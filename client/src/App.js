
import React, {useState, useEffect} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./mainPage.js"; 
import InfoPage from "./infoPage.js";
import TaxiPage from "./taxiPage.js";
import TaxiGroup from "./taxiGroup.js";
import BusDetail from "./busDetail.js"; // DetailPage 추가
import ShuttleDetail from "./shuttleDetail.js";   // DetailBus 추가
import axios from 'axios';  

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />}>
                    <Route path="info" element={<InfoPage />} />
                    <Route path="taxi" element={<TaxiPage />} />
                </Route>
                <Route path="taxiGroup" element={<TaxiGroup />} />
                <Route path="/busDetail" element={<BusDetail />} />
                <Route path="/shuttleDetail" element={<ShuttleDetail />} />
            </Routes>
        </Router>
    );
}

export default App;