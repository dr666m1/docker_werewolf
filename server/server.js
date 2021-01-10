const { GameServer, playGame, inputAssign } = require("./lib/controller");
const { inputNaturalNumber } = require("./lib/utils");

const playGameOnce = async (jobs, port, staticDir="../client/out/") => {
  const assign = await inputAssign(jobs)
  const timeLimit = await inputNaturalNumber("相談時間は何秒？")
  console.log("以下の設定でゲームを開始します。")
  console.log("ブラウザからアクセスしてください。")
  console.log(assign)
  console.log({相談時間: timeLimit})
  const server = new GameServer(staticDir, port)
  server.start();
  await playGame(assign, server, timeLimit);
  server.close()
}

const jobs = ["人狼", "占い師", "霊媒師", "狩人", "市民"]
playGameOnce(jobs, 3000)
