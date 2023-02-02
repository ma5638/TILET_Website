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

after(() => {
    agent.close();
})

describe('/users/:userid', () => {

    context('GET', () => {
        it('should go to userId 3 and contain name: "Papa Mark-Hansen"', done => {
            agent
                .get('/users/3')
                .end((err, response) => {
                    response.text.should.contain('Papa Mark-Hansen');
                    done(err);
                });
        });
    });
});

describe('/users/:userid/edit', () => {

    context('GET', () => {
        it('should go to userId 3 and contain name: "Papa Mark-Hansen"', done => {
            agent
                .get('/users/3/edit')
                .end((err, response) => {
                    response.text.should.contain('form');
                    done(err);
                });
        });
    });
    context('POST', () => {
        it('should change shop name to Quick Test', done => {
            let newShopName = "Quick Test";
            agent
                .post('/users/3/edit')
                .type('form')
                .send({
                    "shopName": newShopName
                })
                .end((err, response) => {
                    response.text.should.contain(newShopName);
                    done(err);
                });


        });
        it('should change shop name to PMH Company and Co.', done => {
            let newShopName = "PMH Company and Co.";
            agent
                .post('/users/3/edit')
                .type('form')
                .send({
                    "shopName": newShopName
                })
                .end((err, response) => {
                    response.text.should.contain(newShopName);
                    done(err);
                });
        });
    });
});

