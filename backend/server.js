const express = require("express");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

//fronend
app.use(express.static("../frontend"));
app.use("/models", express.static("../models"));

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//websocket server
const wss = new WebSocket.Server({ server });


wss.on("connection", (ws) => {
  console.log("Therapist connected");

  ws.on("message", (data) => {
    // broadcast emotion data
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });
});
