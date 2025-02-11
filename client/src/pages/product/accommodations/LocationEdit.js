import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';
import LocationForm from '../../../components/product/accommodations/LocationForm';

const LocationEdit = () => {
  const {locationId} = useParams();
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`/locations/${locationId}`);
        setLocationData(response.data);
      } catch (err) {
        setError('❌ 위치 정보를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!locationData) return <div>데이터가 없습니다.</div>;

  return (
    <div className="container mt-4">
      <h2>📍 위치 수정</h2>
      <LocationForm locationData={locationData} isEdit={true} />
      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate('/product/locations/list')}
      >
        ↩ 목록으로
      </button>
    </div>
  );
};

export default LocationEdit;
