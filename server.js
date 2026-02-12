const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

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

 async function gg (){
 var conn = mongoose.connection;
 var nom = await conn.collection('Users').findOne({username:"dc007"}); 
console.log(nom, nom.password, "ll")
  }

 /// gg()

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
let onlineUsers = [];

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_connected", (userId) => {
    if (!onlineUsers.some(u => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }

    io.emit("online_users", onlineUsers);
  });

  socket.on("send_message", (data) => {
    
    io.emit("receive_message", data);

  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit("online_users", onlineUsers);
    console.log("User disconnected:", socket.id);
  });
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
