const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const users = {
  userRandomID: {
    id: "userRandomId",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express()
const PORT  = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.post('/urls', (req, res) => {
  console.log(req.body); // --> log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`); //--> used to be just ok.
});
app.get('/', (req, res) => {
  res.send('hello');
  
});
app.get('/urls.json', (req, res) => {
  
  res.json(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.send("<html><body>No <b>Thanks</b></body></html>\n")
});
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  };
  res.render('urls_new', templateVars);
});
app.get('/urls/register', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  };
  res.render('urls_register', templateVars);
});
app.post('/urls/register', (req, res) => {
  const newUser = req.body;
  const randomID = generateRandomString();
  console.log(randomID);
  console.log(newUser.emailform);
  console.log(newUser.passwordform);
  users.randomID = { 
      id: randomID,
      email: newUser.emailform,
      password: newUser.passwordform,
    }
  res.cookie('user_id', users.randomID);
  res.redirect('/urls');
  });
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('urls_show', templateVars);
});
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post('/urls/:id/delete', (req, res) => {
  console.log(req.body);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
app.post('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id;
  console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});
app.get('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id
  const templateVars = {
    username: req.cookies['username'],
    id: shortURL, 
    longURL: urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
});
app.post('/login', (req, res) => {
  const userName = req.body.username;
  //console.log(req.body.username);
  res.cookie('username', userName);
  res.redirect('/urls');
});
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});