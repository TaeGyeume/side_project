// 우선 로그인 한 계정 토큰 값 가져오기 뺀 상태

import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createTourTicket} from '../../../api/tourTicket/tourTicketService';

const TourTicketForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    stock: '',
    images: []
  });

  const handleFileChange = e => {
    setFormData({...formData, images: [...e.target.files]});
  };

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formDataObj = new FormData();

    formData.images.forEach(file => {
      formDataObj.append('images', file);
    });

    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('location', formData.location);
    formDataObj.append('price', formData.price);
    formDataObj.append('stock', formData.stock);

    try {
      await createTourTicket(formDataObj);
      alert('상품 등록 성공!');
      navigate('/product/tourTicket/list');
    } catch (error) {
      console.error('상품 등록 실패:', error);
    }
  };

  return (
    <div>
      <h2>투어 & 티켓 상품 등록</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          placeholder="상품명"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="상품 설명"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="위치"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="가격"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="재고"
          value={formData.stock}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default TourTicketForm;
