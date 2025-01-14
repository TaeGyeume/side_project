import React, { useEffect, useState } from "react";
import axios from "axios";

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 서버에서 게시물 데이터 가져오기
    const fetchBoards = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/boards`);
        setBoards(response.data);
      } catch (error) {
        console.error("게시물 데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
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
