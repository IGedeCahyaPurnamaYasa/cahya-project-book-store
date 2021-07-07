const mongoose = require('mongoose')

const categoryTractSchema = new mongoose.Schema({
    code: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        tolowercase: true
    }
})

const CategoryTrackTransaction = mongoose.model('CategoryTrackTransaction', categoryTractSchema)

module.exports = CategoryTrackTransaction