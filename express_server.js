// Import necessary modules
const express = require("express");
const cookieSession = require('cookie-session'); //needed for handling cookies
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');

const app = express();
const PORT = 8081; // default port 8081

app.use(cookieSession({
  name: 'session',
  keys: ['my-secret-key'] // secret key 
}));

// Set the view engine to EJS for rendering dynamic web pages on the server side
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// This is a simple in-memory user database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Define a function named `urlsForUser` which takes a user ID (`id`) as an argument.
function urlsForUser(id) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  // After checking all URLs in `urlDatabase`, return the `urls` object which now contains all URLs belonging to the user.
  return urls;
}

// Middleware to parse the request body for 'POST' requests
app.use(express.urlencoded({ extended: true }));

// Function to generate a random string for unique URL/ID generation
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Route handler for the root path
app.get("/", (req, res) => {
  res.send("Hello!"); // Send "Hello!" as the response
});

// Route handler to render the URLs index page
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  // Only allow logged in users to view URLs, not part of assignment but will also redirect user to login page
  if (!user) {
    res.send(`
    <p>Please login or register first! You will be redirected to the login page! </p>
    <script>
      setTimeout(function() {
        window.location.href = "/login";
      }, 3000);
    </script>
  `);
    return;
  }

  // Only show URLs that belong to the user
  const urls = urlsForUser(userId);

  const templateVars = {
    urls,
    user
  };
  res.render("urls_index", templateVars);
});

// Route handler for form submission to create a new URL
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  // If the user is not logged in, return an error message
  if (!user) {
    res.status(401).send("You must be logged in to shorten URLs.");
    return;
  }

  const shortURL = generateRandomString(); // Generate a random short URL
  const longURL = req.body.longURL; // Get the long URL from the form submission

  // Store the long URL in the database with the short URL as the key
  urlDatabase[shortURL] = { longURL, userID: userId }; // Update the structure here

  res.redirect(`/urls/${shortURL}`); // Redirect to the page for the newly created short URL
});

// Route handler to render the new URL submission form
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { user }); // Render the "urls_new.ejs" template
  }
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;

  // Only allow logged in users to view URLs
  if (!user) {
    res.send("Please login to view URLs!");
    return;
  }

  // Only show URLs that belong to the user
  const urls = urlsForUser(userId);
  const longURL = urls[id] ? urls[id].longURL : undefined; // Either user has it or they do not

  // if url does not belong to user
  if (!longURL) { // if undefined
    res.send("URL does not belong to you!");
    return;
  }

  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

// Route handler to redirect to the longURL associated with the shortURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Get the short URL from the route parameter

  // Check if the short URL exists in the database
  if (!urlDatabase[shortURL]) {
    res.status(404).send("<h1>Error: This short URL does not exist.</h1>");
    return;
  }

  const longURL = urlDatabase[shortURL].longURL; // Look up the corresponding long URL in the database

  res.redirect(longURL); // Redirect the user to the long URL
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;

  // Only allow logged in users to edit URLs
  if (!users[userId]) {
    res.status(403).send("Please login to edit URLs!");
    return;
  }

  // Only allow users to edit their own URLs
  const urls = urlsForUser(userId);
  if (!urls[id]) {
    res.status(403).send("URL does not belong to you!");
    return;
  }

  // Edit the URL
  urlDatabase[id].longURL = req.body.longURL;  // Update the longURL inside the nested object here
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;

  // Check if id exists in urlDatabase
  if (!urlDatabase[id]) {
    res.status(404).send("URL not found!");
    return;
  }

  // Only allow logged in users to delete URLs
  if (!users[userId]) {
    res.status(403).send("Please login to delete URLs!");
    return;
  }

  // Only allow users to delete their own URLs
  const urls = urlsForUser(userId);
  if (!urls[id]) {
    res.status(403).send("URL does not belong to you!");
    return;
  }

  // Delete the URL
  delete urlDatabase[id];
  res.redirect('/urls');
});

// Route handler to render the registration page
app.get('/register', function (req, res) {
  const user_Id = req.session.user_id;  // assuming user information is stored in session
  const user = users[user_Id];

  if (user) {
    res.redirect("/urls");
  } else {
    res.render('register', { user });
  }
});

// Route handler to handle the registration form submission
app.post("/register", (req, res) => {

  //modify the registration endpoint to use bcrypt to has the password
  const email = req.body.email;
  const password = req.body.password; // to be hashed

  // Check if email or password are empty
  if (!email || !password) {
    res.status(400).send("Error 400: Email and password fields must not be empty");
    return;
  }

  // Check if email already exists
  if (getUserByEmail(email, users)) {
    res.status(400).send("Error 400: Email already exists");
    return;
  }

  // Generate a new user ID
  const id = generateRandomString();

  // Hash the password with bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create new user object
  const newUser = {
    id,
    email,
    password: hashedPassword // Store hashed password instead of plain text
  };

  // Add new user to users database
  users[id] = newUser;

  // Set a user_id cookie
  req.session.user_id = id;

  // After creating the account, redirect user to /urls
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  // If the user is logged in, redirect to /urls
  if (user) {
    res.redirect("/urls");
  } else {
    // If the user is not logged in, render the login page
    res.render("login", { user });
  }
});

//modify login endpoint to use bcrypt to check password validation
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find the user by their email
  const user = getUserByEmail(email, users);

  // If the user does not exist or the password does not match, send an error response
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Error 403: Invalid email or password");
    return;
  }
  // Set a user_id cookie
  req.session.user_id = user.id;

  // Redirect the client to the URLs page
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Start the server and listen for connections on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);  // Log a message to the console when the server starts
});
