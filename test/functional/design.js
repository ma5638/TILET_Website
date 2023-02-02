const chai = require('chai');
const createError = require('http-errors');
const expect = chai.expect;
const chaiHttp = require('chai-http');
// const index = require('../../routes/index');
const proxyquire = require('proxyquire');

chai.use(chaiHttp);

// External
const config = require('../../config');
const Sequelize = require('sequelize');
const models = require('../../models/sequelize');

config.mysql.options.logging = false;
const sequelize = new Sequelize(config.mysql.options);

models(sequelize);

sequelize
    .authenticate()
    .then(() => {
        // console.log('Successfully connected to db');
    })
    .catch((err) => {
        console.error(err);
    });

config.mysql.client = sequelize;
process.env.NODE_ENV = "testing";

const app = require('../../app');
const agent = chai.request.agent(app);

// helper function to get userId from url
function getUserId(url) {
    return url.substr(url.lastIndexOf('/') + 1);
}

after(() => {
    agent.close();
});

describe('/users/:userid/:iddesign', () => {

    context('GET', () => {
        it('should go to userId 1, designId 66 and contain name: "Billiard Balls"', done => {
            agent
                .get('/users/1/66')
                .end((err, response) => {
                    response.text.should.contain('Billiard Balls');
                    done(err);
                });
        });
    });
});

describe('/users/:userid/:iddesign/edit', () => {

    context('GET', () => {
        it('should go to userId 1, designId 66 and contain name: "Billiard Balls"', done => {
            agent
                .get('/users/1/66/edit')
                .end((err, response) => {
                    response.text.should.contain('form');
                    done(err);
                });
        });
    });
    context('POST', () => {
        it('should change design name, price and description', done => {
            const designName = "Temp Name";
            const price = "0";
            const description = "Temp desc";
            agent
                .post('/users/1/66/edit')
                .type('form')
                .send({
                    designName,
                    price,
                    description
                })
                .end((err, response) => {
                    response.text.should.contain(designName).and.contain(price).and.contain(description);
                    done(err);
                });
        });
        it('should revert above changes', done => {
            const designName = "Billiard Balls";
            const price = "98";
            const description = "An amazing product!";
            agent
                .post('/users/1/66/edit')
                .type('form')
                .send({
                    designName,
                    price,
                    description
                })
                .end((err, response) => {
                    response.text.should.contain(designName).and.contain(price).and.contain(description);
                    done(err);
                });
        });
    });
});

let newProduct;

describe('/users/:userid/addProduct', () => {

    context('GET', () => {
        it('should go to userId 1, designId 66 and contain name: "Billiard Balls"', done => {
            agent
                .get('/users/1/addProduct')
                .end((err, response) => {
                    response.text.should.contain('form');
                    done(err);
                });
        });
    });
    context('POST', () => {
        it('should add a new product', done => {
            agent
                .post('/users/1/addProduct')
                .type('form')
                .send({
                    "designName": "sgd",
                    "price": "34",
                    "description": "Design that should not be seen..."
                })
                .end((err, response) => {
                    response.text.should.contain('sgd').and.contain('34').and.contain('Design that should not be seen...');
                    newProduct = getUserId(response.request.url);
                    done(err);
                });
        });
    });
});

describe('/users/:userid/:iddesign/delete', () => {

    context('GET', () => {
        it('should go to userId 1, designId 66 and contain word: "Delete"', done => {
            agent
                .get(`/users/1/${newProduct}/delete`)
                .end((err, response) => {
                    response.text.should.contain('Delete');
                    done(err);
                });
        });
    });
    context('POST', () => {
        it('should be redirected to the login page', done => {
            agent
                .post(`/users/1/${newProduct}/delete`)
                .end((err, response) => {
                    response.req.path.should.be.equal('/users/1/');
                    done(err);
                });
        });
    });
});
