import React from 'react';
import { useLocation } from 'react-router-dom';

function Signup() {
    const location = useLocation();
    const { studentId, phoneNumber } = location.state || {}; // 전달된 상태 가져오기

    return (
        <div>회원가입</div>
    );
}

export default Signup;