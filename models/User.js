const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    name_iv: { type: String, required: true },
    message: { type: String, required: true },
    message_iv: { type: String, required: true },
}, { _id: false }); // _id: false is optional, it prevents MongoDB from creating an id for each subdocument

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    messages: [messageSchema],
    verification_code: { type: String, default: null },
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;