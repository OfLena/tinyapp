const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const res = require("express/lib/response");
const req = require("express/lib/request");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

app.use(bodyParser.urlencoded({extended: true}));

///accessing cookies/session
// const username = req.session.user_id
// const username = req.session.user_id

// //setting cookies/session
// res.cookie('username', username) => ("user_id", userID)
// req.session.user_id = userID

// //clearing cookies/session
// res.clearCookie("user_id");
// req.session = null;
 


let urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = {};



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Logs actions to our console.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//client makes a request (GET) for the information on this page.
//We then res.RENDER the information to the user.
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
    res.redirect('/urls');
  }
});

//Client makes request(GET) for information
//We RENDER our main page (urls_index) using the templateVars Object
app.get("/urls", (req, res) => {
  console.log(urlDatabase)
  if (req.session.user_id === null || req.session.user_id === undefined){
    return res.redirect('/urls/register')
  }
const checkUserID = urlsForUser(req.session.user_id, urlDatabase)
// console.log(checkUserID)
  const templateVars = {
    urls: checkUserID,
    user_id: req.session.user_id,
    email:
  users[req.session.user_id]
    ? users[req.session.user_id].email
    : null
  };

  // console.log('TemplateVars --->', templateVars)

  res.render("urls_index", templateVars);
});

//REGISTRATION PAGE
//Client asks for information (GET), the registration page,
//We render the register page
app.get("/urls/register", (req, res) => {
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

//LOGIN PAGE
app.get("/urls/login", (req, res) => {
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
//Then RENDER the urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL, //our shortURL is the req.param.shortURL.
    longURL: urlDatabase[req.params.shortURL].longURL,  //get longURL value like this
    
    user_id: req.session.user_id,
    email:
    users[req.session.user_id]
      ? users[req.session.user_id].email
      : null
  };
  res.render("urls_show", templateVars);
});

//Client makes a request (GET) for information at the variable ":shortURL"
//We set our longURL variable to the Value of our ShortURL key in the URL database
//Then REDIRECT to the longURL
app.get("/u/:shortURL", (req, res) => {
  
  let longURL = urlDatabase[req.params.shortURL].longURL; //again accessing longURL by the key SHortURL and value of it

  res.redirect(longURL);
});


//////// ********************************************** //////////////
////////////////////////// POST ROUTES ///////////////////////////////
//////// ********************************************** //////////////


//Client makes a request to Make/Change Information
app.post("/urls", (req, res) => {
  ///req.session.user_id checks all cookies for the relevant id
  ///If not logged in and attempting to access the post request it will reject with the else error.
  if (req.session.user_id) {
  
    shortURL = generateRandomString()
    longURL = req.body.longURL;
    user_id = req.session.user_id;
    
    //Populate the database. Using [shortURL] we can set the key
    //to our variable.
    //Passing the 'longURL' key the value from our req.body
    //Do the same from our cookies for the userID
   urlDatabase[shortURL] = {
        'longURL' : longURL,
       'userID'  : user_id,
    },
    
    //Console logs to prove our DB is populating properly.
    // console.log('URLdatabase: -->', urlDatabase)
    // console.log('Body --->', req.body)

    res.redirect('/urls');
  } else {
  
    // console.log(req.body);  //Log the POST request body to the console

    res.send("YOU SHALL NOT PASS!");
  }
});

//Client makes a request to Make/Change (POST) information on the register page
app.post("/urls/register", (req, res) => {

  if (checkEmailExists(req.body.email, users, res)) {
    res.send('403 Status Code: Email address already exists');
  } else {

    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10)
    users[id] = {
      id,
      email,
      hashedPassword,
    };
    if (email === '' || password === '') {
      res.send('400 Status Code - Email and/or Password Cannot be Empty');
    }
  }

  req.session.user_id = (checkEmailExists(req.body.email, users, res).id);
  res.redirect('/urls');
});

//User enters their userName in the login input
//sets the variable userName to the userName put at login from req.body.userName
app.post("/urls/login", (req, res) => {

  const hashPassword = checkEmailExists(req.body.email, users, res).hashedPassword
  const password = req.body.password

  if (checkEmailExists(req.body.email, users, res)  &&
  bcrypt.compareSync(password, hashPassword)) {
    req.session.user_id = (checkEmailExists(req.body.email, users, res).id);
    res.redirect(`/urls`);
  } else {
    res.send('403 Status Code: Password or Email Address Incorrect');
  }
});

app.post("/urls/logout", (req, res) => {
  // res.clearCookie('userName', userName)
  req.session = null;
  res.redirect('/urls');
});

//CLient Makes a request to Make or Change Information (PUT)
app.post("/urls/:shortURL/delete", (req, res) => {

  if (req.session.user_id === null || req.session.user_id === undefined){
    return res.redirect('/urls/register')
  }

  if (urlsForUser(req.session.user_id, urlDatabase)) {


  //set the variable to the req.params.shorturl
  let shortURL = req.params.shortURL;
  //delete the ShortURL from the urlDatabase
  delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

//FOllows from URLS_show on line 24
//POST // Dynamic Variable associated with edit.
app.post("/urls/:id", (req, res) => {

  if (req.session.user_id === null || req.session.user_id === undefined){
    return res.redirect('/urls/register')
  }

  if (urlsForUser(req.session.user_id, urlDatabase)) {

  //gets  variable from req.params
  //you can console.log req.body to see the params path.
  
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {
  'longURL': longURL,
  'userID': req.session.user_id
  }
}
  //then redirects to homepage.
  // console.log('req.body.longURL --->', req.body.longURL)
  // console.log('databaseid --->', longURL)
  // console.log('params ---->' ,req.params)
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

generateRandomString = () => {
  let shortURL = Math.random().toString(36).slice(7);
  return shortURL;
};

const checkEmailExists = (newEmail, database, res) => {
  if (newEmail === '') {
    res.send('Status Code 400: Email Can not be Empty');
  }
  for (const i in database) {
    if (newEmail === database[i].email) {
      return database[i];
    }
  }
  return false;
};

const checkPasswordCorrect = (checkPassword, database, res) => {
  if (checkPassword === '') {
    res.send('Status Code 400: Password Cannot be Empty');
  }
  for (const i in database) {
    if (checkPassword === database[i].password) {
      return database[i];
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let userUrlsObj = {};
  for (const element in urlDatabase) {
    if (urlDatabase[element].userID === id) {
      userUrlsObj[element] = urlDatabase[element];
    }
  }
  return userUrlsObj;
}

