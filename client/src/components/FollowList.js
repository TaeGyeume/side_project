import React, { useEffect, useState } from "react";
import { getFollowers, getFollowings, deleteFollowRequest } from "../api/followService";
import { useNavigate } from "react-router-dom";

const FollowList = ({ currentUserId }) => {
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadFollowData = async () => {
      try {
        const [followerData, followingData] = await Promise.all([
          getFollowers(currentUserId),
          getFollowings(currentUserId),
        ]);

        console.log("팔로워 데이터:", followerData);
        console.log("팔로잉 데이터:", followingData);

        setFollowers(followerData || []); // 반환된 데이터를 상태에 저장
        setFollowings(followingData || []);
      } catch (err) {
        console.error("팔로우 데이터 가져오기 실패:", err);
        setError("팔로우 데이터를 불러오는 데 실패했습니다.");
      }
    };

    if (currentUserId) {
      loadFollowData();
    }
  }, [currentUserId]);

  const handleDeleteFollow = async (followId) => {
    try {
      console.log("Deleting follow with ID:", followId); // 디버깅용
      await deleteFollowRequest(followId);

    } catch (err) {
      console.error("팔로우 삭제 실패:", err.response?.data || err.message);
      alert("팔로우를 삭제하는 데 실패했습니다.");
    }
  };

  const handleStartChat = (userId) => {
    navigate(`/chat/${userId}`); // 채팅방으로 이동
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>팔로워 목록</h2>
      {followers.length === 0 ? (
        <p>팔로워가 없습니다.</p>
      ) : (
        <ul>
          {followers.map((follower) => (
            <li key={follower._id}>
              {follower.username}
              <button onClick={() => handleStartChat(follower.userId)}>메시지</button>
              <button onClick={() => handleDeleteFollow(follower.followId)}>X</button>
            </li>
          ))}
        </ul>
      )}

      <h2>팔로잉 목록</h2>
      {followings.length === 0 ? (
        <p>팔로잉하는 사용자가 없습니다.</p>
      ) : (
        <ul>
          {followings.map((following) => (
            <li key={following._id}>
              {following.username}
              <button onClick={() => handleStartChat(following.userId)}>메시지</button>
              <button onClick={() => handleDeleteFollow(following._id, "following")}>X</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowList;