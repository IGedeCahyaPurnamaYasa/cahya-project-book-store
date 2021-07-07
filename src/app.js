const express = require('express')
require('./db/mongoose')

const bookRouter = require('./routers/book')
const userRouter = require('./routers/user')
const categoryRouter = require('./routers/category')
const transactionRouter = require('./routers/transaction')
const trackTransactionRouter = require('./routers/track_transaction')
const app = express()

app.use(express.json())

app.use(bookRouter)
app.use(userRouter)
app.use(categoryRouter)
app.use(transactionRouter)
app.use(trackTransactionRouter)

module.exports = app