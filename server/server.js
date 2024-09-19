const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const path = require("path");

app.use(cors());

app.get("/api", (req, res) => {
  res.json({ message: "TEST PAGE" });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/temp.html");
});

// 기흥역 다음 셔틀 시간 불러오는 함수
function gStation(time) {
  const csvFilePath = path.join(__dirname, "./shuttle/gStation.csv");
  const csvData = fs.readFileSync(csvFilePath, "utf8");

  const lines = csvData.trim().split("\n");

  const busTimes = lines.slice(1).map((line) => {
    const [depart_school] = line.split(",");
    const [hours, minutes] = depart_school.split(":").map(Number);
    return hours * 60 + minutes;
  });

  const currentMinutes = time.getHours() * 60 + time.getMinutes();

  const nextBusMinutes = busTimes.find((busTime) => busTime >= currentMinutes);

  if (nextBusMinutes !== undefined) {
    const nextBusHours = Math.floor(nextBusMinutes / 60);
    const nextBusMins = nextBusMinutes % 60;

    const nextBusTime = new Date(time);
    nextBusTime.setHours(nextBusHours, nextBusMins, 0, 0);

    return nextBusTime;
  } else {
    // 버스끝
    return null;
  }
}

app.get("/api/nextbus", (req, res) => {
  const currentTime = new Date();
  const nextBus = gStation(currentTime);
  if (nextBus) {
    res.json({
      nextBusTime: nextBus.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  } else {
    res.json({ message: "오늘은 더 이상 버스가 없습니다." });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
