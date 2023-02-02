// TODO
// 1. Font Change
// 2. Add Fields
// 3. Remove button around signup
const express = require('express');
const createError = require('http-errors');

const Router = express.Router();        /*Router object reroutes the express*/
const userRoute = require('./user');
const browseRoute = require('./browse');
const config = require('../config');
const databaseService = require('../services')(config.mysql.client, config.mysql.client.models);
const signupRoute = require('./signup');
const loginRoute = require('./login');



module.exports = () => {

    // Middle ware to ignore requests to favicon.ico
    Router.use((request, response, next) => {
        if (!(request.originalUrl && request.originalUrl.split("/").pop() === 'favicon.ico')) {
            return next();
        }
    });

    Router.get('/', async (request, response, next) => {
        const newArrivals = await databaseService.productService.getNewProducts(5);
        return response.render('layout', {
            template: 'index',
            pageTitle: 'Home',
            newArrivals,
            session: request.session,
        });
    });

    // logout route
    Router.get('/logout', (request, response) => {
        request.session.userId = null;
        return response.redirect('/');
    });

    // user shop route
    Router.get('/dashboard', (request, response) => {
        if (request.session.userId) {
            return response.redirect(`/users/${request.session.userId}`);
        }
    });

    // about us
    Router.get('/about', (request, response) => {
        return response.render('layout', {
            template: 'about',
            pageTitle: `About Us`,
            session: request.session,
        });
    })
    Router.use('/browse', browseRoute(databaseService));
    Router.use('/users/:userId', userRoute(databaseService));
    Router.use('/signup', signupRoute(databaseService));
    Router.use('/login', loginRoute(databaseService));

    // Not Found Page
    Router.use(
        (request, response, next) => {
            next(createError(404, request.url));
        });

    // Default Error Page
    Router.use(
        (err, request, response, next) => {
            function checkEmptyJSON(obj) {
                try {
                    for (var i in obj) return true;
                    return false;
                } catch (err) {
                    return false;
                }
            }
            // console.log("-----Start of error-----");
            // console.error(err);
            // console.log("----- End of error -----");
            const code = err.status || 500;

            if (request.session.customError && checkEmptyJSON(request.session.customError)) {
                const title = request.session.customError.title ? request.session.customError.title : `Error ${code}`;
                const subtitle = request.session.customError.subtitle ? request.session.customError.subtitle : 'Internal Error';
                const message = request.session.customError.message ? request.session.customError.message : '';

                if (code == 404) {
                    subtitle = "Not Found";
                }

                request.session.customError = {};
                response.render('layout', {
                    template: 'error',
                    pageTitle: `${title}`,
                    title,
                    subtitle,
                    message,
                    session: request.session,
                });
            } else {
                subtitle = "";
                if (code == 404) {
                    subtitle = "Not Found";
                } else {
                    subtitle = "Internal Error"
                }
                response.render('layout', {
                    template: 'error',
                    pageTitle: `Error ${code}: ${subtitle}`,
                    title: `Error ${code}`,
                    subtitle,
                    message: '',
                    session: request.session,
                });
            }
        });

    return Router;
}