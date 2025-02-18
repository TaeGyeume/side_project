import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import './styles/PopularProductsCard.css';

const SERVER_URL = 'http://localhost:5000';

const PopularProductsCard = ({product}) => {
  const [imageError, setImageError] = useState(false);
  const productId = product._id;

  // 기본 이미지 설정
  let imageUrl = '/default-image.jpg';

  if (product.images?.length > 0 && !imageError) {
    imageUrl = product.images[0];

    // `/uploads/` 경로라면 서버 URL을 붙이기
    if (imageUrl.startsWith('/uploads/')) {
      imageUrl = `${SERVER_URL}${imageUrl}`;
    }
  }

  return (
    <div className="product-card">
      <Link
        to={
          product.type === 'tourTicket'
            ? `/tourTicket/list/${productId}`
            : `/travelItems/${productId}`
        }>
        <div className="product-image">
          <img
            src={imageUrl}
            alt={product.title || product.name}
            onError={() => setImageError(true)}
          />
        </div>
        <div className="product-info">
          <h3>{product.title || product.name}</h3>
          <p>{product.price.toLocaleString()} 원</p>
          <p>조회수: {product.views || 0}</p>
        </div>
      </Link>
    </div>
  );
};

export default PopularProductsCard;
