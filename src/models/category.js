const mongoose = require('mongoose')

const SchemaType = mongoose.Schema.Types

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category