import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const SignupContainer = styled.div`
    display: flex;
    flex-direction: column; 
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f9f9f9;
    gap: 15px; 
`;

const InputContainer = styled.div`
    width: 300px; 
    margin: 10px 0; 
`;

const InputField = styled.input`
    width: 100%; 
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column; 
    align-items: center;
    width: 80%;
    padding: 30px;
    margin: 20px 0 0;
`;

const Button = styled.button`
    width: 100%; 
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const ErrorText = styled.p`
    color: red;
    font-size: 14px;
    text-align: center; 
    margin: 10px 0; 
`;

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        studentId: "",
        phoneNumber: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.studentId || !formData.phoneNumber) {
            setError("모든 필드를 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post("/api/signup", formData);
            if (response.status === 201) {
                alert("회원가입이 완료되었습니다.");
                navigate("/login");
            }
        } catch (error) {
            console.error(error);
            setError("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <SignupContainer>
            <h1>회원가입</h1>
            <form onSubmit={handleSubmit}>
                <InputContainer>
                    <InputField
                        type="text"
                        name="name"
                        placeholder="이름"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </InputContainer>
                <InputContainer>
                    <InputField
                        type="text"
                        name="studentId"
                        placeholder="학번"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                    />
                </InputContainer>
                <InputContainer>
                    <InputField
                        type="tel"
                        name="phoneNumber"
                        placeholder="전화번호"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </InputContainer>
                {error && <ErrorText>{error}</ErrorText>} {/* 에러 메시지 출력 */}
                <ButtonContainer>
                    <Button type="submit">회원가입</Button>
                </ButtonContainer>
            </form>
        </SignupContainer>
    );
}

export default Signup;
