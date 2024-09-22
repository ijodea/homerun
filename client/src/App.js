import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./mainPage.js"; // MainPage를 부모 컴포넌트로 사용
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
