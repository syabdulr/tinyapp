const express = require("express");
var cookieParser = require('cookie-parser'); //needed for username
const app = express();
const PORT = 8081; // default port 8081
app.use(cookieParser());

// Set the view engine to EJS
app.set("view engine", "ejs");

// Database storing the URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Middleware to parse the request body
app.use(express.urlencoded({ extended: true }));

// Function to generate a random string
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
  res.send("Hello!");
});

// Route handler to render the URLs index page
app.get("/urls", (req, res) => {
  const username = req.cookies.username;

  const templateVars = { 
    urls: urlDatabase, 
    username, // Add the username to the data passed to the view
  }; // Provide the URL database to the template
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
  const username = req.cookies.username;
  res.render("urls_new",{username}); // Render the "urls_new.ejs" template
});

// Route handler to render the page for a specific URL
app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const id = req.params.id; // Get the short URL from the route parameter
  const longURL = urlDatabase[id]; // Look up the corresponding long URL in the database
  const templateVars = { id, longURL, username }; // Provide the short URL and long URL to the template
  res.render("urls_show", templateVars); // Render the "urls_show.ejs" template with the provided data
});

// Route handler to redirect to the longURL associated with the shortURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Get the short URL from the route parameter
  const longURL = urlDatabase[shortURL]; // Look up the corresponding long URL in the database
  res.redirect(longURL); // Redirect the user to the long URL
});
// This route handles the request to edit a URL. It gets the id from the request parameters,
// sets the new long URL from the request body, and then redirects the client to the URLs page.
app.post("/urls/:id", (req, res) => { 
  const id = req.params.id;  // Get the id from the request parameters
  urlDatabase[id] = req.body.longURL;  // Set the new long URL from the request body
  res.redirect('/urls');  // Redirect the client to the URLs page
});

// This route handles the request to delete a URL. It gets the id from the request parameters,
// deletes the corresponding entry in the URL database, and then redirects the client to the URLs page.
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;  // Get the id from the request parameters
  delete urlDatabase[id];  // Delete the corresponding entry in the URL database
  res.redirect('/urls');  // Redirect the client to the URLs page
});

// This route handles the request to log in. It gets the username from the request body,
// sets a cookie with the username, and then redirects the client to the URLs page.
app.post("/login", (req, res) => {
  const username = req.body.username;  // Get the username from the request body
  res.cookie('username', username);  // Set a cookie with the username
  res.redirect('/urls');  // Redirect the client to the URLs page
});

// This route handles the request to log out. It clears the username cookie, 
// and then redirects the client to the URLs page.
app.post("/logout", (req, res) => {
  res.clearCookie('username');  // Clear the username cookie
  res.redirect('/urls');  // Redirect the client to the URLs page
});

// Start the server and listen for connections on the specified port.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);  // Log a message to the console when the server starts
});
