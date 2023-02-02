const chai = require('chai');
const createError = require('http-errors');
const expect = chai.expect;
let DesignFormValidator = require('../../../services/design_form');



describe('Design Editting and Adding', () => {
    context('Validation', () => {
        let validator;
        let errors;
        beforeEach(() => {
            errors = [];
        });

        it('should validate the valid image', () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            }
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, {}, errors);
            validator.validateImage().should.be.true;
        });


        it('should not validate the incorrect image', () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            }
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    // mimetype: "commented out",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, {}, errors);
            validator.validateImage().should.be.false;
        });

        it('should not validate the incorrect image file', () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            }
            const userId = 1;
            let files = {}; // wrong object format
            validator = new DesignFormValidator(body, files, userId, {}, errors);
            validator.validateImage().should.be.false;
        });



    });
    context("Creating Product", () => {
        let validator;
        let errors;
        const databaseStub = {
            productService: {
                addDesign: async function () {
                    return 80;
                },
                setField: async function () { }
            }
        };
        const databaseErrorStub = {
            productService: {
                addDesign: async function () { throw createError(404, "Custom Error"); },
                setField: async function () { throw createError(404, "Custom Error"); }
            }
        };
        beforeEach(() => {
            errors = [];
        });
        it('should validate and create a new product', async () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, databaseStub, errors);
            expect(validator.validateImage()).to.be.true;
            const establishSuccess = await validator.establish(false, -1);
            expect(establishSuccess).to.not.be.an('error').and.not.be.undefined;
        });
        it('should validate but not create a new product', async () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, databaseErrorStub, errors);
            expect(validator.validateImage()).to.be.true;
            const establishSuccess = await validator.establish(false, -1);
            expect(establishSuccess).to.be.an('error');
        });
        it('should validate create a new product, delete it and create folder for image', async () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, databaseStub, errors);
            expect(validator.validateImage()).to.be.true;
            const establishSuccess = await validator.establish(false, -1);
            expect(establishSuccess).to.not.be.an('error').and.not.be.undefined;
            const imageSuccess = await validator.setImage();
            expect(imageSuccess).to.be.true;
        });
        it('should validate return error when creating folder for image', async () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { throw createError(404, "Custom Error") }
                }
            };
            validator = new DesignFormValidator(body, files, userId, databaseStub, errors);
            expect(validator.validateImage()).to.be.true;
            const establishSuccess = await validator.establish(false, -1);
            expect(establishSuccess).to.not.be.an('error').and.not.be.undefined;
            const imageSuccess = await validator.setImage();
            expect(imageSuccess).to.be.an('error');
        });
        it('should validate create a new product with default price 0 (due to incorrect input for price)', async () => {
            const body = {
                designName: "allee",
                price: "sas",
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, databaseStub, errors);
            expect(validator.price).to.be.equal(0);
        });
        it('should change values of an existing a new product', async () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new DesignFormValidator(body, files, userId, databaseStub, errors);
            expect(validator.validateImage()).to.be.true;
            const establishSuccess = await validator.establish(true, 66);
            expect(establishSuccess).to.not.be.an('error').and.not.be.undefined;
        });
        it('should not change values of an existing a new product', async () => {
            const body = {
                designName: "allee",
                price: 200,
                description: "Try it",
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            // Using error database stub
            validator = new DesignFormValidator(body, files, userId, databaseErrorStub, errors);
            expect(validator.validateImage()).to.be.true;
            const establishSuccess = await validator.establish(true, 66);
            expect(establishSuccess).to.be.an('error');
        });
    });
});