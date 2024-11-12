import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomerunLink from "./homeRunLink";

const API_BASE_URL = "http://localhost:8000";

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

const Button = styled.button`
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

const SignupText = styled.p`
  margin: 10px 0;
  font-size: 14px;
  color: #007bff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

function Login() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requestData = {
      name,
      studentId,
      phoneNumber,
    };
    
    console.log('Attempting login with:', requestData);
    console.log('Request URL:', `${API_BASE_URL}/auth/login`);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false
      });

      console.log('Login response:', response.data);

      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setError("");
        navigate("/taxi");
      } else {
        setError("서버 응답이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      
      let errorMessage = "로그인에 실패했습니다. 이름, 학번, 전화번호를 확인하세요.";
      
      if (err.response) {
        // 서버가 응답을 반환한 경우
        console.log('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.status === 404) {
          errorMessage = "API 경로를 찾을 수 없습니다.";
        } else if (err.response.status === 401) {
          errorMessage = "로그인 정보가 올바르지 않습니다.";
        } else if (err.response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다.";
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        console.log('No response received:', err.request);
        errorMessage = "서버에서 응답이 없습니다. 서버가 실행 중인지 확인해주세요.";
      } else {
        // 요청 자체를 보내지 못한 경우
        console.log('Error setting up request:', err.message);
        errorMessage = "요청을 보내지 못했습니다. 네트워크 연결을 확인해주세요.";
      }
      
      setError(errorMessage);
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SignupText onClick={() => navigate('/signup', { 
            state: { name, studentId, phoneNumber } 
          })}>
            회원가입하기
          </SignupText>
          <Button type="submit">로그인</Button>
        </ButtonContainer>
      </form>
    </Container>
  );
}

export default Login;