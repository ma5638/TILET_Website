/**
 * @task
 * 1. 3 contexts and its left
 */

// const proxyquire = require('proxyquire');
// const sinon = require('sinon')

const chai = require('chai');
// const should = chai.should();
const config = require('../../../config');
const Sequelize = require('sequelize');

const expect = chai.expect;

const models = require('../../../models/sequelize');

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

const productDbService = require('../../../services/productDbService')(config.mysql.client, config.mysql.client.models.designs);

describe('Product Database Functions', () => {

    context('Get Products', () => {
        it('should get the products from the database from userId 3', () => {
            return productDbService.getProducts(3)
                .then(userProducts => {
                    userProducts.length.should.be.above(0);
                });
        });
        it('should not get the products from the database from userId 7', () => {
            return productDbService.getProducts(7)
                .then(userProducts => {
                    userProducts.length.should.be.equal(0);
                });
        });
    });
    context('Filter Products', () => {
        it('should show the products that start with "Design" ordered by descending price', () => {
            return productDbService.filterProducts("Design", "Descending Price")
                .then(searchedProducts => {
                    let previousPrice = Number.MAX_SAFE_INTEGER;
                    searchedProducts.forEach(product => {
                        product.designName.should.contain('Design');
                        product.price.should.be.at.most(previousPrice);
                        previousPrice = product.price;
                    });
                });
        });
        it('should show all products ordered by ascending price', () => {   // Need to fix all
            return productDbService.filterProducts("", "Ascending Price")
                .then(searchedProducts => {
                    let previousPrice = -1;
                    searchedProducts.forEach(product => {
                        product.price.should.be.at.least(previousPrice);
                        previousPrice = product.price;
                    });
                });
        });
        it('should show all products ordered by newest', () => {   // Need to fix all
            return productDbService.filterProducts("", "Newest")
                .then(searchedProducts => {
                    let previousDate = new Date(-8640000000000000);
                    let currentDate;
                    searchedProducts.forEach(product => {
                        currentDate = new Date(product.CreatedAt);
                        currentDate.should.be.at.least(previousDate);
                        previousPrice = new Date(product.CreatedAt);
                    });
                });
        });
    });

    context('Get New Products', () => {
        it('should show the newest 4 products', () => {
            return productDbService.getNewProducts(4)
                .then(newProducts => {
                    newProducts.length.should.be.equal(4);
                });
        });
        it('should default to showing 6 products despite wrong input', () => {
            return productDbService.getNewProducts('Not a number')
                .then(newProducts => {
                    newProducts.length.should.be.equal(6);
                });
        });
    });


    context('Verifying if Design Exists and Belongs to User', () => {
        it('should verify that iddesign 65 exists and belongs to userId 1', () => {
            return productDbService.verifyDesign(65, 1)
                .then(presence => {
                    presence.should.be.true;
                });
        });
        it('should reject because iddesign 65 exists but does not belong to userId 19', () => {
            return productDbService.verifyDesign(65, 19)
                .then(presence => {
                    presence.should.be.false;
                });
        });
        it('should reject because iddesign 10 does not exists (nor belongs to userId 51)', () => {
            return productDbService.verifyDesign(10, 51)
                .then(presence => {
                    presence.should.be.false;
                });
        });
        it('should reject because of error', () => {
            return productDbService.verifyDesign("aksmaslkdas \" asm/?!1#$%^&*()", "aksmaslkdas asm/?!1#$%^&*()")
                .then(presence => {
                    presence.should.be.false;
                });
        });
    });
    context('Getting Design Attributes', () => {
        it('should return a design with id 65', () => {
            return productDbService.getDesign(65)
                .then(design => {
                    design.iddesign.should.be.equal(65);
                });
        });
        it('should not return a design with id 27', () => {
            return productDbService.getDesign(27)
                .then(design => {
                    expect(design).to.be.undefined;
                });
        });
    });
    context('Change extension column of user', () => {
        it('should update the extension from .jpg to .png and back', () => {
            productDbService.setExtension(1, 65, '.png')
                .then(async () => {
                    let product = await productDbService.getDesign(65);
                    expect(product.imageExtension).to.be.equal('.png')
                })
                .then(async () => {
                    await productDbService.setExtension(1, 65, '.jpg');
                    let product = await productDbService.getDesign(65);
                    expect(product.imageExtension).to.be.equal('.jpg');
                });

        });
    });
    context('Updating Attributes of a Particular Design', () => {
        it('should change the description, price and designName of iddesign 65 and revert changes', async () => {
            let fieldNames = ["designName", "price", "description"];
            let newAttr = ["Design 65", 2000, "Picture of Honey"];
            // let newAttr = ["Changed Design Name", 2274, "An amazing product!"];
            let product = await productDbService.getDesign(65);
            const originalAttr = [product.designName, product.price, product.description];
            let currentAttr;

            if (originalAttr[0] == newAttr[0] && originalAttr[1] == newAttr[1] && originalAttr[2] == newAttr[2]) {
                console.log("Possible Pre-equality of new fields and original fields");
                expect(0).to.be.equal(1);
            }

            productDbService.setField(65, fieldNames, newAttr)
                .then(async () => {
                    product = await productDbService.getDesign(65);
                    currentAttr = [product.designName, product.price, product.description];
                    expect(currentAttr[0]).to.be.equal(newAttr[0]);
                    expect(currentAttr[1]).to.be.equal(newAttr[1]);
                    expect(currentAttr[2]).to.be.equal(newAttr[2]);
                })
                .then(async () => {
                    await productDbService.setField(65, fieldNames, originalAttr)
                        .then(async () => {
                            product = await productDbService.getDesign(65);
                            currentAttr = [product.designName, product.price, product.description];
                            expect(currentAttr[0]).to.be.equal(originalAttr[0]);
                            expect(currentAttr[1]).to.be.equal(originalAttr[1]);
                            expect(currentAttr[2]).to.be.equal(originalAttr[2]);
                        });
                });
        });
    });

    context('Adding and Removing a New Design', () => {
        it('should create a new design and then delete it', async () => {
            const userId = 1;
            const designName = "Absolutely new Design";
            const price = 2500;
            const description = "Should not be seen on Db";
            // const imageExtension;
            values = {
                userId,
                designName,
                price,
                description
            }
            productDbService.addDesign(values)
                .then(async newId => {
                    const product = await productDbService.getDesign(newId);
                    expect(product.iddesign).to.be.equal(newId);
                    await productDbService.removeDesign(values.userId, newId)
                        .then(async success => {
                            expect(success).to.be.true;
                            const stillPresent = await productDbService.verifyDesign(newId, values.userId);
                            expect(stillPresent).to.be.false;
                        });
                });

        });
    });



});

