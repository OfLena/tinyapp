const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const e = require("express");


app.set("view engine", "ejs");
app.use(cookieParser());


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

app.use(bodyParser.urlencoded({extended: true}));

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

  if (req.cookies.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user_id: req.cookies.user_id,
      email:
    users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
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
  const templateVars = {
    urls: urlDatabase,

    user_id: req.cookies.user_id,
    email:
  users[req.cookies["user_id"]]
    ? users[req.cookies["user_id"]].email
    : null
  };

  console.log('TemplateVars --->', templateVars)

  res.render("urls_index", templateVars);
});

//REGISTRATION PAGE
//Client asks for information (GET), the registration page,
//We render the register page
app.get("/urls/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    
    user_id: req.cookies.user_id,
    email:
    users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null
  };
  res.render("urls_register", templateVars);
});

//LOGIN PAGE
app.get("/urls/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    email:
      users[req.cookies["user_id"]]
        ? users[req.cookies["user_id"]].email
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
    
    user_id: req.cookies.user_id,
    email:
    users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null
  };
  res.render("urls_show", templateVars);
});

//Client makes a request (GET) for information at the variable ":shortURL"
//We set our longURL variable to the Value of our ShortURL key in the URL database
//Then REDIRECT to the longURL
app.get("/u/:shortURL", (req, res) => {
  
  let longURL = urlDatabase[req.params.shortURL].longURL; //again accessing longURL by the key SHortURL and value of it
  
  console.log('longURL --->', longURL)
  res.redirect(longURL);
});


//////// ********************************************** //////////////
////////////////////////// POST ROUTES ///////////////////////////////
//////// ********************************************** //////////////


//Client makes a request to Make/Change Information
app.post("/urls", (req, res) => {
  ///req.cookies.user_id checks all cookies for the relevant id
  ///If not logged in and attempting to access the post request it will reject with the else error.
  if (req.cookies.user_id) {
  
    //Set ShortURL to random String
    shortURL = generateRandomString()
    longURL = req.body.longURL;
    user_id = req.cookies.user_id;
    
    //Populate the database. Using [shortURL] we can set the key
    //to our variable.
    //Passing the 'longURL' key the value from our req.body
    //Do the same from our cookies for the userID
   urlDatabase[shortURL] = {
        'longURL' : longURL,
       'UserID'  : user_id,
    },
    
    //Console logs to prove our DB is populating properly.
    console.log('URLdatabase: -->', urlDatabase)
    console.log('Body --->', req.body)

    
    // let shortURL = generateRandomString();
    // let longURL = req.body.longURL;
    // urlDatabase.shortURL = longURL;
      // urlDatabase[shortURL] = generateRandomString();

    res.redirect('/urls');
  } else {
  
    // console.log(req.body);  //Log the POST request body to the console

    res.send("YOU SHALL NOT PASS!");
  }
});

//CLient Makes a request to Make or Change Information (PUT)
app.post("/urls/:shortURL/delete", (req, res) => {
  //set the variable to the req.params.shorturl
  let shortURL = req.params.shortURL;
  //delete the ShortURL from the urlDatabase
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//FOllows from URLS_show on line 24
//POST // Dynamic Variable associated with edit.
app.post("/urls/:id/edit", (req, res) => {
  //gets  variable from req.params
  //you can console.log req.body to see the params path.
  
  let id = req.params.id;
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {
  'longURL': longURL,
  'userID': req.params.user_id
  }
  //then redirects to homepage.
  console.log('req.body.longURL --->', req.body.longURL)
  console.log('databaseid --->', longURL)
  console.log('params ---->' ,req.params)
  res.redirect(`/urls`);
});



//Client makes a request to Make/Change (POST) information on the register page
app.post("/urls/register", (req, res) => {

  if (checkEmailExists(req.body.email, users, res)) {
    res.send('403 Status Code: Email address already exists');
  } else {

    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    users[id] = {
      id,
      email,
      password,
    };
    if (email === '' || password === '') {
      res.send('400 Status Code - Email and/or Password Cannot be Empty');
    }
  }


  res.cookie('user_id', checkEmailExists(req.body.email, users, res).id);
  res.redirect('/urls');
});



//User enters their userName in the login input
//sets the variable userName to the userName put at login from req.body.userName
app.post("/urls/login", (req, res) => {
  if (checkEmailExists(req.body.email, users, res)  &&
      checkPasswordCorrect(req.body.password, users, res)) {
    res.cookie('user_id', checkEmailExists(req.body.email, users, res).id);
    res.redirect(`/urls`);
  } else {
    res.send('403 Status Code: Password or Email Address Incorrect');
  }
});

app.post("/urls/logout", (req, res) => {
  // res.clearCookie('userName', userName)
  res.clearCookie('user_id');
  res.redirect('/urls');
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

const urlsForUsers = (id) => {
  
}
