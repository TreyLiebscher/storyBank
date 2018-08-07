'use strict';

const chai = require('chai')
const chaiHttp = require('chai-http')

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

describe('Weird things', function () {
    it('should close an inexistent server', async () => {
        await closeServer()
    })
})
