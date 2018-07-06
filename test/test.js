'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {
    app,
    runServer,
    closeServer
} = require('../server');
const {
    Story,
    StoryBlock
} = require('../models');
const {
    TEST_DATABASE_URL
} = require('../config');


const expect = chai.expect;
chai.use(chaiHttp);


function seedStoriesData() {
    console.info('seeding stories data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateStoriesData());
    }

    return Story.insertMany(seedData);
}

function generateStoriesData() {
    return {
        title: faker.lorem.words(),
        image: faker.lorem.word(),
        content: faker.lorem.paragraph(),
        public: faker.random.boolean(),
        storyBlock: faker.random.number(),
        publishDate: faker.date.past()
    }
}

function seedStoryBlockData() {
    console.info('seeding storyblocks data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateStoryBlocksData());
    }

    return StoryBlock.insertMany(seedData);
}

function generateStoryBlocksData() {
    return {
        title: faker.lorem.word(),
        color: faker.commerce.color()
    }
}

function tearDownDb() {
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}


describe('Stories API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedStoriesData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {
        it('GET should return with a status of 200', function () {
            return chai
                .request(app)
                .get('/stories')
                .then(function (res) {
                    expect(res).to.have.status(200);
                });
        });

        it('GET should return stories with the right fields', function () {
            let resStory;
            return chai
                .request(app)
                .get('/stories')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.stories).to.be.a('array');
                    expect(res.body.stories).to.have.lengthOf.at.least(1);

                    res.body.stories.forEach(function (story) {
                        expect(story).to.be.a('object');
                        expect(story).to.include.keys(
                            'id', 'title', 'content', 'image', 'public', 'storyBlock', 'publishDate'
                        );
                    });
                    resStory = res.body.stories[0];
                    return Story.findById(resStory.id);
                })
                .then((story) => {
                    expect(resStory.id).to.equal(story.id);
                    expect(resStory.title).to.equal(story.title);
                    expect(resStory.content).to.equal(story.content);
                    expect(resStory.image).to.equal(story.image);
                    expect(resStory.public).to.equal(story.public);
                    expect(resStory.storyBlock).to.equal(story.storyBlock);
                    expect(resStory.publishDate).to.equal(story.publishDate);
                });
        });
    });

    describe('POST enpoint', function () {
        it('POST should create a new story', function () {
            const newStory = {
                title: 'new story',
                content: 'just some new stuff',
                image: 'upload img',
                public: true,
                storyBlock: '1234'
            };
            return chai
                .request(app)
                .post('/stories')
                .send(newStory)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).include.keys('title', 'content', 'image', 'public', 'storyBlock');
                    expect(res.body.id).to.not.equal(null);
                    expect(res.body.publishDate).to.not.equal(null);
                    expect(res.body).to.deep.equal(
                        Object.assign(newStory, {
                            id: res.body.id,
                            publishDate: res.body.publishDate
                        })
                    );
                });
        });
    });

    describe('PUT endpoint', function () {
        it('PUT should update a story by id', function () {
            const updateStory = {
                title: 'test story',
                content: 'just testing',
                image: 'uploaded image'
            };

            return
            chai
                .request(app)
                .get('/stories')
                .then(function (res) {
                    updateStory.id = res.body[0].id;
                    return chai
                        .request(app)
                        .put(`/stories/${updateStory.id}`)
                        .send(updateStory);
                })
                .then(function (res) {
                    expect(res).to.have.status(204);
                });
        });
    });

    describe('DELETE endpoint', function () {
        it('DELETE should remove a story by id', function () {
            return
            chai
                .request(app)
                .get('/stories')
                .then(function (res) {
                    return chai.resquest(app).delete(`/stories/${res.body[0].id}`);
                })
                .then(function (res) {
                    expect(res).to.have.status(204);
                });
        });
    });

});

describe('StoryBlocks API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedStoryBlockData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {
        it('should return all existing storyblocks', function() {
            return chai
            .request(app)
            .get('/story-blocks')
            .then(function (res) {
                expect(res).to.have.status(200);
            });
        });
    });

    describe('POST endpoint', function() {

    });

    describe('PUT endpoint', function() {

    });

    describe('DELETE endpoint', function() {

    });
});