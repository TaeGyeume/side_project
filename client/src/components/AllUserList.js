import React, { useEffect, useState } from "react";
import { fetchAllUsers } from "../api/userService";

const AllUserList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await fetchAllUsers(); // fetchAllUsers 호출
                setUsers(data); // 사용자 데이터 설정
            } catch (error) {
                setError("사용자 정보를 불러오는 데 실패했습니다.");
            }
        };

        loadUsers();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>전체 사용자 목록</h1>
            <ul>
                {users.map((user) => (
                    <li key={user._id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
};

export default AllUserList;