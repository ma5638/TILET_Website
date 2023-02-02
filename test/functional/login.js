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
const agent = chai.request.agent(app);
after(() => {
    agent.close();
})

describe('/login', () => {
    context('GET', () => {
        it('should contain the labels "Username:" and "Password:"', done => {
            agent
                .get('/login')
                .end((err, response) => {
                    response.text.should.contain('Username').and.contain('Password:');
                    done(err);
                });
        });
    });
    context('POST', () => {
        it('should be redirected to the main page and contain word "Account"', done => {
            agent
                .post('/login')
                .type('form')
                .send({
                    "username": "allee2",
                    "password": "pass"
                })
                .end(function (err, response) {
                    response.req.path.should.be.equal('/');
                    response.text.should.contain('Log Out');
                    done(err);
                });
        });
    });
    context('Dashboard', () => {
        it('should go to user shop', done => {
            agent
                .get('/users/3')
                .end(function (err, response) {
                    response.text.should.contain('Options');
                    done(err);
                });
        });
    });
    context('Logging Out', () => {
        it('should logout', done => {
            agent
                .get('/logout')
                .end(function (err, response) {
                    response.req.path.should.be.equal('/');
                    response.text.should.contain('Login');
                    done(err);
                });
        });
    });
});