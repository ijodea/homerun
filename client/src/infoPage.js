import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useOutletContext } from "react-router-dom";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const CardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 20px 0;
`;

const Card = styled.div`
    background: white;
    border: 6px solid ${(props) => (props.type === 'shuttle' ? '#001C4A' : '#C00305')};
    border-radius: 8px;
    padding: 20px;
    margin: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(30% - 20px);
    max-width: 300px;
    color: black;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-height: 180px;
    min-height: 180px;
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
`;

const Title = styled.h2`
    text-align: center;
    color: white;
    background-color: ${(props) => (props.type === 'shuttle' ? '#001C4A' : '#C00305')};
    padding: 10px;
    border-radius: 4px;
    font-size: 1.5em;
    margin-bottom: 10px;
`;

const InfoItem = styled.div`
    text-align: left;
    margin: 2px 0;
`;

const RefreshButton = styled.button`
    margin: 10px;
    padding: 10px 20px;
    font-size: 1em;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const Info = () => {
    const [busInfo, setBusInfo] = useState([]);
    const [shuttleInfo, setShuttleInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { direction } = useOutletContext();

    const busTimes = {
        "셔틀": 20,
        "5600": 32,
        "5005": 38,
        "5003A": 43,
        "5003B": 43,
        "820": 44
    };

    const calculateDepartureTime = (minutesFromNow) => {
        const now = new Date();
        const futureTime = new Date(now.getTime() + minutesFromNow * 60000);
        const hours = futureTime.getHours().toString().padStart(2, '0');
        const minutes = futureTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const calculateArrivalTime = (departureMinutes, busNumber) => {
        const additionalTime = busTimes[busNumber] || 0;
        return calculateDepartureTime(departureMinutes + additionalTime);
    };

    const fetchBusInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/bus/${direction}`);
            if (!response.ok) throw new Error('네트워크 오류입니다.');
            const data = await response.json();

            const filteredBusInfo = data.map((bus) => {
                const departureMinutes = bus.도착시간 ? parseInt(bus.도착시간) : 0;
                const departureTime = calculateDepartureTime(departureMinutes);
                const arrivalTime = calculateArrivalTime(departureMinutes, bus.버스번호);

                return {
                    busNumber: bus.버스번호,
                    departureTime,
                    arrivalTime,
                    remainingSeats: bus.남은좌석수 || '정보 없음',
                    type: 'bus',
                };
            });
            setBusInfo(filteredBusInfo);
        } catch (error) {
            setError("버스 정보를 불러오는 데 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const fetchShuttleInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/shuttle/next`);
            const text = await response.text();

            if (!response.ok) {
                throw new Error(`네트워크 오류: ${response.status}`);
            }
            const data = JSON.parse(text);

            const departureMinutes = parseInt(data.time);
            const departureTime = calculateDepartureTime(departureMinutes);
            const arrivalTime = calculateArrivalTime(departureMinutes, "셔틀");

            setShuttleInfo([{
                busNumber: data.nextShuttle ? `${data.nextShuttle}` : '셔틀',
                departureTime,
                arrivalTime,
                remainingSeats: '정보 없음',
                type: 'shuttle',
            }]);
        } catch (error) {
            console.error('Fetch error:', error);
            setShuttleInfo([{
                busNumber: "셔틀",
                departureTime: `${error.message}`,
                arrivalTime: 'Error',
                remainingSeats: 'Error',
                type: 'shuttle',
            }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusInfo();
        fetchShuttleInfo();
    }, [direction]);

    const handleRefresh = () => {
        setLoading(true);
        fetchBusInfo();
        fetchShuttleInfo();
    };

    const sortedInfo = [...busInfo, ...shuttleInfo].sort((a, b) => {
        const [aHours, aMinutes] = a.arrivalTime.split(':').map(Number);
        const [bHours, bMinutes] = b.arrivalTime.split(':').map(Number);
        return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
    });

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <RefreshButton onClick={handleRefresh}>정보 갱신</RefreshButton>
            <CardContainer>
                <TransitionGroup component={null}>
                    {sortedInfo.map((info, index) => (
                        <CSSTransition key={index} timeout={300} classNames="fade" appear={true}>
                            <Card type={info.type}>
                                <Title type={info.type}>{info.busNumber}</Title>
                                <div>
                                    <InfoItem><strong>출발 시간:</strong> {info.departureTime}</InfoItem>
                                    <InfoItem><strong>도착 시간:</strong> {info.arrivalTime}</InfoItem>
                                    <InfoItem><strong>탑승 인원:</strong> {info.remainingSeats}</InfoItem>
                                </div>
                            </Card>
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </CardContainer>
        </>
    );
};

export default Info;
