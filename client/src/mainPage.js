import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import './mainCard.css';
import InfoPage from "./infoPage";

const H3 = styled(Link)`
    color: #007bff;
    display: inline-block; /* 인라인 블록 형태로 변경 */
    margin-left: 6%;
    margin-right: 70%; /* 버튼과의 간격 조정 */
    text-decoration: none;
    font-weight: bold;
    margin-top: 10px; /* 위쪽 여백 */
`;

const InfoBtn = styled(Link)`
    display: inline-block; /* 인라인 블록 형태로 변경 */
    margin-right: 20px; /* 버튼 간의 간격 조정 */
    color: grey;
    text-decoration: none;
    margin-top: 20px; /* 위쪽 여백 */

    &:hover {
        color: black; 
        transition: color 0.2s ease; 
    }
`;

const TaxiBtn = styled(Link)`
    display: inline-block; /* 인라인 블록 형태로 변경 */
    color: grey;
    text-decoration: none;
    margin-top: 20px; /* 위쪽 여백 */

    &:hover {
        color: black; 
        transition: color 0.2s ease; 
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;   
    justify-content: flex-start; /* 위쪽 정렬 */
    align-items: center;       
    height: 100vh;  
    margin-top: 25px;          
`;

const MainPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000); // 1초마다 업데이트

        return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, []);

    return (
        <div>
            <H3 to="/">Homerun</H3>
            <InfoBtn to="/info">정보</InfoBtn>
            <TaxiBtn to="/taxi">택시</TaxiBtn>
            <Container>
                <div className="card">
                    <div className="card-header">현재 가장 효율적인 교통 수단</div>
                    <div className="card-body">기흥역 셔틀버스</div>
                    <div className="time">현재 시간: {currentTime}</div> {/* 현재 시간을 표시 */} 
                </div>
            </Container>
            <div>
                <Outlet />
            </div>
        </div>
    );
}

export default MainPage;
