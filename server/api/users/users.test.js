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

const UserModel = getConfig('users').models.users;

const {
    TEST_DATABASE_URL,
    PORT
} = require('../../../config');


const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

const seedData = [
    { email: 'foo@example.com', password: 'secret' },
    { email: 'bar@example.com', password: 'haxx0r' },
]
const SEED_DATA_LENGTH = seedData.length

//TODO factor this out and learn to type
async function deleteCollections(namesArr) {
    const collections = await mongoose.connection.db.collections();

    const filteredCollections = collections.filter(item => namesArr.includes(item.collectionName));

    return await Promise.all(filteredCollections.map(c => c.remove()));
}

describe('Users API routes', function () {

    before(async () => {
        await runServer(TEST_DATABASE_URL, PORT);
    });

    after(async () => {
        await closeServer();
    });

    describe('CRUD /users/user', () => {
        let createdUser, deletedUser

        it('should create a new user (POST)', async () => {
            const email = 'test2@test.com';
            const password = 'password123';

            const res = await chai
                .request(app)
                .post('/users/user/createUser')
                .send({
                    email,
                    password
                })
            expect(res).to.have.status(200)
            expect(res).to.be.json;

            const {user} = res.body;
            createdUser = user;
            expect(user).to.be.an('object');
            expect(user.email).to.equal(email);
            expect(user.id).to.be.a('string');
        })
    })

})
