const express = require('express');
const { check, validationResult } = require('express-validator');

const Router = express.Router();

/**
 *  @summary Returns Express Router for login 
 */

module.exports = (databaseService) => {
    /**
     * @summary GET '/' login Page
     */
    Router.get('/', (request, response) => {
        if (request.session.userId) {
            return response.redirect('/');
        }
        let errors = [];
        if (request.session.errors) {
            errors = request.session.errors;
            request.session.errors = [];
        }
        return response.render('layout', {
            template: 'login',
            pageTitle: 'Login',
            session: request.session,
            errors
        });

    });

    /**
     * @summary POST '/' login attempt
     */

    Router.post('/', async (request, response) => {
        const errors = validationResult(request);
        request.session.errors = [];
        if (!errors.isEmpty()) {
            request.session.errors = errors.errors;

        }
        const username = request.body.username.trim();
        const password = request.body.password.trim();
        databaseService.userService.verifyUser(username, password)
            .then((userId) => {             // userId == -1 => failed login
                if (userId != -1) {
                    request.session.userId = userId;
                    return response.redirect('/');
                } else {
                    request.session.login = {};
                    request.session.login.username = username;
                    request.session.errors.push({
                        msg: 'Invalid Username or Password'
                    });
                    return response.redirect('/login');
                }
            });
    });

    return Router;

}