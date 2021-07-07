const express = require('express')
const Transaction = require('../models/transaction')
const auth = require('../middleware/auth')
const TrackTransaction = require('../models/track_transaction')
const router = new express.Router()

const checkRole = (user_role, target_role) => {
    return user_role.find((role) => role.role === target_role)
}

router.post('/track_transaction', auth, async (req,res) => {
    try {
        const track_transaction = new TrackTransaction({
            ...req.body
        })

        await track_transaction.save()
        res.status(201).send(track_transaction)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/track_transaction/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['note']    
    const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidOpertaion){
        return res.status(400).send({error: 'invalid update'})
    }
    
    try {
        const track_transaction = await TrackTransaction.findOne({_id: req.params.id})

        if(!track_transaction){
            return res.status(404).send()
        }

        updates.forEach((update) => track_transaction[update] = req.body[update])
        await track_transaction.save()

        res.send(track_transaction)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router