const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser")

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}; 

app.use(bodyParser.urlencoded({extended: true}));


//FOllows from URLS_show on line 24
//POST // Dynamic Variable associated with edit.
app.post("/urls/:shortURL/edit", (req, res) => {
  //gets short variable from req.params
  let shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  //then redirects to homepage.
  res.redirect(`/urls`)
})

// Logs actions to our console.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next();
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, //our shortURL is the req.param.shortURL.
    longURL: urlDatabase[req.params.shortURL]  //get longURL value like this 
  }
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] //again accessing longURL by the key SHortURL and value of it
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  //Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);    
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

generateRandomString = () => {
  let shortURL = Math.random().toString(36).slice(7);
  return shortURL;
}




