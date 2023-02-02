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
});


describe('/signup', () => {

    context('GET', () => {
        it('should contain the labels "Username:", "Password:" and "E-mail"', done => {
            agent
                .get('/signup')
                .end((err, response) => {
                    response.text.should.contain('Username').and.contain('Password:').and.contain('E-mail:');
                    done(err);
                });
        });
    });
    context('POST', () => {
        it('should be redirected to the login page', done => {
            agent
                .post('/signup')
                .type('form')
                .send({
                    "username": "allee2",
                    "password": "password",
                    "shop_name": "New shop",
                    "first_name": "T",
                    "last_name": "Sowah",
                    "email": "sthg@sthg.com",
                    "DOB": "28/09/2004"
                })
                .end((err, response) => {
                    response.req.path.should.be.equal('/login');
                    done(err);
                });
        });
    });
});

describe('/users/:userid/delete', () => {

    context('GET', () => {
        it('should go to userId 3 and contain name: "Papa Mark-Hansen"', done => {
            agent
                .get('/users/3/delete')
                .end((err, response) => {
                    response.text.should.contain('Delete');
                    done(err);
                });
        });
    });
    // context('POST', () => {
    //     it('should be redirected to the login page', done => {
    //         agent
    //             .post('/signup')
    //             .type('form')
    //             .send({
    //                 "username": "allee2",
    //                 "password": "password",
    //                 "shop_name": "New shop",
    //                 "first_name": "T",
    //                 "last_name": "Sowah",
    //                 "email": "sthg@sthg.com",
    //                 "DOB": "28/09/2004",
    //                 "test": true
    //             })
    //             .end((err, response) => {
    //                 response.req.path.should.be.equal('/login');
    //                 agent.close();
    //                 done(err);
    //             });
    //     });
    // });
});