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
  const csvFilePath = path.join(__dirname, "./timetable/gStation.csv");
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  // 줄바꿈 정리
  const lines = csvData.trim().split("\n");
  // 배차표 array (명지대 -> 기흥역)
  const MJUtoGS = lines.slice(1).map((line) => {
    const columns = line.split(",");
    const depart_school_m = Number(columns[2]);
    return depart_school_m;
  });

  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  // 가장 가까운 버스 시간 찾기
  const nextBusMinutes = MJUtoGS.find((busTime) => busTime >= currentMinutes);
  // 남은 시간 return
  if (nextBusMinutes !== undefined) {
    return nextBusMinutes - currentMinutes;
  } else {
    return null;
  }
}

// 기흥역 다음 셔틀까지 남은 시간 불러오는 함수
function mStation(time) {
  // CSV파일 불러오기
  const csvFilePath = path.join(__dirname, "./timetable/mStation.csv");
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  // 줄바꿈 정리
  const lines = csvData.trim().split("\n");
  // 배차표 array (명지대 -> 명지대역)
  const MJUtoMS = lines.slice(1).map((line) => {
    const columns = line.split(",");
    const depart_school_m = Number(columns[2]);
    return depart_school_m;
  });

  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  // 가장 가까운 버스 시간 찾기
  const nextBusMinutes = MJUtoMS.find((busTime) => busTime >= currentMinutes);
  // 남은 시간 return
  if (nextBusMinutes !== undefined) {
    return nextBusMinutes - currentMinutes;
  } else {
    return null;
  }
}

function everline(m, time) {
  // CSV파일 불러오기
  const csvFilePath = path.join(__dirname, "./timetable/everline.csv");
  const csvData = fs.readFileSync(csvFilePath, "utf8");
  // 줄바꿈 정리
  const lines = csvData.trim().split("\n");
  // 배차표 array (명지대역 -> 기흥역)
  const MStoGS = lines.slice(1).map((line) => {
    const columns = line.split(",");
    const depart_school_m = Number(columns[0]);
    return depart_school_m;
  });
  // 명지대 -> 명지대역 10분 걸린다고 가정
  m += 10;
  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  const nextSubwayMinutes = MStoGS.find(
    (subwayTime) => subwayTime >= m + currentMinutes
  );

  if (nextSubwayMinutes !== undefined) {
    return nextSubwayMinutes - currentMinutes;
  } else {
    return null;
  }
}

// 명지대역 셔틀 vs 기흥역 셔틀 누가 더 먼저오는지 비교
function compare(time) {
  // console.log("지금 시간 : ", time.getHours() * 60 + time.getMinutes());
  const m = mStation(time); // 명지대역 셔틀 타기까지 남은 시간
  const el = everline(m, time); // 명지대역 셔틀 타고 내려서 에버라인 타기까지 남은 시간
  const g = gStation(time); // 기흥역 셔틀 타기까지 남은 시간
  // console.log("m:", m, "el:", el, "g:", g);
  // 명지대역 셔틀, 에버라인 타고 기흥역까지 도착하기까지 남은 시간
  const eta_el = el + 16;
  // 기흥역 셔틀 타고 기흥역까지 도착하기까지 남은 시간
  const eta_g = g + 15;
  // console.log("eta_el : ", eta_el, "/ eta_g : ", eta_g);

  if (m !== null && g !== null && el !== null) {
    if (eta_g <= eta_el) return ["기흥역 셔틀버스", g];
    else return ["명지대역 셔틀버스", m];
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
