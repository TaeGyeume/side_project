import React, { useEffect, useState } from "react";
import { fetchUsersWithStatus, sendFollowRequest, deleteFollowRequest } from "../api/followService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AllUserList = ({ currentUserId }) => {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const usersData = await fetchUsersWithStatus(currentUserId);

				console.log("Fetched users data :", usersData); // 디버깅용

				// followId 매핑 확인
				setUsers(usersData.map((user) => ({
					...user,
					followId: user.followId || null, // followId 명시적으로 설정
				})));
			} catch (err) {
				console.error("Failed to fetch users:", err);
			}
		};

		if (currentUserId) {
			fetchData();
		}
	}, [currentUserId]);

	const handleFollow = async (userId) => {
		try {
			console.log("Sending follow request to:", userId); // 디버깅용
			await sendFollowRequest(currentUserId, userId);

			// 즉시 "요청 중" 버튼으로 변경
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user._id === userId ? { ...user, status: "PENDING" } : user
				)
			);
			alert("팔로우 요청을 보냈습니다.");
		} catch (err) {
			console.error("팔로우 요청 실패:", err.response?.data || err.message);
			alert("팔로우 요청에 실패했습니다.");
		}
	};

	const handleDeleteFollow = async (followId) => {
		try {
			console.log("Deleting follow with ID:", followId); // 디버깅용
			await deleteFollowRequest(followId);
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.followId === followId ? { ...user, isFollowing: false, status: null, followId: null } : user
				)
			);
			alert("팔로우가 삭제되었습니다.");
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
      navigate(`/chat/${response.data._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

	if (error) {
		return <p>{error}</p>;
	}

	return (
		<div>
			<h2>전체 사용자 목록</h2>
			{users.length === 0 ? (
				<p>사용자가 없습니다.</p>
			) : (
				<ul>
					{users.map((user) => (
						<li key={user._id}>
							{user.username}
							{user.isFollowing ? (
								<>
									<button onClick={() => handleDeleteFollow(user.followId)}>X</button>
								</>
							) : user.status === "PENDING" ? (
								<>
									<button disabled>요청 중</button>
								</>
							) : (
								<button onClick={() => handleFollow(user._id)}>팔로우</button>
							)}
							<button onClick={() => handleChatClick(user._id)}>
								DM
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AllUserList;
