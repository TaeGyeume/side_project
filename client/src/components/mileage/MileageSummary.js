import React from 'react';

const MileageSummary = ({totalMileage}) => {
  return (
    <div className="bg-blue-100 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold">💎 총 마일리지</h2>
      <p className="text-2xl font-semibold text-blue-600">
        {totalMileage.toLocaleString()} 점
      </p>
    </div>
  );
};

export default MileageSummary;
