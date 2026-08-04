const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/hash.js');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'La password es obligatoria'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function saveHook() {
    if (!this.isModified('password')) {
        return;
    }

    this.password = await hashPassword(this.password);
    return;
});

userSchema.methods.matchPassword = async function matchPassword(plainPassword) {
    return comparePassword(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
