/**
 * @task
 * 1. 3 contexts and its left
 */

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const chai = require('chai');
const should = chai.should();
const config = require('../../../config');
const Sequelize = require('sequelize');
const models = require('../../../models/sequelize');
const expect = chai.expect;

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

const userDbService = require('../../../services/userDbService')(config.mysql.client, config.mysql.client.models.userLogins);

describe('User Database Functions', () => {


    context('Sign Up', () => {
        it('should verify that username allee exists', () => {
            userDbService.checkExistingUser('allee')
                .then(exists => {
                    exists.should.be.true;
                });
        });
        it('should return false username allee extra is free', () => {
            userDbService.checkExistingUser('allee extra')
                .then(exists => {
                    exists.should.be.false;
                });
        });
    });

    context('Log In', () => {
        it('should verify username "allee2" and password "pass"', () => {
            userDbService.verifyUser('allee2', 'pass')
                .then(loginSuccess => {
                    loginSuccess.should.be.equal(3);    // function returns userId
                });
        });
        it('should not verify false username "allee2 extra" and password "pass"', () => {
            userDbService.verifyUser('allee2 extra', 'pass')
                .then(loginSuccess => {
                    loginSuccess.should.be.equal(-1);   // -1 means failed login
                });
        });
    });
    context('User Exists for /users/:userid', () => {
        it('should verify userid 4', () => {
            userDbService.verifyUserExists(4)
                .then(userExists => {
                    userExists.should.be.true;    // function returns userId
                });
        });
        it('should not verify false userid 11', () => {
            userDbService.verifyUserExists(11)
                .then(userExists => {
                    userExists.should.be.false;   // -1 means failed login
                });
        });
        it('should not verify false input userid "fake"', () => {
            userDbService.verifyUserExists("fake")
                .then(userExists => {
                    userExists.should.be.false;   // -1 means failed login
                });
        });
    });

    context('Get User Attributes', () => {
        it('should return user attributes of user id 6', () => {
            userDbService.getUser(6)
                .then(user => {
                    user.First_Name.should.be.equal('Jalal');
                });
        });
        it('should verify false user id 7 and return undefined', () => {
            userDbService.getUser(7)
                .then(user => {
                    expect(user).to.be.undefined;
                });
        });
    });
    context('Shop Searching', () => {
        it('should find user with shop name that is "Westerner Mall"', () => {
            userDbService.searchUsers("Westerner Mall")
                .then(shopList => {
                    shopList.length.should.be.equal(1);
                });
        });
        it('should find user with shop name that contains "Co"', () => {
            userDbService.searchUsers("Co")
                .then(shopList => {
                    shopList.length.should.be.equal(2);
                });
        });
        it('should not find any shop that contains "PMH Not Any Shop"', () => {
            userDbService.searchUsers("PMH Not Any Shop")
                .then(shopList => {
                    shopList.length.should.be.equal(0);
                });
        });
    });
    context('Adding and Removing a New User', () => {
        it('should create and delete a new user', () => {
            return userDbService.addUser(
                "FreeUser",
                "SecretPass",
                "Some shop",
                "sthg@sthg.com",
                "My",
                "Name",
                "2001-01-01"
            )
                .then(async userId => {
                    expect(userId).to.not.be.an('error').and.not.be.undefined;
                    return await userDbService.verifyUser("FreeUser", "SecretPass");
                })
                .then(userId => {
                    expect(userId).to.not.be.an('error').and.not.be.undefined;
                    return userId;
                })
                .then(async userId => {
                    await userDbService.removeUser(userId);
                    return await userDbService.verifyUserExists(userId);
                })
                .then(exists => {
                    expect(exists).to.be.false;
                });
        });
    });
    context('Update Existing User Attributes', () => {
        it('should update the shop name and revert it', () => {
            const shop_name = "Western Mall";
            let original_shop_name = "Westerner Mall";
            userDbService.getUser(1)
                .then(async user => {
                    // original_shop_name = user.shopName;
                    await userDbService.setField(shop_name, "shopName", 1);
                }).then(async () => {
                    let db_shop = await userDbService.getUser(1);
                    const db_shop_name = db_shop.shopName;
                    expect(db_shop_name).to.be.equal(shop_name);
                })
                .then(async () => {
                    await userDbService.setField(original_shop_name, "shopName", 1);

                })
                .then(async () => {
                    let db_shop = await userDbService.getUser(1);
                    const db_shop_name = db_shop.shopName;
                    expect(db_shop_name).to.be.equal(original_shop_name);
                });
        });


    });
});

