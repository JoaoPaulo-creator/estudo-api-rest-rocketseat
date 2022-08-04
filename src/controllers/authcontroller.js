const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const router = express.Router()

const authConfig = require('../config/auth.json')

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

router.post('/register', async (req,res) =>{
    const { email } = req.body

    try {
        const isEmailExists = await User.findOne({email})        
        if(isEmailExists){
            return res.status(400).send({error: 'User already exists'})
        }

        const user = await User.create(req.body)
        user.password = undefined
        
        return res.send({ user, token: generateToken({ id: user.id }) })

    } catch (err) {
        return res.status(400).send({error: 'Porque caralhos está caindo aqui?'})
    }

})

router.post('/authenticate', async (req, res) =>{
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if(!user){
        return res.status(400).send({ error: 'User not found' })
    }
    
    //Verificando se a senha informada é a senha que ele cadastrou
    //Utilizando bcrypt compare, pois a senha do usuário foi criptograda anteriormente
    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ err: 'Invalid password'})
    }

    user.password = undefined
    


    //gerando token com jwt
    //usando id, pois ser uma informação que não deve ser repetida
    //Ao lado, passando um hash, que também deve ser algo único. O hash é importado do arquivo auth.json
  
    res.send({ user, token: generateToken({ id: user.id }) })

})

module.exports = app => app.use('/auth', router)
