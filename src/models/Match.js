const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    usernameA: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },

    usernameB: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },

    matchStatus: [{
        userAtoBstatus : {type: String, enum: ['reject', 'accept', 'pending']},
        userBtoAstatus : {type: String, enum: ['reject', 'accept', 'pending']}
    }]

});