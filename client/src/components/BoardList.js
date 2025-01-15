import React, { useEffect, useState } from "react";
import axios from "axios";

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // 에러 상태 추가

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        // 로컬스토리지에서 토큰 가져오기
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("로그인이 필요합니다."); // 토큰이 없으면 에러 처리
        }

        // 서버에 요청
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/boards`, {
          headers: {
            Authorization: `Bearer ${token}`, // Authorization 헤더 추가
          },
        });

        setBoards(response.data);
      } catch (error) {
        console.error("게시물 데이터를 불러오는 중 오류 발생:", error);
        setError(error.response?.data?.message || error.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>; // 에러 메시지 표시
  }

  if (boards.length === 0) {
    return <div>게시물이 없을걸요?</div>;
  }

  return (
    <div>
      <h1>게시물 목록</h1>
      <ul>
        {boards.map((board) => (
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

export default BoardList;
