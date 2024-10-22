const mongoose = require('mongoose');


// required: true 表示此欄位是必填的
// unique: true 表示這個欄位的值必須在資料庫中是唯一的，不能重複
const userSchema = new mongoose.Schema({
    username: { type: string, required: true, unique: true },
    password: { type: string, required: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;