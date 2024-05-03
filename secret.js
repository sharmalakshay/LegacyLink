//To create secret key for Session and JWT token

const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log(secret);