import React from 'react';

const Unauthorized = () => {
  return (
    <div className="text-center mt-5">
      <h2>🚫 접근 권한이 없습니다.</h2>
      <p>이 페이지에 접근할 수 있는 권한이 없습니다.</p>
      <a href="/main" className="btn btn-primary">메인 페이지로 이동</a>
    </div>
  );
};

export default Unauthorized;
