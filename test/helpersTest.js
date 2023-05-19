// Import the 'assert' object from the 'chai' library. 'assert' provides us with assertion methods for our tests.
const { assert } = require('chai');

// Import the 'getUserByEmail' function from our helper module.
const { getUserByEmail } = require('../helpers.js');

// Define a set of test users that we will use in our tests.
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Mocha testing framework to test userByEmail
describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    // Call 'getUserByEmail' with a valid email and our test user database.
    const user = getUserByEmail("user@example.com", testUsers);
    // Define what we expect the result of the function call above to be.
    const expectedUser = testUsers["userRandomID"];
    // Assert that the result of the function is deeply equal to our expected result.
    assert.deepEqual(user, expectedUser);
  });

  // This test checks the behavior 'should return undefined when email does not exist in database'.
  it('should return undefined when email does not exist in database', function() {

    const user = getUserByEmail("nonexistent@example.com", testUsers);
    // Assert that the result of the function is 'undefined'.
    assert.isUndefined(user);
  });
});
