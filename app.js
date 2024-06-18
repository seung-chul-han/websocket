const express = require('express');
const { join } = require('path');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const nunjucks = require('nunjucks');
require('dotenv').config();

const webSocket = require('./socket');
const indexRouter = require('./routes');

const app = express();
app.set('view engin', 'html');
app.set('port', process.env.PORT || 8005);
nunjucks.configure('views', {
	autoescape: true,
	express: app,
});

app.use(morgan('dev'));
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
	session({
		resave: false,
		saveUninitialized: false,
		secret: process.env.COOKIE_SECRET,
		cookie: {
			httpOnly: true,
			secure: false,
		},
	})
);
app.use(flash());

app.use('/', indexRouter);

app.use((req, res, next) => {
	const err = new Error('Not found');
	err.status = 404;
	next(err);
});

app.use((err, req, res) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.render('error');
});

const server = app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기 중');
});

webSocket(server);
