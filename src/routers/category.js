const express = require('express')
const Category = require('../models/category')

const router = new express.Router()

router.post('/categories', async (req, res) => {
    const category = new Category(req.body)

    try {
        await category.save()
        res.status(201).send(category)
    } catch (e) {
        res.status(400)
    }
})

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({})
        res.send(categories)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findOne({_id: req.params.id})
        
        if(!category){
            return res.status(404).send()
        }
        
        res.send(category)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/categories/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name']
    const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOpertaion){
        return res.status(400).send({error: 'invalid update'})
    }

    try {
        const category = await Category.findOne({_id: req.params.id})

        if(!category){
            return res.status(404).send()
        }

        updates.forEach((update) => category[update] = req.body[update])
        await category.save()
        res.send(category)

    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/categories/:id', async (req,res) => {
    try {
        const category = await Category.findOneAndDelete({_id: req.params.id})
        if(!category){
            return res.status(404).send()
        }
        res.send(category)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router