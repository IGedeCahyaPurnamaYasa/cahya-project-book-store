const mongoose = require('mongoose')
const SchemaType = mongoose.Schema.Types

const transactionSchema = new mongoose.Schema({
    book: {
        type: SchemaType.ObjectId,
        required: true,
        ref: 'Book'
    },
    buyer: {
        type: SchemaType.ObjectId,
        required: true,
        ref: 'User'
    },
    owner: {
        type: SchemaType.ObjectId,
        required: true,
        ref: 'User'
    },
    total: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
},
{
    virtuals: true
})

// Virtual Property
transactionSchema.virtual('tracktransactions', {
    ref: 'TrackTransaction',
    localField: '_id',
    foreignField: 'parent_transaction'
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction