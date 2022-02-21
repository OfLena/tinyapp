const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser")

app.set("view engine", "ejs");

generateRandomString = () => {
  
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  res.send("OK");         // Respond with 'OK' (we will reaplce this)
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req,res) => {
  res.send('<html><body>Hello <b>World</b></hmtl>\n')
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});