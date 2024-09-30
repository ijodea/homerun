import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const CardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 20px 0;
`;

const Card = styled(Link)`
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(33.33% - 20px);
    text-decoration: none;
    color: black;
    transition: box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 200px;
    max-height: 200px;
    min-height: 200px;

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #f7f7f7;
    }

    @media (max-width: 768px) {
        flex: 1 1 calc(50% - 20px);
    }

    @media (max-width: 480px) {
        flex: 1 1 100%;
    }
`;

const Title = styled.h2`
    text-align: center;
    color: #007bff;
    font-size: 1.5em;
    margin-bottom: 10px;
`;

const DirectionSelect = styled.select`
    margin: 20px;
    padding: 10px;
    font-size: 1em;
`;

const Info = () => {
    const [busInfo, setBusInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [direction, setDirection] = useState("mju-to-giheung"); // 기본 방향

    const fetchBusInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/${direction}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const filteredBusInfo = data.map((bus) => ({
                busNumber: bus.버스번호 || '정보 없음',
                arrivalTime: bus.도착시간 || '정보 없음',
                remainingSeats: bus.남은좌석수 || '정보 없음',
                type: 'bus',
            }));
            setBusInfo(filteredBusInfo);
        } catch (error) {
            setError("버스 정보를 불러오는 데 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusInfo();
    }, [direction]);

    const handleDirectionChange = (event) => {
        setDirection(event.target.value);
        setLoading(true);
    };

    const sortCards = (cards) => {
        return cards.sort((a, b) => {
            const parseArrivalTime = (arrivalTime) => {
                const timeRegex = /(\d+)\s*분\s*후\s*도착/;
                const match = timeRegex.exec(arrivalTime);
                if (match) {
                    const minutes = parseInt(match[1], 10);
                    return Date.now() + minutes * 60 * 1000;
                }
                return Infinity;
            };

            const aArrivalTime = parseArrivalTime(a.arrivalTime);
            const bArrivalTime = parseArrivalTime(b.arrivalTime);
            return aArrivalTime - bArrivalTime; 
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const shuttleInfo = [
        { type: 'shuttle', busNumber: '-', arrivalTime: '정보 없음', remainingSeats: '-' },
    ];

    const sortedInfo = sortCards([...busInfo, ...shuttleInfo]);

    return (
        <>
            <DirectionSelect value={direction} onChange={handleDirectionChange}>
                <option value="mju-to-giheung">기흥역 방향</option>
                <option value="giheung-to-mju">명지대 방향</option>
            </DirectionSelect>
            <CardContainer>
                {sortedInfo.map((info, index) => (
                    <Card key={index} to="/busDetail">
                        <Title>{info.type === 'shuttle' ? '셔틀 정보' : '버스 정보'}</Title>
                        <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                            <ul>
                                <li>
                                    <div style={{ textAlign: "left" }}>
                                        <strong>버스 번호:</strong> {info.busNumber}
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <strong>도착 시간:</strong> {info.arrivalTime}
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <strong>남은 좌석 수:</strong> {info.remainingSeats}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </Card>
                ))}
            </CardContainer>
        </>
    );
};

export default Info;
