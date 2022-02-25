const getUserByEmail = (newEmail, database, res) => {
  if (newEmail === '') {
    return res.status(400).send('Email Can\'t be Empty');
  }
  for (const i in database) {
    if (newEmail === database[i].email) {
      return database[i].id;
    }
  }
  return undefined;
};

const getUserObjectByEmail = (newEmail, database, res) => {
  if (newEmail === '') {
    return res.status(400).send('Email Can\'t be Empty');
  }
  for (const i in database) {
    if (newEmail === database[i].email) {
      return database[i];
    }
  }
  return false;
};

const getUserDatabaseByEmail = (newEmail, database, res) => {
  if (newEmail === '') {
    return res.status(400).send('Email Can\'t be Empty');
  }
  for (const i in database) {
    if (newEmail === database[i].email) {
      return database[i];
    }
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  let userUrlsObj = {};
  for (const element in urlDatabase) {
    if (urlDatabase[element].userID === id) {
      userUrlsObj[element] = urlDatabase[element];
    }
  }
  return userUrlsObj;
};

const generateRandomString = () => {
  let shortURL = Math.random().toString(36).slice(7);
  return shortURL;
};




module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  getUserObjectByEmail,
  getUserDatabaseByEmail,
};