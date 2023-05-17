// Import necessary modules
const express = require("express");
const cookieParser = require('cookie-parser'); //needed for handling cookies
const app = express();
const PORT = 8081; // default port 8081

app.use(cookieParser()); // middleware for parsing cookies

// Set the view engine to EJS for rendering dynamic web pages on the server side
app.set("view engine", "ejs");

// This is a simple in-memory URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// Middleware to parse the request body for 'POST' requests
app.use(express.urlencoded({ extended: true }));

// Function to find a user by email in our users database
function getUserByEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

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
  // Get the user from the users database using the ID from the cookies
  const userId = req.cookies.user_id;
  const user = users[userId];

  const templateVars = {
    urls: urlDatabase, // Pass the URL database to the template
    user // Pass the user to the template
  };
  res.render("urls_index", templateVars); // Render the "urls_index.ejs" template with the provided data
});

// Route handler for form submission to create a new URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Generate a random short URL
  const longURL = req.body.longURL; // Get the long URL from the form submission
  urlDatabase[shortURL] = longURL; // Store the long URL in the database with the short URL as the key
  res.redirect(`/urls/${shortURL}`); // Redirect to the page for the newly created short URL
});

// Route handler to render the new URL submission form
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  res.render("urls_new", { user }); // Render the "urls_new.ejs" template
});

// Route handler to render the page for a specific URL
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const id = req.params.id; // Get the URL id from the route parameters
  const longURL = urlDatabase[id]; // Look up the corresponding long URL in the database
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars); // Render the "urls_show.ejs" template with the provided data
});

// Route handler to redirect to the longURL associated with the shortURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Get the short URL from the route parameter
  const longURL = urlDatabase[shortURL]; // Look up the corresponding long URL in the database
  res.redirect(longURL); // Redirect the user to the long URL
});

// Route handler to handle the request to edit a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;  // Get the id from the request parameters
  urlDatabase[id] = req.body.longURL;  // Update the long URL in the database
  res.redirect('/urls');  // Redirect the client to the URLs page
});

// Route handler to handle the request to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;  // Get the id from the request parameters
  delete urlDatabase[id];  // Delete the corresponding entry in the URL database
  res.redirect('/urls');  // Redirect the client to the URLs page
});

// Route handler to handle the request to log out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');  // Clear the user_id cookie
  res.redirect('/login');  // Redirect the client to the URLs page
});

// Route handler to render the registration page
app.get('/register', function(req, res) {
  const user_Id = req.cookies.user_id;  // assuming user information is stored in session
  const user = users[user_Id];
  res.render('register', { user });
});


// Route handler to handle the registration form submission
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email or password are empty
  if (!email || !password) {
    res.status(400).send("Error 400: Email and password fields must not be empty");
    return;
  }

  // Check if email already exists
  if (getUserByEmail(email)) {
    res.status(400).send("Error 400: Email already exists");
    return;
  }

  // Generate a new user ID
  const id = generateRandomString();

  // Create new user object
  const newUser = {
    id,
    email,
    password
  };

  // Add new user to users database
  users[id] = newUser;

  // Set a user_id cookie
  res.cookie('user_id', id);

  // After creating the account, redirect user to /urls
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  res.render("login", { user });  // Render the "login.ejs" template
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find the user by their email
  const user = getUserByEmail(email);

  // If the user does not exist or the password does not match, send an error response
  if (!user || user.password !== password) {
    res.status(403).send("Error 403: Invalid email or password");
    return;
  }
  // Set a user_id cookie
  res.cookie('user_id', user.id);

  // Redirect the client to the URLs page
  res.redirect('/urls');
});

// Start the server and listen for connections on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);  // Log a message to the console when the server starts
});