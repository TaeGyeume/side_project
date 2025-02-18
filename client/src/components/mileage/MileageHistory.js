import React from 'react';

const MileageHistory = ({history}) => {
  if (!history || history.length === 0) {
    return <p className="text-center text-gray-500">📭 마일리지 내역이 없습니다.</p>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">📜 마일리지 내역</h2>
      <ul className="divide-y divide-gray-300">
        {history.map((item, index) => (
          <li key={index} className="py-2">
            <p className="text-sm text-gray-600">{item.createdAt}</p>
            <p className="text-lg font-medium">{item.description}</p>
            <p
              className={`text-lg ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.amount > 0 ? `+${item.amount}` : item.amount} 점
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MileageHistory;
