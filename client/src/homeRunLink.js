// HomerunLink.js
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    justify-content: center;  /* 수평 중앙 정렬 */
    align-items: center;      /* 수직 중앙 정렬 (상단에 배치할 경우 필요 없음) */
    margin: 15px 0;          /* 상하 여백 조정 */
`;

const StyledLink = styled(Link)`
    color: #007bff;
    font-size: 1.5em;
    font-weight: bold;
    text-decoration: none;
    margin: 10px;            /* 링크 주변 여백 */
`;

const HomerunLink = () => {
    return (
        <Container>
            <StyledLink to="/">Homerun</StyledLink>
        </Container>
    );
};

export default HomerunLink;
