const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { time } = require("console");

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

// MongoDB
const url = "mongodb+srv://rlnitheesh_db_user:d1uPQN4wzq7BzPUr@waws.n18awwh.mongodb.net/DW";

mongoose.connect(url)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

   var conn = mongoose.connection;
 var user_DB = conn.collection('Users');
 var message_DB = conn.collection("Messages")
  
 async function gg (){
 var conn = mongoose.connection;
 var nom = await conn.collection('Users').findOne({username:"dc007"}); 
console.log(nom, nom.password, "ll")
  }

 /// gg()

app.get("/user-status/:username", async (req, res) => {

  const user = await user_DB.findOne({ username: req.params.username });
const status = user.status;
console.log(status, user)
  res.json({
   status
  });

});


app.post('/login-verify', async (req, res) => {
 const { username, password }  = req.body;
    var conn = mongoose.connection;
 var no = await conn.collection('Users').find({username: username}); 
 var result = await no.toArray();
    console.log(username,result, result[0], result[0].password);

if(result[0].password == password){
console.log(result[0])
  return res.json({ status: true ,info: JSON.stringify(result[0]) })
}

return res.json({ status: false ,info:result[0] })
}) 


// Online users
// Store online users
let onlineUsers = new Map();


io.on("connection", (socket) => {

  console.log("Socket connected:", socket.id);


  // USER CONNECTED
  socket.on("user_connected", (userId) => {

    socket.userId = userId;

    // join room with userId
    socket.join(userId);

    // save user
    onlineUsers.set(userId, socket.id);

    console.log(userId, "connected");
user_DB.updateOne({username: userId},{ $set: { status: "Online" } }); 
io.emit("connect_update", ({status: "Online", userId}));

    // broadcast online users
    io.emit("online_users", Array.from(onlineUsers.keys()));

  });


  // PRIVATE MESSAGE
  socket.on("send_message",  async ({ toUserId, message }) =>{

    const time = new Date().toLocaleTimeString();
var inti_msg = await message_DB.insertOne({from: socket.userId, to: toUserId,  text: message, r_time:time,s_time:"",seen_time:"", status : "Sent"})
    const payload = {
      from: socket.userId,
      text: message,
      time: time
    };
    console.log(inti_msg, inti_msg.insertedId)
await message_DB.updateOne({_id:inti_msg.insertedId},{ $set: {status: "Delivered",s_time:time}})

console.log("To User : ", toUserId)
    // send to receiver
    io.to(toUserId).emit("receive_message", payload);

    // send back to sender
    io.to(socket.userId).emit("receive_message", payload);

  });


  // TYPING INDICATOR
  socket.on("typing", ({ toUserId }) => {

    io.to(toUserId).emit("typing", {
      from: socket.userId
    });

  });


  // STOP TYPING
  socket.on("stop_typing", ({ toUserId }) => {

    io.to(toUserId).emit("stop_typing", {
      from: socket.userId
    });

  });


  // DISCONNECT
  socket.on("disconnect", () => {
const userId = socket.userId;
    if (socket.userId) {

      onlineUsers.delete(socket.userId);
const time = new Date().toLocaleTimeString();
      console.log(socket.userId, "disconnected");
        user_DB.updateOne({username: userId},{ $set: {status: "Last Seen "+ time}}); 
io.emit("disconnect_update", ({status: "Last Seen "+ time, userId}));
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }

  });

});


// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
