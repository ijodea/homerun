import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./mainPage.js"; 
import InfoPage from "./infoPage.js";
import TaxiPage from "./taxiPage.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path="/info" element={<InfoPage />} />
          <Route path="/taxi" element={<TaxiPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
