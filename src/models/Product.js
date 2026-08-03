const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El titulo es obligatorio'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'El precio es obligatorio'],
            min: 0,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);
