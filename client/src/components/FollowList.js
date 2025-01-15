import React, { useEffect, useState } from "react";
import { getFollowers, getFollowings, deleteFollowRequest } from "../api/followService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FollowList = ({ currentUserId }) => {
  const [followers, setFollowers] = useState([]); // 팔로워 목록 저장
  const [followings, setFollowings] = useState([]); // 팔로잉 목록 저장
  const [error, setError] = useState(""); // 에러 메시지

  const navigate = useNavigate();

  // 데이터 가져오기: 팔로워와 팔로잉 데이터 로드
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const [followerData, followingData] = await Promise.all([
          getFollowers(currentUserId), // 팔로워 목록
          getFollowings(currentUserId), // 팔로잉 목록
        ]);

        console.log("팔로워 데이터:", followerData);
        console.log("팔로잉 데이터:", followingData);

        setFollowers(followerData || []); // 상태에 저장
        setFollowings(followingData || []);
      } catch (err) {
        console.error("팔로우 데이터 가져오기 실패:", err);
        setError("팔로우 데이터를 불러오는 데 실패했습니다.");
      }
    };

    if (currentUserId) {
      fetchFollowData();
    }
  }, [currentUserId]);

  // 팔로우 삭제 핸들러
  const handleDeleteFollow = async (followId, type) => {
    try {
      console.log("Deleting follow with ID:", followId); // 디버깅 로그
      await deleteFollowRequest(followId); // API 호출로 삭제 요청

      // 타입에 따라 상태 업데이트
      if (type === "following") {
        setFollowings((prevFollowings) =>
          prevFollowings.filter((user) => user.followId !== followId) // 팔로잉 목록 업데이트
        );
      } else if (type === "follower") {
        setFollowers((prevFollowers) =>
          prevFollowers.filter((user) => user.followId !== followId) // 팔로워 목록 업데이트
        );
      }

      alert("팔로우 관계가 삭제되었습니다.");
    } catch (err) {
      console.error("팔로우 삭제 실패:", err.response?.data || err.message);
      alert("팔로우를 삭제하는 데 실패했습니다.");
    }
  };

  const handleChatClick = async (userId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/rooms/create", {
        userId1: currentUserId,
        userId2: userId,
      });
      navigate(`/messages/${response.data._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  // 에러가 있으면 메시지 표시
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
              <button onClick={() => handleChatClick(follower.followerId)}>DM</button>
              <button onClick={() => handleDeleteFollow(follower._id)}>X</button>
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
              <button onClick={() => handleChatClick(following.followingId)}>DM</button>
              <button onClick={() => handleDeleteFollow(following._id)}>X</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowList;