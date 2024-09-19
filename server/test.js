const fs = require("fs");
const path = require("path");

let kst = 1000 * 60 * 60 * 9;
// let time = new Date(Date.now() + kst);
let time = new Date(Date.now());

console.log("Current Time:", time);
console.log("date : ", time.getDate());
console.log("hour: ", time.getHours());

const csvFilePath = path.join(__dirname, "./shuttle/gStation.csv");
const csvData = fs.readFileSync(csvFilePath, "utf8");

const lines = csvData.trim().split("\n");

const GStoMJU = lines.slice(1).map((line) => {
  const columns = line.split(",");
  const depart_school_m = Number(columns[2]);
  return depart_school_m;
});

console.log("GStoMJU Array:", GStoMJU);

const currentMinutes = (time.getHours() - 12) * 60 + time.getMinutes();
console.log("Current Minutes:", currentMinutes);

const nextBusMinutes = GStoMJU.find((busTime) => busTime >= currentMinutes);

if (nextBusMinutes !== undefined) {
  console.log("Next Bus Minutes:", nextBusMinutes - currentMinutes);
  return nextBusMinutes - currentMinutes;
} else {
  console.log("없음");
  return null;
}
