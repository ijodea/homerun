// MainPage.js
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import './App.css';
import './card.css';

// 아이콘 파일 import
import taxiIcon from './assets/Taxi.png';
import busInfoIcon from './assets/Bus.png';
import mjImage from './assets/mj.png';
import ghImage from './assets/gh.png';

const AppContainer = styled.div`
    background-color: #f0f0f0; 
    display: flex;
    flex-direction: column;
    align-items: stretch; 
    width: 100%; 
    min-height: 100vh; 
`;

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
    width: 30%;
    background-color: #f0f0f0;
    border-radius: 10px; 
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    color: black;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 300ms ease-in, transform 300ms ease-in;

    &.show {
        opacity: 1;
        transform: translateY(0);
    }
    * {
        text-align: center;
    }
`;

const Time = styled.div`
    margin: 10px; 
    color: #000; 
    text-align: center;
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

const Footer = styled.footer`
    background-color: #333; 
    color: #fff; 
    text-align: right;
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
    const [efficientTransport, setEfficientTransport] = useState(null);
    const [arrivalTime, setArrivalTime] = useState(null);
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
            fetchEfficientTransport();
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

    const calculateArrivalTime = (departureMinutes, transportType) => {
        const now = new Date();
        const departureTime = new Date(now.getTime() + departureMinutes * 60000);
        const travelTime = transportType === '셔틀' ? 20 : 32; // 셔틀은 20분, 버스는 32분으로 가정
        const arrivalTime = new Date(departureTime.getTime() + travelTime * 60000);
        return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const fetchEfficientTransport = async () => {
        try {
          const busResponse = await fetch(`http://localhost:8000/bus/mju-to-giheung`);
          const shuttleResponse = await fetch(`http://localhost:8000/shuttle/next`);
          
          if (!busResponse.ok || !shuttleResponse.ok) {
            throw new Error('네트워크 오류입니다.');
          }
          
          const busData = await busResponse.json();
          const shuttleData = await shuttleResponse.json();
      
          const busTimes = {
            "5600": 32,
            "5005": 38,
            "5003A": 43,
            "5003B": 43,
            "820": 44,
            "셔틀": 20
          };
      
          const calculateArrivalTime = (departureMinutes, busType) => {
            const now = new Date();
            const departureTime = new Date(now.getTime() + departureMinutes * 60000);
            const travelTime = busTimes[busType] || 30;
            return new Date(departureTime.getTime() + travelTime * 60000);
          };
      
          const allTransports = [
            ...busData.map(bus => ({
              type: 'bus',
              number: bus.버스번호,
              departureTime: parseInt(bus.도착시간) || Infinity,
              arrivalTime: calculateArrivalTime(parseInt(bus.도착시간), bus.버스번호)
            })),
            {
              type: 'shuttle',
              number: '셔틀',
              departureTime: parseInt(shuttleData.time) || Infinity,
              arrivalTime: calculateArrivalTime(parseInt(shuttleData.time), '셔틀')
            }
          ];
      
          const fastestTransport = allTransports.reduce((fastest, current) => 
            current.arrivalTime < fastest.arrivalTime ? current : fastest
          );
      
          setEfficientTransport(fastestTransport);
        } catch (error) {
          console.error("Error fetching efficient transport:", error);
          setEfficientTransport({ type: 'error', number: '정보 없음' });
        }
      };
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
                        <div className="card-header">현재 가장 빠른 기흥-명지 교통수단</div>
                        <div className="card-body">
                            {efficientTransport ? (
                                <>
                                    <div>{efficientTransport.number}</div>
                                    <div>도착 예정 시간: {efficientTransport.arrivalTime instanceof Date
                                        ? efficientTransport.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '정보 없음'}
                                    </div>
                                </>
                            ) : '로딩 중...'}
                        </div>
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
                © 2024 공개SW 아2조디어 | HomeRun | 백병재 강병수 박영찬 이승현
            </Footer>
        </AppContainer>
    );
}

export default MainPage;