const { assert } = require('chai');

const emailChecker = require('../helper.js');

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

describe('getUserByEmail', function() {
  it('should return a true if both emails exist', function() {
    const user = emailChecker("user@example.com", testUsers)
    const expectedReturn = true;
    assert.strictEqual(user, expectedReturn);
  });
  it('should return undefined if email does not exist in database', () => {
    const user = emailChecker('user3@example.com', testUsers);
    const expectedReturn = false;
    assert.strictEqual(user, expectedReturn);
  })
});