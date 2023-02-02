const moment = require('moment');
const he = require('he');
const createError = require('http-errors');

module.exports = class SignupFormValidator {
    /**
     * @summary validates signup form inputs
     * @param {Object} body request.body
     * @param {Array|Object} errors array of errors
     */
    constructor(body, databaseService, errors) {
        this.username = body.username;
        this.password = body.password;
        this.shop_name = body.shop_name;
        this.first_name = body.first_name;
        this.last_name = body.last_name;
        this.email = body.email;
        this.DOB = body.DOB;
        this.errors = errors;
        this.databaseService = databaseService;
    }
    // Helper Functions

    hasCharacters(string, forbidden) {
        string = he.decode(string);
        let found = false;
        forbidden.forEach(character => {
            if (string.indexOf(character) != -1) {
                found = true;
            }
        });
        if (found) {
            return true;
        }
        return false;
    }
    // Method
    validate() {

        if (!moment(this.DOB, "DD/MM/YYYY", true).isValid()) {
            this.errors.push({       // for similar formatting to previous express-validator errors
                value: this.DOB,
                msg: 'Invalid Date',
                param: 'DOB',
                location: 'body'
            });
        }

        const special_characters = ["\\", "&", "/", "=", "-", "<", ">", ";"];
        if (this.hasCharacters(this.username, special_characters) ||
            this.hasCharacters(this.first_name, special_characters) ||
            this.hasCharacters(this.last_name, special_characters) ||
            this.hasCharacters(this.shop_name, special_characters)
        ) {
            this.errors.push({       // for similar formatting to previous express-validator errors
                msg: 'Please refrain from using the following characters: \\, &, /, =, -, <, >, ;',
                location: 'body'
            });
        }

        this.DOB = moment(this.DOB, "DD/MM/YYYY").format('YYYY-MM-DD');    // SQL Date format
        if (this.errors.length > 0) {
            return false;
        }
        return true;
    }

    async verify() {
        if (await this.databaseService.userService.checkExistingUser(this.username)) {
            this.errors.push({       // for similar formatting to previous express-validator errors
                value: this.username,
                msg: 'Username already in use. Please choose a different username',
                param: 'DOB',
                location: 'body'
            });
            return false;
        }
        return true;
    }

    async signUp() {
        if (this.username && this.password) {
            const success = await this.databaseService.userService.addUser(this.username, this.password, this.shop_name, this.email, this.first_name, this.last_name, this.DOB);
            return success;
        } else {
            return createError(404, "Form Inactive")
        }
    }


}