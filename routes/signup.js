const express = require('express');
const { check, validationResult } = require('express-validator');
const SignUpFormValidator = require('../services/signup_form');

const Router = express.Router();        /*Router object reroutes the express*/

/**
 * @summary prevent forbidden characters in form
 * @param {string} string string to check for forbidden characters
 * @param {array|string} forbidden array of forbidden characters
 * @returns {boolean} true if characters
 */
// function hasCharacters(string, forbidden) {
//     string = he.decode(string);
//     let found = false;
//     forbidden.forEach(character => {
//         if (string.indexOf(character) != -1) {
//             found = true;
//         }
//     });
//     if (found) {
//         return true;
//     }
//     return false;
// }

/**
 * 
 * @param {Object} databaseService Object to get database functions
 */

module.exports = (databaseService) => {

    // End Comment


    /**
     * @summary GET '/signup' Signup Page
     */
    Router.get('/', (request, response) => {
        if (request.session.userId) {
            return response.redirect('/');
        }
        errors = [];

        if (request.session.errors) {
            errors = request.session.errors;
            request.session.errors = [];
        }

        return response.render('layout', {
            template: 'signup',
            pageTitle: 'Sign Up',
            session: request.session,
            errors
        });

    });

    /**
     * @summary POST '/signup' Signup Attempt
     */
    // Router.post('/', [
    //     check('first_name')
    //         .trim()
    //         .isLength({ min: 1, max: 45 })
    //         .escape()
    //         .withMessage('Please enter your first name (maximum: 45 characters)'),
    //     check('last_name')
    //         .trim()
    //         .isLength({ min: 1, max: 45 })
    //         .escape()
    //         .withMessage('Please enter your last name (maximum: 45 characters)'),
    //     check('email')
    //         .trim()
    //         .isEmail()
    //         .normalizeEmail()
    //         .escape()
    //         .withMessage('Please enter a correct email'),
    //     check('username')
    //         .trim()
    //         .isLength({ min: 1, max: 15 })
    //         .escape()
    //         .withMessage('Please enter a username (maximum: 15 characters)'),
    //     check('password')
    //         .trim()
    //         .isLength({ min: 1, max: 15 })
    //         .escape()
    //         .withMessage('Please enter a valid password (maximum: 15 characters)'),
    // ], async (request, response, next) => {
    //     request.session.signup = {};
    //     request.session.signup.first_name = request.body.first_name;
    //     request.session.signup.last_name = request.body.last_name;
    //     request.session.signup.DOB = request.body.DOB;
    //     request.session.signup.email = request.body.email;
    //     request.session.signup.username = request.body.username;
    //     request.session.signup.shop_name = request.body.shop_name;
    //     const errors = validationResult(request);

    //     request.session.errors = [];
    //     if (!errors.isEmpty()) {
    //         request.session.errors = errors.errors;
    //     }
    //     // DOB Validation
    //     if (!moment(request.body.DOB, "DD/MM/YYYY").isValid()) {
    //         request.session.errors.push({       // for similar formatting to previous express-validator errors
    //             value: request.body.DOB,
    //             msg: 'Invalid Date',
    //             param: 'DOB',
    //             location: 'body'
    //         });
    //     }
    //     // username, password, first name, last name
    //     const special_characters = ["\\", "&", "/", "=", "-", "<", ">", ";"];
    //     if (hasCharacters(request.body.username, special_characters) ||
    //         hasCharacters(request.body.first_name, special_characters) ||
    //         hasCharacters(request.body.last_name, special_characters) ||
    //         hasCharacters(request.body.password, special_characters) ||
    //         hasCharacters(request.body.shop_name, special_characters)
    //     ) {
    //         request.session.errors.push({       // for similar formatting to previous express-validator errors
    //             msg: 'Please refrain from using the following characters: \\, &, /, =, -, <, >, ;',
    //             location: 'body'
    //         });
    //     }

    //     if (hasCharacters(request.body.username, [' '])) {
    //         request.session.errors.push({       // for similar formatting to previous express-validator errors
    //             value: request.body.username,
    //             msg: 'Please refrain from using spaces in the username',
    //             location: 'body'
    //         });
    //     }

    //     const username = request.body.username.trim();
    //     const password = request.body.password.trim();
    //     const shopName = request.body.shop_name.trim();
    //     const firstName = request.body.first_name;
    //     const lastName = request.body.last_name;
    //     const email = request.body.email;
    //     const DOB = moment(request.body.DOB, "DD/MM/YYYY").format('YYYY-MM-DD');    // SQL Date format

    //     if (await databaseService.userService.checkExistingUser(username)) {
    //         request.session.errors.push({       // for similar formatting to previous express-validator errors
    //             value: request.body.username,
    //             msg: 'Username already in use. Please choose a different username',
    //             param: 'DOB',
    //             location: 'body'
    //         });
    //     }

    //     if (request.session.errors.length > 0) {
    //         return response.redirect('/signup');
    //     }

    //     if (username && password) {
    //         databaseService.userService.inTransaction(async t => {
    //             // databaseService.userService.addUser(username, password, shopName, email, firstName, lastName, DOB, t)
    //             //     .then(success => {
    //             //         if (success == true) {
    //             //             return response.redirect('/login');
    //             //         } else {
    //             //             return next(success);
    //             //         }
    //             //     });
    //             const success = await databaseService.userService.addUser(username, password, shopName, email, firstName, lastName, DOB, t);
    //             if (success == true) {
    //                 return response.redirect('/login');

    //             } else {
    //                 return next(success);   // next(err)
    //             }
    //         });
    //     }
    // });
    Router.post('/', [
        check('first_name')
            .trim()
            .isLength({ min: 1, max: 45 })
            .escape()
            .withMessage('Please enter your first name (maximum: 45 characters)'),
        check('last_name')
            .trim()
            .isLength({ min: 1, max: 45 })
            .escape()
            .withMessage('Please enter your last name (maximum: 45 characters)'),
        check('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .escape()
            .withMessage('Please enter a correct email'),
        check('username')
            .trim()
            .isLength({ min: 1, max: 15 })
            .escape()
            .withMessage('Please enter a username (maximum: 15 characters)'),
        check('password')
            .trim()
            .isLength({ min: 6, max: 15 })
            .escape()
            .withMessage('Please enter a valid password (minimum: 6, maximum: 15 characters)'),
    ], async (request, response, next) => {
        request.session.signup = {};
        request.session.signup.first_name = request.body.first_name;
        request.session.signup.last_name = request.body.last_name;
        request.session.signup.DOB = request.body.DOB;
        request.session.signup.email = request.body.email;
        request.session.signup.username = request.body.username;
        request.session.signup.shop_name = request.body.shop_name;
        const errors = validationResult(request);

        // if (process.env.NODE_ENV == "testing") {
        //     if (!request.body.test) {
        //         databaseService = {
        //             userService: {
        //                 checkExistingUser: function () { return false; },
        //                 inTransaction: function (fn) { fn(); },
        //                 addUser: function () { try { return 0 / 0; } catch (err) { return err; } },
        //             }
        //         };
        //     } else {
        //         databaseService = {
        //             userService: {
        //                 checkExistingUser: function () { return true; },
        //                 inTransaction: function (fn) { fn(); },
        //                 addUser: function () { return 20; },
        //             }
        //         };
        //     }
        // }

        request.session.errors = [];
        if (!errors.isEmpty()) {
            request.session.errors = errors.errors;
            return response.redirect('/signup');
        }

        const validator = new SignUpFormValidator(request.body, databaseService, request.session.errors);

        if (!(validator.validate())) {
            return response.redirect('/signup');
        } else if (await !(validator.verify())) {
            return response.redirect('/signup');
        } else {
            const userId = await validator.signUp();
            return response.redirect('/login');
        }
    });
    return Router;
}