const mongoose = require('mongoose')

const SchemaType = mongoose.Schema.Types

const trackTransactionSchema = new mongoose.Schema({
    parent_transaction: {
        type: SchemaType.ObjectId,
        required: true,
        ref: 'Transaction'
    },
    category_transaction: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['cart', 'requested', 'confirm', 'paid', 'packed', 'delivered', 'accepted', 'canceled']
    },
    code_transaction: {
        type: Number,
        required: true,
        enum: [0,1,2,3,4,5,6,-1]
    },
    note: {
        type: String,
        trims: true
    }
}, {
    timestamps: true
})

trackTransactionSchema.pre('validate', async function (next) {
    const track_transaction = this
    const category = ['cart', 'requested', 'confirm', 'paid', 'packed', 'delivered', 'accepted']
    if(track_transaction.isModified('code_transaction')){
        if(track_transaction.code_transaction >= 0){
            track_transaction.category_transaction = category[track_transaction.code_transaction]
        }
        else{
            track_transaction.category_transaction = 'canceled'
        }
    }
    next()
})

const TrackTransaction = mongoose.model('TrackTransaction', trackTransactionSchema)

module.exports = TrackTransaction