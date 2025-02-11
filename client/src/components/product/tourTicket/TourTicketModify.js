import React, {useEffect, useState} from 'react';
import {
  getTourTicketById,
  updateTourTicket
} from '../../../api/tourTicket/tourTicketService';
import {useParams, useNavigate} from 'react-router-dom';

const TourTicketModify = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTourTicketById(id);
        setTicket(data);
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setStock(data.stock);
      } catch (error) {
        console.error('상품 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchTicket();
  }, [id]);

  const handleImageUpload = e => {
    setNewImages([...newImages, ...e.target.files]);
  };

  const handleImageDeleteToggle = image => {
    if (deleteImages.includes(image)) {
      setDeleteImages(deleteImages.filter(img => img !== image));
    } else {
      setDeleteImages([...deleteImages, image]);
    }
  };

  const handleRemoveImage = async image => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('deleteImages', JSON.stringify([image])); // 삭제할 이미지 배열 전송

      await updateTourTicket(id, formData);

      setTicket(prevTicket => ({
        ...prevTicket,
        images: prevTicket.images.filter(img => img !== image)
      }));

      alert('이미지가 삭제되었습니다.');
    } catch (error) {
      console.error('이미지 삭제 오류:', error);
      alert('이미지 삭제 실패');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);

    formData.append('deleteImages', JSON.stringify(deleteImages));

    newImages.forEach(img => formData.append('images', img));

    try {
      await updateTourTicket(id, formData);
      alert('상품이 수정되었습니다.');
      navigate(`/product/tourTicket/${id}`);
    } catch (error) {
      console.error('상품 수정 오류:', error);
    }
  };

  return (
    <div>
      <h1>상품 수정</h1>
      <form onSubmit={handleSubmit}>
        <label>상품명:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <label>상품 설명:</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <label>가격:</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />

        <label>재고:</label>
        <input
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />

        <label>기존 이미지:</label>
        <div>
          {ticket?.images.map((image, index) => (
            <div key={index} style={{display: 'flex', alignItems: 'center'}}>
              <img src={`http://localhost:5000${image}`} alt="기존 이미지" width="100" />
              <input
                type="checkbox"
                checked={deleteImages.includes(image)}
                onChange={() => handleImageDeleteToggle(image)}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(image)}
                style={{marginLeft: '10px', cursor: 'pointer', color: 'red'}}
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        <label>새로운 이미지 추가:</label>
        <input type="file" multiple onChange={handleImageUpload} />

        <button type="submit">수정 완료</button>
      </form>
    </div>
  );
};

export default TourTicketModify;
