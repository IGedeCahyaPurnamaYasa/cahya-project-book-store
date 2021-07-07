const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/users', async (req,res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'birt_date', 'roles']
    const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOpertaion){
        return res.status(400).send({error: 'invalid updates'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        req.user.roles = []
        req.body.roles.forEach((role) => {
            req.user.roles.push({role})
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const photo_profile = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jepg|png)*/)){
            return cb(new Error('Please upload images file'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/photo', auth, photo_profile.single('photo_profile'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.photo_profile = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/photo', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.photo_profile){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.photo_profile)
    } catch (e) {
        res.status(404).send()
    }
})

router.delete('/users/me/photo', auth, async (req, res) => {
    req.user.photo_profile = undefined
    await req.user.save()
    res.send()
})

module.exports = router