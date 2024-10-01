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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000); 

        return () => clearInterval(timer); 
    }, []);

    return (
        <div>
            <Homerun to="/">Homerun</Homerun>
            <InfoBtn to="/info">정보</InfoBtn>
            <TaxiBtn to="/taxi">택시</TaxiBtn>

            <div className="card-container">
            <div className="card">
                <div className="card-header">현재 가장 효율적인 교통 수단</div>
                <div className="card-body">기흥역 셔틀버스</div>
                <Time>현재 시간: {currentTime}</Time> 
                </div>
                </div>
            <div>
                <Outlet />
            </div>
        </div>
    );
}

export default MainPage;
