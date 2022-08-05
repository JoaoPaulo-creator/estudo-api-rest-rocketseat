const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

module.exports = (req, res, next) =>{
    const authHeader = req.headers.authorization
    
    if(!authHeader){
        return res.status(401).send({ err: 'No token provided'})
    }

    const parts = authHeader.split(' ')

    if(!parts.lenth === 2){
        return res.status(401).send({ err: 'Token error'})
    }

    //Utilizando de desestruturização, para que o Bearer fique no índice 0
    const [scheme, token ] = parts
    //regex para verificar se a parts não contém Bearer escrito
    if(!/^Bearer$/i.test(scheme)){
        return res.status(401).send({ err: 'Token malformatted'})
    }

    jwt.verify(token, authConfig.secret, (err, decoded) =>{
        if(err){ 
            return res.status(401).send({ err: 'Invalid token'})
        }

        req.userId = decoded.id
        return next()
    })

}