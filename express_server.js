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
const emailChecker = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    } 
  }
  return false;
}
const getUserFromEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
  return [];
}
const accountchecker = (email, password) => {
  for (const user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        return true;
      }
    } 
  }
  return false;
}
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
  const loggedInUser = req.cookies['user_id'];
  //if user is not logged in, respond with an html message they cant make a url because they need to be logged in 
  if (loggedInUser) {
    const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  } else {
    throw('Cannot create a shortened url because you are not logged in');
  }
  // const shortURL = generateRandomString();
  // urlDatabase[shortURL] = req.body.longURL;
  // res.redirect(`/urls/${shortURL}`); //--> used to be just ok.
});
app.get('/', (req, res) => {
  res.send('hello');
  
});
app.get('/urls.json', (req, res) => {
  
  res.json(urlDatabase);
});
// app.get('/hello', (req, res) => {
//   res.send("<html><body>No <b>Thanks</b></body></html>\n")
// });
app.get('/urls', (req, res) => {
  const templateVars = {
    user: req.cookies['user_id'],
    urls: urlDatabase,
  };
  console.log(`I am from get/urls`);
  console.log(users);
  console.log(templateVars)
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: req.cookies['user_id'],
  };
  const loggedInUser = req.cookies['user_id'];
  //if user is not logged in, any visits to /urls_new should be redirected to /login
if (loggedInUser) {
  res.render('urls_new', templateVars);
} else {
res.redirect('/login');
}
  //res.render('urls_new', templateVars);
});
app.get('/urls/register', (req, res) => {
  const templateVars = {
    user: req.cookies['user_id'],
  };
  const loggedInUser = req.cookies['user_id'];
  //if user is already logged in, any visits to /urls/register should be redirected to /urls
  if (loggedInUser) {
    res.redirect('/urls');
  } else {
  res.render('urls_register', templateVars);
  }
  //res.render('urls_register', templateVars);
});
app.post('/urls/register', (req, res) => {
  const newUser = req.body;
  const randomID = generateRandomString();
  // console.log(newUser);
  // console.log(randomID);
  // console.log(newUser.emailform);
  // console.log(newUser.passwordform); 
  if (newUser.registeremailform === '' || newUser.registerpasswordform === '') {
      throw new Error(`Error ${400}, email and/or password were left blank`)
    } else if (emailChecker(newUser.registeremailform) === true) {
      throw new Error(`Error ${400}, email already in use`)
    } else {
        users[randomID] = { 
        id: randomID,
        email: newUser.registeremailform,
        password: newUser.registerpasswordform,
      }
      console.log(`I am from register`)
      console.log(users);
  res.cookie('user_id', users[randomID])
  res.redirect('/urls');
    }
  });
  app.post('/login', (req, res) => {
    const possibleExistingUser = req.body;
    console.log(`from login`);
    console.log(possibleExistingUser);
    const loggedInUser = getUserFromEmail(possibleExistingUser.loginemailform)
    console.log(`loggedInUser function`);
    console.log(loggedInUser);
    if (loggedInUser) {
      if (accountchecker(possibleExistingUser.loginemailform, possibleExistingUser.loginpasswordform) === true) {
        res.cookie('user_id', loggedInUser);
        res.redirect('/urls');
      } else if (accountchecker(possibleExistingUser.loginemailform, possibleExistingUser.loginpasswordform) === false) {
        throw new Error(`Error ${403}, password doesn't match for that email`)
      }
    } else if (emailChecker(possibleExistingUser.loginemailform) === false) {
      throw new Error(`Error ${403}, email isn't registered to an account`);
    }
    //res.redirect('/login');
  });
app.post('/loginbutton', (req, res) => {
  res.redirect('/login');
})
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    user: req.cookies['user_id'],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('urls_show', templateVars);
});
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    throw new Error ('That short URL does not yet exist therefor it does not lead to anywhere');
  } else {
  res.redirect(longURL);
  }
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
    user: req.cookies['user_id'],
    id: shortURL, 
    longURL: urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
});
app.get('/login', (req, res) => {
  const templateVars = {
    user: req.cookies['user_id]'],
  };
  const loggedInUser = req.cookies['user_id'];
  //if user is already logged in, any visits to /login should be redirected to /urls
  if (loggedInUser) {
    res.redirect('/urls');
  } else {
  res.render('login', templateVars);
  }
});
app.post('/register', (req, res) => {
  res.redirect('/urls/register');
});
app.post('/logout', (req, res) => {
  //console.log(user);
  res.clearCookie('user_id');
  res.redirect('/login');
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});