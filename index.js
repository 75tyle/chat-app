const http = require("http");
const express = require("express");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server)

// Stores nicknames in memory
const users = {};

// Socket.io
io.on('connection', (socket) => {
    
    
    // Handle nickname setting
    socket.on('set-nickname', (nickname) =>{
        users[socket.id] = nickname;
        console.log(`${nickname} connected`);
        socket.broadcast.emit('message', {nickname: 'Server', text: `${nickname} has connected`});
    })



    // handle incoming user messages
    socket.on('user-message',(message) => {
        const nickname = users[socket.id]
        // console.log("A new User Message", message);
        socket.broadcast.emit('message', {nickname: nickname, text: message})
    });

    // broadcast when a user is disconnected
    socket.on('disconnect', ()=>{
        const nickname = users[socket.id];
        if(nickname){
            socket.broadcast.emit('message', {nickname: 'Server', text: `${nickname} has disconnected`});
            delete users[socket.id];
        }
        console.log(`${nickname} diconnected`);
        
    });
})

app.use(express.static('public'));

app.get('/', (req, res)=>{
    return res.sendfile('/public/index.html')
})

server.listen(9000, () => console.log(`server started at port 9000`))