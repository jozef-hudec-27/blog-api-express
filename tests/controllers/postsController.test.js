const app = require('../../app')

const Post = require('../../models/post')
const User = require('../../models/user')
const mongoose = require('mongoose')

const expect = require('chai').expect
const request = require('supertest')
const { connect, close } = require('../mongodbMemoryServer')

let testUser
let testUserToken

before(connect)
after(close)
beforeEach(async () => {
  // Clear the database
  for (var i in mongoose.connection.collections) {
    await mongoose.connection.collections[i].deleteMany({})
  }

  // Create test user
  await request(app).post('/auth/register').send({
    email: 'test@user.com',
    firstName: 'TestName',
    lastName: 'TestLastName',
    password: 'test123',
    passwordConfirmation: 'test123',
  })
  testUser = await User.findOne({ email: 'test@user.com' })

  // Sign in test user to get access token
  const response = await request(app).post('/auth/login').send({ email: 'test@user.com', password: 'test123' })
  testUserToken = response.body.accessToken

  // Make test user an author
  await request(app)
    .post('/api/users/author')
    .send({ code: process.env.AUTHOR_CODE })
    .set('Authorization', `Bearer ${testUserToken}`)
})

describe('GET /api/posts', () => {
  it('returns an array of posts if there are some', async () => {
    await Post.create({ title: 'TestTitle', body: 'TestContent', author: testUser._id })

    const response = await request(app).get('/api/posts')

    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body.length).to.equal(1)
    expect(response.body[0]).to.have.property('title', 'TestTitle')
    expect(response.body[0]).to.have.property('author')
  })

  it('returns an empty array if there are no posts', async () => {
    const response = await request(app).get('/api/posts')

    expect(response.status).to.equal(200)
    expect(response.body).to.be.an('array')
    expect(response.body.length).to.equal(0)
  })
})

describe('GET /api/posts/:postId', () => {
  it('returns a post if it exists', async () => {
    const post = await Post.create({ title: 'TestTitle', body: 'TestContent', author: testUser._id })

    const response = await request(app).get(`/api/posts/${post._id}`)

    expect(response.status).to.equal(200)
    expect(response.body).to.have.property('title', 'TestTitle')
    expect(response.body).to.have.property('author')
  })

  it('returns a 404 if the post does not exist', async () => {
    const response = await request(app).get(`/api/posts/65587939d5bb6d58248f4f46`)

    expect(response.status).to.equal(404)
  })
})

describe('POST /api/posts', async () => {
  describe('when the user is logged in', () => {
    it('creates a post if the data is valid', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({ title: 'TestTitle', body: 'TestContent' })
        .set('Authorization', `Bearer ${testUserToken}`)

      expect(response.status).to.equal(201)
      expect(response.body).to.have.property('title', 'TestTitle')
      expect(response.body).to.have.property('author')
    })

    it('returns error if the data is invalid', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({ title: '', body: '' })
        .set('Authorization', `Bearer ${testUserToken}`)

      expect(response.status).to.equal(400)
    })
  })

  describe('when the user is not logged in', () => {
    it('returns 401', async () => {
      const response = await request(app).post('/api/posts').send({ title: 'TestTitle', body: 'TestContent' })

      expect(response.status).to.equal(401)
    })
  })
})

describe('PUT api/posts/:postId', () => {
  describe('when user is author of the post', () => {
    it('updates the post if the data is valid', async () => {
      const post = await Post.create({ title: 'TestTitle', body: 'TestContent', author: testUser._id })

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send({ title: 'NewTestTitle', body: 'NewTestContent' })
        .set('Authorization', `Bearer ${testUserToken}`)

      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('title', 'NewTestTitle')
      expect(response.body).to.have.property('body', 'NewTestContent')
    })

    it('returns error if the data is invalid', async () => {
      const post = await Post.create({ title: 'TestTitle', body: 'TestContent', author: testUser._id })

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send({ title: '', body: '' })
        .set('Authorization', `Bearer ${testUserToken}`)

      expect(response.status).to.equal(400)
    })
  })

  describe('when user is not author of the post', () => {
    it('returns 403', async () => {
      const anotherUser = await User.create({
        email: 'another@user.com',
        firstName: 'AnotherName',
        lastName: 'AnotherLastName',
        passwordEncrypted: 'test123',
        isAuthor: true,
      })

      const post = await Post.create({ title: 'TestTitle', body: 'TestContent', author: anotherUser._id })

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send({ title: 'NewTestTitle', body: 'NewTestContent' })
        .set('Authorization', `Bearer ${testUserToken}`)

      expect(response.status).to.equal(403)
    })
  })
})

describe('DELETE /api/posts/:postId', () => {
  describe('when user is author of the post', () => {
    it('deletes the post', async () => {
      const post = await Post.create({ title: 'TestTitle', body: 'TestContent', author: testUser._id })

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)

      const postCount = await Post.countDocuments()

      expect(response.status).to.equal(204)
      expect(postCount).to.equal(0)
    })
  })

  describe('when user is not author of the post', () => {
    it('returns 403', async () => {
      const anotherUser = await User.create({
        email: 'another@user.com',
        firstName: 'AnotherName',
        lastName: 'AnotherLastName',
        passwordEncrypted: 'test123',
        isAuthor: true,
      })

      const post = await Post.create({ title: 'TestTitle', body: 'TestContent', author: anotherUser._id })

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)

      expect(response.status).to.equal(403)
    })
  })
})
