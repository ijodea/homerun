import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MainPage from "./mainPage.js"; 
import InfoPage from "./infoPage.js";
import TaxiPage from "./taxiPage.js";
import TaxiGroup from "./taxiGroup.js";
import BusDetail from "./busDetail.js"; // DetailPage 추가
import ShuttleDetail from "./shuttleDetail.js"; // DetailBus 추가
import LoginPage from "./loginPage.js"; // 로그인 페이지 추가
import SignupPage from "./signUp.js"; // 회원가입 페이지 추가


// 로그인 상태를 확인하는 PrivateRoute 컴포넌트
function PrivateRoute({ children }) {
    const isLoggedIn = localStorage.getItem("token"); // JWT 토큰이 있으면 로그인 상태로 판단
    return isLoggedIn ? children : <Navigate to="/login" />; // 로그인 안되어있으면 /login으로 리디렉트
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />}>
                    <Route path="info" element={<InfoPage />} />
                    <Route path="taxi" element={
                        <PrivateRoute>
                            <TaxiPage />
                        </PrivateRoute>
                    } />
                </Route>
                <Route path="taxiGroup" element={<TaxiGroup />} />
                <Route path="/busDetail" element={<BusDetail />} />
                <Route path="/shuttleDetail" element={<ShuttleDetail />} />
                <Route path="/login" element={<LoginPage />} /> {/* 로그인 페이지 추가 */}
                <Route path="/signup" element={<SignupPage />} /> {/* 회원가입 페이지 추가 */}
            </Routes>
        </Router>
    );
}

export default App;
