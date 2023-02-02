// const proxyquire = require('proxyquire');
// const sinon = require('sinon');

const chai = require('chai');
// const config = require('../../../config');
// const Sequelize = require('sequelize');
// const models = require('../../../models/sequelize');
// const databaseService = require('../../../services');
// const expect = chai.expect;

// config.mysql.options.logging = false;
// const sequelize = new Sequelize(config.mysql.options);

const expect = chai.expect;
let SignUpFormValidator = require('../../../services/signup_form');

describe('Sign Up Validation', () => {

    /**
     * Validate Correctness:
     * DOB format is correct for SQL (YYYY-MM-DD) DONE
     * 
     * Ways for validation to be rejected:
     * Wrong date format  DONE
     * Special Characters included in username, firstname, lastname, shopname: ["\\", "&", "/", "=", "-", "<", ">", ";"];
     */
    context('Validation', () => {
        let validator;
        let errors;
        beforeEach(() => {
            errors = [];
        });
        it('should validate the valid data', () => {
            let errors = [];
            const body = {
                username: "allee",
                password: "joke",
                shop_name: "Try it",
                first_name: "A",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "24/07/2020",
            }
            validator = new SignUpFormValidator(body, {}, errors);
            validator.validate().should.be.true;

        });
        it('should reject validation of wrong date format', () => {
            const body = {
                username: "allee",
                password: "joke",
                shop_name: "Try it",
                first_name: "A",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "2008-12-12",
            }
            validator = new SignUpFormValidator(body, {}, errors);

            validator.validate().should.be.false;

        });
        it('should reject special characters ["\\", "&", "/", "=", "-", "<", ">", ";"] for username, password, shop_name, first_name, last_name', () => {
            const body = {
                username: "allee",
                password: "joke",
                shop_name: "Try it",
                first_name: "A<",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "24/07/2020",
            }
            validator = new SignUpFormValidator(body, {}, errors);
            validator.validate().should.be.false;
        });
    });

    context('Verification', () => {
        let validator;
        let errors;
        let databaseServiceStubFalse = {
            userService: {
                checkExistingUser: function () { return false; },
            }
        };
        let databaseServiceStubTrue = {
            userService: {
                checkExistingUser: function () { return true; },
            }
        };
        beforeEach(() => {
            errors = [];
        });
        it('should verify that the username is available', () => {
            const body = {
                username: "alleejk",
                password: "joke",
                shop_name: "Try it",
                first_name: "A",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "2008-12-12",
            }
            validator = new SignUpFormValidator(body, databaseServiceStubFalse, errors);
            validator.verify()
                .then(success => {
                    success.should.be.equal(true);
                });

        });
        it('should reject an existing username', () => {
            const body = {
                username: "allee",
                password: "joke",
                shop_name: "Try it",
                first_name: "A",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "2008-12-12",
            }
            validator = new SignUpFormValidator(body, databaseServiceStubTrue, errors);
            validator.verify()
                .then(success => {
                    success.should.be.equal(false);
                });
        });
    });


    context('Signing Up', () => {
        let validator;
        let errors;
        let databaseServiceStubFalse = {
            userService: {
                inTransaction: function (fn) { fn(); },
                addUser: function () { try { return 0 / 0; } catch (err) { return err; } },
            }
        };
        let databaseServiceStubTrue = {
            userService: {
                inTransaction: function (fn) { fn(); },
                addUser: function () { return true; },
            }
        };
        beforeEach(() => {
            errors = [];
        });
        it('should verify sign up', () => {
            const body = {
                username: "allee",
                password: "joke",
                shop_name: "Try it",
                first_name: "A",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "2008-12-12",
            }
            validator = new SignUpFormValidator(body, databaseServiceStubTrue, errors);
            validator.signUp()
                .then(success => {
                    expect(success).to.not.be.an('error');
                });

        });
        it('should reject sign up due to no username and password', () => {
            const body = {
                shop_name: "Try it",
                first_name: "A",
                last_name: "B",
                email: "sthg@sthg.com",
                DOB: "2008-12-12",
            }
            validator = new SignUpFormValidator(body, databaseServiceStubFalse, errors);
            validator.signUp()
                .then(success => {
                    expect(success).to.be.an('error');
                });
        });
    });
});