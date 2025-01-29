import React from 'react';

const AccommodationCard = ({accommodation}) => {
  return (
    <div className="card mb-3">
      <img
        src={accommodation.images[0]}
        className="card-img-top"
        alt={accommodation.name}
      />
      <div className="card-body">
        <h5 className="card-title">{accommodation.name}</h5>
        <p className="card-text">{accommodation.description}</p>
        <p>
          <strong>최저가:</strong> {accommodation.minPrice.toLocaleString()}원
        </p>
        <button className="btn btn-primary">상세 보기</button>
      </div>
    </div>
  );
};

export default AccommodationCard;
