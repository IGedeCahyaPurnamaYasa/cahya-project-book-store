const express = require('express')
const Transaction = require('../models/transaction')
const Book = require('../models/book')
const auth = require('../middleware/auth')

const router = new express.Router()

const checkRole = (user_role, target_role) => {
    return user_role.find((role) => role.role === target_role)
}

router.post('/transactions', auth, async (req, res) => {
    const check_role = checkRole(req.user.roles, 'buyer')
    if(!check_role){
        return res.status(401).send()
    }

    try {
        
        const transaction = new Transaction({
            ...req.body,
            buyer: req.user._id
        })
        
        if(transaction.book){
            const book = await Book.findById(transaction.book)
            transaction.total = book.price * transaction.quantity
        }

        await transaction.save()

        res.status(201).send(transaction)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/transactions/buyer', auth, async (req,res) => {
    const check_role = checkRole(req.user.roles, 'buyer')
    if(!check_role){
        return res.status(401).send()
    }

    try {
        const transactions = await Transaction.find({buyer: req.user._id})
        res.send(transactions)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/transactions/seller', auth, async (req,res) => {
    const check_role = checkRole(req.user.roles, 'seller')
    if(!check_role){
        return res.status(401).send()
    }
    
    try {
        const transactions = await Transaction.find({seller: req.user._id})
        res.send(transactions)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/transactions/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({_id: req.params.id})
            .populate('book', ['name', 'price'])
            .populate('owner', 'name')
            .populate('buyer', 'name')
            // .populate({ path: 'tracktransactions' }).execPopulate()

        if(!transaction){
            return res.status(404).send()
        }

        res.send(transaction)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router