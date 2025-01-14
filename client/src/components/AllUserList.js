import React, { useEffect, useState } from "react";
import { fetchUsersWithStatus, sendFollowRequest, deleteFollow } from "../api/followService";
import { useNavigate } from "react-router-dom";

const AllUserList = ({ currentUserId }) => {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const usersData = await fetchUsersWithStatus(currentUserId);
				console.log("Fetched users:", usersData); // 디버깅용
				setUsers(usersData || []);
			} catch (err) {
				console.error("Failed to fetch users:", err);
				setError("사용자 목록을 가져오는 데 실패했습니다.");
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

	const handleDeleteFollow = async (followingId) => {
		try {
			console.log("Deleting follow with ID:", followingId); // 디버깅용
			await deleteFollow(followingId);

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
									<button onClick={() => handleStartChat(currentUserId)}>메시지</button>
									<button onClick={() => handleDeleteFollow(user.userId)}>X</button>
								</>
							) : user.status === "PENDING" ? (
								<>
									<button disabled>요청 중</button>
								</>
							) : (
								<button onClick={() => handleFollow(user._id)}>팔로우</button>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AllUserList;
