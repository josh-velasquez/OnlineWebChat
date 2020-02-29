var express = require("express");
var app = express();
var path = require("path");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

var currentUsers = [];
var messages = [];
var numUsers = 0;

const newUserConnection = () => {
  numUsers += 1;
  var newUser = { username: "User" + numUsers, color: (255, 255, 255) };
  currentUsers.push(newUser);
  io.emit("new user connection", newUser);
  updateCurrentOnlineUsers();
};

// When a new user connects
io.on("connection", function(socket) {
  console.log("a user connected");
  newUserConnection();
  socket.on("disconnect", function() {
    console.log("user disconnected");
    updateCurrentOnlineUsers();
  });
});

const updateUserName = (currentUsername, newName) => {
  for (var i = 0; i < currentUsers.length; i++) {
    if (currentUsers[i].username == currentUsername) {
      currentUsers[i].username = newName;
    }
  }
};

const updateUserColor = (username, newColor) => {
  for (var i = 0; i < currentUsers.length; i++) {
    if (currentUsers[i].username == username) {
      currentUsers[i].color = newColor;
    }
  }
};

io.on("connection", function(socket) {
  socket.on("change user color", function(data) {
    updateUserColor(data.username, data.newcolor);
  });
});

io.on("connection", function(socket) {
  socket.on("change username", function(data) {
    updateUserName(data.username, data.newusername);
    updateCurrentOnlineUsers();
  });
});

const updateCurrentOnlineUsers = () => {
  io.emit("update current online users", currentUsers);
};

io.on("connection", function(socket) {
  socket.on("chat message", function(userInput) {
    var message =
      userInput.time + " " + userInput.username + ": " + userInput.message;
    io.emit("chat message", message);
  });
});

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});
