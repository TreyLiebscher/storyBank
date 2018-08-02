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

const {
    TEST_DATABASE_URL,
    PORT
} = require('../../../config');


const expect = chai.expect;
chai.use(chaiHttp);

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

            const { user } = res.body;
            createdUser = user;
            expect(user).to.be.an('object');
            expect(user.email).to.equal(email);
            expect(user.id).to.be.a('string');
        })
    })

})
