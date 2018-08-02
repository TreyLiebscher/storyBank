'use strict';

const chai = require('chai')
const chaiHttp = require('chai-http')


const {
    closeServer,
    runServer,
    app
} = require('../../server')

const {
    TEST_DATABASE_URL,
    PORT
} = require('../../../config')

const {
    getConfig
} = require('../../api/api')

const BlockModel = getConfig('storyblock').models.block

const {
    testUtilCreateUser
} = require('../users/userModel')

const deleteCollections = require('../../helpers').deleteCollections;

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
chai.use(chaiHttp)

const seedData = [{
        title: 'Block 1',
        color: 'blue'
    },
    {
        title: 'Block 2',
        color: 'green'
    },
    {
        title: 'Block 3',
        color: 'red'
    },
]
const SEED_DATA_LENGTH = seedData.length

const email = 'test@test.com';
const password = 'password123';
let testUser

describe('block API routes', function () {

    before(async () => {
        await runServer(TEST_DATABASE_URL, PORT)
        testUser = await testUtilCreateUser()
        //Adds a user id to the seed data for auth testing
        seedData.forEach(i => i.user_id = testUser._id)
        console.log(seedData)
    })

    after(async () => {
        await closeServer()
    })


    describe('CRUD /storyBlock/block', () => {

        let createdBlock, deletedBlock

        it('should update a block by id (PUT)', async () => {
            const title = 'Some useless block';
            const newTitle = 'A useful block';
            const color = 'purple';
            const newColor = 'green';



            //create a post directly in the db
            const record = await BlockModel.create({
                user_id: testUser._id,
                title,
                color
            })

            //make an API HTTP request with an updated title
            const res = await chai
                .request(app)
                .put(`/storyblock/block/update/${record._id}`) // // need correct URL
                .send({
                    title: newTitle,
                    color: newColor
                })
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            const {
                block
            } = res.body
            expect(block.title).to.equal(newTitle);
            expect(block.color).to.equal(newColor);
        })


        it('should create a new block (POST)', async () => {
            const title = 'Some useless block';
            const color = 'purple';

            const authToken = await testUserLoginToken()

            const res = await chai
                .request(app)
                .post('/storyblock/block/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title,
                    color
                })
            expect(res).to.have.status(200)
            expect(res).to.be.json;

            const {
                block
            } = res.body
            createdBlock = block
            expect(block).to.be.an('object');
            expect(block.title).to.equal(title)
            expect(block.id).to.be.a('string')
            expect(block.createdAt).to.be.a('string')
            const createdAt = new Date(block.createdAt)
            expect(createdAt).to.be.a('date')
            expect(createdAt.getTime()).to.not.equal(NaN)
        })

        //NOTE this depends on the previous it() being sucessful
        it('should retrieve a block by id (GET)', async () => {
            const res = await chai.request(app).get(`/storyblock/block/${createdBlock.id}`)
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            const {
                block: retrievedBlock
            } = res.body
            expect(retrievedBlock).to.deep.equal(createdBlock);
        })

        // // // // 
        it('should retrieve a block and associated stories by id (GET)', async () => {
            const res = await chai.request(app).get(`/storyblock/blocks/stories/${createdBlock.id}`)
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            const {
                block: retrievedBlock
            } = res.body
            const {
                stories: retrievedStories
            } = res.body
            expect(retrievedStories).to.be.an('array');
            //need to verify whether or not there ARE stories associated w/ block
            expect(retrievedBlock).to.deep.equal(createdBlock);
        })

        //NOTE this depends on the previous it() being sucessful
        it('should delete a block by id (DELETE)', async () => {
            const res = await chai.request(app).delete(`/storyblock/block/delete/${createdBlock.id}`)
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            const {
                block
            } = res.body
            deletedBlock = block
            expect(block).to.deep.equal(createdBlock)
        })

        //NOTE this depends on the previous it() being sucessful
        it('should return a 404 for non-existent post', async () => {
            const nxID = deletedBlock.id
            const res = await chai.request(app).get(`/storyblock/block/${nxID}`)
            expect(res).to.have.status(404)
            expect(res).to.be.json;
        })


    })

    describe('GET /storyblock/blocks (no records)', () => {
        it('should respond with JSON', async () => {
            await deleteCollections(['blockmodels'])
            const authToken = await testUserLoginToken()

            const res = await chai
                .request(app)
                .get('/storyblock/blocks')
                .set('Authorization', `Bearer ${authToken}`)
            expect(res).to.have.status(200)
            expect(res).to.be.json;

            //perform a deep comparison 'deep.equal' because arrays are not equal by reference
            expect(res.body.blocks).to.deep.equal([])
        })

        it('should fail when the offset param is out of bounds', async () => {
            const res = await chai.request(app).get('/storyblock/blocks/10')
            expect(res).to.be.json;
            expect(res).to.have.status(400)
        })


    })

    describe('GET /storyblock/blocks (some records)', () => {
        it('should respond with JSON', async () => {

            // start fresh by deleting all posts
            await deleteCollections(['blockmodels'])

            // create posts directly in the database using the model and seedData (not the API)
            await Promise.all(seedData.map(item => BlockModel.create(item)))

            // retrieve posts through an API call
            const res = await chai.request(app).get('/storyblock/blocks')
            expect(res).to.have.status(200)
            expect(res).to.be.json;
            expect(res.body.blocks).to.be.an('array');
            expect(res.body.blocks).to.have.lengthOf(SEED_DATA_LENGTH)
            expect(res.body.total).to.equal(SEED_DATA_LENGTH)
        })

        it('should account for the offset param', async () => {
            const numRecordsToSkip = 2
            const res = await chai.request(app).get(`/storyblock/blocks/${numRecordsToSkip}`)
            expect(res).to.be.json;
            expect(res).to.have.status(200)
            expect(res.body.blocks).to.be.an('array');

            // the number of returned posts should be (SEED_DATA_LENGTH - numRecordsToSkip)
            expect(res.body.blocks).to.have.lengthOf(SEED_DATA_LENGTH - numRecordsToSkip)
            expect(res.body.total).to.equal(SEED_DATA_LENGTH)
        })


    })


})