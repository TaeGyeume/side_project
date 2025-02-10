import React from 'react';
import TravelItemForm from '../../../components/product/travelItems/TravelItemForm';

const TravelItemPage = () => {
  return (
    <div className="container mt-4">
      <h2>🛍️ 상품 관리</h2>

      {/* ✅ 상품 추가 폼 (onItemCreated 전달) */}
      <TravelItemForm onItemCreated={() => console.log('상품이 추가됨!')} />
    </div>
  );
};

export default TravelItemPage;
