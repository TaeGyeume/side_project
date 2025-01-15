import React, { useEffect, useState } from "react";
import axios from "axios";

const MyBoards = () => {
  const [myBoards, setMyBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyBoards = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/boards/my-boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMyBoards(response.data);
      } catch (error) {
        console.error("사용자 게시물 데이터를 불러오는 중 오류 발생:", error);
        setError(error.response?.data?.message || "게시물을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBoards();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (myBoards.length === 0) {
    return <div>작성한 게시물이 없습니다.</div>;
  }

  return (
    <div>
      <h1>내가 작성한 게시물</h1>
      <ul>
        {myBoards.map((board) => (
          <li key={board._id}>
            <h3>{board.title}</h3>
            <p>{board.content}</p>
            {board.media.map((mediaUrl, index) => (
              <div key={index}>
                {mediaUrl.endsWith(".mp4") ? (
                  <video src={mediaUrl} controls width="300" />
                ) : (
                  <img src={mediaUrl} alt="게시물 미디어" width="300" />
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyBoards;
