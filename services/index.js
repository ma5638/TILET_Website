// const Sequelize = require('sequelize');
const userDbService = require('./userDbService');
const productDbService = require('./productDbService');

/**
 * @summary exports user database functions and product database functions
 * @exports userDbService user database functions
 * @exports productDbService product database functions
 */

module.exports = (sequelize, model) => {
    return {
        userService: userDbService(sequelize, model.userLogins),
        productService: productDbService(sequelize, model.designs)
    }

}