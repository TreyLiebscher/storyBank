const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('basic functionality', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should return with a status of 200', function() {
        return chai
            .request(app)
            .get('/stories')
            .then(function(res) {
                expect(res).to.have.status(200);
            });
    });

    it('POST should create a new story', function() {
        const newStory = {title: 'new story', content: 'just some new stuff', image: 'upload img', public: true, storyBlock: '1234'};
        return chai
            .request(app)
            .post('/stories')
            .send(newStory)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).include.keys('title', 'content', 'image', 'public', 'storyBlock');
                expect(res.body.id).to.not.equal(null);
                expect(res.body.publishDate).to.not.equal(null);
                expect(res.body).to.deep.equal(
                    Object.assign(newStory, {id: res.body.id, publishDate: res.body.publishDate})
                );
            });
    });

    it('PUT should update a story by id', function() {
        const updateStory = {
            title: 'test story',
            content: 'just testing',
            image: 'uploaded image'
        };

        return 
            chai
                .request(app)
                .get('/stories')
                .then(function(res){
                    updateStory.id = res.body[0].id;
                    return chai
                        .request(app)
                        .put(`/stories/${updateStory.id}`)
                        .send(updateStory);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                });
    });

    it('DELETE should remove a story by id', function() {
        return
            chai
                .request(app)
                .get('/stories')
                .then(function (res) {
                    return chai.resquest(app).delete(`/stories/${res.body[0].id}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                });
    });
});