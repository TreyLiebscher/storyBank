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

const StoriesModel = getConfig('storyBank').models.story;

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
        public: true
    },
    {
        title: 'Story2',
        image: 'Image2',
        content: 'Content2',
        public: false
    },
    {
        title: 'Story3',
        image: 'Image3',
        content: 'Content3',
        public: true
    },
]

async function deleteCollections(namesArr) {
    const collections = await mongoose.connection.db.collections();

    const filteredCollections = collections.filter(item => namesArr.includes(item.collectionName));

    return await Promise.all(filteredCollections.map(c => c.remove()));
}

describe('StoryBank API routes', function () {

    before(async () => {
        await runServer(TEST_DATABASE_URL);
    });

    after(async () => {
        await closeServer();
    });

    describe('POST /storyBank/story/create', () => {
        it('should create a new story', async () => {
            const newStory = {
                title: 'new story',
                content: 'just some new stuff',
                image: 'upload img',
                public: true,
                storyBlock: '1234'
            };
            const res = await chai
                .request(app)
                .post('/storyBank/story/create')
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
});