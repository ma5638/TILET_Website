const express = require('express');
const { check, validationResult } = require('express-validator');

const DesignFormValidator = require('../services/design_form');

const Router = express.Router({ mergeParams: true });        /*Router object reroutes the express*/


/**
 * 
 * @param {Object} databaseService 
 * Params inside URL:
 * '/users/:userid/:product'
 * @param {number} userid id of the currently accessed shop's user
 * @param {number} product id of the design
 */


module.exports = (databaseService) => {

    // Helper Functions
    async function verifyDesign(productId, userId) {
        try {
            return (await databaseService.productService.verifyDesign(productId, userId));
        } catch (err) {
            return false;
        }
    }

    async function verifyUserExists(userId) {
        try {
            return (await databaseService.userService.verifyUserExists(userId));
        } catch (err) {
            return false;
        }
    }

    function verifyUserSession(userId, session) {
        return (session.userId && session.userId == userId);
    }

    // Helper Functions End

    /**
     * @summary GET '/user/:userid/addProduct' Add New Product
     */
    Router.get('/addProduct', async (request, response, next) => {
        const userId = request.params.userId;
        const designName = "Delete";
        const price = 2000;
        const description = "Oh nooo";//---------------------------------
        const file_extension = ".jpg";

        errors = [];

        if (request.session.errors) {
            errors = request.session.errors;
            request.session.errors = [];
        }
        addProd = {};
        if (request.session.addProd) {
            addProd = request.session.addProd;
            request.session.addProd = {};
        }

        request.session.userId = userId;

        if (!(await verifyUserExists(userId))) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}/`);     // handling unwarranted url access
        }

        return response.render('layout', {
            template: 'design',
            pageTitle: 'New Design',
            userId,
            product: false,
            session: request.session,
            edit: true,
            errors,
            addProd
        });
    });

    /**
     * @summary POST '/user/:userid/addProduct' Confirm Adding New Product
     */

    Router.post('/addProduct', [
        check('designName')
            .trim()
            .isLength({ min: 1, max: 45 })
            .escape()
            .withMessage('Please enter the design name (maximum: 45 characters)'),
        check('price')
            .trim()
            .isInt({
                min: 0,
            })
            .escape()
            .withMessage('Please enter a non-negative price'),
        check('description')
            .trim()
            .isLength({ min: 0, max: 300 })
            .escape()
            .withMessage('Maximum characters allowed for description: 300'),
    ], async (request, response, next) => {
        // Error Handling
        const userId = request.params.userId;

        request.session.addProd = {};
        request.session.addProd.designName = request.body.designName;
        request.session.addProd.price = request.body.price;
        request.session.addProd.description = request.body.description;

        const errors = validationResult(request);

        request.session.errors = [];
        if (!errors.isEmpty()) {
            request.session.errors = errors.errors;
            console.log(request.session.errors);
            return response.redirect(`/users/${userId}/addProduct`);
        }

        request.session.userId = userId;    //--------------------
        if (!(await verifyUserExists(userId))) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}/`);     // handling unwarranted url access
        }

        // if (!request.files) {
        //     request.session.errors.push({
        //         msg: "Please upload a file",
        //     });
        //     return response.redirect(`/users/${userId}/addProduct`);
        // }

        const validator = new DesignFormValidator(request.body, request.files, userId, databaseService, request.session.errors);

        const iddesign = await validator.establish(false, -1);
        console.log(iddesign);
        if (validator.validateImage()) {
            await validator.setImage();
        }
        if (request.session.errors.length > 0) {
            console.log(request.session.errors);
            return response.redirect(`/users/${userId}/addProduct`);
        }
        return response.redirect(`/users/${userId}/${iddesign}`);

    });

    /**
     * @summary GET '/user/:userid/:product' View Existing Product
     */
    Router.get('/:product', async (request, response, next) => {
        const userId = request.params.userId;
        const productId = request.params.product;
        if (!(await verifyUserExists(userId))) {
            return next();
        } else if (!(await verifyDesign(productId, userId))) {
            return next();
        }

        databaseService.productService.getDesign(productId)
            .then((product) => {
                return response.render('layout', {
                    template: 'design',
                    pageTitle: `${product.designName}`,
                    userId,
                    product,
                    session: request.session,
                    edit: false,
                });
            })
            .catch(err => {
                return next(err);
            });
    });

    /**
     * @summary GET '/user/:userid/:product/edit' Edit Existing Product Page
     */

    Router.get('/:product/edit', async (request, response, next) => {
        const userId = request.params.userId;
        request.session.userId = userId;
        const productId = request.params.product;
        // request.session.userId = userId;
        errors = [];
        if (request.session.errors) {
            errors = request.session.errors;
            request.session.errors = [];
        }
        addProd = {};
        if (request.session.addProd) {
            addProd = request.session.addProd;
            request.session.addProd = {};
        }

        if (!(await verifyUserExists(userId))) {
            return next();
        } else if (!(await verifyDesign(productId, userId))) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}/${productId}`);     // handling unwarranted url access
        }
        let product;
        try {
            product = await databaseService.productService.getDesign(productId);
        } catch (err) {
            return next(err);
        }

        databaseService.productService.getDesign(productId)
            .then((product) => {

                return response.render('layout', {
                    template: 'design',
                    pageTitle: `${product.designName}`,
                    userId,
                    product,
                    session: request.session,
                    edit: true,
                    errors,
                    addProd
                });
            })
            .catch(err => {
                return next(err);
            });
    });

    /**
     * @summary POST '/user/:userid/:product/edit' Confirm Changes to Edit Existing Product
     */

    Router.post('/:product/edit', [
        check('designName')
            .trim()
            .isLength({ min: 1, max: 45 })
            .escape()
            .withMessage('Please enter the design name (maximum: 45 characters)'),
        check('price')
            .trim()
            .isInt({
                min: 0,
            })
            .escape()
            .withMessage('Please enter a non-negative price'),
        check('description')
            .trim()
            .isLength({ min: 0, max: 300 })
            .escape()
            .withMessage('Maximum characters allowed for description: 300'),
    ], async (request, response, next) => {

        const userId = request.params.userId;
        const productId = request.params.product;
        request.session.addProd = {};
        request.session.addProd.designName = request.body.designName;
        request.session.addProd.price = request.body.price;
        request.session.addProd.description = request.body.description;

        const errors = validationResult(request);

        request.session.errors = [];
        if (!errors.isEmpty()) {
            request.session.errors = errors.errors;
        }
        if (request.session.errors.length > 0) {
            return response.redirect(`/users/${userId}/${productId}/edit`);
        }

        if (!(await verifyUserExists(userId))) {
            return next();
        } else if (!(await verifyDesign(productId, userId))) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}/${productId}`);     // handling unwarranted url access
        }

        const validator = new DesignFormValidator(request.body, request.files, userId, databaseService, request.session.errors);

        await validator.establish(true, productId);
        if (validator.validateImage()) {
            await validator.setImage();
        }
        if (request.session.errors.length > 0) {
            console.log(request.session.errors);
            return response.redirect(`/users/${userId}/addProduct`);
        }
        return response.redirect(`/users/${userId}/${productId}`);
    });

    /**
     * @summary GET '/user/:userid/:product/delete' Delete Product Changes
     */
    Router.get('/:product/delete', async (request, response, next) => {
        const userId = request.params.userId;
        const productId = request.params.product;

        if (!(await verifyUserExists(userId))) {
            return next();
        } else if (!(await verifyDesign(productId, userId))) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}/${productId}`);     // handling unwarranted url access
        }

        databaseService.productService.getDesign(productId)
            .then(product => {
                return response.render('layout', {
                    template: 'design_delete',
                    pageTitle: `${product.designName}`,
                    userId,
                    product,
                    session: request.session,
                    edit: false,
                });
            })
            .catch(err => {
                return next(err);
            });
    });

    /**
     * @summary POST '/user/:userid/:product/delete' Confirm Deletion of Product
     */
    Router.post('/:product/delete', async (request, response, next) => {
        const productId = request.params.product;
        const userId = request.params.userId;
        if (!(await verifyUserExists(userId))) {
            return next();
        } else if (!(await verifyDesign(productId, userId))) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}/${productId}`);     // handling unwarranted url access
        }
        databaseService.productService.removeDesign(userId, productId)
            .then(() => {
                return response.redirect(`/users/${userId}`);
            })
            .catch(err => {
                return next(err);
            });


    });

    return Router;
}