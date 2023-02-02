const fsExtra = require('fs-extra');
const path = require('path');

module.exports = class DesignFormValidator {
    /**
     * @summary validates signup form inputs
     * @param {Object} body request.body
     * @param {Object} files request.files
     */
    constructor(body, files, userId, databaseService, errors) {
        this.designName = body.designName;
        this.price = 0;
        this.price = parseInt(body.price);
        if (isNaN(this.price)) {
            this.price = 0;
        }
        this.description = body.description;
        this.iddesign = -1;

        this.file = (files && files.uploaded_image) ? files.uploaded_image : -1;

        this.userId = userId;

        this.databaseService = databaseService;

        this.errors = errors;

    }

    validateImage() {
        try {
            if (this.file != -1 && typeof (this.file.name) == "string") {
                this.file_extension = path.parse(this.file.name).ext;
                if ((this.file.mimetype == "image/jpeg" || this.file.mimetype == "image/png" || this.file.mimetype == "image/gif") && this.file_extension != "") {
                    return true;
                }
            }
        } catch (err) { }
        return false;
    }

    async establish(edit, productId) {
        let values = {
            userId: this.userId,
            designName: this.designName,
            price: this.price,
            description: this.description,
            file_extension: this.file_extension
        };
        let success;
        // this.iddesign;
        if (edit) {
            this.iddesign = productId;
            await this.databaseService.productService.setField(this.iddesign, ["designName", "price", "description"], [values.designName, values.price, values.description])
                .then(() => {
                    success = this.iddesign;
                })
                .catch(err => {
                    success = err;
                });
        } else {
            try {
                this.iddesign = await this.databaseService.productService.addDesign(values);
                success = this.iddesign;
            } catch (err) {
                success = err;
            }
        }
        return success;
    }
    async setImage() {
        let success;
        await fsExtra.remove(path.join(__dirname, `../static/users/${this.userId}/${this.iddesign}`))
            .then(async () => {
                await fsExtra.mkdir(`static/users/${this.userId}/${this.iddesign}`);
            })
            .then(async () => {
                await this.file.mv(`static/users/${this.userId}/${this.iddesign}/${this.iddesign}` + this.file_extension);
            })
            .then(() => {
                success = true;
            })
            .catch(err => {
                success = err;
            });
        return success;
    }
}