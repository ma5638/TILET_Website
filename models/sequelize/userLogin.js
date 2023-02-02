
module.exports = (sequelize, DataTypes) => {
    const userLogins = sequelize.define('userLogins', {
        username: {
            type: DataTypes.STRING(15),
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true,
            autoIncrement: true,
        },
        password: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        First_Name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        Last_Name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        Email: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        DOB: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        shopImageExt: {
            type: DataTypes.STRING(10),
        },
        shopName: {
            type: DataTypes.STRING(45),
            allowNull: false,
        }
    }, {
        timestamps: false
    });



    return userLogins;

}