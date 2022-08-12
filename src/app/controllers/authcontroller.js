const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const router = express.Router()
const mailer = require('../../modules/mailer')
const crypto = require('crypto')


require('dotenv').config()

const SECRET = process.env.SECRET_TOKEN

function generateToken(params = {}){
    return jwt.sign(params, SECRET, {
        expiresIn: 86400
    })
}

router.post('/register', async (req,res) =>{
    const { email } = req.body

    try {
        const isEmailExists = await User.findOne({ email })        
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

    //passando undefined para que a senha não seja retornado no response
    user.password = undefined

    //gerando token com jwt
    //usando id, pois tem de ser uma informação que não deve ser repetida
    //Ao lado, passando um hash, que também deve ser algo único. O hash é importado do arquivo auth.json
  
    res.send({ user, token: generateToken({ id: user.id }) })

})

router.post('/forgot_password', async (req, res) =>{
    const { email } = req.body
    //gerando token para recuperação de senha
    //a nova senha terá 20 caracteres e será hexadecimal
    const token = crypto.randomBytes(20).toString('hex')    
    const now = new Date()

    try {
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).send({ error: 'User not found' })
        }
        
        //Aqui será definido o tempo em que o token irá expirar        
        now.setHours(now.getHours() + 1)
        //salvando o token
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })

        mailer.sendMail({
            to: email,
            subject: 'Password recover',
            from: 'emailteste@teste.com',
            template: 'auth/forgot_password',
            context: { token }
        }, (err) => {
            if(err){
                console.log(err)
                return res.status(400).send({ error: 'Cannot send forgot password email'})                
            }

            return res.sendStatus(200)
        })

          
    } catch (error) {
        res.status(400).send({ error : 'Error on forgot password. Try again!' })
    }

})

router.post('/reset_password', async (req, res) =>{
    const { email, token, password} = req.body
    const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')
    const now = new Date()
    
    try {
        if(!user){
            res.status(400).send({ error: 'User not found'})
        }

        if(token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Invalid token' })
        }

        if(now > user.passwordResetExpires){
            return res.status(400).send({ error: 'Token expired, generate a new one!' })
        }

        user.password = password
        await user.save()
        res.sendStatus(200)

    } catch (error) {
        return res.status(400).send({ error: 'Error on reset password. Try again later.'})
    }
})


module.exports = app => app.use('/auth', router)
