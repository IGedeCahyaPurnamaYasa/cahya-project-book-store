const mongoose = require('mongoose')

const SchemaType = mongoose.Schema.Types

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
    },
    owner: {
        type: SchemaType.ObjectId,
        required: true,
        ref: 'User'
    },
    categories: [{
        category: {
            type: SchemaType.ObjectId,
            ref: 'Category'
        }
    }],
    photo: {
        type: Buffer
    },
    stock: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Virtual Property For Book
bookSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'book'
})

const Book = mongoose.model('Book', bookSchema)

module.exports = Book