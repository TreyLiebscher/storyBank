'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { UserModel } = require('./users/userModel');
const { JWT_SECRET, TEST_DATABASE_URL, PORT } = require('../../config');

const expect = chai.expect;

const AUTH_REFRESH_ROUTE = '/users/refresh-auth-token';

chai.use(chaiHttp);

const email = 'test@test.com';
const password = 'password123';

describe('Auth endpoints', function () {


    before(function () {
        return runServer(TEST_DATABASE_URL, PORT);
    });

    after(function () {
        return closeServer();
    });

    beforeEach(function () {
        return UserModel.hashPassword(password).then(hashedPassword => {
            return UserModel.create({
                email,
                password: hashedPassword
            })
        })
    });

    afterEach(function () {
        return UserModel.remove({});
    });

    describe('/users/login', function () {
        it('Should reject requests with no credentials', function () {
            return chai
                .request(app)
                .post('/users/login')
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(400);
                });
        });
        it('Should reject requests with incorrect email', function () {
            return chai
                .request(app)
                .post('/users/login')
                .send({ email: 'wrongEmail', password })
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with incorrect passwords', function () {
            return chai
                .request(app)
                .post('/users/login')
                .send({ email, password: 'wrongPassword' })
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should return a valid auth token', function () {
            return chai
                .request(app)
                .post('/users/login')
                .send({ email, password })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ['HS256']
                    });

                    expect(payload.user.email).to.equal(email)
                });

        });

    });

    describe(AUTH_REFRESH_ROUTE, function () {
        it('Should reject requests with no JWT token', function () {
            return chai
                .request(app)
                .post('/users/refresh-auth-token')
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with an invalid token', function () {
            const token = jwt.sign(
                {
                    email,
                },
                'wrongSecret',
                {
                    algorithm: 'HS256',
                    expiresIn: '7d'
                }
            );

            return chai
                .request(app)
                .post(AUTH_REFRESH_ROUTE)
                .set('Authorization', `Bearer ${token}`)
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with an expired token', function () {
            const token = jwt.sign(
                {
                    user: {
                        email,
                    },
                },
                JWT_SECRET,
                {
                    algorithm: 'HS256',
                    subject: email,
                    expiresIn: Math.floor(Date.now() / 1000) - 10
                }
            );

            return chai
                .request(app)
                .post('/users/refresh')
                .set('authorization', `Bearer ${token}`)
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }
                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should return a valid auth token with a new expiry date', function () {
            const token = jwt.sign(
                {
                    user: {
                        email,
                    }
                },
                JWT_SECRET,
                {
                    algorithm: 'HS256',
                    subject: email,
                    expiresIn: '7d'
                }
            );
            const decoded = jwt.decode(token);

            return chai
                .request(app)
                .post('/users/refresh-auth-token')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    console.log('AUTH TOKEN', res.body.authToken)
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ['HS256']
                    });
                    expect(payload.user.email).to.equal(email);
                    expect(payload.exp).to.be.at.least(decoded.exp);
                });
        });
        it('Should change the password', async function () {


            const token = jwt.sign(
                {
                    user: {
                        email,
                    }
                },
                JWT_SECRET,
                {
                    algorithm: 'HS256',
                    subject: email,
                    expiresIn: '7d'
                }
            );

            const newPassword = '23456789'

            const res = await chai
                .request(app)
                .post('/users/changepassword')
                .send({ newPassword, retypeNewPassword:newPassword })
                .set('authorization', `Bearer ${token}`)

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
        });
    });
});