import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {authAPI} from '../../api/auth';

const MileagePage = () => {
  const [mileage, setMileage] = useState(null);
  const [mileageHistory, setMileageHistory] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 사용자 ID 및 마일리지 데이터 불러오기
  useEffect(() => {
    const fetchUserAndMileage = async () => {
      try {
        // 사용자 정보 가져오기
        const user = await authAPI.getUserProfile();
        console.log('🔍 사용자 정보:', user);

        if (user && user._id) {
          setUserId(user._id);

          // ✅ 전체 마일리지 및 적립 내역 조회
          const [mileageResponse, historyResponse] = await Promise.all([
            axios.get(`http://localhost:5000/api/user-mileages/${user._id}`),
            axios.get(`http://localhost:5000/api/mileage/history/${user._id}`)
          ]);

          console.log('✅ 마일리지 조회 성공:', mileageResponse.data);
          console.log('✅ 마일리지 내역 조회 성공:', historyResponse.data);

          // ✅ 상태 업데이트
          setMileage(mileageResponse.data.mileage);
          setMileageHistory(historyResponse.data);
        } else {
          setError('사용자 정보가 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('🚨 마일리지 조회 실패:', err);
        setError('마일리지 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMileage();
  }, []);

  if (loading) return <p>⏳ 마일리지를 불러오는 중...</p>;
  if (!userId) return <p>⚠️ 로그인 후 이용해 주세요.</p>;

  return (
    <div className="mileage-container" style={{padding: '20px'}}>
      <h2>✈️ 내 마일리지</h2>
      {mileage !== null ? (
        <h3>🎯 현재 마일리지: {mileage.toLocaleString()} 점</h3>
      ) : (
        <p>⏳ 마일리지 정보를 불러오는 중...</p>
      )}

      {/* 마일리지 내역 리스트 */}
      <div className="mileage-history" style={{marginTop: '30px'}}>
        <h4>📜 마일리지 적립/사용 내역</h4>
        {mileageHistory.length > 0 ? (
          <ul style={{listStyle: 'none', padding: 0}}>
            {mileageHistory.map(item => (
              <li
                key={item._id}
                style={{padding: '10px', borderBottom: '1px solid #ccc'}}>
                <strong>{item.description}</strong>
                <span
                  style={{
                    color: item.type === 'earn' ? 'green' : 'red',
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>
                  {item.type === 'earn' ? '+' : '-'}
                  {item.amount.toLocaleString()} 점
                </span>
                <div style={{fontSize: '12px', color: '#888'}}>
                  {new Date(item.createdAt).toLocaleString()} | 잔액:{' '}
                  {item.balanceAfter.toLocaleString()} 점
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>📂 아직 마일리지 내역이 없습니다.</p>
        )}
      </div>

      {/* 오류 메시지 */}
      {error && (
        <p className="text-danger" style={{color: 'red'}}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default MileagePage;
