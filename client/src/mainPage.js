import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import './App.css';
import './card.css';

// 아이콘 파일 import
import taxiIcon from './assets/Taxi.png';
import busInfoIcon from './assets/Bus.png';
import mjImage from './assets/mj.png'; // 명지 이미지
import ghImage from './assets/gh.png'; // 기흥역 이미지

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: column; /* 세로 방향으로 배치 */
    align-items: center; /* 중앙 정렬 */
    width: 100%; /* 전체 너비 */
`;

const HomerunLink = styled(Link)`
    color: #007bff;
    font-size: 1.5em; /* 글씨 크기 */
    font-weight: bold; /* 글씨 두껍게 */
    text-decoration: none;
    margin: 10px 20px; /* 위치 조정 */
`;

const MenuContainer = styled.nav`
    display: flex;
    justify-content: center; /* 중앙 정렬 */
    background-color: lightgray; /* 비활성화 시 배경색 */
    padding: 10px 0; /* 상단 메뉴바의 패딩 */
    width: 100%; /* 메뉴바가 전체 너비를 차지하도록 설정 */
`;

const MenuItem = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center; /* 이미지와 텍스트 중앙 정렬 */
    color: ${(props) => (props.active ? "white" : "grey")}; /* 텍스트 색상 */
    text-decoration: none;
    padding: 20px; /* 패딩 */
    font-size: 1.5em; /* 글씨 크기 */
    margin: 0 10px; /* 버튼 사이 여백 */
    flex-grow: 1; /* 버튼의 너비가 균등하게 분배되도록 설정 */
    border-radius: 5px;
    background-color: ${(props) => (props.active ? "#005700" : "transparent")}; /* 활성화 색상 */
    
    img {
        height: 40px; /* 이미지 크기 */
        filter: ${(props) => (props.active ? "invert(1)" : "invert(0.5)")}; /* 이미지 색상 변환 */
    }

    &:hover {
        background-color: ${(props) => (props.active ? "#005700" : "rgba(0, 0, 0, 0.1)")}; /* Hover 시 배경색 변경 */
    }
`;

const CardContainer = styled.div`
    display: block; /* 카드 표시 */
    margin: 20px auto; /* 카드 중앙 정렬 */
    width: 80%; /* 카드의 너비 */
    background-color: #f0f0f0; /* 카드 배경색 */
    border-radius: 10px; 
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
    padding: 20px; /* 카드 안쪽 여백 */
    text-align: center; /* 텍스트 중앙 정렬 */
    color: black; /* 텍스트 색상 변경 */
`;

const Time = styled.div`
    margin: 10px; 
    color: #000; /* 시간 텍스트 색상 */
    text-align: left;
    font-size: 15px;
`;

const DirectionButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center; /* 이미지와 텍스트 중앙 정렬 */
    color: ${(props) => (props.active ? "white" : "grey")}; /* 텍스트 색상 */
    padding: 15px 30px; /* 패딩 */
    font-size: 1.5em; /* 글씨 크기 */
    margin: 0 10px;
    border: 2px solid transparent; /* 기본 테두리 */
    border-radius: 5px;
    background-color: ${(props) => (props.active ? "#005700" : "transparent")}; /* 활성화 색상 */
    
    img {
        height: 50px; /* 이미지 크기 증가 */
        margin-right: 10px; /* 이미지와 텍스트 사이 간격 */
        filter: ${(props) => (props.active ? "none" : "none")}; /* 원래 색상 유지 */
    }

    &:hover {
        background-color: ${(props) => (props.active ? "#005700" : "transparent")}; /* Hover 시 배경색 */
    }
`;

const MainPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [direction, setDirection] = useState("giheung-to-mju");
    const location = useLocation();

    // 방향 버튼과 현재 방향을 '정보'와 '택시' 페이지에서만 보이도록 설정
    const showDirectionControls = location.pathname === "/info" || location.pathname === "/taxi";

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
        <HeaderContainer>
            <HomerunLink to="/">Homerun</HomerunLink>

            <MenuContainer>
                <MenuItem 
                    to={`/info?direction=${direction}`} 
                    active={location.pathname === "/info"} 
                >
                    <img src={busInfoIcon} alt="Info" />
                    정보
                </MenuItem>
                <MenuItem 
                    to="/taxi" 
                    active={location.pathname === "/taxi"}
                >
                    <img src={taxiIcon} alt="Taxi" />
                    택시
                </MenuItem>
            </MenuContainer>

            {/* 카드 표시: 현재 가장 효율적인 교통 수단 */}
            {location.pathname === "/" && (
                <CardContainer>
                    <div className="card-header">현재 가장 효율적인 교통 수단</div>
                    <div className="card-body">기흥역 셔틀버스</div>
                    <Time>현재 시간: {currentTime}</Time>
                </CardContainer>
            )}

            {/* 방향 선택 버튼: '/info' 또는 '/taxi' 경로에서만 표시 */}
            {showDirectionControls && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <img src={mjImage} alt="명지역" style={{ height: "40px", marginRight: "10px" }} />
                    <DirectionButton 
                        onClick={() => handleDirectionChange("mju-to-giheung")} 
                        active={direction === "mju-to-giheung"}
                    >
                        명지대행
                    </DirectionButton>
                    <DirectionButton 
                        onClick={() => handleDirectionChange("giheung-to-mju")} 
                        active={direction === "giheung-to-mju"}
                    >
                        기흥역행
                    </DirectionButton>
                    <img src={ghImage} alt="기흥역" style={{ height: "40px", marginLeft: "10px" }} />
                </div>
            )}

            <Outlet context={{ direction }} />
        </HeaderContainer>
    );
}

export default MainPage;
