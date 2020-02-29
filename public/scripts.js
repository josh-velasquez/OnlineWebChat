$(function() {
  var socket = io();
  var liveUser = { username: "", color: "" };

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

  socket.on("new user connection", function(newUser) {
    liveUser = newUser;
    var li = '<li style="font-weight: bold; text-align: center; color: red">';
    $("#messages").append(
      $(li).text("New user joined the chat: " + newUser.username)
    );
  });

  const newMessage = data => {
    socket.emit("chat message", {
      username: liveUser.username,
      color: liveUser.color,
      time: getCurrentTime(),
      message: data
    });
  };

  socket.on("chat message", function(msg) {
    var li = '<li style="color: rgb' + msg.color + ';">';
    $("#messages").append($(li).text(msg.message));
  });

  // ###############################################

  socket.on("update current online users", function(users) {
    $("#users").empty();
    let li;
    for (var i = 0; i < users.length; i++) {
      li = '<li style="color: rgb' + users[i].color + ';">';
      $("#users").append($(li).text(users[i].username));
    }
  });

  const getCurrentTime = () => {
    var today = new Date();
    return (
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    );
  };

  const changeUserName = data => {
    var newName = data.slice(6, data.length);
    socket.emit("change username", {
      username: liveUser.username,
      newusername: newName
    });
    var message =
      "User " + liveUser.username + " updated their name to " + newName;
    var li = '<li style="font-weight: bold; text-align: center;">';
    $("#messages").append($(li).text(message));
    liveUser.username = newName;
  };

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
