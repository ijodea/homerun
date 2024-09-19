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

// 기흥역 다음 셔틀까지 남은 시간 불러오는 함수
function gStation(time) {
  // CSV파일 불러오기
  const csvFilePath = path.join(__dirname, "./shuttle/gStation.csv");
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  // 줄바꿈 정리
  const lines = csvData.trim().split("\n");
  // 배차표 array (Giheung Station to MJU)
  const GStoMJU = lines.slice(1).map((line) => {
    const columns = line.split(",");
    const depart_school_m = Number(columns[2]);
    return depart_school_m;
  });

  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  // 가장 가까운 버스 시간 찾기
  const nextBusMinutes = GStoMJU.find((busTime) => busTime >= currentMinutes);
  // 남은 시간 return
  if (nextBusMinutes !== undefined) {
    return nextBusMinutes - currentMinutes;
  } else {
    return null;
  }
}

//명지대역 다음 셔틀 시간 불러오는 함수
function mStation(time) {
  // CSV파일 불러오기
  const csvFilePath = path.join(__dirname, "./shuttle/mStation.csv");
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  // 줄바꿈 정리
  const lines = csvData.trim().split("\n");
  // 배차표 array (MJU Station to MJU)
  const MStoMJU = lines.slice(1).map((line) => {
    const columns = line.split(",");
    const depart_school_m = Number(columns[2]);
    return depart_school_m;
  });

  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  // 가장 가까운 버스 시간 찾기
  const nextBusMinutes = MStoMJU.find((busTime) => busTime >= currentMinutes);
  // 남은 시간 return
  if (nextBusMinutes !== undefined) {
    return nextBusMinutes - currentMinutes;
  } else {
    return null;
  }
}

// 명지대역 셔틀 vs 기흥역 셔틀 누가 더 먼저오는지 비교
function compare(time) {
  const m = mStation(time);
  // console.log("명지대역 셔틀: ", m);
  const g = gStation(time);
  // console.log("기흥역 셔틀: ", g);

  if (m !== null && (g === null || m < g)) {
    return ["명지대역 셔틀버스", m];
  } else if (g !== null) {
    return ["기흥역 셔틀버스", g];
  } else {
    return [null, null];
  }
}

app.get("/api/nextbus", (req, res) => {
  const currentTime = new Date();
  const [nextBus, eta] = compare(currentTime);

  if (nextBus !== null) {
    res.json({
      nextBusName: nextBus,
      nextBusTime: eta,
    });
  } else {
    res.json({ message: "오늘은 더 이상 버스가 없습니다." });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
