const routes = require('./routes/index');
// const adminRoute = require('./routes/admin');
const helmet = require('helmet');
const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");

const app = express();

// if (process.env.NODE_ENV != "testing" && process.env.NODE_ENV != "production") {
//     process.env.NODE_ENV = 'development';
// }


// app.use('/admin', adminRoute());
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "kit.fontawesome.com"],
            scriptSrcElem: ["'self'", 'code.jquery.com/jquery-3.2.1.slim.min.js',
                'cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js', 'kit.fontawesome.com',
                'maxcdn.bootstrapcdn.com', 'cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js'],
            objectSrc: ["'none'"],
            styleSrcElem: ["'self'", 'kit-free.fontawesome.com', 'maxcdn.bootstrapcdn.com',
                'fonts.googleapis.com', 'use.typekit.net', 'p.typekit.net', "'unsafe-inline'"], // typekit.net is Adobe
            fontSrc: ["'self'", 'kit-free.fontawesome.com', 'maxcdn.bootstrapcdn.com', 'fonts.googleapis.com',
                'fonts.gstatic.com', 'use.typekit.net'],
            imgSrc: ["'self'", "blob:", "data:"]

        },
    })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(cookieParser());
let MemoryStore = session.MemoryStore;
app.use(session({
    name: 'app.sid',
    secret: "3cnijotgrbas232nit3424nho23ono324nj",
    resave: true,
    store: new MemoryStore(),
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './static')));

app.set('trust proxy', 1);
app.use(fileUpload());
app.use('/', routes());

// app.listen(port, () => {
//     console.log(`Listening on port: ${port}`)
// });

module.exports = app;