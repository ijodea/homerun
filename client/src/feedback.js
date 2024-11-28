import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import styled from "styled-components";

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 50px;;
  align-items: center;
  font-family: 'Roboto', sans-serif;

`;

const StyledForm = styled.form`
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #444;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 20px;
  resize: none;
  height: 120px;
  box-sizing: border-box; /* 추가 */

  &:focus {
    border-color: #2575fc;
    outline: none;
    box-shadow: 0 0 5px rgba(37, 117, 252, 0.5);
  }
`;

const Button = styled.button`
  background: #2575fc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #1b5fbf;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.p`
  font-size: 15px;
  background: #2575fc;
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

function FeedbackForm() {
  const [state, handleSubmit] = useForm("xrbgybgk"); // Form ID 그대로 사용
  if (state.succeeded) {
    return (
      <FormWrapper>
        <SuccessMessage>피드백이 성공적으로 전송되었습니다. 감사합니다!</SuccessMessage>
      </FormWrapper>
    );
  }
  return (
    <FormWrapper>
      <StyledForm onSubmit={handleSubmit}>
        <Title>피드백을 보내주세요</Title>
        <TextArea
          id="message"
          name="message"
          placeholder="피드백을 입력하세요"
          required
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
        />
        <Button type="submit" disabled={state.submitting}>
          보내기
        </Button>
      </StyledForm>
    </FormWrapper>
  );
}

export default FeedbackForm;
