'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {
    app,
    runServer,
    closeServer
} = require('../../server');

const {
    getConfig
} = require('../../api/api');

const StoriesModel = getConfig('stories').models.story;

const {
    TEST_DATABASE_URL,
    PORT
} = require('../../../config');


const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

const mockData = [{
        title: 'Story1',
        image: 'Image1',
        content: 'Content1',
        publicStatus: true
    },
    {
        title: 'Story2',
        image: 'Image2',
        content: 'Content2',
        publicStatus: false
    },
    {
        title: 'Story3',
        image: 'Image3',
        content: 'Content3',
        publicStatus: true
    },
]

async function deleteCollections(namesArr) {
    const collections = await mongoose.connection.db.collections();

    const filteredCollections = collections.filter(item => namesArr.includes(item.collectionName));

    return await Promise.all(filteredCollections.map(c => c.remove()));
}

describe('storyBank API routes', function () {

    before(async () => {
        await runServer(TEST_DATABASE_URL, PORT);
    });

    after(async () => {
        await closeServer();
    });

    describe('POST /stories/story/create', () => {
        it('should create a new story', async () => {
            const newStory = {
                title: 'new story',
                content: 'just some new stuff',
                image: 'upload img',
                publicStatus: true,
                storyBlock: '1234'
            };
            const res = await chai
                .request(app)
                .post('/stories/story/create')
                .send(newStory)
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            const {
                story
            } = res.body;
            expect(story).to.be.an('object');
            expect(story.title).to.equal(newStory.title);
            expect(story.id).to.be.a('string');
            const createdAt = new Date(story.createdAt);
            expect(createdAt).to.be.a('date');
            expect(createdAt.toDateString()).to.not.equal('Invalid Date');
        });
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

            await Promise.all(mockData.map(item => StoriesModel.create(item)))
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