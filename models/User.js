const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: { type: String, required: false },
    message_iv: { type: String, required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { _id: true });

const namesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    name_iv: { type: String, required: true },
    visibility: { type: String, required: true, default: 'public'},
    password: { type: String, required: false, select: false },
    password_iv: { type: String, required: false, select: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    messages: [messageSchema],
}, { _id: true });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    names: [namesSchema],
    verification_code: { type: String, default: null },
    active: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { _id: true });

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;