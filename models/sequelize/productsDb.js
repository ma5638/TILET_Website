module.exports = (sequelize, DataTypes) => {
    const userLogins = sequelize.define('designs', {
        iddesign: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true
        },
        designName: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
        },
        description: {
            type: DataTypes.STRING(300),
        },
        CreatedAt: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        UpdatedAt: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        imageExtension: {
            type: DataTypes.STRING(10)
        }
    }, {
        timestamps: false
    });



    return userLogins;

}