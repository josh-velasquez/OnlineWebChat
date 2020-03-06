$(function() {
  var socket = io();
  var liveUser = { username: "", color: "" };

  // Keeps the window scrolled to the bottom
  $("#chat").scrollTop($("#chat-box")[0].scrollHeight);

  $("form").submit(function(e) {
    e.preventDefault();
    var input = $("#m").val();
    if (input.includes("/nick ")) {
      changeUserName(input);
    } else if (input.includes("/nickcolor ")) {
      changeUserColor(input);
    } else {
      newMessage(input);
    }
    $("#m").val("");
    return false;
  });

  // Shows to that a new connection is made
  socket.on("new user connection", function(newUser) {
    var li = '<li style="font-weight: bold; text-align: center; color: white">';
    $("#messages").append(
      $(li).text("New user joined the chat: " + newUser.username)
    );
  });

  // Shows the connected users name
  socket.on("show user name", function(newUser) {
    liveUser = newUser;
    var li = '<li style="font-weight: bold; text-align: center; color: white">';
    $("#messages").append($(li).text("You are " + newUser.username));
    var p = '<p style="padding: 3px; margin-top: 3px;">';
    $("#username-header").append($(p).text(newUser.username));
  });

  const newMessage = data => {
    socket.emit("chat message", {
      username: liveUser.username,
      color: liveUser.color,
      message: data
    });
  };

  socket.on("chat global message", function(userInput) {
    if (userInput.username != liveUser.username) {
      var li =
        '<li style="color: rgb' + userInput.color + ';font-style: italic;">';
      var message =
        userInput.time + " " + userInput.username + ": " + userInput.message;
      $("#messages").append($(li).text(message));
    }
  });

  // ###############################################

  socket.on("chat message", function(userInput) {
    var li =
      '<li style="color: rgb' + userInput.color + ';font-weight: bold;">';
    var message =
      userInput.time + " " + userInput.username + ": " + userInput.message;
    $("#messages").append($(li).text(message));
  });

  socket.on("update current online users", function(users) {
    $("#users").empty();
    let li;
    for (var i = 0; i < users.length; i++) {
      li = '<li style="color: rgb' + users[i].color + ';">';
      $("#users").append($(li).text(users[i].username));
    }
  });

  const changeUserName = data => {
    var newName = data.slice(6, data.length);
    socket.emit("change username", {
      username: liveUser.username,
      newusername: newName
    });
    liveUser.username = name.newName;
  };

  socket.on("change username approved global", function(user) {
    var message =
      "User " + user.username + " updated their name to " + user.newusername;
    var li = '<li style="font-weight: bold; text-align: center;">';
    $("#messages").append($(li).text(message));
  });

  socket.on("show all messages", function(messages) {
    let li;
    let text;
    for (var i = 0; i < messages.messages.length; i++) {
      li =
        '<li style="color: rgb' +
        messages.messages[i].color +
        ';font-style: italic;">';
      text =
        messages.messages[i].time +
        " " +
        messages.messages[i].username +
        ": " +
        messages.messages[i].message;
      $("#messages").append($(li).text(text));
    }
  });

  socket.on("show updated user name", function(name) {
    liveUser.username = name;
    var li = '<li style="font-weight: bold; text-align: center; color: white">';
    $("#messages").append($(li).text("Name updated. You are " + name));
  });

  const changeUserColor = data => {
    var newColor = data.slice(11, data.length);
    socket.emit("change user color", {
      username: liveUser.username,
      newcolor: newColor
    });
    var message = "Successfully changed your colour to: " + newColor;
    var li = '<li style="font-weight: bold; text-align: center;">';
    $("#messages").append($(li).text(message));
    liveUser.color = newColor;
  };
});
