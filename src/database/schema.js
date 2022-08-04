const { application } = require('express')
const mongoose =  require('mongoose')
require('dotenv').config()

const MONGO_DB_USER = process.env.DB_USER
const MONGO_DB_PSW = process.env.DB_PSW
//
//'mongodb+srv://usuario_rest_api:4XGe0fpjdwFEY3T0@clusterapirest.a4phtwg.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(`mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PSW}@clusterapirest.a4phtwg.mongodb.net/?retryWrites=true&w=majority`)
        .then(() => {
            console.log('Connected to database!')            
        }).catch((error) => console.log(error))

mongoose.Promise = global.Promise

module.exports = mongoose