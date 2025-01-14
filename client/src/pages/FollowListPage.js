import React from "react";
import FollowList from "../components/FollowList";

const FollowListPage = ({ currentUserId }) => {
  if (!currentUserId) {
    return <p>로그인이 필요합니다.</p>;
  }

  return (
    <div>
      <h1>팔로우 목록</h1>
      <FollowList currentUserId={currentUserId} />
    </div>
  );
};

export default FollowListPage;