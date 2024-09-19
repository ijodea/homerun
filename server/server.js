const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); // React에서 오는 요청 허용

app.get("/api", (req, res) => {
  res.json({ message: "TEST PAGE" });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/temp.html");
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
