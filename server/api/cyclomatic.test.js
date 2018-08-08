'use strict';

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect;

const {
    closeServer,
    runServer,
    app
} = require('../server')

const {
    TEST_DATABASE_URL,
    PORT
} = require('../../config')

const {
    getConfig
} = require('../api/api')

describe('Unexpected Events', function () {
    it('should return false when trying to close a closed server', async () => {
        const result = await closeServer()
        expect(result).to.equal(false)

    })
})
