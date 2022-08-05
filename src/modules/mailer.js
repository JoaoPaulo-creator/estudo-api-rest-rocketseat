//configurações para que seja possível enviar email

const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')


const {host, port, user, pass} = require('../config/mail.json')

const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user,pass }
  });

//criando um template de email

transport.use('compile', hbs({
  viewEngine:{
    defaultLayout: undefined,
    partialsDir: path.resolve('./src/resources/mail/')
  },
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.html'
}))
  
module.exports = transport