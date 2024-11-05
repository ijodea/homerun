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
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(33.33% - 20px);
    max-width: 300px;
    text-decoration: none;
    color: black;
    transition: box-shadow 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 160px;
    max-height: 160px;
    min-height: 160px;

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        flex: 1 1 calc(50% - 20px);
    }

    @media (max-width: 480px) {
        flex: 1 1 100%;
    }

    &.fade-enter, &.fade-appear {
        opacity: 0;
        transform: translateY(20px);
    }

    &.fade-enter-active, &.fade-appear-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 300ms ease-in, transform 300ms ease-in;
    }

    &.fade-exit {
        opacity: 1;
    }

    &.fade-exit-active {
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 300ms ease-in, transform 300ms ease-in;
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

const Info = () => {
    const [busInfo, setBusInfo] = useState([]);
    const [shuttleInfo, setShuttleInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { direction } = useOutletContext();

    const fetchBusInfo = async () => {
        try {
            const response = await fetch(`http://localhost:8000/bus/${direction}`);
            if (!response.ok) {
                throw new Error('네트워크 오류입니다.');
            }
            const data = await response.json();
            const filteredBusInfo = data.map((bus) => ({
                busNumber: bus.버스번호,
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

    const fetchShuttleInfo = async () => {
        try {
            const response = await fetch(`${direction}`);
            if (!response.ok) {
                throw new Error('네트워크 오류입니다.');
            }
            const data = await response.json();
            const filteredShuttlesInfo = data.map((shuttle) => ({
                busNumber: "셔틀",
                arrivalTime: shuttle.도착시간 || '정보 없음',
                remainingSeats: shuttle.남은좌석수 || '정보 없음',
                type: 'shuttle',
            }));
            setShuttleInfo(filteredShuttlesInfo);
        } catch (error) {
            setShuttleInfo([{
                busNumber: "셔틀",
                arrivalTime: '정보 없음',
                remainingSeats: '정보 없음',
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

    const sortedInfo = [...busInfo, ...shuttleInfo];

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <CardContainer>
            <TransitionGroup component={null}>
                {sortedInfo.map((info, index) => (
                    <CSSTransition
                        key={index}
                        timeout={300}
                        classNames="fade"
                        appear={true}
                    >
                        <Card type={info.type}>  
                            <Title type={info.type}>{info.type === 'shuttle' ? '셔틀' : `${info.busNumber}`}</Title>
                            <div>
                                <InfoItem>
                                    <strong>도착 시간:</strong> {info.arrivalTime}
                                </InfoItem>
                                <InfoItem>
                                    <strong>탑승 인원:</strong> {info.remainingSeats}
                                </InfoItem>
                            </div>
                        </Card>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </CardContainer>
    );
};


export default Info;