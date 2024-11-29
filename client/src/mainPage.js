import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import DirectionControls from "./directioncontrols";
import taxiIcon from "./assets/Taxi.png";
import busInfoIcon from "./assets/Bus.png";
import "./App.css";

const SERVER_URL = "http://localhost:8000";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f0f0;
`;

const HeaderContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
`;

const HomerunLink = styled(Link)`
  color: #007bff;
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoutButton = styled.button`
  color: black;
  font-size: 0.9em;
  background: none;
  border: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const LoginLink = styled(Link)`
  color: black;
  font-size: 0.9em;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const MenuContainer = styled.nav`
  display: flex;
  justify-content: center;
  background-color: lightgray;
  padding: 10px 0;
  width: 100%;
  margin-bottom: 20px;
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
  max-width: 200px;
  border-radius: 5px;
  background-color: ${(props) =>
    props.active ? (props.isinfo ? "#005700" : "#fb9403") : "transparent"};
  transition: background-color 0.3s;

  img {
    height: 40px;
    margin-right: 8px;
    filter: ${(props) => (props.active ? "invert(1)" : "invert(0.5)")};
  }

  &:hover {
    background-color: ${(props) =>
      props.active
        ? props.isinfo
          ? "#005700"
          : "#fb9403"
        : "rgba(0, 0, 0, 0.1)"};
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
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 0 10px;
  }
`;

const DirectionColumn = styled.div`
  width: 320px;
  height: ${(props) => (props.isMobile ? "auto" : "100vh")};
  position: ${(props) => (props.isMobile ? "static" : "sticky")};
  top: ${(props) => (props.isMobile ? "0" : "20px")};

  @media (max-width: 768px) {
    width: 90%;
    max-width: 320px;
  }
`;

const CardScrollContainer = styled.div`
  height: ${(props) => (props.isMobile ? "300px" : "auto")};
  overflow-y: ${(props) => (props.isMobile ? "auto" : "visible")};
  padding: 10px;

  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }
`;

const TransportCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: ${(props) =>
    props.type === "shuttle" ? "6px solid #001C4A" : "6px solid #C00305"};

  @media (min-width: 769px) {
    margin-bottom: 30px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TransportInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BusNumber = styled.div`
  font-size: 24px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TimeInfo = styled.div`
  text-align: right;
`;

const DirectionText = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ArrivalTime = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #0066ff;
`;

const SeatInfo = styled.div`
  color: #0066ff;
  font-size: 14px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
  position: ${(props) => (props.isMobile ? "static" : "sticky")};
  top: 0;
  background: ${(props) => (props.isMobile ? "none" : "#f0f0f0")};
  padding: ${(props) => (props.isMobile ? "0" : "10px 0")};
  z-index: 1;
`;

const Footer = styled.footer`
  background-color: #333;
  color: #fff;
  text-align: right;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 15px;
    font-size: 0.8em;
  }
