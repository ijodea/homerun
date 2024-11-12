import React from 'react';
import { useLocation } from 'react-router-dom';

function Signup() {
    const location = useLocation();
    const { name, studentId, phoneNumber } = location.state || {}; // 전달된 상태 가져오기

    return (
        <div>
            <h1>회원가입 페이지</h1>
            <form>
                <div>
                    <label>이름:</label>
                    <input type="text" value={name || ''} readOnly />
                </div>
                <div>
                    <label>학번:</label>
                    <input type="text" value={studentId || ''} readOnly />
                </div>
                <div>
                    <label>전화번호:</label>
                    <input type="tel" value={phoneNumber || ''} readOnly />
                </div>
                {/* 추가적인 회원가입 입력 필드 */}
            </form>
        </div>
    );
}

export default Signup;
