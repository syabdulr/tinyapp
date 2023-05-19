// Function to find a user by email in our users database
function getUserByEmail(email, database) {
    for (let userId in database) {
      if (database[userId].email === email) {
        return database[userId];
      }
    }
    return undefined;
  }

  module.exports = { getUserByEmail };