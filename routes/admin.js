const AdminBro = require('admin-bro');
const AdminBroExpress = require('admin-bro-expressjs');
const AdminBroSequelize = require('admin-bro-sequelizejs');
const config = require('../config');

// Adminbro


AdminBro.registerAdapter(AdminBroSequelize);

const adminBro = new AdminBro({
    databases: [config.mysql.client],
    rootPath: '/admin',
    branding: {
        companyName: 'TILET'
    }
});

const ADMIN = {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'TILET@2020RT'
}
// const originalRouter = AdminBroExpress.buildRouter(adminBro);

console.log("Building Router..");
const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    cookieName: process.env.ADMIN_COOKIE_NAME || 'admin',
    cookiePassword: process.env.ADMIN_COOKIE_PASS || 'wxrt59xrt59xrt',
    authenticate: async (email, password) => {
        console.log("Authenticating");
        if (email === ADMIN.email && password === ADMIN.password) {
            console.log("Authenticated");
            return ADMIN;
        }
        return null;
    }
}, null, {
    resave: false,
    saveUninitialized: true,
    // proxy: true
});



module.exports = () => { return router; };