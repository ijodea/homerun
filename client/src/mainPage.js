import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
    justify-content: center;
    align-items: center;
    margin: 20px 0;
`;

const StyledButton = styled(Link)`
    display: inline-flex;
    align-items: center;
    color: ${(props) => (props.active ? "white" : "grey")}; /* 텍스트 색상 */
    text-decoration: none;
    padding: ${(props) => (props.isMainPage ? "20px 40px" : "10px 20px")}; /* 패딩 */
    font-size: ${(props) => (props.isMainPage ? "1.5em" : "1em")}; /* 글씨 크기 */
    margin: 0 10px;
    border: 2px solid transparent; /* 기본 테두리 */
    border-radius: 5px;
    background-color: ${(props) => {
        if (props.active) {
            return props.isInfoButton ? "#005700" : "#DAA520"; // 정보 버튼은 진한 녹색, 택시 버튼은 진한 노랑
        }
        return "transparent"; // 기본 상태는 투명
    }};

    &:hover {
        background-color: ${(props) => (props.active ? (props.isInfoButton ? "#005700" : "#DAA520") : "rgba(0, 0, 0, 0.1)")}; /* Hover 시 배경색 */
    }
`;

const DirectionButton = styled.button`
    display: inline-flex;
    align-items: center;
    color: ${(props) => (props.active ? "white" : "grey")}; /* 텍스트 색상 */
    padding: 10px 20px; /* 패딩 */
    font-size: 1em; /* 글씨 크기 */
    margin: 0 10px;
    border: 2px solid transparent; /* 기본 테두리 */
    border-radius: 5px;
    background-color: ${(props) => (props.active ? (props.isMjuButton ? "#001C4A" : "#DAA520") : "transparent")}; /* 활성화 색상 */
    
    &:hover {
        background-color: ${(props) => (props.active ? (props.isMjuButton ? "#001C4A" : "#DAA520") : "rgba(0, 0, 0, 0.1)")}; /* Hover 시 배경색 */
    }
`;

const CardContainer = styled.div`
    display: ${(props) => (props.show ? "block" : "none")}; /* 카드 표시 여부 */
    margin: 20px auto; /* 카드 중앙 정렬 */
    width: 80%; /* 카드의 너비 */
`;

const Card = styled.div`
    background-color: white; /* 카드 배경색을 흰색으로 변경 */
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
        <div>
            <Homerun to="/">Homerun</Homerun>
            <ButtonContainer>
                <StyledButton 
                    to={`/info?direction=${direction}`} 
                    active={location.pathname === "/info"} 
                    isMainPage={location.pathname === "/"} // 메인 페이지 여부 확인
                    isInfoButton={true} // 정보 버튼 여부
                >
                    정보
                </StyledButton>
                <StyledButton 
                    to="/taxi" 
                    active={location.pathname === "/taxi"} 
                    isMainPage={location.pathname === "/"} // 메인 페이지 여부 확인
                >
                    택시
                </StyledButton>
            </ButtonContainer>

            {/* 첫 페이지일 때만 "현재 가장 효율적인 교통 수단" 메시지 표시 */}
            {location.pathname === "/" && (
                <CardContainer show={location.pathname === "/"}>
                    <Card>
                        <div className="card-header">현재 가장 효율적인 교통 수단</div>
                        <div className="card-body">기흥역 셔틀버스</div>
                        <Time>현재 시간: {currentTime}</Time>
                    </Card>
                </CardContainer>
            )}

            {/* 방향 선택 버튼과 현재 방향을 '/info' 또는 '/taxi' 경로에서만 표시 */}
            {showDirectionControls && (
                <ButtonContainer>
                    <DirectionButton 
                        onClick={() => handleDirectionChange("mju-to-giheung")} 
                        active={direction === "mju-to-giheung"} 
                        isMjuButton={true} // 명지대행 버튼 여부
                    >
                        명지대행
                    </DirectionButton>
                    <DirectionButton 
                        onClick={() => handleDirectionChange("giheung-to-mju")} 
                        active={direction === "giheung-to-mju"} 
                        isMjuButton={false} // 기흥역행 버튼 여부
                    >
                        기흥역행
                    </DirectionButton>
                </ButtonContainer>
            )}

            <Outlet context={{ direction }} />
        </div>
    );
}

export default MainPage;
