const express = require("express");
const app = express();
const PORT = 8081; // default port 8081

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
  const templateVars = { urls: urlDatabase }; // Provide the URL database to the template
  res.render("urls_index", templateVars); // Render the "urls_index.ejs" template with the provided data
});

// Route handler for form submission to create a new URL
app.post("/urls", (req, res) => {
  console.log("inside creation");
  const shortURL = generateRandomString(); // Generate a random short URL
  const longURL = req.body.longURL; // Get the long URL from the form submission
  urlDatabase[shortURL] = longURL; // Store the long URL in the database with the short URL as the key
  res.redirect(`/urls/${shortURL}`); // Redirect to the page for the newly created short URL
});

// Route handler to render the new URL submission form
app.get("/urls/new", (req, res) => {
  res.render("urls_new"); // Render the "urls_new.ejs" template
});

// Route handler to render the page for a specific URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the short URL from the route parameter
  const longURL = urlDatabase[id]; // Look up the corresponding long URL in the database
  const templateVars = { id, longURL }; // Provide the short URL and long URL to the template
  res.render("urls_show", templateVars); // Render the "urls_show.ejs" template with the provided data
});

// Route handler to redirect to the longURL associated with the shortURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Get the short URL from the route parameter
  const longURL = urlDatabase[shortURL]; // Look up the corresponding long URL in the database
  res.redirect(longURL); // Redirect the user to the long URL
});

app.post("/urls/:id", (req,res) => { //edit 
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls'); 
});

app.post("/urls/:id/delete", (req,res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});