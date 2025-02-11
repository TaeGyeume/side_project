import React from 'react';
import {useParams} from 'react-router-dom';
import TravelItemForm from '../../../components/product/travelItems/TravelItemForm';

const TravelItemEditPage = () => {
  const {itemId} = useParams(); // URL에서 itemId 가져오기

  return (
    <div className="container mt-4">
      <h2>✏️ 여행용품 수정</h2>
      {/* ✅ 수정 모드로 폼을 표시 */}
      <TravelItemForm isEdit={true} itemId={itemId} />
    </div>
  );
};

export default TravelItemEditPage;
