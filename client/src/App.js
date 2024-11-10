import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./mainPage"; 
import InfoPage from "./infoPage"; 
import TaxiPage from "./taxiPage"; 
import TaxiGroup from "./taxiGroup"; 
import BusDetail from "./busDetail"; 
import ShuttleDetail from "./shuttleDetail";   
import LoginPage from "./loginPage";  

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />}>
                    <Route path="info" element={<InfoPage />} />
                    <Route path="taxi" element={<TaxiPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/taxiGroup" element={<TaxiGroup />} />
                <Route path="/busDetail" element={<BusDetail />} />
                <Route path="/shuttleDetail" element={<ShuttleDetail />} />
            </Routes>
        </Router>
    );
}

export default App;
