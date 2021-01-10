"use strict";
// this module is imoprted only by `server.js`
const Member = require("./member");
const Game = require("./game");
const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const { mayor, inputNaturalNumber } = require("./utils");

const waitForMembers = (n, server) => {
  const members = [];
  return new Promise((resolve, reject) => {
    server.ws.on("connection", (socket) => {
      socket.on("clientMemberJoin", (name) => {
        members.push(new Member(name, socket));
        members.map((x, i, ary) => {
          x.receiveMemberInfo(ary)
        });
        mayor(socket, `ようこそ【${name}】さん。`);
        mayor(socket, `皆が揃うまでしばし待たれよ。`);
        console.log(`memberJoin: ${name}`);
        if (members.length === n) {
          members.map((x) => x.socket.removeAllListeners("clientMemberJoin"));
          resolve(members);
        }
      });
    });
  });
};

module.exports.GameServer = class GameServer {
  constructor(staticDir, port) {
    const app = express();
    app.use(express.static(staticDir));
    this.http = http.createServer(app);
    this.ws = new Server(this.http);
    this.port = port;
  }
  start() {
    this.http.listen(this.port);
  }
  close() {
    this.http.close();
    this.ws.close();
  }
};

module.exports.playGame = async (assign, server, timeLimit) => {
  const n = Object.values(assign).reduce((sum, n) => (sum += n), 0);
  const members = await waitForMembers(n, server);
  const game = new Game(members, assign, timeLimit);
  while (game.next !== "done") {
    await game.proceed();
  }
};

module.exports.inputAssign = async (jobs) => {
  const inputs = []
  for (const j of jobs) {
    const n = await inputNaturalNumber(`【${j}】は何人？（半角数字）：`)
    inputs.push(n)
  }
  const res = {}
  for (let i = 0; i < jobs.length; i++) {
    res[jobs[i]] = inputs[i]
  }
  console.log("以下の設定でゲームを開始します。")
  console.log("ブラウザからアクセスしてください。")
  console.log(res)
  return res
}
