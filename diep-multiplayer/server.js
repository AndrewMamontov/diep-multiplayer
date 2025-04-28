
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import { makeInitialWorld, spawnPlayer, applyInput, stepWorld, respawnPlayer } from "./world.js";

const app  = express();
const srv  = http.createServer(app);
const io   = new Server(srv, { cors:{origin:"*"} });

let world = makeInitialWorld();

io.on("connection", socket => {
  const player = spawnPlayer(socket.id, world);
  socket.emit("init", {world, selfId: socket.id});

  socket.on("input",  inp => applyInput(player, inp));
  socket.on("shoot",  ang => player.shootQueue.push(ang));
  socket.on("respawn",()   => respawnPlayer(player, world));
  socket.on("disconnect",()=> delete world.players[socket.id]);
});

setInterval(() => {
  stepWorld(world, 0.05);
  io.emit("snapshot", world);
}, 50);

app.use("/", express.static("public"));
const PORT = process.env.PORT || 3000;
srv.listen(PORT, ()=> console.log("Server @", PORT));
