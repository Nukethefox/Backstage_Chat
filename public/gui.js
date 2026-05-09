let pendingHistory = [];
let username = localStorage.getItem("username") || "";

const socket = io();
let lastHeartbeat = Date.now();
const quickMessages = document.getElementById("quickMessages");
const loginBtn = document.getElementById("loginBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("input");
const usernameInput = document.getElementById("usernameInput");

quickMessages.addEventListener("change", () => {
  const selectedMessage = quickMessages.value;
  const messageId = Date.now() + Math.random();
  if (selectedMessage !== "") {
    socket.emit("chat message", {  
      id: messageId,
      name: username,
      message: selectedMessage,
      time: new Date().toLocaleTimeString()
    });
    
    quickMessages.value = "";

    messageInput.blur();
  }
});

socket.on("heartbeat", () => {
  lastHeartbeat = Date.now();
  updateConnectionStatus(true);
});

setInterval(() => {
  const now = Date.now();
  if (now - lastHeartbeat > 40000) {
    updateConnectionStatus(false);
  }
}, 5000);

function updateConnectionStatus(isConnected) {
  let status = document.getElementById("connectionStatus");
  if (!status) return;

  status.textContent = isConnected ? "✅ You are connected" : "⚠️ You are offline, please check connection!";
}
socket.on("connect", () => {
  socket.emit("requestHistory");
});

if (username) {
  document.getElementById("login").style.display = "none";
  document.getElementById("chatContainer").style.display = "flex";
}

const changeNameBtn = document.getElementById("changeNameBtn");

changeNameBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  username = "";

  document.getElementById("login").style.display = "flex";
  document.getElementById("chatContainer").style.display = "none";
  usernameInput.value = "";
});


loginBtn.addEventListener("click", setUsername);
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

function setUsername() {
  username = usernameInput.value.trim();
  if (!username) return;

  localStorage.setItem("username", username);

  const chatContainer = document.getElementById("chatContainer");
  chatContainer.style.display = "flex";
  const messages = document.getElementById("messages");
  messages.innerHTML = "";

  pendingHistory.forEach(msg => addMessageToChat(msg, true));

  messages.scrollTop = messages.scrollHeight;

  chatContainer.offsetHeight; 
}



function sendMessage() {
  if (!messageInput.value.trim()) return;
  const messageId = Date.now() + Math.random();
  socket.emit("chat message", {
    id: messageId,
    name: username,
    message: messageInput.value,
    time: new Date().toLocaleTimeString()
  });

  messageInput.value = "";
  messageInput.blur();
}

function scrollToBottomIfNeeded() {
  const messages = document.getElementById("messages");

  const isAtBottom =
    messages.scrollHeight - messages.scrollTop <= messages.clientHeight + 50;

  if (isAtBottom) {
    messages.scrollTop = messages.scrollHeight;
  }
}

socket.on("messageReadUpdate", (messageId) => {
  const messages = document.querySelectorAll(".message");

  messages.forEach(msg => {
    if (msg.dataset.id == messageId) {
      const readStatus = msg.querySelector(".readStatus");
      if (readStatus) {
        readStatus.textContent = " - Received";
      }
    }
  });
});

function addMessageToChat(data, isHistory = false) {
  const messages = document.getElementById("messages");

  const wasAtBottom =
    messages.scrollTop + messages.clientHeight >= messages.scrollHeight - 10;

  const div = document.createElement("div");
  div.dataset.id = data.id;
  div.classList.add("message");
  div.classList.add(data.name === username ? "me" : "other");

  div.innerHTML =
    "<strong>" + data.name + "</strong><br>" +
    data.message +
    "<br><small>" + data.time + "</small>";

    if (data.name === username) {
  const readInfo = document.createElement("small");
  readInfo.classList.add("readStatus");
  readInfo.textContent = " - Sent";
  div.appendChild(readInfo);
}

  if (!isHistory && data.name !== username) {
    div.classList.add("unread");
    const ackBtn = document.createElement("button");
    ackBtn.textContent = "Mark as received";
    ackBtn.style.marginTop = "5px";
ackBtn.addEventListener("click", () => {
  div.classList.remove("unread");
  ackBtn.remove();
  socket.emit("messageRead", data.id);
});

    div.appendChild(ackBtn);
  }


  messages.appendChild(div);
  div.offsetHeight;

  if (wasAtBottom) {
    messages.scrollTop = messages.scrollHeight;
  }
}



socket.on("chat history", (history) => {
  pendingHistory = history; 

  if (username) {
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    pendingHistory.forEach(msg => addMessageToChat(msg, true)); 
    messages.scrollTop = messages.scrollHeight;
  }
});

function showNotification(data) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(`Mensaje de ${data.name}`, {
      body: data.message,
      silent: true
    });
  }
}


socket.on("chat message", (data) => {
  addMessageToChat(data);
  if (data.name !== username) showNotification(data);
});

