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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Logs actions to our console.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next();
});

//client makes a request (GET) for the information on this page.
//We then res.RENDER the information to the user.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Client makes request(GET) for information
//We RENDER our main page (urls_index) using the templateVars Object
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Client makes request (GET) for information using the variable ":shortURL"
//We access the templateVars Object to set the KEY - VALUE pairs.
//Then RENDER the urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, //our shortURL is the req.param.shortURL.
    longURL: urlDatabase[req.params.shortURL]  //get longURL value like this 
  }
  res.render("urls_show", templateVars);
});

//Client makes a request (GET) for information at the variable ":shortURL"
//We set our longURL variable to the Value of our ShortURL key in the URL database
//Then REDIRECT to the longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] //again accessing longURL by the key SHortURL and value of it
  res.redirect(longURL);
});

//Client makes a request to Make/Change Information
app.post("/urls", (req, res) => {
  // console.log(req.body);  //Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);    
})

//CLient Makes a request to Make or Change Information (PUT)
app.post("/urls/:shortURL/delete", (req, res) => {
  //set the variable to the req.params.shorturl
  let shortURL = req.params.shortURL
  //delete the ShortURL from the urlDatabase
  delete urlDatabase[shortURL]
  res.redirect('/urls');
})

//FOllows from URLS_show on line 24
//POST // Dynamic Variable associated with edit.
app.post("/urls/:id/edit", (req, res) => {
  //gets  variable from req.params
  //you can console.log req.body to see the params path.
  let id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  //then redirects to homepage.
  res.redirect(`/urls`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

generateRandomString = () => {
  let shortURL = Math.random().toString(36).slice(7);
  return shortURL;
}




