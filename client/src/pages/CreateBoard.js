import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateBoard = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [error, setError] = useState("");

  // 파일 업로드 핸들러
  const handleFileChange = (e) => {
    setMedia([...e.target.files]);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (media.length === 0) {
      setError("이미지 또는 영상을 최소 하나 이상 업로드해야 합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    Array.from(media).forEach((file) => formData.append("media", file));

    try {
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/boards`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Authorization 헤더 추가
          },
        }
      );
      console.log("게시물 생성 성공:", response.data);
      navigate("/"); // 게시물 생성 후 메인 페이지로 이동
    } catch (error) {
      console.error("게시물 생성 실패:", error);
      setError(
        error.response?.data?.message || "게시물 생성에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  return (
    <div>
      <h1>게시물 작성</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>
        <div>
          <label>미디어 파일 (이미지/영상)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">게시물 생성</button>
      </form>
    </div>
  );
};

export default CreateBoard;
