import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./mainPage.js";
import InfoPage from "./infoPage.js";
import TaxiPage from "./taxiPage.js";
import BusDetail from "./busDetail.js"; // DetailPage 추가
import ShuttleDetail from "./shuttleDetail.js"; // DetailBus 추가
import Direction from "./directioncontrols.js";
import LoginPage from "./loginPage.js";
import ChatRoom from "./chatRoom.js";
import KakaoRedirect from "./KakaoRedirect";
import FeedbackForm from "./feedback.js";
// import axios from "axios";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
        <Route path="info" element={<InfoPage />} />
        <Route path="taxi" element={<TaxiPage />} />
        <Route path="direction" element={<Direction />} />
        <Route path="feedback" element={<FeedbackForm />} />
      </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/detail">
        <Route path="bus" element={<BusDetail />} />
        <Route path="shuttle" element={<ShuttleDetail />} />
      </Route>
        <Route path="/chat/room/:groupId" element={<ChatRoom />} />
        <Route path="/oauth/callback" element={<KakaoRedirect />} />
    </Routes>
  </Router>
  );
}

export default App;
