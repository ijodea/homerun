import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import './App.css';
import './card.css';
import axios from 'axios';

// 아이콘 파일 import
import taxiIcon from './assets/Taxi.png';
import busInfoIcon from './assets/Bus.png';
import mjImage from './assets/mj.png';
import ghImage from './assets/gh.png';

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 100vh;
    padding-bottom: 0;
`;

const HomerunLink = styled(Link)`
    color: #007bff;
    font-size: 1.5em;
    font-weight: bold;
    text-decoration: none;
    margin: 10px 20px;
`;

const MenuContainer = styled.nav`
    display: flex;
    justify-content: center;
    background-color: lightgray;
    padding: 10px 0;
    width: 100%;
`;

const MenuItem = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => (props.active ? "white" : "grey")};
    text-decoration: none;
    padding: 20px;
    font-size: 1.5em;
    margin: 0 10px;
    flex-grow: 1;
    border-radius: 5px;
    background-color: ${(props) => (props.active ? (props.isinfo ? "#005700" : "#fb9403") : "transparent")};

    img {
        height: 40px;
        filter: ${(props) => (props.active ? "invert(1)" : "invert(0.5)")};
    }

    &:hover {
        background-color: ${(props) => (props.active ? (props.isinfo ? "#005700" : "#fb9403") : "rgba(0, 0, 0, 0.1)")};
    }
`;

const CardContainer = styled.div`
    display: block;
    margin: 20px auto;
    width: 80%;
    background-color: #f0f0f0;
    border-radius: 10px; 
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
    color: black;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 300ms ease-in, transform 300ms ease-in;

    &.show {
        opacity: 1;
        transform: translateY(0);
    }
`;

const Time = styled.div`
    margin: 10px; 
    color: #000; 
    text-align: left;
    font-size: 15px;
`;

const DirectionButtonContainer = styled.div`
    text-align: center;
    margin: 20px 0;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 300ms ease-in, transform 300ms ease-in;

    &.show {
        opacity: 1;
        transform: translateY(0);
    }
`;

const DirectionButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => (props.active ? "white" : "grey")};
    padding: 15px 30px;
    font-size: 1.5em;
    margin: 0 10px;
    border: 2px solid transparent; 
    border-radius: 5px;
    background-color: ${(props) => (props.active ? (props.dir ? "#F5A200" : "#001C4A") : "lightgrey")};
    transition: background-color 300ms ease-in;

    img {
        height: 50px; 
        margin-right: 10px; 
        filter: ${(props) => (props.active ? "none" : "none")}; 
    }

    &:hover {
        background-color: ${(props) => (props.active ? (props.dir ? "#F5A200" : "#001C4A") : "rgba(0, 0, 0, 0.1)")}; 
    }
`;

const AppContainer = styled.div`
    background-color: #f0f0f0; 
    display: flex;
    flex-direction: column;
    align-items: stretch; 
    width: 100%; 
    min-height: 100vh; 
`;

const Footer = styled.footer`
    background-color: #333; 
    color: #fff; 
    text-align: center;
    padding: 20px; 
    font-size: 0.9em;
    width: 100%; 
    flex-shrink: 0; 
    min-height: 60px; 
    margin-top: auto; 
    box-sizing: border-box; 
`;

const MainPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [direction, setDirection] = useState("giheung-to-mju");
    const [showEfficiencyCard, setShowEfficiencyCard] = useState(false);
    const [showDirectionControls, setShowDirectionControls] = useState(false);
    const [cardVisible, setCardVisible] = useState(false);
    const [directionControlsVisible, setDirectionControlsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleDirectionChange = (newDirection) => {
        setDirection(newDirection);
    };

    useEffect(() => {
        if (location.pathname === "/") {
            setShowEfficiencyCard(true);
            setShowDirectionControls(false);
            setTimeout(() => setCardVisible(true), 33);
            setDirectionControlsVisible(false);
        } else if (location.pathname === "/info" || location.pathname === "/taxi") {
            setShowEfficiencyCard(false);
            setShowDirectionControls(true);
            setCardVisible(false);
            setTimeout(() => setDirectionControlsVisible(true), 33);
        } else {
            setShowEfficiencyCard(false); 
            setShowDirectionControls(false); 
            setCardVisible(false);
            setDirectionControlsVisible(false);
        }
    }, [location]);
    
    return (
        <AppContainer>
            <HeaderContainer>
                <HomerunLink to="/">Homerun</HomerunLink>

                <MenuContainer>
                    <MenuItem
                        to={`/info?direction=${direction}`}
                        active={location.pathname === "/info"}
                        isinfo={location.pathname === "/info"}
                    >
                        <img src={busInfoIcon} alt="Info" />
                        정보
                    </MenuItem>
                    <MenuItem
                        to="/taxi"
                        active={location.pathname === "/taxi"}
                        isinfo={location.pathname === "/info"}
                    >
                        <img src={taxiIcon} alt="Taxi" />
                        택시
                    </MenuItem>
                </MenuContainer>

                {showEfficiencyCard && (
                    <CardContainer className={cardVisible ? 'show' : ''}>
                        <div className="card-header">현재 가장 효율적인 교통 수단</div>
                        <div className="card-body">기흥역 셔틀버스</div>
                        <Time>현재 시간: {currentTime}</Time>
                    </CardContainer>
                )}

                {showDirectionControls && (
                    <DirectionButtonContainer className={directionControlsVisible ? 'show' : ''}>
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
                            dir={true}
                        >
                            기흥역행
                        </DirectionButton>
                        <img src={ghImage} alt="기흥역" style={{ height: "40px", marginLeft: "10px" }} />
                    </DirectionButtonContainer>
                )}

                <Outlet context={{ direction }} />
            </HeaderContainer>
            <Footer>
                © 2024 Example Site | Developed by Your Name
            </Footer>
        </AppContainer>
    );
}

export default MainPage;