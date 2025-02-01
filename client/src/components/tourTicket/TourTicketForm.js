// 우선 로그인 한 계정 토큰 값 가져오기 뺀 상태

import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {createTourTicket} from '../../api/tourTicket/tourTicketService';

const TourTicketForm = () => {
  const navigate = useNavigate();
  // const [ticket, setTicket] = useState({
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    stock: '',
    images: []
  });

  // const [imageFile, setImageFile] = useState(null); // 파일 선택
  // const [previewImage, setPreviewImage] = useState(null); // 파일 미리보기

  // const handleChange = e => {
  //   // setTicket({...ticket, [e.target.name]: e.target.value});

  //   if (e.target.name === 'image') {
  //     setFormData({...formData, image: e.target.files[0]}); // 파일 저장
  //   } else {
  //     setFormData({...formData, [e.target.name]: e.target.value});
  //   }
  // };

  // const handleFileChange = e => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImageFile(file);
  //     setPreviewImage(URL.createObjectURL(file)); // 미리보기 URL 생성
  //   }
  // };

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
