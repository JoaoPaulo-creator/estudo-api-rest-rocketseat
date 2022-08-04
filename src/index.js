const express = require('express')
const app = express()


app.use(express.json())
app.use(express.urlencoded({extendeds: false}))


require('./controllers/authcontroller')(app)
require('./controllers/projectController')(app)

app.listen(3000)
