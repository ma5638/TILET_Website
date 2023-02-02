const express = require('express');
const designRoute = require('./design');
const { check, validationResult } = require('express-validator');

const UserEditFormValidator = require('../services/user_form');

const Router = express.Router({ mergeParams: true });        /*Router object reroutes the express*/



/**
 * 
 * @param {Object} databaseService 
 * Params inside URL:
 * '/users/:userid/'
 * @param {number} userid id of the currently accessed shop's user
 */

module.exports = (databaseService) => {

    // Helper Functions
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
     * @summary GET '/user/:userid' User Shop Page
     */
    Router.get('/', async (request, response, next) => {
        const userId = request.params.userId;
        request.session.userId = userId; /* ***************** */ //---------------------------------
        const products = await databaseService.productService.getProducts(userId);
        if (!verifyUserExists(userId, request.session)) {
            return next();
        }
        databaseService.userService.getUser(userId)
            .then(user => {
                return response.render('layout', {
                    template: 'shop',
                    pageTitle: `Shop  | `,
                    userId,
                    user,
                    products,
                    session: request.session,
                    edit: false
                });
            })
            .catch(err => {
                request.session.customError = {};
                request.session.customError.subtitle = "User Not Found";
                request.session.customError.message = "";
                return next(err);
            });

    });

    /**
     * @summary GET '/user/:userid/edit' User Shop Edit Page
     */
    Router.get('/edit', async (request, response, next) => {
        const userId = request.params.userId;
        const products = await databaseService.productService.getProducts(userId);
        errors = [];
        if (request.session.errors) {
            errors = request.session.errors;
            request.session.errors = [];
        }
        // editShop = {};
        // if (request.session.editShop) {
        //     editShop = request.session.editShop;
        //     request.session.editShop = {};
        // }
        if (!verifyUserExists(userId, request.session)) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}`);     // handling unwarranted url access
        }
        databaseService.userService.getUser(userId)
            .then(user => {
                return response.render('layout', {
                    template: 'shop',
                    pageTitle: `Shop  | `,
                    userId,
                    user,
                    products,
                    session: request.session,
                    edit: true,
                    errors,
                });
            })
            .catch(err => {
                return next(err);
            });


    });

    /**
     * @summary Post '/user/:userid/edit' User Shop Edit Attempt
     */
    Router.post('/edit', [
        check('shopName')
            .trim()
            .isLength({ min: 1, max: 45 })
            .escape()
            .withMessage('Please enter the design name (maximum: 45 characters)'),
    ], async (request, response) => {
        const userId = request.params.userId;

        const errors = validationResult(request);

        request.session.errors = [];
        if (!errors.isEmpty()) {
            request.session.errors = errors.errors;
            return response.redirect(`/users/${userId}/edit`);
        }

        if (!verifyUserExists(userId, request.session)) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}`);     // handling unwarranted url access
        }

        const validator = new UserEditFormValidator(request.body, request.files, userId, databaseService);
        await validator.setShopName();
        if (validator.validateImage()) {
            const imgSuccess = await validator.setImageExtension();
            if (imgSuccess != true) {
                return next(imgSuccess);
            }
        }
        return response.redirect(`/users/${userId}`);



        // const shopName = request.body.shopName;

        // databaseService.userService.setField(shopName, "shopName", userId);

        // ------------------------------------------------------ Under Construction ------------------------------------------------------------
        // if (request.files) {
        //     let file = request.files.uploaded_image;
        //     console.log(file);

        //     if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
        //         let old_file_extension;
        //         let new_file_extension;

        // databaseService.userService.getUser(userId)
        //     .then(async user => {
        //         old_file_extension = user.shopImageExt;
        //         new_file_extension = path.parse(file.name).ext;
        //         await fsExtra.remove(path.join(__dirname, `../static/users/${userId}/${userId}${old_file_extension}`), err => {
        //             if (err) throw err;
        //         });
        //     })
        //     .then(async () => {
        //         await databaseService.userService.inTransaction(async t => {
        //             await databaseService.userService.setField(new_file_extension, "shopImageExt", userId)
        //                 .then(async () => {
        //                     await file.mv(`static/users/${userId}/${userId}` + new_file_extension, function (err) {
        //                         if (err) throw err;
        //                     });
        //                 })
        //                 .catch(err => {
        //                     return next(err);
        //                 })
        //         });
        //     })
        //     .catch(err => {
        //         return next(err);
        //     })
        //     .then(() => {
        //         return response.redirect(`/users/${userId}`);
        //     });
        // }
        //     }
    });

    /**
     * @summary GET '/user/:userid/delete' User Shop Delete Confirmation Page
     */
    Router.get('/delete', async (request, response, next) => {
        const userId = request.params.userId;
        request.session.userId = userId; /* ************ */
        if (!verifyUserExists(userId, request.session)) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}`);     // handling unwarranted url access
        }


        return response.render('layout', {
            template: 'confirmation',
            confirmation_message: 'Do you wish to permanantly delete your account?',
            pageTitle: `Delete User`,
            userId,
            session: request.session,
            edit: false,
            sendToUrl: request.baseUrl,
        });
    });

    /**
     * @summary POST '/user/:userid/delete' Confirm Delete User Page
     */

    Router.post('/delete', async (request, response, next) => {
        const userId = request.params.userId;
        request.session.userId = userId; /* ************ */
        if (!verifyUserExists(userId, request.session)) {
            return next();
        }
        else if (!verifyUserSession(userId, request.session)) {
            return response.redirect(`/users/${userId}`);     // handling unwarranted url access
        }
        request.session.userId = null;
        databaseService.userService.removeUser(userId)
            .then(() => {
                return response.redirect('/');
            })
            .catch(err => {
                return next(err);
            });

    });

    /**
     * @summary Route for designs inside shop
     */
    Router.use("/", designRoute(databaseService));



    return Router;

}