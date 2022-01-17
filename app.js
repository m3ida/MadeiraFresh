const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const Promise = require('bluebird');
const crypto = require('crypto');
const passport = require('passport');
const flash = require('connect-flash');
const DAO = require('./Database/dao');
const User = require('./Models/user');
const bodyParser = require('body-parser');
const Publication = require('./Models/publication');
const Comment = require('./Models/comment');
const cookieParser = require('cookie-parser');
var LocalStrategy = require('passport-local').Strategy;

const app = express();
const dao = new DAO('./main.sqlite3');
const users = new User(dao);
const publications = new Publication(dao);
const comments = new Comment(dao);

const sessionMiddleware = session({
  secret: 'supernova',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1296000000, //15 days
    sameSite: 'strict',
  },
});

app.use(express.static('public'));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('view engine', 'ejs');

//se ainda nao estiverem criadas, cria
users.createTable().then(() => {
  publications.createTable().then(() => {
    comments.createTable();
  });
});

function hashPassword(password, salt) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  hash.update(salt);
  return hash.digest('hex');
}

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    function (email, password, done) {
      users.getUserWithEmail(email).then((user) => {
        if (!user)
          return done(null, false, {
            message: 'login|Email e/ou password incorretos',
          });
        var hash = hashPassword(password, user.salt);
        users.getUser(email, hash).then((user) => {
          if (!user)
            return done(null, false, {
              message: 'login|Email e/ou password incorretos',
            });
          return done(null, user);
        });
      });
    }
  )
);

passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return done(null, false, {
          message: 'register|Email inválido',
        });
      }
      if (!req.body.nickname)
        return done(null, false, {
          message: 'register|Nickname em falta',
        });
      users.getUserWithEmail(email).then((user) => {
        if (user)
          return done(null, false, {
            message: 'register|Email em uso',
          });
        if (req.body.password != req.body.password_confirmation)
          return done(null, false, {
            message: 'register|Passwords não equivalentes',
          });
        const salt = crypto.randomBytes(16).toString('base64');
        var hash = hashPassword(password, salt);
        users.create(req.body.nickname, email, hash, salt).then((user) => {
          if (!user) return done(null, false);
          return done(null, user);
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  users.getUserById(id).then((user) => {
    if (!user) return done(null, false);
    return done(null, user);
  });
});

app.post(
  '/register',
  passport.authenticate('register', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.post(
  '/login',
  passport.authenticate('login', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.post('/logout', function (req, res) {
  req.logout();
  res.cookie('connect.sid', '', {
    expires: new Date(),
  });
  res.redirect('/');
});

app.post('/api/pubs', function (req, res) {
  publications.getPublicationsIdCoords().then((publications) => {
    res.send(publications);
  });
});

function associarComentarios(publications) {
  return new Promise((resolve, reject) => {
    n = 0;
    publications.forEach((publication) => {
      comments
        .getCommentsFromPublicationWithId(publication.id)
        .then((comentarios) => {
          publication['comments'] = comentarios;
          n++;
          if (n >= publications.length) resolve(publications);
        });
    });
  });
}

app.get('/', async (req, res) => {
  const errors = (req.flash('error')[0] || '').split('|');
  publications.getPublications().then((publications) => {
    associarComentarios(publications).then((treatedPubs) => {
      res.render('main', {
        username: req.user ? req.user.name : '',
        publications: treatedPubs,
        authenticated: req.isAuthenticated(),
        addError: req.query.addError ? 'Uma avaliação é obrigatória' : '',
        authErrorType: errors[0] || '',
        authError: errors[1] || '',
        userType: req.user ? req.user.type : '',
        pubSuccess: req.query.success
      });
    });
  });
});

app.get('/validarpublicacoes', (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).redirect('/');
  } else {
    if (req.user.type !== 'mod' && req.user.type !== 'admin') {
      res.status(401).redirect('/');
    } else {
      publications.getPublicationsNonValid().then((publications) => {
        res.render('validarpubs', {
          publications: publications,
        });
      });
    }
  }
});

app.get('/estacoes', (req, res) => {
  res.render('stations', {
    username: req.user ? req.user.name : '',
    authenticated: req.isAuthenticated(),
    addError: '',
    authErrorType: '',
    authError: '',
    userType: '',
  });
});

app.post('/validarpublicacoes', (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).redirect('/');
  } else {
    if (req.user.type !== 'mod' && req.user.type !== 'admin') {
      res.status(401).redirect('/');
    } else {
      for (const key in req.body) {
        const pedido = key.trim().split('-');
        if (pedido[0] === 'del') {
          publications.deletePub(pedido[1]);
        } else if (pedido[0] === 'val') {
          publications.validatePub(pedido[1]);
        }
      }
      res.status(200).redirect('/validarpublicacoes');
    }
  }
});

app.post('/nova-publicacao', (req, res) => {
  if (req.isAuthenticated()) {
    if (!req.body.msg) {
      res.status(406).redirect('/?addError=true');
    } else {
      publications
        .create(
          req.body.msg,
          req.body.lng,
          req.body.lat,
          req.body.NO2,
          req.body.CO,
          req.body.PM25,
          req.body.PM10,
          req.body.O3,
          req.body.SO2,
          req.user.id
        )
        .then(() => res.status(200).redirect('/?success=true'));
    }
  } else {
    res.status(401).redirect('/');
  }
});

app.post('/newComment', (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).redirect('/');
  } else {
    if (req.body.comment) {
      comments.create(req.body.comment, req.user.id, req.query.pub).then(() => {
        res.redirect('/');
      });
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running at port 3000`);
});
