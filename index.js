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

io.on("connection", function(socket) {
  console.log("a user connected");
  numUsers += 1;
  newUserConnectionNotification(socket);
  updateMessages(socket);
  socket.on("disconnect", function() {
    console.log("user disconnected");
    numUsers -= 1;
    updateCurrentOnlineUsers();
  });
});

const getCurrentTime = () => {
  var today = new Date();
  return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
};

const newUserConnectionNotification = socket => {
  var assignedName = "User" + numUsers;
  var newUser = { username: assignedName, color: "(255, 255, 255)" };
  currentUsers.push(newUser);
  io.emit("new user connection", newUser);
  socket.emit("show user name", { username: assignedName });
  updateCurrentOnlineUsers();
};

const updateCurrentOnlineUsers = () => {
  io.emit("update current online users", currentUsers);
};

// ###############################################

const updateMessages = socket => {
  socket.emit("show all messages", { messages: messages });
};

const updateUserName = (currentUsername, newName) => {
  for (var i = 0; i < currentUsers.length; i++) {
    if (currentUsers[i].username == currentUsername) {
      currentUsers[i].username = newName;
    }
  }

  // UPDATE THE MESSAGES TOO
};

const updateUserColor = (username, newColor) => {
  for (var i = 0; i < currentUsers.length; i++) {
    if (currentUsers[i].username == username) {
      currentUsers[i].color = newColor;
    }
  }

  // UPDATE THE MESSAGES TOO
};

io.on("connection", function(socket) {
  socket.on("change user color", function(data) {
    updateUserColor(data.username, data.newcolor);
    updateCurrentOnlineUsers();
    updateAllMessagesColor(data);
  });
});

const updateAllMessagesColor = newData => {
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].username == newData.username) {
      messages[i].color = newData.newcolor;
    }
  }
  io.emit("update all messages color", messages);
  console.log("EMITTED")
};

io.on("connection", function(socket) {
  socket.on("change username", function(data) {
    updateUserName(data.username, data.newusername);
    io.emit("change username approved global", {
      username: data.username,
      newusername: data.newusername
    });
    socket.emit("show updated user name", data.newusername);
    updateCurrentOnlineUsers();
  });
});

io.on("connection", function(socket) {
  socket.on("chat message", function(userInput) {
    var newInput = { ...userInput, time: getCurrentTime() };
    io.emit("chat global message", newInput);
    socket.emit("chat message", newInput);
    addNewMessage(newInput);
  });
});

const addNewMessage = userInput => {
  var newMessage = {
    username: userInput.username,
    time: userInput.time,
    message: userInput.message,
    color: userInput.color
  };
  messages.push(newMessage);
};

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});
