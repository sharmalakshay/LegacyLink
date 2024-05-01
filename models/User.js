const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    try {
        const hashedPassword = await argon2.hash(user.password);
        user.password = hashedPassword;
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    const user = this;
    return await argon2.verify(user.password, candidatePassword);
};

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;