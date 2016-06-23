// require modules
var express = require("express");
var path = require("path");
var app = express();
var server = app.listen(8000, function() {
    console.log("Port number: 8000");
})

var io = require("socket.io").listen(server);
var number = 0;
var messages = [];
var users = [];
io.sockets.on('connection', function (socket) {
    
    socket.on("got_new_user", function(data){
        users.push({
            name: data.name,
            id: data.id
        });
        socket.broadcast.emit("new_user", data);
        socket.emit("route_to_chatroom", data);
    })
    
    socket.on("get_current_messages", function(){
        socket.emit('current', {messages: messages});
    });
    
    socket.on("send_new_message", function(data){
        messages.push(data.text);
        io.emit('add_message', data)
    });
    
    socket.on('disconnect', function () {
        for(idx in users){
            if(socket.id == users[idx].id){
                var info = { 
                    name: users[idx].name
                }
                users.splice(idx, 1);
            }
        }
        socket.broadcast.emit("user_disconnecting", info)
    });

    
});

// static content 
app.use(express.static(path.join(__dirname, "./static")));

// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// root route to render the index.ejs view
app.get('/', function(req, res) {
    res.render("index");
})