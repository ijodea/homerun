import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MainPage from "./mainPage.js";
import InfoPage from "./infoPage.js";
import TaxiPage from "./taxiPage.js";
import TaxiGroup from "./taxiGroup.js";
import BusDetail from "./busDetail.js"; // DetailPage 추가
import ShuttleDetail from "./shuttleDetail.js"; // DetailBus 추가
import Direction from "./directioncontrols.js";
import LoginPage from "./loginPage.js";
import JoingPage from "./joinPage.js";
import ChatRoom from "./chatRoom.js";
import axios from "axios";

const PrivateRoute = ({children})=>{
    const token = localStorage.getItem("token");

    if(!token){
        return <Navigate to="/login" replace />;
    }
    return children;
};



function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path="info" element={<InfoPage />} />
          <Route path="taxi" element={<PrivateRoute><TaxiPage /></PrivateRoute>} />
          <Route path="direction" element={<Direction />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<JoingPage />} />
        <Route path="/taxiGroup" element={<TaxiGroup />} />
        <Route path="/busDetail" element={<BusDetail />} />
        <Route path="/shuttleDetail" element={<ShuttleDetail />} />
        <Route path="/chat/room/:groupId" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
