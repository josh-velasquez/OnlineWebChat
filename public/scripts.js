$(function() {
  var socket = io();
  var liveUser = { username: "", color: "" };

  // Keeps the window scrolled to the bottom
  // $("#chat-content").scrollTop($("#messages")[0].scrollHeight);

  $("#chat-input").submit(function(e) {
    e.preventDefault();
    var input = document.getElementById("message").value.trim();
    if (input.includes("/nick ")) {
      changeUserName(input);
    } else if (input.includes("/nickcolor ")) {
      changeUserColor(input);
    } else if (input.split(" ")[0].includes("/")) {
      var li = '<li style="font-weight: bold; text-align: center; color: red">';
      $("#messages").append(
        $(li).text(">>          Invalid command.          <<")
      );
    } else {
      newMessage(input);
    }
    $("#message").val("");
    return true;
  });

  const getUsernameCookie = () => {
    var value = "; " + document.cookie;
    var parts = value.split("; username=");
    if (parts.length == 2)
      return parts
        .pop()
        .split(";")
        .shift();
  };

  // Saving cookie (expires in an hour)
  const saveUsernameCookie = username => {
    var now = new Date();
    now.setTime(now.getTime() + 1 * 60 * 1000); // 5 minute cookie
    document.cookie =
      "username=" +
      username +
      "; expires=" +
      now.toUTCString() +
      ";" +
      " path=/";
  };

  socket.on("username reconnected", function(data) {
    if (data.reconnected) {
      liveUser = data.user;
      var li =
        '<li style="font-weight: bold; text-align: center; color: white">';
      $("#messages").append(
        $(li).text("User reconnected: " + liveUser.username)
      );
      saveUsernameCookie(liveUser.username);
    } else {
      var li =
        '<li style="font-weight: bold; text-align: center; color: white">';
      $("#messages").append(
        $(li).text("New user joined the chat: " + data.user.username)
      );
      saveUsernameCookie(data.user.username);
    }
  });

  // Shows to that a new connection is made
  socket.on("new user connection", function(newUser) {
    var oldUser = getUsernameCookie();
    // Send the username to server to see if it exists
    socket.emit("check username reconnection", {
      newUser: newUser,
      oldUser: oldUser
    });
  });

  // Shows the connected users name
  socket.on("show username", function(newUser) {
    var li = '<li style="font-weight: bold; text-align: center; color: white">';
    $("#messages").append($(li).text("You are " + newUser.username));
    $("#username").empty();
    var p = '<h3 style="padding: 3px; margin-top: 3px;">';
    $("#username").append($(p).text("You are: " + newUser.username));
    if (liveUser.username != newUser.username) {
      liveUser = { username: newUser.username };
      saveUsernameCookie(liveUser.username);
    }
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

  socket.on("chat message", function(userInput) {
    var li =
      '<li style="color: rgb' + userInput.color + ';font-weight: bold;">';
    var message =
      userInput.time + " " + userInput.username + ": " + userInput.message;
    $("#messages").append($(li).text(message));
  });

  // socket.on("update all messages color", function(messages) {
  //   $("#messages").empty();
  //   showAllMessages(messages);
  // });

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
  };

  socket.on("change username approved global", function(user) {
    var message =
      "User " + user.username + " updated their name to " + user.newusername;
    var li = '<li style="font-weight: bold; text-align: center;">';
    $("#messages").append($(li).text(message));
  });

  socket.on("show all messages", function(messages) {
    showAllMessages(messages.messages);
  });

  const showAllMessages = messages => {
    let li;
    let text;
    for (var i = 0; i < messages.length; i++) {
      if (messages[i].username == liveUser.username) {
        li =
          '<li style="color: rgb' + messages[i].color + ';font-weight: bold;">';
      } else {
        li =
          '<li style="color: rgb' +
          messages[i].color +
          ';font-style: italic;">';
      }
      text =
        messages[i].time +
        " " +
        messages[i].username +
        ": " +
        messages[i].message;
      $("#messages").append($(li).text(text));
    }
  };

  socket.on("show updated username", function(data) {
    if (!data.changed) {
      var li = '<li style="font-weight: bold; text-align: center; color: red">';
      $("#messages").append(
        $(li).text(
          " >>      Name is taken. Please select another name.      <<"
        )
      );
      $("#username").empty();
    } else {
      liveUser.username = data.newUsername;
      var li =
        '<li style="font-weight: bold; text-align: center; color: white">';
      $("#messages").append(
        $(li).text("Name updated. You are " + data.newUsername)
      );
      $("#username").empty();
      var p = '<h3 style="padding: 3px; margin-top: 3px;">';
      $("#username").append($(p).text("You are: " + data.newUsername));
      saveUsernameCookie(data.newUsername);
    }
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
