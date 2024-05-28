//To create secret key for Session and JWT token

const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log('\n64 character secret:');
console.log(secret);

console.log('\n');

const secretKey = crypto.randomBytes(32).toString('hex');
console.log('32 character secret key:');
console.log(secretKey);