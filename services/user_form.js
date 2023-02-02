const fsExtra = require('fs-extra');
const path = require('path');
const createError = require('http-errors');

module.exports = class UserEditFormValidator {
    /**
     * @summary validates signup form inputs
     * @param {Object} body request.body
     * @param {Object} files request.files
     */
    constructor(body, files, userId, databaseService) {
        this.shopName = body.shopName;
        this.userId = userId;
        this.file = (files && files.uploaded_image) ? files.uploaded_image : -1;
        this.databaseService = databaseService;

    }
    // Helper Function
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
    async setShopName() {
        if (this.shopName) {
            await this.databaseService.userService.setField(this.shopName, "shopName", this.userId);
            return true;
        }
        return false;
    }

    async setImageExtension() {
        // params
        // oldExtension, newExtension, userId, 
        // await this.databaseService.userService.setImgExtension(ext)
        //     .then(() => {

        //     });
        let success = createError(404, "Function Not Finished");
        let old_file_extension;
        let new_file_extension;
        await this.databaseService.userService.getUser(this.userId)
            .then(async user => {
                old_file_extension = user.shopImageExt;
                new_file_extension = this.file_extension;
                await fsExtra.remove(path.join(__dirname, `../static/users/${this.userId}/${this.userId}${old_file_extension}`));
            })
            .then(async () => {
                await this.databaseService.userService.setField(new_file_extension, "shopImageExt", this.userId);
                await this.file.mv(`static/users/${this.userId}/${this.userId}` + new_file_extension);
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