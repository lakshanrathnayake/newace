const express =require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');

const routes = require('./routes.json');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const https = require('https');
const http = require('http');


const httpPort = 3000;
const httpsPort = 3000;


const app = express();

/*
 app.use((req, res, next) => {
 if (req.protocol === 'http') {
 res.redirect(301, `https://${req.headers.host}${req.url}`);
 }
 next();
 });
 */
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json({limit: "50mb"}));
//  app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const index = require('./controllers/index');
require('./extensions/twig/loader');
app.use('/', index);

const controllers = [];

/**
 * initialize express-session to allow us track the logged-in user across sessions.
 */
app.use(session({
    key: 'pos_user',
    secret: 'esol',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 24 * 60 * 60 * 1000
    }
}));


/**
 * pos api middleware token verification
 */
const api_helper = require('./helpers/api_helper');
let apiTokenVerification = function (req, res, next) {
    if (req.session.username && req.cookies.pos_user && req.session.token) {
        let access_token = req.session.token;
      
        api_helper.verifyToken(access_token, req.session.user_id, function (access) {
       
            if (access) {
                next();
            }
            else {
                res.render('errors/403.twig', {"message": "Your Access token expired, re-login ", "error": '403'});
            }
        });
        
    }
    else {
        res.redirect('/');
    }
};

/**
 * session based authentication
 * @param req
 * @param res
 * @param next 
 */
var authenticateConnection = function (req, res, next) {
    if (req.session.username && req.cookies.pos_user && req.session.role) {
        let userRole = req.session.role.toString();
        let authRoles = {
            1: "ADMIN",
            2: "MANAGER",
            3: "CASHIER",
            4: "SUPER_ADMIN"
        };
        //console.log(req.originalUrl);
        //console.log(userRole);
        let validity = false;
        let checked = false;
        let url = req.originalUrl;
        let controllersKeys = Object.keys(routes);
        for (let i = 0; i < controllersKeys.length; i++) {
            let controller = routes[controllersKeys[i]];
            let regexExpression = "(?!(?:[^<]+>|[^>]+<\\/a>))\\b(^" + controller.controller + '\/' + controller.pattern + ")\\b";
            let urlRex = new RegExp(regexExpression, "i");
            if (urlRex.test(url.substr(1))) {
                let auths = controller.auth.split("|");
                if (auths.indexOf(authRoles[userRole]) !== -1) {
                    validity = true;
                    checked = true;
                    break;
                }
                else {
                    validity = false;
                    break;
                }
            }
        }
        if (validity) {
            next();
        }
        else {
            res.render('errors/403.twig', {
                "message": "You don't have permission to access this content ",
                "error": '403'
            });
        }
    }
    else {
        res.redirect('/');
    }
};

Object.keys(routes).forEach(function (key) {
    let route = routes[key];
    let controller = require('./controllers/' + route.controller.toLowerCase());
    controllers.push(controller);
    if (route.tag == 'API_AUTH') {
        app.use('/' + route.controller.toLowerCase(), authenticateConnection, controller);
        app.use('/' + route.controller.toLowerCase(), apiTokenVerification, controller);
    }
    else if (route.tag != 'INIT') {
        app.use('/' + route.controller.toLowerCase(), authenticateConnection, controller);
    }
    else {
        app.use('/' + route.controller.toLowerCase(), controller);
    }
;
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    res.render('errors/404.twig', {"message": "Page Not Found", "error": err});
    //next(err);
});

//const httpsOptions = {
//  cert: fs.readFileSync('./.ssl/__aptabas_com.crt'),
//  ca: fs.readFileSync('./.ssl/__aptabas_com.ca-bundle'),
//  key: fs.readFileSync('./.ssl/aptabas.key'),

//};
// httpServer.listen(httpPort,hostname);
//const httpsServer = https.createServer(httpsOptions, app);
const httpServer = http.createServer(app);
httpServer.timeout = 120000 * 5;
httpServer.keepAliveTimeout = 60000 * 2;
//httpsServer.listen(httpsPort);
httpServer.listen(httpPort);

app.listen(process.env.PORT || 3001, '0.0.0.0', () => {
    console.log("Server is running.");
  });

module.exports = app;


