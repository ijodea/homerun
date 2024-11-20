import React, { useState,useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import HomerunLink from "./homeRunLink";
import MainPage from "./mainPage";
import Join from "./joinPage";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin-top: 0;
`;

const InputContainer = styled.div`
  width: 300px;
  margin: 10px 0;
`;

const Input = styled.input`
  width: 100%;
  margin-top: 7px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 20px 0 0;
`;

const LoginBtn = styled.button`
  width: 50%;
  padding: 10px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const JoinLink = styled(Link)`
  margin: 10px 0;
  font-size: 14px;
  color: #007bff;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;


function Login(){
  const [studentName, setStudentName] = useState(""); // 이름 상태
  const [studentId, setStudentId] = useState(""); // 학번 상태
  const [phoneNumber, setPhoneNumber] = useState(""); // 전화번호 상태
  const navigate = useNavigate();

  // 이미 로그인된 사용자 체크
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try{
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name:studentName, studentId, phoneNumber}),
      });
      if(response.ok){
        const data = await response.json();
        localStorage.setItem("studentName", studentName);
        localStorage.setItem("studentId", studentId);
        localStorage.setItem("phoneNumber", phoneNumber);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("accessToken", data.accessToken);

        navigate("/");
      } else {
        alert("로그인에 실패하였습니다.");
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };


  

  return (
    <Container>
      <HomerunLink />
      <form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            type="text"
            placeholder="이름을 입력하세요"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
        </InputContainer>
        <InputContainer>
          <Input
            type="text"
            placeholder="학번을 입력하세요"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </InputContainer>
        <InputContainer>
          <Input
            type="tel"
            placeholder="전화번호를 입력하세요"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </InputContainer>
        <ButtonContainer>
          <JoinLink onClick={() => navigate("/join")}>회원가입하기</JoinLink>
          <LoginBtn type="submit">로그인</LoginBtn>
        </ButtonContainer>
      </form>
    </Container>
  );
}

export default Login;
