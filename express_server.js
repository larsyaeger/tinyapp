const bcrypt = require('bcryptjs');
//----------------------------------------------------------generateRandomString function here
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
//----------------------------------------------------------users variable here
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    //hashedpassword: bcrypt.hashSync(this.password, 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    //hashedpassword: bcrypt.hashSync(this.password, 10),
  },
};
//----------------------------------------------------------emailChecker function here
const emailChecker = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};
//----------------------------------------------------------getUserFromEmail function here
const getUserFromEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return [];
};
//----------------------------------------------------------accountchecker function here
const accountchecker = (email, password) => {
  for (const user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].hashedPassword) === true) {
      // if (users[user].hashedPassword === bcrypt.hashSync(password, 10)) 
        return true;
      }
    }
  }
  return false;
};
//----------------------------------------------------------Express + cookie + app + PORT stuff here
const express = require('express');
const cookieSession = require('cookie-session');
//const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');


//----------------------------------------------------------urlDataBase here
const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user2RandomID',
  },
  //  'b2xVn2': 'http://www.lighthouselabs.ca',
  //  '9sm5xK': 'http://www.google.com',
};
//----------------------------------------------------------urlsForUser function here
const urlsForUser = (id) => {
  const userUrls = {};
  for (let shortUrls in urlDatabase) {
    if (urlDatabase[shortUrls].userID === id) {
      userUrls[shortUrls] = urlDatabase[shortUrls];
    }
  }
  return userUrls;
};
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['hello'],
  maxAge: 24 * 60 * 60 * 1000,
}));
//app.use(cookieParser());
//----------------------------------------------------------POST ('/urls') here
app.post('/urls', (req, res) => {
  let userID = req.session.user_id;
  let shortURL = generateRandomString();
  let longUrl = req.body.longURL;
  //if user is not logged in, respond with an html message they cant make a url because they need to be logged in 
  if (userID) {
    urlDatabase[shortURL] = {
      longURL: longUrl,
      userID: userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    throw ('Cannot create a shortened url because you are not logged in');
  }
});
//----------------------------------------------------------get ('/') here
app.get('/', (req, res) => {
  res.send('hello');

});
//----------------------------------------------------------get ('/urls/json') here
app.get('/urls.json', (req, res) => {

  res.json(urlDatabase);
});
//----------------------------------------------------------get ('/urls') here
app.get('/urls', (req, res) => {
  const loggedInUser = req.session.user_id;
  if (loggedInUser) {
    const thisUsersUrls = urlsForUser(loggedInUser);
    const templateVars = {
      user: users[req.session.user_id],
      urls: thisUsersUrls,
      //urls: urlDatabase,        //-->Keep this here for debugging purposes
    };
    res.render('urls_index', templateVars);
  } else {
    throw new Error('Must be logged in to view URLS page');
  }
});
//----------------------------------------------------------get ('/urls/new') here
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  const loggedInUser = req.session.user_id;
  //if user is not logged in, any visits to /urls_new should be redirected to /login
  if (loggedInUser) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});
//----------------------------------------------------------get ('/urls/register') here
app.get('/urls/register', (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  const loggedInUser = req.session.user_id;
  //if user is already logged in, any visits to /urls/register should be redirected to /urls
  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});
