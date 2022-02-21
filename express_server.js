const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser")

app.set("view engine", "ejs");

generateRandomString = () => {
  let shortURL = Math.random().toString(36).slice(7);
  return shortURL;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  
};

app.use(bodyParser.urlencoded({extended: true}));

//Logs actions to our console.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next();
});

app.post("/urls", (req, res) => {
  console.log(req.body);  //Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase)
  res.redirect(`/urls/:${shortURL}`);    
})

app.post('/urls', (req, res) => {
  res.redirect(`urls/:${longURL}`)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[longURL];
  res.redirect(`urls/${longURL}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});