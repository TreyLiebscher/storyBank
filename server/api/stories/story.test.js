'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {
    app,
    runServer,
    closeServer
} = require('../../server');

const {
    getConfig
} = require('../../api/api');

const StoriesModel = getConfig('stories').models.story;
const BlockModel = getConfig('storyblock').models.block

const {
    testUtilCreateUser
} = require('../users/userModel')

const deleteCollections = require('../../helpers').deleteCollections;

const {
    TEST_DATABASE_URL,
    PORT
} = require('../../../config');

async function testUserLoginToken() {
    const loginRes = await chai
        .request(app)
        .post('/users/login')
        .send({
            email,
            password
        })
    const authToken = loginRes.body.authToken
    return authToken
}

const expect = chai.expect;
chai.use(chaiHttp);

const seedData = [{
    title: 'Story1',
    image: 'Image1',
    content: 'Content1',
    publicStatus: true
},
{
    title: 'Story2',
    image: 'Image2',
    content: 'Content2',
    publicStatus: true
},
{
    title: 'Story3',
    image: 'Image3',
    content: 'Content3',
    publicStatus: true
},
]



const SEED_DATA_LENGTH = seedData.length;

const email = 'test@test.com';
const password = 'password123';
let testUser

describe('story API routes', function () {

    before(async () => {
        await runServer(TEST_DATABASE_URL, PORT);
        testUser = await testUtilCreateUser();
        seedData.forEach(i => i.user_id = testUser._id);
        console.log(seedData);
    });

    after(async () => {
        await closeServer();
    });

    describe('CRUD /stories/story', () => {

        let createdStory, deletedStory

        it('should update a story by id (PUT)', async () => {
            const title = 'Old story';
            const image = 'Old image';
            const content = 'Old content';
            const publicStatus = false;
            const newTitle = 'New story';
            const newImage = 'New image';
            const newContent = 'New content';
            const newPublicStatus = true;

            const record = await StoriesModel.create({
                user_id: testUser._id,
                title,
                image,
                content,
                publicStatus
            })

            const res = await chai
                .request(app)
                .put(`/stories/story/update/${record._id}`)
                .send({
                    title: newTitle,
                    image: newImage,
                    content: newContent,
                    publicStatus: newPublicStatus
                })
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            const {
                story
            } = res.body
            expect(story.title).to.equal(newTitle);
            expect(story.image).to.equal(newImage);
            expect(story.content).to.equal(newContent);
            expect(story.publicStatus).to.equal(newPublicStatus);
        })


        it('should create a new story within a block (POST)', async () => {

            const record = await BlockModel.create({
                user_id: testUser._id,
                title: 'a test block',
                color: 'blue'
            })

            const newStory = {
                title: 'new story',
                content: 'just some new stuff',
                image: 'upload img',
                publicStatus: true,
                block: record._id
            };

            const authToken = await testUserLoginToken();


            const res = await chai
                .request(app)
                .post(`/stories/story/create/${record._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(newStory)
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            const {
                story
            } = res.body;
            createdStory = story;
            expect(story).to.be.an('object');
            expect(story.title).to.equal(newStory.title);
            expect(story.block).to.equal(record.id);
            expect(story.id).to.be.a('string');
            const createdAt = new Date(story.createdAt);
            expect(createdAt).to.be.a('date');
            expect(createdAt.toDateString()).to.not.equal('Invalid Date');
        });

        it('should delete a story by id (DELETE)', async () => {
            
            const authToken = await testUserLoginToken();

            const res = await chai
            .request(app)
            .delete(`/stories/story/delete/${createdStory.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            const {
                story
            } = res.body
            deletedStory = story
            expect(story).to.deep.equal(createdStory);
        });

        it('should return a 404 for a non-existent post', async () => {
            const nxID = deletedStory.id;
            const res = await chai.request(app).get(`/stories/story/${nxID}`)
            expect(res).to.have.status(404)
            expect(res).to.be.json;
        })

    });

    describe('GET /stories/storiesall (no records)', () => {
        it('should respond with JSON', async () => {
            await deleteCollections(['storiesmodels'])
            const res = await chai
                .request(app)
                .get('/stories/storiesall')
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.stories).to.deep.equal([]);
        });

        it('should fail when the offset parameter is out of bounds', async () => {
            const res = await chai
                .request(app)
                .get('/stories/storiesall/10')
            expect(res).to.be.json;
            expect(res).to.have.status(500)
        });
    });

    describe('GET /stories/storiesall (some records)', () => {
        it('should respond with JSON', async () => {
            await deleteCollections(['storiesmodels'])

            await Promise.all(seedData.map(item => StoriesModel.create(item)))
            const res = await chai
                .request(app)
                .get('/stories/storiesall')
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.stories).to.be.an('array');
            expect(res.body.stories).to.have.lengthOf(3);
            expect(res.body.total).to.equal(3);

        });

        it('should account for the offset paramter', async () => {
            const res = await chai
                .request(app)
                .get('/stories/storiesall/2')
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            expect(res.body.stories).to.be.an('array');
            expect(res.body.stories).to.have.lengthOf(1);
            expect(res.body.total).to.equal(3);
        });
    });
});