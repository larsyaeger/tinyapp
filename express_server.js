const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
const express = require('express');
const app = express()
const PORT  = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
app.use(express.urlencoded({extended: true}));
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
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.get('/urls/:id', (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
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
  const templateVars = {id: shortURL, longURL: urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});