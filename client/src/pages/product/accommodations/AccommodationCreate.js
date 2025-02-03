import React from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';
import AccommodationForm from '../../../components/accommodations/AccommodationForm';

const AccommodationCreate = () => {
  const navigate = useNavigate();

  const handleSubmit = async formData => {
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          Array.from(formData.images).forEach(file => form.append('images', file));
        } else {
          form.append(key, formData[key]);
        }
      });

      await axios.post('/accommodations/new', form, {
        headers: {'Content-Type': 'multipart/form-data'}
      });

      alert('숙소가 성공적으로 등록되었습니다.');
      navigate('/product/accommodations');
    } catch (error) {
      console.error('숙소 등록 오류:', error);
      alert('숙소 등록에 실패했습니다.');
    }
  };

  return (
    <div className="container mt-3">
      <h2>숙소 등록</h2>
      <AccommodationForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AccommodationCreate;
