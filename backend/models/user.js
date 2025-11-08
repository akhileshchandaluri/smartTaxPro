const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    salary: Number,
    capitalGains: Number,
    sec80c: Number,
    sec80d: Number,
    homeLoan: Number,
    multipleHouse: { type: String, enum: ['yes','no'], default: 'no' },
    recommendedRegime: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
