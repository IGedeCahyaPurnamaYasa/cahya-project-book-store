const express = require('express')
const Book = require('../models/book')
const auth = require('../middleware/auth')
const { getAllCategory } = require('../data/category')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')

const getCategoryName = async () => {
    const allCategory = await getAllCategory()
    const name = []

    // Get category name
    allCategory.forEach((category) => {
        name.push(category.name)
    })

    return name
}

const getCategoryId = async (categories) => {
    const allCategory = await getAllCategory()
    const categoryId = []
    // Get category ID
    allCategory.forEach((category) => {
        if(categories.includes(category.name)){
            categoryId.push({category: category._id})
        }
    })
    
    return categoryId
}

const checkRole = (user_role, target_role) => {
    return user_role.find((role) => role.role === target_role)
}

router.post('/books', auth, async (req,res) => {
    const check_role = checkRole(req.user.roles, 'seller')
    if(!check_role){
        return res.status(401).send()
    }
    // if contain categories
    if(req.body.categories){
        const categories = req.body.categories
        const categoryName = await getCategoryName()
    
        // Check category name
        const filterCategory = categories.every((category) => categoryName.includes(category))
        
        if(!filterCategory){
            return res.status(400).send({error: 'You some problem with input category'})
        }

        // Get category id
        req.body.categories = await getCategoryId(categories)
    }
    
    const book = new Book({
        ...req.body,
        owner: req.user._id
    })

    try {
        await book.save()
        res.status(201).send(book)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/books', async (req,res) => {
    try {
        const books = await Book.find({})

        res.send(books)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/books/:id', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id)
        
        if(!book){
            return res.status(404).send()
        }
        
        res.send(book)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/books/:id', auth, async (req,res) => {
    const check_role = checkRole(req.user.roles, 'seller')
    if(!check_role){
        return res.status(401).send()
    }

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'price', 'categories', 'stock']    
    const isValidOpertaion = updates.every((update) => allowedUpdates.includes(update))
    
    // if contain categories
    if(req.body.categories){
        const categories = req.body.categories
        const categoryName = await getCategoryName()
    
        // Check category name
        const filterCategory = categories.every((category) => categoryName.includes(category))
        
        if(!filterCategory){
            return res.status(400).send({error: 'You some problem with input category'})
        }

        // Get category id
        req.body.categories = await getCategoryId(categories)
    }    


    if(!isValidOpertaion){
        return res.status(400).send({error: 'invalid update'})
    }

    try {
        const book = await Book.findById(req.params.id)

        if(!book){
            return res.status(404).send()
        }

        updates.forEach((update) => book[update] = req.body[update])
        await book.save()

        res.send(book)
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/books/:id', async (req,res) => {    
    const check_role = checkRole(req.user.roles, 'seller')
    if(!check_role){
        return res.status(401).send()
    }

    try {
        const book = await Book.findOneAndDelete({_id: req.params.id})

        if(!book){
            return res.status(404).send()
        }
        
        res.send(book)
    } catch (e) {
        res.status(500).send()
    }
})

const photo = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload images file'))
        }
        cb(undefined, true)
    }
}) 

router.post('/books/:id/photo', photo.single('photo'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    const book = await Book.findOne({_id: req.params.id})
    
    if(!book){
        return res.status(404).send()
    }

    book.photo = buffer
    await book.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


router.get('/books/:id/photo', async (req, res) => {
    try {
        const book = await Book.findOne({_id: req.params.id})

        if(!book || !book.photo){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(book.photo)
    } catch (e) {
        res.status(404).send()
    }
})


router.delete('/books/:id/photo', async (req, res) => {
    const book = await Book.findOne({_id: req.params.id})
    
    if(!book){
        return res.status(404).send()
    }

    book.photo = undefined
    await book.save()
    res.send()
})


module.exports = router
