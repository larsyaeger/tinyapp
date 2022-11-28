const express = require('express');
const app = express();
const PORT  = 8080;

app.set('view engine', 'ejs');

const urlDataBase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('hello');
  
});
app.get('/urls.json', (req, res) => {
  
  res.json(urlDataBase);
});
app.get('/hello', (req, res) => {
  res.send("<html><body>No <b>Thanks</b></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});