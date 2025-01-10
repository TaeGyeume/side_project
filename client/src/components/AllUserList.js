import React, { useEffect, useState } from "react";
import { fetchUsers } from "../api/userService";
import {
	sendFollowRequest,
	getPendingFollowRequests,
} from "../api/followService"; // PENDING 요청 가져오는 API 포함
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllUserList = ({ currentUserId }) => {
	const [users, setUsers] = useState([]);
	const [pendingRequests, setPendingRequests] = useState([]); // 요청 중인 사용자 ID 목록
	const [error, setError] = useState("");
	const navigate = useNavigate();

	// 사용자 목록 및 PENDING 상태 가져오기
	useEffect(() => {
		const loadUsersAndPendingRequests = async () => {
			try {
				// 전체 사용자 목록 및 요청 중(PENDING) 상태 가져오기
				const [userData, pendingData] = await Promise.all([
					fetchUsers(),
					getPendingFollowRequests(currentUserId),
				]);
				// 현재 로그인한 사용자를 제외한 사용자 목록으로 필터링
				const filteredUsers = userData.filter((user) => user._id !== currentUserId);

				setUsers(filteredUsers); // 필터링된 사용자 목록 저장
				setPendingRequests(pendingData.map((req) => req.followingId)); // 요청 중인 사용자 ID만 저장
			} catch (error) {
				console.error("사용자 정보 또는 요청 중 목록 불러오기 실패:", error);
				setError("사용자 정보를 불러오는 데 실패했습니다.");
			}
		};

		loadUsersAndPendingRequests();
	}, [currentUserId]);

	// 팔로우 버튼 클릭 핸들러
	const handleFollow = async (userId) => {
		try {
			await sendFollowRequest(currentUserId, userId); // 팔로우 요청 전송
			setPendingRequests((prev) => [...prev, userId]); // 요청 중 상태 업데이트
		} catch (error) {
			console.error("팔로우 요청 실패:", error);
		}
	};

	// PENDING 상태 확인
	const isPending = (userId) => {
		return pendingRequests.includes(userId); // PENDING 상태인지 확인
	};

	const handleChatClick = async (userId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/rooms/create", {
        userId1: currentUserId,
        userId2: userId,
      });
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h1>전체 사용자 목록</h1>
			<ul>
				{users.map((user) => (
					<li key={user._id}>
						{user.username}{" "}
						{user._id !== currentUserId && (
							<button
								onClick={() => !isPending(user._id) && handleFollow(user._id)}
								disabled={isPending(user._id)} // 요청 중인 경우 버튼 비활성화
							>
								{isPending(user._id) ? "요청 중" : "팔로우"}
							</button>
						)}
						<button onClick={() => handleChatClick(user._id)}>
              DM
            </button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default AllUserList;