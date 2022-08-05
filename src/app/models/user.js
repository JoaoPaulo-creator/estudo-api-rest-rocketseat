const mongoose = require('../../database/schema')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,        
    },
    email:{
        type: String,
        unique: true,        
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    passwordResetToken:{
        type: String,
        select: false
    },
    passwordResetExpires:{
        type: Date,
        select: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    },    
})

//Antes de salvar, será executado essas linhas
UserSchema.pre('save', async function(next){
    // Essa variável contém o hash, e o que esse hash vai encpritar.
    // Nesse caso, a senha passará 10 vezes processo de encript
    // Quando criar um usuário, esse hash deve ser criado automaticamente

    const hash =  await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User
