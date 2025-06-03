const express = require('express');
const http = require('http');
const socket = require('socket.io')
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socket(server);

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
})

app.use(express.static(path.join(__dirname, 'public')));

app.set('view', path.join(__dirname, 'public'));

app.engine('html', ejs.renderFile);

app.use('/', (req, res) => {
    res.render('index.html')
})

function connectDB() {
    let dbURL = 'mongodb+srv://lucasyfmarinho:8HLBYqLTr16E98oH@cluster0.5xeau.mongodb.net/';

    mongoose.connect(dbURL);
    mongoose.connection.on('error', console.error.bind(console, 'connection error: '))
    mongoose.connection.once('open', function () {

        console.log('Atlas MongoDB conectado com sucesso')
    })
}

connectDB()
let Message = mongoose.model('Post', { title_post: String, post: String, date: String })
let messages = []

Message.find({}).then(docs => { messages = docs })
    .catch(error => { console.log(error) })

io.on('connection', socketResp => {

    console.log('Novo Usúario Conectado: ' + socketResp.id)

    socketResp.emit('previousMessage', messages)

    socketResp.on('sendMessage', data => {
        let message = new Message(data)
        message.save().then(socketResp.broadcast.emit('receivedMessage', data))
            .catch(error => { console.log(error) })
        console.log('QTD. Mesagens: ' + messages.length)
    })
    console.log('QTD. Mesagens: ' + messages.length)
})