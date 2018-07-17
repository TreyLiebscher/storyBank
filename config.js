'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://treyliebscher:password57@ds239368.mlab.com:39368/storybank';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://treyliebscher:password57@ds239368.mlab.com:39368/storybank';
exports.PORT = process.env.PORT || 8080;

// 'mongodb://localhost/storyBank'