import React, {useState, useEffect} from 'react';
import axios from '../../../api/axios';
import {useNavigate} from 'react-router-dom';

const LocationList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  // 위치 목록 불러오기
  const fetchLocations = async () => {
    try {
      const response = await axios.get('/locations');
      setLocations(response.data);
    } catch (err) {
      setError('위치 목록을 불러오는 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  // 위치 삭제 핸들러
  const handleDelete = async locationId => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/locations/${locationId}`);
      alert('위치가 성공적으로 삭제되었습니다.');
      setLocations(locations.filter(location => location._id !== locationId));
    } catch (err) {
      alert('위치 삭제 중 오류 발생');
      console.error('오류:', err);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-4">
      <h2>📍 위치 목록</h2>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => navigate('/product/locations/new')}>
        📍 위치 추가
      </button>
      <ul className="list-group">
        {locations.map(location => (
          <li
            key={location._id}
            className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>
                {location.name} ({location.country})
              </strong>{' '}
              - 위도: {location.latitude}, 경도: {location.longitude}
            </div>
            <button
              className="btn btn-warning btn-sm"
              onClick={() => navigate(`/product/locations/edit/${location._id}`)}>
              ✏️ 수정
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(location._id)}>
              🗑️ 삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LocationList;
