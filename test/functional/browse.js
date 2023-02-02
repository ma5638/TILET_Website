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

const app = require('../../app');

describe('/browse/designs', () => {
    context('GET', () => {
        it('should contain the subtitle of the main page("Fashion that Inspires")', done => {
            chai.request(app)
                .get('/browse/designs')
                .end((err, response) => {
                    response.text.should.contain('data-products');
                    done(err);
                });
        });
    });
});

describe('/browse/shops', () => {
    context('GET', () => {
        it('should contain the subtitle of the main page("Fashion that Inspires")', done => {
            chai.request(app)
                .get('/browse/shops')
                .end((err, response) => {
                    response.text.should.contain('data-users');
                    done(err);
                });
        });
    });
});