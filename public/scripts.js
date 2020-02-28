$(function() {
  var socket = io();
  var user = null;

  $("form").submit(function(e) {
    e.preventDefault();
    var input = $("#m").val();
    if (input.includes("/nick")) {
      changeUserName(input);
    } else if (input.includes("/nickcolor")) {
      changeUserColor(input);
    } else {
      newMessage(input);
    }
    $("#m").val("");
    return false;
  });

  socket.on("chat message", function(msg) {
    $("#messages").append($("<li>").text(msg));
  });

  socket.on("new user connection", function(newUser) {
    user = newUser.username;
  });

  socket.on("update current online users", function(users) {
    $("#users").empty();

    for (var i = 0; i < users.length; i++) {
      $("#users").append($("<li>").text(users[i].username));
      //   style = '<li style="color: rgb' + users[i].color + ';font-weight: bold;"';
      //   console.log(style);
      //   $("#users").append($(style).text(users[i].username));
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
      username: data.username,
      time: getCurrentTime(),
      newusername: newName
    });
  };

  const changeUserColor = data => {
    var newColor = data.slice(10, data.length);
    // PARSE DATA HERE... IT WILL BE IN THE FROM /nickcolor <color>
    socket.emit("change user color", {
      username: user,
      time: getCurrentTime(),
      newcolor: newColor
    });
  };

  const newMessage = data => {
    socket.emit("chat message", {
      username: user,
      time: getCurrentTime(),
      message: data
    });
  };
});
