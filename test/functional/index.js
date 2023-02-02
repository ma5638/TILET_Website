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

// End External

describe('/', () => {
    context('GET', () => {
        it('should contain the subtitle of the main page("Fashion that Inspires")', done => {
            chai.request(app)
                .get('/')
                .end((err, response) => {
                    response.text.should.contain('Fashion that Inspires')
                    done(err);
                });
        });
    });
});

describe('/about', () => {
    context('GET', () => {
        it('should contain the the phrase "online market place"', done => {
            chai.request(app)
                .get('/about')
                .end((err, response) => {
                    response.text.should.contain('online market place');
                    done(err);
                });
        });
    });
});

describe('errors', () => {
    context('Wrong page', () => {
        it('should contain "Error 404"', done => {
            chai.request(app)
                .get('/enter-wrong-page')
                .end((err, response) => {
                    response.text.should.contain('Error 404');
                    done(err);
                });
        });
    });
});