`;

function TransportDisplay({ transports, direction }) {
  const isMobile = window.innerWidth <= 768;

  return (
    <DirectionColumn isMobile={isMobile}>
      <SectionTitle isMobile={isMobile}>
        {direction === "mju" ? "명지대 → 기흥역" : "기흥역 → 명지대"}
      </SectionTitle>
      <CardScrollContainer isMobile={isMobile}>
        {transports.map((transport, index) => (
          <TransportCard key={index} type={transport.type}>
            <TransportInfo>
              <BusNumber>{transport.number}</BusNumber>
              <TimeInfo>
                <DirectionText>
                  {direction === "mju" ? "명지대 → 기흥역" : "기흥역 → 명지대"}
                </DirectionText>
                <ArrivalTime>
                  {transport.arrivalTime instanceof Date
                    ? transport.arrivalTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "정보 없음"}
                </ArrivalTime>
              </TimeInfo>
            </TransportInfo>
            <SeatInfo>잔여 좌석: {transport.remainingSeats}</SeatInfo>
          </TransportCard>
        ))}
      </CardScrollContainer>
    </DirectionColumn>
  );
}

const MainPage = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [direction, setDirection] = useState("giheung-to-mju");
  const [fastestTransports, setFastestTransports] = useState({
    mju: [],
    gih: [],
  });
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
  };

  const isLoggedIn = () => {
    return !!(
      localStorage.getItem("studentId") ||
      localStorage.getItem("isLoggedIn") === "true"
    );
  };

  const getUserDisplayName = () => {
    const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser"));
    if (kakaoUser?.nickname) {
      return kakaoUser.nickname;
    }
    return localStorage.getItem("studentId") || "사용자";
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const fetchEfficientTransport = async () => {
    try {
      setLoading(true);
      const [mjuResponse, gihResponse] = await Promise.all([
        fetch(`${SERVER_URL}/bus/mju-to-giheung`),
        fetch(`${SERVER_URL}/bus/giheung-to-mju`),
      ]);
      const [mjuBusData, gihBusData] = await Promise.all([
        mjuResponse.json(),
        gihResponse.json(),
      ]);

      const busTimes = {
        셔틀: 20,
        5600: 32,
        5005: 38,
        "5003A": 43,
        "5003B": 43,
        820: 44,
      };

      const calculateArrivalTime = (departureMinutes, busType) => {
        const now = new Date();
        const departureTime = new Date(
          now.getTime() + departureMinutes * 60000
        );
        const travelTime = busTimes[busType] || 30;
        return new Date(departureTime.getTime() + travelTime * 60000);
      };

      const processTransports = async (busData, direction) => {
        const transports = busData.map((bus) => ({
          type: "bus",
          number: bus.버스번호,
          departureTime: parseInt(bus.도착시간) || Infinity,
          arrivalTime: calculateArrivalTime(
            parseInt(bus.도착시간),
            bus.버스번호
          ),
          remainingSeats: bus.남은좌석수 || "정보 없음",
          direction: direction,
        }));

        try {
          const shuttleResponse = await fetch(
            `${SERVER_URL}/shuttle/${direction}`
          );
          const shuttleData = await shuttleResponse.json();
          if (shuttleData?.time) {
            transports.push({
              type: "shuttle",
              number: shuttleData.nextShuttle || "셔틀",
              departureTime: parseInt(shuttleData.time),
              arrivalTime: calculateArrivalTime(
                parseInt(shuttleData.time),
                "셔틀"
              ),
              remainingSeats: "정보 없음",
              direction: direction,
            });
          }
        } catch (error) {
          console.error("셔틀 정보를 가져오는 중 오류 발생:", error);
        }

        return transports
          .filter((transport) => transport.departureTime !== Infinity)
          .sort((a, b) => a.arrivalTime - b.arrivalTime)
          .slice(0, 3);
      };

      const mjuTransports = await processTransports(
        mjuBusData,
        "mju-to-giheung"
      );
      const gihTransports = await processTransports(
        gihBusData,
        "giheung-to-mju"
      );

      setFastestTransports({
        mju: mjuTransports,
        gih: gihTransports,
      });
    } catch (error) {
      console.error("효율적인 교통수단 정보를 가져오는 중 오류 발생:", error);
      setFastestTransports({ mju: [], gih: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <HeaderContainer>
        <TopBar>
          <HomerunLink to="/">Homerun</HomerunLink>
          {isLoggedIn() ? (
            <UserInfo>
              <span>{getUserDisplayName()}님</span>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </UserInfo>
          ) : (
            <LoginLink to="/login">Login</LoginLink>
          )}
        </TopBar>

        <MenuContainer>
          <MenuItem
            to={`/info?direction=${direction}`}
            active={location.pathname === "/info"}
            isinfo={true}
          >
            <img src={busInfoIcon} alt="Info" />
            정보
          </MenuItem>
          <MenuItem
            to="/taxi"
            active={location.pathname === "/taxi"}
            isinfo={false}
          >
            <img src={taxiIcon} alt="Taxi" />
            택시
          </MenuItem>
        </MenuContainer>

        {location.pathname === "/" && (
          <>
            <TimeContainer>현재 시간: {currentTime}</TimeContainer>
            {loading ? (
              <div>로딩 중...</div>
            ) : (
              <CardContainer>
                <TransportDisplay
                  transports={fastestTransports.mju}
                  direction="mju"
                />
                <TransportDisplay
                  transports={fastestTransports.gih}
                  direction="gih"
                />
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
      <Footer>© 아2조디어 | HomeRun | 백병재 강병수 박영찬 이승현</Footer>
    </AppContainer>
  );
};

export default MainPage;
