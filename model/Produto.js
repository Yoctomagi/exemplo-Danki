const mongoose = require('mongoose')

const ProdutoSchema = new mongoose.Schema({
    nome:{type:String},
    urlFoto:{type:String},
   
},{timestamps:true})

module.exports = mongoose.model('Produto',ProdutoSchema)