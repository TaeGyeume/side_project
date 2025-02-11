import React from 'react';

const TravelItemList = ({items}) => {
  return (
    <div className="mt-4">
      <h4>🛒 등록된 상품 목록</h4>
      {items.length > 0 ? (
        <ul className="list-group">
          {items.map(item => (
            <li key={item._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{item.name}</strong> - {item.price.toLocaleString()}₩
                </div>
                <div>{item.stock > 0 ? '✅ 재고 있음' : '❌ 품절'}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>해당 카테고리에 등록된 상품이 없습니다.</p>
      )}
    </div>
  );
};

export default TravelItemList;
