import React, {useEffect, useState} from 'react';
import {fetchMileage, fetchMileageHistory} from '../../api/mileage/mileageService';
import MileageSummary from '../../components/mileage/MileageSummary';
import MileageHistory from '../../components/mileage/MileageHistory';
import {authAPI} from '../../api/auth';

const MileagePage = () => {
  const [userId, setUserId] = useState(null);
  const [totalMileage, setTotalMileage] = useState(0);
  const [mileageHistory, setMileageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        console.log('유저 정보:', userData);

        // 응답 형태가 올바른지 확인 후 userId 설정
        if (userData && userData._id) {
          setUserId(userData._id);
        } else if (userData?.user?.id) {
          setUserId(userData.user.id); // 응답 구조에 따른 예외 처리
        } else {
          throw new Error('유효한 유저 ID를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('유저 정보 가져오기 실패:', err);
        setError('유저 정보를 불러올 수 없습니다.');
      }
    };

    fetchUserProfile();
  }, []);

  // 마일리지 및 내역 불러오기
  useEffect(() => {
    if (!userId) return;

    const loadMileageData = async () => {
      try {
        setLoading(true);
        const mileageData = await fetchMileage(userId);
        console.log('총 마일리지 API 응답:', mileageData);

        if (!mileageData || typeof mileageData.mileage === 'undefined') {
          throw new Error('마일리지 데이터가 유효하지 않습니다.');
        }

        setTotalMileage(mileageData.mileage || 0);

        const historyData = await fetchMileageHistory(userId);
        console.log('마일리지 내역 API 응답:', historyData);

        if (!Array.isArray(historyData)) {
          throw new Error('마일리지 내역 데이터가 유효하지 않습니다.');
        }

        setMileageHistory(historyData);
      } catch (error) {
        console.error('마일리지 데이터 불러오기 실패:', error.response ?? error.message);
        setError('마일리지 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMileageData();
  }, [userId]);

  if (loading) {
    return <p className="text-center text-blue-500">⏳ 로딩 중...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-4">마일리지 관리</h1>
      {userId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MileageSummary totalMileage={totalMileage} />
          <MileageHistory history={mileageHistory} />
        </div>
      ) : (
        <p className="text-center text-red-500">유저 정보가 없습니다.</p>
      )}
    </div>
  );
};

export default MileagePage;
