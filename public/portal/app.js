var user_name = localStorage.getItem("user");
var u_name = JSON.parse(user_name).name;
var user_id = JSON.parse(user_name).username;
var toUserId  = JSON.parse(user_name).to_username;
document.getElementById("user_name").textContent= u_name;

let socket;
let myId;


function displayStatus(status){

  if(status === "Online") {
     console.log(status,"Connect Online")
document.getElementById("status_name").textContent = status;
document.getElementById("status_icon").style.background = "green";
 }

else {
      console.log(status,"Connect Offline")
document.getElementById("status_name").textContent = status;
document.getElementById("status_icon").style.background = "red";
}
}

const url =  "https://" +location.host
async function getStatus() {


  const res = await fetch(`${url}/user-status/${toUserId}`);
  const data = await res.json();

  console.log(data)
  displayStatus(data.status);

}

function displayoldmsgs (msgs){

msgs.forEach(msg => {
  console.log(msg)
if(msg.from === user_id){
  addMessage(msg.text, msg.r_time)
}
else{
  addMessage (msg.text, msg.r_time, true)
}

});

}

async function getMsgs() {


  const res = await fetch(`${url}/user-msgs/${user_id+"$"+toUserId}`);
  const data = await res.json();

  console.log("Messages:", data.msgs)
  displayoldmsgs (data.msgs)
 // displayStatus(data.status);

}


function connect() {

  myId = user_id

  socket = io(url);

  socket.on("connect", () => {

    socket.emit("user_connected", myId);

  });


  // RECEIVE MESSAGE
  socket.on("receive_message", (data) => {
if( data.from == user_id) return;
    console.log("message", data)



addMessage(data.text, data.time, true)

 /*   const div = document.createElement("div");


    div.innerHTML =
      `<b>${data.from}</b>: ${data.text} 
      <small>${data.time}</small>`;

    document.getElementById("chat").appendChild(div);*/

  });

socket.on("connect_update", ({status, userId}) => {
  if(userId !== user_name) return;
  console.log(user_name,userId,"Connect")
document.getElementById("status_name").textContent = status;
document.getElementById("status_icon").style.background = "green";
 });

socket.on("disconnect_update", ({status, userId}) => {
if(userId !== user_name) return;
document.getElementById("status_name").textContent = status;
document.getElementById("status_icon").style.background = "red";
 });


  // ONLINE USERS 
 /* socket.on("online_users", (users) => {

    document.getElementById("onlineUsers").innerHTML =
      users.join("<br>");

  }); */


  // TYPING
  socket.on("typing", ({ from }) => {

    document.getElementById("typingStatus").innerText =
      from + " is typing...";

  });


  socket.on("stop_typing", () => {

    document.getElementById("typingStatus").innerText = "";

  });

}



function sendMessage() {

 

  const message = document.getElementById("messageInput").value;
console.log(toUserId)
    const time = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false
});
 addMessage(message, time); 
  socket.emit("send_message", {
    toUserId,
    message
  });

  document.getElementById("messageInput").value = "";

}



let typingTimeout;

function typing() {

  

  socket.emit("typing", { toUserId });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {

    socket.emit("stop_typing", { toUserId });

  }, 1000);

}


function send() {
  const text = document.getElementById("msg").value;
  socket.emit("send_message", {
    user: user_id,
    text,
    to_user: to_user_id
  });
}

function addMessage(text, time, isReply = false) {
  const chat = document.getElementById("chat").children[1];

  const msg = document.createElement("div");
  msg.className = "message" + (isReply ? " reply" : "");

  // Message content
  const msg_over = document.createElement("div");
  msg_over.className = "message-text";
  msg_over.textContent = text;

  // Time
  const msg_time = document.createElement("div");
  msg_time.className = "message-time";
  msg_time.textContent = time;

  // Append inside message
  msg.appendChild(msg_over);
  msg.appendChild(msg_time);

  // Append message to chat
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}


