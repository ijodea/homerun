import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate,useLocation, Link } from "react-router-dom"; 
import HomerunLink from "./homeRunLink";
import MainPage from "./mainPage";
import Join from "./joinPage";
import axios from "axios";


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
const API_BASE_URL = "http://localhost:8000/api";

function Login() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // 이전 페이지 경로 가져오기
  const returnPath = location.state?.returnPath || "/";

  const handleSubmit = async (e) => {
      e.preventDefault();

      console.log('Login attempt with:', {
        name,
        studentId: studentId.length > 0 ? '***' : 'empty',
        phoneNumber: phoneNumber.length > 0 ? '***' : 'empty'
      });
      
      try {
          console.log('sending login request to:', `${API_BASE_URL}/auth/login`);
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
              name,
              studentId,
              phoneNumber
          },{
            headers:{
              "Content-Type": "application/json",
            },
            //withCredentials: true 제거
          });

          console.log('Server response:', {
            status: response.status,
            hasToken: !!response.data.access_token,
            data: response.data
          });

          if (response.data.access_token) {
              // 토큰 저장
              console.log('login successful, storing token and redirecting');
              localStorage.setItem('token', response.data.access_token);
              localStorage.setItem('name', name);
              localStorage.setItem('studentId', studentId);
              localStorage.setItem('phoneNumber', phoneNumber);
              
              // 이전 페이지로 리다이렉트
              navigate("/taxi");
          }
      } catch (error) {
          console.error('Login error details:',{
            status: error.response?.status,
            message: error.response?.data?.message,
            error: error.message
          });
          setError(error.response?.data?.message || "로그인에 실패했습니다.");
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
                  <JoinLink to="/join">회원가입하기</JoinLink>
                  <LoginBtn type="submit">로그인</LoginBtn>
              </ButtonContainer>
          </form>
      </Container>
  );
}

export default Login;