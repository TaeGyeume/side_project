// src/product/AccommodationList.js
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../api/axios';
import AccommodationCard from '../../components/accommodations/AccommodationCard';

const AccommodationList = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await axios.get('/accommodations/list');
        setAccommodations(response.data);
      } catch (err) {
        setError('숙소 정보를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-3">
      <h2>숙소 목록</h2>
      <button
        className="btn btn-success"
        onClick={() => navigate('/product/accommodations/new')}>
        + 숙소 등록
      </button>
      <div className="row">
        {accommodations.length > 0 ? (
          accommodations.map(acc => (
            <div key={acc._id} className="col-md-4">
              <AccommodationCard accommodation={acc} />
            </div>
          ))
        ) : (
          <p>숙소가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default AccommodationList;
