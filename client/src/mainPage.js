import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import DirectionControls from "./directioncontrols";
import taxiIcon from './assets/Taxi.png';
import busInfoIcon from './assets/Bus.png';
import './App.css';

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

const LoginLink = styled(Link)`
  color: black;
  font-size: 0.9em;
  text-decoration: none;
  position: absolute;
  right: 20px;
  top: 20px;
  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  color: black;
  font-size: 0.9em;
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 20px;
  &:hover {
    text-decoration: underline;
  }
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

const TimeContainer = styled.div`
  background: white;
  padding: 15px 30px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border: 3px solid #007bff;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
`;

const DirectionColumn = styled.div`
  width: 45%;
`;

const EfficientCardViewport = styled.div`
  width: 300px;
  height: 180px;
  overflow: hidden;
  position: relative;
  margin: 20px auto;
`;

const EfficientCardContainer = styled.div`
  position: absolute;
  width: 100%;
  transition: transform 0.3s ease;
`;

const EfficientCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) => (props.type === 'shuttle' ? '6px solid #001C4A' : '6px solid #C00305')};
  height: 160px;
  box-sizing: border-box;
`;

const TransportInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const BusNumber = styled.div`
  font-size: 28px;
  font-weight: bold;
`;

const TimeInfo = styled.div`
  text-align: right;
  div:first-child {
    color: #666;
    font-size: 14px;
    margin-bottom: 5px;
  }
  div:last-child {
    font-size: 18px;
    font-weight: bold;
    color: #0066ff;
  }
`;

const SeatInfo = styled.div`
  color: #0066ff;
  font-size: 14px;
  margin-top: 5px;
`;

const CardControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

const CardButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.7);
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
  const [currentCardIndex, setCurrentCardIndex] = useState({ mju: 0, gih: 0 });
  const [fastestTransports, setFastestTransports] = useState({ mju: [], gih: [] });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      fetchEfficientTransport();
    }
  }, [location]);

  const handleDirectionChange = (newDirection) => {
    setDirection(newDirection);
    setCurrentCardIndex({ mju: 0, gih: 0 });
  };

  const isLoggedIn = !!localStorage.getItem("studentId");

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("phoneNumber");
    window.location.reload();
  };

  const fetchEfficientTransport = async () => {
    try {
      setLoading(true);
      const [mjuResponse, gihResponse, shuttleResponse] = await Promise.all([
        fetch(`http://localhost:8000/bus/mju-to-giheung`),
        fetch(`http://localhost:8000/bus/giheung-to-mju`),
        fetch(`http://localhost:8000/shuttle/next`)
      ]);
      const [mjuBusData, gihBusData, shuttleData] = await Promise.all([
        mjuResponse.json(),
        gihResponse.json(),
        shuttleResponse.json()
      ]);

      const busTimes = {
        "셔틀": 20,
        "5600": 32,
        "5005": 38,
        "5003A": 43,
        "5003B": 43,
        "820": 44
      };

      const calculateArrivalTime = (departureMinutes, busType) => {
        const now = new Date();
        const departureTime = new Date(now.getTime() + departureMinutes * 60000);
        const travelTime = busTimes[busType] || 30;
        return new Date(departureTime.getTime() + travelTime * 60000);
      };

      const processTransports = (busData, direction) => {
        const transports = busData.map(bus => ({
          type: 'bus',
          number: bus.버스번호,
          departureTime: parseInt(bus.도착시간) || Infinity,
          arrivalTime: calculateArrivalTime(parseInt(bus.도착시간), bus.버스번호),
          remainingSeats: bus.남은좌석수 || '정보 없음',
          direction: direction
        }));

        if (shuttleData.time) {
          transports.push({
            type: 'shuttle',
            number: '셔틀',
            departureTime: parseInt(shuttleData.time),
            arrivalTime: calculateArrivalTime(parseInt(shuttleData.time), '셔틀'),
            remainingSeats: '정보 없음',
            direction: direction
          });
        }

        return transports
          .filter(transport => transport.departureTime !== Infinity)
          .sort((a, b) => a.arrivalTime - b.arrivalTime)
          .slice(0, 3);
      };

      const mjuTransports = processTransports(mjuBusData, 'mju');
      const gihTransports = processTransports(gihBusData, 'gih');

      setFastestTransports({ mju: mjuTransports, gih: gihTransports });
    } catch (error) {
      console.error("Error fetching efficient transport:", error);
      setFastestTransports({ mju: [], gih: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCardScroll = (direction, type) => {
    setCurrentCardIndex(prevState => ({
      ...prevState,
      [type]: direction === 'up'
        ? Math.max(0, prevState[type] - 1)
        : Math.min(fastestTransports[type].length - 1, prevState[type] + 1)
    }));
  };

  const renderTransportCards = (type) => (
    <DirectionColumn>
      <EfficientCardViewport>
        <EfficientCardContainer style={{ transform: `translateY(-${currentCardIndex[type] * 180}px)` }}>
          {fastestTransports[type].map((transport, index) => (
            <EfficientCard key={index} type={transport.type}>
              <TransportInfo>
                <BusNumber>{transport.number}</BusNumber>
                <TimeInfo>
                  <div>{type === 'mju' ? '명지대 → 기흥역' : '기흥역 → 명지대'}</div>
                  <div>
                    {transport.arrivalTime instanceof Date
                      ? transport.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '정보 없음'
                    }
                  </div>
                </TimeInfo>
              </TransportInfo>
              <SeatInfo>잔여 좌석: {transport.remainingSeats}</SeatInfo>
            </EfficientCard>
          ))}
        </EfficientCardContainer>
      </EfficientCardViewport>
      <CardControls>
        <CardButton onClick={() => handleCardScroll('up', type)} disabled={currentCardIndex[type] === 0}>
          ↑
        </CardButton>
        <CardButton onClick={() => handleCardScroll('down', type)} disabled={currentCardIndex[type] >= fastestTransports[type].length - 1}>
          ↓
        </CardButton>
      </CardControls>
    </DirectionColumn>
  );

  return (
    <AppContainer>
      <HeaderContainer>
        <HomerunLink to="/">Homerun</HomerunLink>
        {isLoggedIn ? (
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        ) : (
          <LoginLink to="/login">로그인</LoginLink>
        )}
        <MenuContainer>
          <MenuItem to={`/info?direction=${direction}`} active={location.pathname === "/info"} isinfo={true}>
            <img src={busInfoIcon} alt="Info" />
            정보
          </MenuItem>
          <MenuItem to="/taxi" active={location.pathname === "/taxi"} isinfo={false}>
            <img src={taxiIcon} alt="Taxi" />
            택시
          </MenuItem>
        </MenuContainer>
        {location.pathname === "/" && (
          <>
            <TimeContainer>
              현재 시간: {currentTime}
            </TimeContainer>
            {loading ? (
              <div>로딩 중...</div>
            ) : (
              <CardContainer>
                {renderTransportCards('mju')}
                {renderTransportCards('gih')}
              </CardContainer>
            )}
          </>
        )}
        <DirectionControls
          show={location.pathname === "/info" || location.pathname === "/taxi"}
          direction={direction}
          onDirectionChange={handleDirectionChange}
        />
        <Outlet context={{ direction }} />
      </HeaderContainer>
      <Footer>
        © 2024 공개SW 아2조디어 | HomeRun | 백병재 강병수 박영찬 이승현
      </Footer>
    </AppContainer>
  );
};

export default MainPage;