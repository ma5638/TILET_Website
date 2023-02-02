const path = require('path');

/**
* Returns object DB that contains both databases:
* UserLogins and productsDb
* @param {Object} sequelize object created from sequelize module
* @returns {Object}
*/

module.exports = (sequelize) => {

    db = {};
    db[0] = sequelize.import(path.join(__dirname, './userLogin.js'));
    db[1] = sequelize.import(path.join(__dirname, './productsDb.js'));


    // Relationship
    db[0].hasMany(db[1], { foreignKey: 'userId' });
    db[1].belongsTo(db[0], { foreignKey: 'userId' });

    return db;

};