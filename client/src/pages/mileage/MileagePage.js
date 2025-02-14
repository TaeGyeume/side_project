import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {authAPI} from '../../api/auth';

const MileagePage = () => {
  const [mileage, setMileage] = useState(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 사용자 ID 가져오기 & 마일리지 조회
  useEffect(() => {
    const fetchUserAndMileage = async () => {
      try {
        // ✅ 사용자 정보 가져오기
        const user = await authAPI.getUserProfile();
        console.log('🔍 사용자 정보:', user);

        if (user && user._id) {
          setUserId(user._id);

          // ✅ 절대 URL 사용
          const response = await axios.get(
            `http://localhost:5000/api/user-mileages/${user._id}`
          );
          console.log('✅ 마일리지 조회 성공:', response.data);
          setMileage(response.data.mileage);
        } else {
          setError('사용자 정보가 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('🚨 마일리지 조회 실패:', err);
        setError('마일리지 조회에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMileage();
  }, []);

  if (loading) return <p>⏳ 마일리지를 불러오는 중...</p>;
  if (!userId) return <p>⚠️ 로그인 후 이용해 주세요.</p>;

  return (
    <div className="mileage-container">
      <h2>✈️ 내 마일리지</h2>
      {mileage !== null ? (
        <h3>🎯 현재 마일리지: {mileage.toLocaleString()} 점</h3>
      ) : (
        <p>⏳ 로딩 중...</p>
      )}
      {error && <p className="text-danger">⚠️ {error}</p>}
    </div>
  );
};

export default MileagePage;
