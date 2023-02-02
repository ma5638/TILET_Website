const chai = require('chai');
const createError = require('http-errors');
const expect = chai.expect;
let UserEditFormValidator = require('../../../services/user_form');



describe('Shop Editing and Adding', () => {
    context('Validation', () => {
        let validator;
        let errors;
        beforeEach(() => {
            errors = [];
        });
        it('should validate the valid image', () => {
            const body = {
                shopName: "Test shop Name"
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                    mimetype: "image/jpeg",
                    mv: async function (path) { }
                }
            };
            validator = new UserEditFormValidator(body, files, userId, {});
            validator.validateImage().should.be.true;
        });
        it('should not validate the valid image', () => {
            const body = {
                shopName: "Test shop Name"
            }
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.jpg",
                }
            };
            validator = new UserEditFormValidator(body, files, userId, {});
            validator.validateImage().should.be.false;
        });

        const databaseStub = {
            userService: {
                setField: async function () { },
                getUser: async function (userId) {
                    return {
                        shopImageExt: ".jpg"
                    };
                }
            }
        };
        const databaseErrorStub = {
            userService: {
                setField: async function (x, y, z) { throw createError(404, "Custom Error") },
                getUser: async function (userId) {
                    // throw createError(404, "Custom Error");
                    return {
                        shopImageExt: ".jpg"
                    };
                }
            }
        };

        it('should validate and change the shop name', async () => {
            const body = {
                shopName: "Test shop Name"
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.png",
                    mimetype: "image/png",
                    mv: async function (path) { }
                }
            };
            validator = new UserEditFormValidator(body, files, userId, databaseStub);
            expect(validator.validateImage()).to.be.true;
            const shopNameSuccess = await validator.setShopName();
            expect(shopNameSuccess).to.be.true;
        });

        it('should validate, change the shop name and set image extension', async () => {
            const body = {
                shopName: "Test shop Name"
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.png",
                    mimetype: "image/png",
                    mv: async function (path) { }
                }
            };
            validator = new UserEditFormValidator(body, files, userId, databaseStub);
            expect(validator.validateImage()).to.be.true;
            const shopNameSuccess = await validator.setShopName();
            expect(shopNameSuccess).to.be.true;
            const imgExtensionSuccess = await validator.setImageExtension()
            expect(imgExtensionSuccess).to.not.be.an('error').and.not.be.undefined;
        });

        it('should validate but return an error for setting image extension', async () => {
            const body = {
                shopName: "Test shop Name"
            };
            const userId = 1;
            let files = {
                uploaded_image: {
                    name: "sthg.png",
                    mimetype: "image/png",
                    mv: async function (path) { }
                }
            };
            validator = new UserEditFormValidator(body, files, userId, databaseErrorStub);
            expect(validator.validateImage()).to.be.true;
            const imgExtensionSuccess = await validator.setImageExtension();
            expect(imgExtensionSuccess).to.be.an('error');
        });
    });
});