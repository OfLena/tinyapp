const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const res = require("express/lib/response");
const req = require("express/lib/request");
const cookieParser = require('cookie-parser');

const {getUserByEmail, urlsForUser, generateRandomString, getUserDatabaseByEmail } = require('./helpers');

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['Guy', 'Dilena'],
}));

app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {};

let users = {};

//////// ********************************************** //////////////
////////////////////////// GET ROUTES ///////////////////////////////
//////// ********************************************** //////////////

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Logs actions to our console.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  if (req.session.user_id === null || req.session.user_id === undefined) {
    return res.redirect('/urls/register');
  } else {
    return res.redirect('/urls');
  }
});

//client makes a request (GET) for the information on this page.
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user_id: req.session.user_id,
      email:
    users[req.session.user_id]
      ? users[req.session.user_id].email
      : null
    };
    res.render("urls_new",templateVars);
  } else {
    res.redirect('/urls/login');
  }
});

//Client makes request(GET) for information
app.get("/urls", (req, res) => {
  if (req.session.user_id === null || req.session.user_id === undefined) {
    return res.redirect('/urls/login');
  }
  const checkUserID = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: checkUserID,
    user_id: req.session.user_id,
    email:
  users[req.session.user_id]
    ? users[req.session.user_id].email
    : null
  };
  res.render("urls_index", templateVars);
});


//Client asks for information (GET), the registration page,
app.get("/urls/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    email:
    users[req.session.user_id]
      ? users[req.session.user_id].email
      : null
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id,
    email:
      users[req.session.user_id]
        ? users[req.session.user_id].email
        : null
  };
  res.render("urls_login", templateVars);
});

//Client makes request (GET) for information using the variable ":shortURL"
//We access the templateVars Object to set the KEY - VALUE pairs.
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === null || req.session.user_id === undefined) {
    return res.status(400).send('Error: You Must be Logged In');
  } else if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const templateVars = {
      urls: urlDatabase,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: req.session.user_id,
      email:
    users[req.session.user_id]
      ? users[req.session.user_id].email
      : null
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(404).send("This URL Does Not Belong To You");
  }
});

//Client makes a request (GET) for information at the variable ":shortURL"
app.get("/u/:shortURL", (req, res) => {
  if (req.session.user_id === null || req.session.user_id === undefined) {
    return res.status(400).send('Error: You Must be Logged In');
  }
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    return res.status(404).send("This URL Does Not Belong To You");
  }
});


//////// ********************************************** //////////////
////////////////////////// POST ROUTES ///////////////////////////////
//////// ********************************************** //////////////


//Client makes a request to Make/Change Information
app.post("/urls", (req, res) => {
  ///req.session.user_id checks all cookies for the relevant id
  ///If not logged in and attempting to access the post request it will reject with the else error.
  if (req.session.user_id) {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    let user_id = req.session.user_id;
    
    //Populate the database. Using [shortURL] we can set the object to our variable.
    //Passing the 'longURL' key the value from our req.body
    //Do the same from our cookies for the userID
    urlDatabase[shortURL] = {
      'longURL' : longURL,
      'userID'  : user_id,
    },
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("YOU SHALL NOT PASS!");
  }
});

//Client makes a request to Make/Change (POST) information on the register page
app.post("/urls/register", (req, res) => {
  if (getUserByEmail(req.body.email, users, res)) {
    return res.status(400).send('Email address already exists');
  } else {
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id,
      email,
      hashedPassword,
    };
    if (email === '' || password === '') {
      return res.status(400).send('Email and/or Password Cannot be Empty');
    }
  }
  req.session.user_id = (getUserByEmail(req.body.email, users, res));
  res.redirect('/urls');
});

app.post("/urls/login", (req, res) => {
  const hashPassword = getUserDatabaseByEmail(req.body.email, users, res).hashedPassword;
  const password = req.body.password;
  if (getUserByEmail(req.body.email, users, res)  &&
  bcrypt.compareSync(password, hashPassword)) {
    req.session.user_id = (getUserByEmail(req.body.email, users, res));
    res.redirect(`/urls`);
  } else {
    return res.status(400).send('Password or Email Address Incorrect');
  }
});

app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls/login');
});

//CLient Makes a request to Make or Change Information (PUT)
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === null || req.session.user_id === undefined) {
    return res.redirect('/urls/register');
  }
  if (urlsForUser(req.session.user_id, urlDatabase)) {
    //set the variable to the req.params.shorturl
    let shortURL = req.params.shortURL;
    //delete the ShortURL from the urlDatabase
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === null || req.session.user_id === undefined) {
    return res.redirect('/urls/register');
  }
  if (urlsForUser(req.session.user_id, urlDatabase)) {
    const longURL = req.body.longURL;
    const shortURL = req.params.id;
    urlDatabase[shortURL] = {
      'longURL': longURL,
      'userID': req.session.user_id
    };
  }
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Mega Server Serving Port: ${PORT}! - Days Since Last Server Crash: 0.25`);
});
