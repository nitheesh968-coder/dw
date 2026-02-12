let socket;

function connect() {
  const userId = JSON.parse(localStorage.getItem("user")).username;
  socket = io();

  socket.emit("user_connected", userId);

  socket.on("receive_message", (data) => {
    const div = document.createElement("div");
    div.innerText = `${data.user}: ${data.text}`;
    document.getElementById("chat").appendChild(div);
  });
}

function send() {
  const text = document.getElementById("msg").value;
  socket.emit("send_message", {
    user: document.getElementById("userId").value,
    text
  });
}

function addMessage(text, isReply = false) {
   const chat = document.getElementById("chat").children[1]; 
   const msg = document.createElement("div"); msg.className = "message" + (isReply ? " reply" : ""); 
   msg.textContent = text; chat.appendChild(msg); 
   chat.scrollTop = chat.scrollHeight; 
  } 

   function sendMessage() { 
    const input = document.getElementById("messageInput"); 
    const text = input.value.trim(); if (text === "") return; 

    addMessage(text); 
    input.value = ""; 
  }