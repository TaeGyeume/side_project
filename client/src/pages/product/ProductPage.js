// Product 메인 페이지

import React from 'react';
import Sidebar from '../../components/Sidebar';

const ProductPage = () => {
  return (
    <div style={{display: 'flex'}}>
      <Sidebar />
      <div style={{padding: '20px', flex: 1}}>
        <h1>상품 페이지</h1>
        <p>좌측에서 원하는 카테고리를 선택하세요.</p>
      </div>
    </div>
  );
};

export default ProductPage;
