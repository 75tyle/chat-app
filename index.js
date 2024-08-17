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
        users[socket.id] = nickname;   // Store the user's nickname
        console.log(`${nickname} connected`);
        io.emit('online-users', Object.values(users));  // Send the updated list of online users to everyone
        socket.broadcast.emit('message', {nickname: 'Server', text: `${nickname} has connected`});
    })



    // handle incoming user messages
    socket.on('user-message',(message) => {
        const nickname = users[socket.id]
        // console.log("A new User Message", message);
        socket.broadcast.emit('message', {nickname: nickname, text: message})
    });

    // Handle typing event
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data.nickname);
    });

    // Handle stop typing event
    socket.on('stop-typing', () => {
        socket.broadcast.emit('stop-typing');
    });

    // broadcast when a user is disconnected
    socket.on('disconnect', ()=>{
        const nickname = users[socket.id];
        if(nickname){
            socket.broadcast.emit('message', {nickname: 'Server', text: `${nickname} has disconnected`});
            delete users[socket.id];    // Remove the users from the list 
            io.emit('online-users', Object.values(users));  // Send the update list of online users to everyone
        }
    });
})

app.use(express.static('public'));

app.get('/', (req, res)=>{
    return res.sendfile('/public/index.html')
})

server.listen(9000, () => console.log(`server started at port 9000`))