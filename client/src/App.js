import React, {useEffect, useState} from 'react';
import api from './api/axios';

const App = () => {
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    // 서버와 연결 테스트
    const fetchMessage = async () => {
      try {
        // GET 요청 보내기
        const response = await api.get('/test'); // '/api/test' 요청
        setServerMessage(response.data.message); // 서버 응답 메시지 설정
      } catch (error) {
        console.error('Error connecting to the server:', error);
        setServerMessage('Failed to connect to the server');
      }
    };

    fetchMessage();
  }, []);

  return (
    <div>
      <h1>Server Connection Test</h1>
      <p>{serverMessage}</p>
    </div>
  );
};

export default App;
