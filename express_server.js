const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser")


app.set("view engine", "ejs");
app.use(cookieParser())


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

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
  const templateVars = {
    // userName: req.cookies.userName
    user_id: req.cookies.user_id
  }
 
  res.render("urls_new",templateVars);
});

//Client makes request(GET) for information
//We RENDER our main page (urls_index) using the templateVars Object
app.get("/urls", (req, res) => {
  const templateVars = { 
  urls: urlDatabase,
  // userName: req.cookies.userName,
  user_id: req.cookies.user_id
   };
  res.render("urls_index", templateVars);
});

//REGISTRATION PAGE
//Client asks for information (GET), the registration page,
//We render the register page
app.get("/urls/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // userName: req.cookies.userName
    user_id: req.cookies.user_id
  }
    res.render("urls_register", templateVars)
  })

//Client makes request (GET) for information using the variable ":shortURL"
//We access the templateVars Object to set the KEY - VALUE pairs.
//Then RENDER the urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, //our shortURL is the req.param.shortURL.
    longURL: urlDatabase[req.params.shortURL],  //get longURL value like this 
    // userName: req.cookies.userName
    user_id: req.cookies.user_id
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


//////// ********************************************** //////////////
////////////////////////// POST ROUTES ///////////////////////////////
//////// ********************************************** //////////////


//Client makes a request to Make/Change Information
app.post("/urls", (req, res) => {
  // console.log(req.body);  //Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');    
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



//Client makes a request to Make/Change (POST) information on the register page
app.post("/urls/register", (req, res) => {

  if (checkEmailExists(req.body.email, users, res) === true) {
    res.send('Error: Email address already exists')
  } else {

  let userRandomID = generateRandomString();
  let id = userRandomID
  let email = req.body.email
  let password = req.body.password
  users[userRandomID] = {
    id,
    email,
    password,
  }

  if (email === '' || password === '') {
    res.send('400 Status Code - Email and/or Password Cannot be Empty')
  }
  
  res.cookie('user_id',users[userRandomID])
  res.redirect('/urls')
}})


//User enters their userName in the login input
//sets the variable userName to the userName put at login from req.body.userName
app.post("/urls/login", (req, res) => {
  const userName = req.body.userName
  //set the cookie with RES to 'userName' , userName
  // res.cookie('userName', userName)
  //redirect to the index
  res.redirect(`/urls`)
})

app.post("/urls/logout", (req, res) => {
  const userName = req.body.userName;
  // res.clearCookie('userName', userName)
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

generateRandomString = () => {
  let shortURL = Math.random().toString(36).slice(7);
  return shortURL;
}

checkEmailExists = (newEmail, database, res) => {
for (const i in database) {
  // console.log("USER --->", database[i].email)
  if (newEmail === database[i].email) {
    return true;
  }
}
return false;
}
