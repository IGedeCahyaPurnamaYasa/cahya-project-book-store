const Category = require('../models/category')

const getAllCategory = async () => {
    const categories = Category.find({})
    return categories
}

module.exports = {
    getAllCategory
}