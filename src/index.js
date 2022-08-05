const express = require('express')
const app = express()


app.use(express.json())
app.use(express.urlencoded({extendeds: false}))


require('./app/controllers/index')(app)

app.listen(3000)
