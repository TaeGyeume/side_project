import React, {useState} from 'react';
import FindUserIdForm from '../../components/Auth/FindUserIdForm';

const FindUserId = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">아이디 찾기</h2>
          <FindUserIdForm />
        </div>
      </div>
    </div>
  );
};

export default FindUserId;
