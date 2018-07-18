'use strict';
require('dotenv').config()

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/storybank2';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/storybank2';
exports.PORT = process.env.PORT || 8080;

// 'mongodb://localhost/storyBank'