//----------------------------------------------------------POST ('/urls/register') here
app.post('/urls/register', (req, res) => {
  const newUser = req.body;
  const randomID = generateRandomString();
  if (newUser.registeremailform === '' || newUser.registerpasswordform === '') {
    throw new Error(`Error ${400}, email and/or password were left blank`);
  } else if (emailChecker(newUser.registeremailform) === true) {
    throw new Error(`Error ${400}, email already in use`);
  } else {
    users[randomID] = {
      id: randomID,
      email: newUser.registeremailform,
      //password: newUser.registerpasswordform,
      hashedPassword: bcrypt.hashSync(newUser.registerpasswordform, 10),
    };
    req.session.user_id = randomID
    //res.cookie('user_id', users[randomID]);
    res.redirect('/urls');
  }
});
//----------------------------------------------------------POST ('/login') here
app.post('/login', (req, res) => {
  const possibleExistingUser = req.body;
  const loggedInUser = getUserFromEmail(possibleExistingUser.loginemailform);
  if (loggedInUser) {
    if (accountchecker(possibleExistingUser.loginemailform, possibleExistingUser.loginpasswordform) === true) {
      req.session.user_id = loggedInUser.id;
      //res.cookie('user_id', loggedInUser);
      res.redirect('/urls');
    } else if (accountchecker(possibleExistingUser.loginemailform, possibleExistingUser.loginpasswordform) === false) {
      throw new Error(`Error ${403}, password doesn't match for that email`);
    }
  } else if (emailChecker(possibleExistingUser.loginemailform) === false) {
    throw new Error(`Error ${403}, email isn't registered to an account`);
  }
  //res.redirect('/login');
});
//----------------------------------------------------------POST ('/loginbutton') here
app.post('/loginbutton', (req, res) => {
  res.redirect('/login');
});
//----------------------------------------------------------get ('/urls/:id') here
app.get('/urls/:id', (req, res) => {
  const loggedInUser = req.session.user_id;
  const thisUsersUrls = urlsForUser(loggedInUser);
  const templateVars = {
    user: users[req.session.user_id],
    userID: req.session.user_id,
    id: req.params.id,
    urls: thisUsersUrls,
    longURL: urlDatabase[req.params.id].longURL,
  };
  if (!thisUsersUrls[req.params.id]) {
    res.send('this tinyUrl belongs to someone else');
  }
  res.render('urls_show', templateVars);
});
//----------------------------------------------------------get ('/u/:id') here
app.get('/u/:id', (req, res) => {
  console.log(`inside url database`, urlDatabase);
  console.log(`insdie req.params.id`, req.params.id);
  const urlObject = urlDatabase[req.params.id];
  if (urlObject === undefined) {
    throw new Error('That short URL does not yet exist therefor it does not lead to anywhere');
  } else {
    const longURL = urlObject.longURL;
    res.redirect(longURL);
  }
});
//----------------------------------------------------------POST ('/urls/:id/delete) here
app.post('/urls/:id/delete', (req, res) => {
  const loggedInUser = req.session.user_id;
  if (!loggedInUser) {
    res.send('Cannot delete link because you are not logged in');
  }

  const thisUsersUrls = urlsForUser(loggedInUser);

  if (!thisUsersUrls[req.params.id]) {
    //console.log(`INSIDE THE ERORR CONDITION`);
    res.send('Cannot delete this link because it was not created by you');
  } else if (!req.params.id) {
    res.send(`Cannot delete a link that doesn't exist`);
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});
//----------------------------------------------------------POST ('urls/:id/edit') here
app.post('/urls/:id/edit', (req, res) => {
  const loggedInUser = req.session.user_id;
  if (!loggedInUser) {
    res.send('Cannot edit link because you are not logged in');
  }

  const thisUsersUrls = urlsForUser(loggedInUser);
  if (!thisUsersUrls[req.params.id]) {
    res.send('Cannot edit this link because it was not created by you');
  } else if (!req.params.id) {
    res.send(`Cannot edit a link that doesn't exist`);
  } else {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.longURL;

    res.redirect('/urls');
  }
});
//----------------------------------------------------------get ('/urls/:id/edit) here
app.get('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id;
  const templateVars = {
    user: req.session.user_id,
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render('urls_show', templateVars);
});
//----------------------------------------------------------get ('/login') here
app.get('/login', (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  const loggedInUser = req.session.user_id;
  //if user is already logged in, any visits to /login should be redirected to /urls
  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});
//----------------------------------------------------------POST ('/register') here
app.post('/register', (req, res) => {
  res.redirect('/urls/register');
});
//----------------------------------------------------------POST ('/logout') here
app.post('/logout', (req, res) => {
  req.session = null;
  //res.clearCookie('user_id');
  res.redirect('/login');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});