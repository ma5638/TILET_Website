const path = require('path');
const fsExtra = require('fs-extra');
const { QueryTypes } = require('sequelize');
// const createError = require('http-errors');



module.exports = (sequelize, model) => {
    // console.log("Seq:");
    // console.log(sequelize);
    // console.log("Model:");
    // console.log(model);

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
     * @summary gets products according to given UserId
     * @param {number} userId 
     * @returns {Object} queryObject
     */
    async function getProducts(userId) {
        return sequelize.query(
            `SELECT designName, iddesign, imageExtension, userId 
            FROM designs 
            WHERE userId=? 
            ORDER BY designName;`, {
            replacements: [userId],
            model: sequelize.models.designs,                                     // Can be used after db model was created
            mapToModel: true // pass true here if you have any mapped fields
        });
    }

    /**
     * @summary Product Searching according to search terms and sorts according to order
     * @param {string} search given search terms 
     * @param {string} order to sort
     * @returns {Object} queryObject
     */
    async function filterProducts(search, order) {
        if (order == "Ascending Price") {
            order = "designs.price";

        } else if (order == "Descending Price") {
            order = "designs.price desc";
        } else { // Also Includes New
            order = "designs.CreatedAt desc";
        }
        return await sequelize.query(`
        SELECT designs.designName, designs.CreatedAt, designs.price, designs.imageExtension,
        userLogins.shopName, designs.iddesign, userLogins.userId
            FROM designs 
            LEFT OUTER JOIN userLogins ON userLogins.userId = designs.userId
                WHERE designName LIKE ? ORDER BY ${order};`, {
            replacements: ['%' + search + '%'],
            type: QueryTypes.SELECT,
        });
    }

    /**
     * @summary get the first
     * @param {number} firstX
     */

    async function getNewProducts(firstX) {//SELECT username, designName, CreatedAt FROM designs ORDER BY CreatedAt desc LIMIT ${x};
        if (typeof firstX != 'number') {
            firstX = 6;
        }
        return await sequelize.query(`
        SELECT *
            FROM designs 
            LEFT OUTER JOIN userLogins ON userLogins.userId = designs.userId
            ORDER BY CreatedAt desc LIMIT ?`, {
            replacements: [firstX],
            model: sequelize.models.designs,                                     // Can be used after db model was created
            mapToModel: false // pass true here if you have any mapped fields
        });
    }
    /**
     * @summary set the extension of the uploaded image
     * @param {number} userId 
     * @param {number} iddesign 
     * @param {string} ext 
     * @returns {void}
     */

    async function setExtension(userId, iddesign, ext) {
        await sequelize.query(`UPDATE designs SET imageExtension=?
            WHERE userId=? AND iddesign=?`, {
            replacements: [ext, userId, iddesign],
        });
    }
    /**
     * @summary General database updating function
     * 
     * @param {number} productId 
     * @param {string|array} fieldNames name of database fields to change
     * @param {string|array} newAttr values to change to (in the same order as field name)
     * @returns {void}
     */

    async function setField(productId, fieldNames, newAttr) {
        let line = "";
        for (i = 0; i < fieldNames.length; i++) {
            line += fieldNames[i] + " = ?,";
        }
        line = line.slice(0, -1);
        // console.log(line);
        newAttr.push(productId);
        await inTransaction(async t => {
            await sequelize.query(`UPDATE designs SET ${line} WHERE iddesign=?`, {
                replacements: newAttr,
            });
        });
    }

    /**
     * @summary Remove Design from Database
     * @param {number} userId 
     * @param {number} productId 
     * @returns {boolean} returns true if success
     */

    async function removeDesign(userId, productId) {
        let success = false;
        await inTransaction(async t => {
            await sequelize.query(`DELETE FROM designs WHERE iddesign=?`, {
                replacements: [productId]
            }).then(async () => {
                await fsExtra.remove(path.join(__dirname, `../static/users/${userId}/${productId}`))
                    // .catch((err) => {
                    //     console.log("Error in system suppressed");
                    //     success = false;
                    // })
                    ;
                success = true;
            });
        });
        return success;
    }
    /**
     * @summary verifies if design exists and belongs to given user
     * @param {number} productId 
     * @param {number} userId 
     * @returns {boolean} true if design exists (for given userid and productid)
     */
    async function verifyDesign(productId, userId) {
        try {
            details = await sequelize.query(`SELECT * FROM designs WHERE iddesign=? AND userId=?;`, {
                replacements: [productId, userId]
            });
        } catch (err) {
            console.log("Passed heree");
            return false;
        }
        return details[0].length != 0;
    }
    /**
     * @summary get needed fieds from design
     * Left outer join with userLogins to get :
     * First Name, Last Name and Shop Name
     * 
     * @param {number} designId 
     * @returns {Object} queryObject
     */
    async function getDesign(designId) {
        return (await sequelize.query(`
        SELECT designs.iddesign, designs.userId, designs.designName, designs.price, designs.description, 
        designs.imageExtension, userLogins.First_Name, userLogins.Last_Name, userLogins.shopName
            FROM designs 
            LEFT OUTER JOIN userLogins ON userLogins.userId = designs.userId
                WHERE designs.iddesign=?`, {
            replacements: [designId],
            model: sequelize.models.designs,                                     // Can be used after db model was created
            mapToModel: true // pass true here if you have any mapped fields
        }))[0];

    }

    /**
     * @summary Add design using object of values
     * @param {object} values values to insert into sql
     * @returns design id
     */

    async function addDesign(values) { //username, design, price, image, description
        try {
            const j = await sequelize.query(`INSERT INTO designs(userId, designName, price, description, imageExtension) 
            VALUES (?,?,?,?,?);`, {
                replacements: [values.userId, values.designName, values.price, values.description, values.file_extension],
            });
            return j[0]; // return iddesign

        } catch (err) {
            console.log("Error occured");
            throw err;
        }

    }

    return {
        getProducts,
        filterProducts,
        getNewProducts,
        setField,
        removeDesign,
        verifyDesign,
        addDesign,
        getDesign,
        setExtension
    }
}