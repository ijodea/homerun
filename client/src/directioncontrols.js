import React from "react";
import styled from "styled-components";
import mjImage from './assets/mj.png';
import ghImage from './assets/gh.png';

const DirectionButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin: 25px 0;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 300ms ease-in, transform 300ms ease-in;

    &.show {
        opacity: 1;
        transform: translateY(0);
    }

    img {
        height: 50px;
        margin: 0 10px;

        @media (max-width: 768px) {
            display: none; /* 모바일 화면에서 이미지 숨기기 */
        }
    }
`;

const DirectionButton = styled.button`
    display: flex;
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
        height: 1.5em;
        margin-right: 10px;
    }

    @media (max-width: 768px) {
        font-size: 1.2em; 
        padding: 8px 16px; 
    }
`;

const DirectionControls = ({ show, direction, onDirectionChange }) => {
    return (
        show && (
            <DirectionButtonContainer className={show ? 'show' : ''}>
                <img 
                    src={mjImage} 
                    alt="명지역" 
                    style={{ marginRight: "10px" }} 
                />
                <DirectionButton
                    onClick={() => onDirectionChange("mju-to-giheung")}
                    active={direction === "mju-to-giheung"}
                >
                    명지대행
                </DirectionButton>
                <DirectionButton
                    onClick={() => onDirectionChange("giheung-to-mju")}
                    active={direction === "giheung-to-mju"}
                    dir={true}
                >
                    기흥역행
                </DirectionButton>
                <img 
                    src={ghImage} 
                    alt="기흥역" 
                    style={{ marginLeft: "10px" }} 
                />
            </DirectionButtonContainer>
        )
    );
};

export default DirectionControls;