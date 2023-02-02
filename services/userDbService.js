const fs = require('fs');
// const { nextTick } = require('process');
const path = require('path');
const fsExtra = require('fs-extra');

module.exports = (sequelize, model) => {
    /**
     * @summary Function to reverse database changes if error occurs
     * @param {function} work 
     * @returns {void}
     */
    async function inTransaction(work) {
        const t = await sequelize.transaction();

        try {
            await work(t);
            return t.commit();
        } catch (err) {
            t.rollback();
            throw err;
        }
    }

    /**
     * @summary create new user
     * @param {string} username 
     * @param {string} password 
     * @param {string} shopName 
     * @param {string} email 
     * @param {string} firstName 
     * @param {string} lastName 
     * @param {string} DOB date of birth
     * @param {string} transaction 
     * @returns {Object} rowObject
     */

    async function addUser(username, password, shopName, email, firstName, lastName, DOB) {
        let userId;

        await inTransaction(async t => {
            try {
                const newUser = await model.create({
                    username: username,
                    password: password,
                    shopName: shopName,
                    Email: email,
                    First_Name: firstName,
                    Last_Name: lastName,
                    DOB: DOB,
                }, { transaction: t });
                userId = newUser.userId;
                // fsExtra.exists(`static/users/${userId}/`).then(async present => {   // fix this felix ----------------
                //     if (present) {
                //         await fsExtra.remove(`static/users/${userId}/`, err => {
                //             if (err) throw err;
                //         });
                //     }
                // })
                //     .then(async () => {
                //         await fsExtra.mkdir(`static/users/${userId}/`, err => {
                //             if (err) throw err;
                //         });
                //     });
                fsExtra.ensureDir(`static/users/${userId}/`);


            } catch (err) {
                userId = err;       //-------------TEST--------
            }

        });
        return userId;


    }

    /**
     * @summary remove user
     * @param {number} userId 
     * @returns {void}
     */
    async function removeUser(userId) {
        await inTransaction(async t => {
            await sequelize.query(`DELETE FROM userLogins WHERE userId = ?;`, {
                replacements: [userId],
            });

        });
        fsExtra.remove(path.join(__dirname, `../static/users/${userId}`));
    }

    /**
     * @summary checks if username exists
     * @param {string} username 
     * @returns {boolean} true if exists
     */

    async function checkExistingUser(username) {
        const existing = await sequelize.query(`SELECT * FROM userLogins WHERE username = ?;`, {
            replacements: [username],
        });
        return existing[0].length != 0;

    }
    /**
     * @summary verify login
     * @param {string} username 
     * @param {string} password 
     * @returns userId if true
     * @returns -1 if failed
     */

    async function verifyUser(username, password) {
        const existing = await sequelize.query(`SELECT * FROM userLogins WHERE username=? AND password=?;`,
            {
                replacements: [username, password],
                model: sequelize.models.userLogins,
                mapToModel: false
            });
        if (existing.length != 0) {
            return existing[0].dataValues.userId;
        } else {
            return -1;
        }
    }

    /**
     * @summary verify user with given userId exists
     * @param {number} userId 
     * @return {boolean} true if exists
     */
    async function verifyUserExists(userId) {
        const existing = await sequelize.query(`SELECT * FROM userLogins WHERE userId=?;`,
            {
                replacements: [userId],
                model: sequelize.models.userLogins,                                     // Can be used after db model was created
                mapToModel: false // pass true here if you have any mapped fields
            });
        return existing.length > 0;
    }

    // Function for updating user's attribute
    /**
     * @summary set a certain field inside database
     * @param {string} attribute 
     * @param {string} field
     * @param {number} userId
     * @returns {void}
     */
    async function setField(attribute, field, userId) {
        await inTransaction(async t => {
            await sequelize.query(`UPDATE userLogins SET ${field}=? WHERE userId=?`, {
                replacements: [attribute, userId]
            });
        });
    }

    // async function setImgExtension(oldExt, newExt, userId) {
    //     await inTransaction(async t => {
    //         await sequelize.query(`UPDATE userLogins SET shopImageExt=? WHERE userId=?`, {
    //             replacements: [newExt, userId]
    //         });
    //     });
    // }

    /**
     * @summary Find and return user
     * @param {number} userId 
     * @returns {Object} rowObject
     */

    async function getUser(userId) {
        return (await sequelize.query(`SELECT First_Name, Last_Name, Email, shopImageExt, shopName 
        FROM userLogins WHERE userId=?`, {
            replacements: [userId],
            model: sequelize.models.userLogins,                                     // Can be used after db model was created
            mapToModel: false // pass true here if you have any mapped fields
        }))[0]; // return first instance
    }
    /**
     * @summary enter search term ro get list of users
     * @param {string} search search terms
     * @returns {Object} rowObject
     */

    async function searchUsers(search) {
        return await sequelize.query(`SELECT userId, shopName FROM userLogins WHERE shopName LIKE ?`, {
            replacements: ['%' + search + '%'],
            model: sequelize.models.userLogins,                                     // Can be used after db model was created
            mapToModel: false // pass true here if you have any mapped fields
        });

    }

    return {
        addUser,
        removeUser,
        verifyUser,
        setField,
        // setImgExtension,
        checkExistingUser,
        getUser,
        searchUsers,
        verifyUserExists,
        inTransaction
    }

}