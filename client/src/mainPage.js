import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import './card.css';

const Homerun = styled(Link)`
    color: #007bff;
    display: inline-block; 
    margin: 10px 70% 50px 6%;
    text-decoration: none;
    font-weight: bold;
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
        transform: scale(1.01);
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center; /* 버튼을 중앙 정렬 */
    margin: 20px 0; /* 버튼과 카드 간격 */
`;

const DirectionButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    margin: 0 10px; /* 버튼 간격 */
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const CurrentDirection = styled.div`
    text-align: center;
    margin: 10px 0;
    font-size: 1.2em;
    color: #333;
`;

const InfoBtn = styled(Link)`
    display: inline-block; 
    margin-right: 20px; 
    color: grey;
    text-decoration: none;
    margin-top: 20px; 

    &:hover {
        color: black; 
        transition: color 0.2s ease; 
    }
`;

const TaxiBtn = styled(Link)`
    display: inline-block; 
    color: grey;
    text-decoration: none;
    margin-top: 20px; 

    &:hover {
        color: black; 
        transition: color 0.2s ease; 
    }
`;

const Time = styled.div`
    margin: 10px; 
    color: #666; 
    text-align: left;
    font-size: 15px;
`;

const MainPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [direction, setDirection] = useState("giheung-to-mju"); // 기본 방향 설정

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000); 

        return () => clearInterval(timer); 
    }, []);

    const handleDirectionChange = (newDirection) => {
        setDirection(newDirection);
    };

    return (
        <div>
            <Homerun to="/">Homerun</Homerun>
            <InfoBtn to={`/info?direction=${direction}`}>정보</InfoBtn>
            <TaxiBtn to="/taxi">택시</TaxiBtn>

            <div className="card-container">
                <div className="card">
                    <div className="card-header">현재 가장 효율적인 교통 수단</div>
                    <div className="card-body">기흥역 셔틀버스</div>
                    <Time>현재 시간: {currentTime}</Time>
                </div>
            </div>
            
            <ButtonContainer>
                <DirectionButton onClick={() => handleDirectionChange("mju-to-giheung")}>
                    명지대행
                </DirectionButton>
                <DirectionButton onClick={() => handleDirectionChange("giheung-to-mju")}>
                    기흥역행
                </DirectionButton>
            </ButtonContainer>

            <CurrentDirection>현재 방향: {direction === "mju-to-giheung" ? "명지대행" : "기흥역행"}</CurrentDirection>

            <Outlet context={{ direction }} />
        </div>
    );
}

export default MainPage;
