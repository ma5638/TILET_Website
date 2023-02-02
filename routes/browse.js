
const express = require('express');
const config = require('../config');
const url = require('url');

const Router = express.Router();

/**
 * @summary Router module for browsing designs/products and user shops
 * @param {Object} databaseService functions for database control
 */

module.exports = (databaseService) => {

    /**
     * @summary browsing and searching designs
     */
    Router.get('/designs', async (request, response, next) => {
        let url_parts = url.parse(request.url, true);
        let query = url_parts.query;
        let search = "";
        let sort = "";
        request.session.browseDesigns = {};
        // change value of search and sort only if the objects exist in URL query
        if (query) {
            if (query.search) {
                search = query.search;
                request.session.browseDesigns.search = query.search;
            }
            if (query.sort) {
                sort = query.sort;
                request.session.browseDesigns.sort = query.sort;
            }
        }
        try {
            const products = await databaseService.productService.filterProducts(search, sort);
            return response.render('layout', {
                template: 'browse_designs',
                pageTitle: 'Browse Designs',
                products,
                session: request.session,
            });
        } catch (err) {
            request.session.customError = {};
            request.session.customError.title = null;
            request.session.customError.subtitle = "Designs Not Found";
            request.session.customError.message = "Try refreshing?";
            return next(err);
        }
    });

    /**
     * @summary browsing and searching shops
     */
    Router.get('/shops', async (request, response, next) => {
        let url_parts = url.parse(request.url, true);
        let query = url_parts.query;
        let search = "";
        if (query && query.search) {
            search = query.search;
        }

        try {
            const users = await databaseService.userService.searchUsers(search);
            return response.render('layout', {
                template: 'browse_shops',
                pageTitle: 'Browse Shops',
                users,
                session: request.session,
            });
        } catch (err) {
            request.session.customError = {};
            request.session.customError.title = null;
            request.session.customError.subtitle = "Shops Not Found";
            request.session.customError.message = "Try refreshing?";
            return next(err);
        }
    });



    return Router;
}