const express = require('express')
const Router = require('express').Router()
const { app, BrowserWindow, Menu, Tray } = require('electron')
const mongoose = require('mongoose')
const path = require('path')
const ejs = require('ejs')// view engine
const multer = require('multer')
const Produtos = require('./model/Produto')//model produtos
const os = require('os')
const fs = require('fs')
const server = express()
server.set('views', path.join(__dirname, 'views'))
server.set('view engine', 'ejs')
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(express.static(path.join(__dirname, 'public')))

// conectando ao banco de dados
mongoose.connect('mongodb://localhost:27017/exemploDanki', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('banco conecatado')
}).catch(error => {
    console.log(error)
})

//multer ------------------------



var destino = path.join(os.homedir(), 'Downloads')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'public')
    },
    filename: function (req, file, cb) {
        let nome = Date.now() + path.extname(file.originalname)
        cb(null, nome)
        req.body.imagem = nome
    },


})
// rotas
server.use(Router)
// rota para mostrar todos os produtos do banco
Router.get('/produtos', async (req, res, next) => {
    try {
        const todosOsProdutos = await Produtos.find()
        res.render('produtos.ejs', { todosOsProdutos })
    } catch (error) {
        next(error)
    }
})
// rota para mostrar cadastro de  produto
Router.get('/cadastrar', async (req, res) => {
    res.render('cadastrarProduto.ejs')
})
// rota para cadastrar o produto

Router.post('/cadastrar', multer({ storage }).single('imagem'), async (req, res, next) => {
    try {
        const { nome, imagem } = req.body
        const produto = new Produtos({
            nome: nome, urlFoto: imagem
        })
        await produto.save()
        return res.redirect('/produtos')
    } catch (error) {
        next(error)
    }
})

//porta de concexão
server.listen(3300, (error) => {
    if (error) console.log(error)
    console.log('server is running')
})

// electron app -----------------------------
const isMac = process.platform === "darwin" ? true : false;
function createWindow() {

    const win = new BrowserWindow({
        with: 1920,
        height: 1080,
        icon: path.join(__dirname, 'public', "imagens", 'logoCorujao.jpg'),
        show: false,
        webPreferences: {
            nodeIntegration: true,
        }

    })

    win.loadURL('http://localhost:3300/produtos')

    win.on("ready-to-show", () => {
        win.show()
        const menuTemplate = [{ label: 'Abrir', submenu: [{ label: 'View', submenu: [{ label: 'Toggle Developer Tools' }] }, { label: 'nova janela', click: () => { createWindow() } }] }]
        const menu = Menu.buildFromTemplate(menuTemplate)
        Menu.setApplicationMenu(menu)
    })
}
app.whenReady().then(() => {
    console.log('app ready')
    createWindow()
})

app.on('window-all-closed', () => {
    console.log('todas as janelas fechadas')
    if (!isMac) {
        app.quit()
    }
})
app.once("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }

})