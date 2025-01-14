import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatRoom from "../components/ChatRoom";
import "./styles/ChatPage.css"; // 스타일 추가

const ChatPage = ({ currentUser, onMessagesRead }) => {
  const { roomId } = useParams(); // URL에서 roomId 가져오기
  const [selectedRoomId, setSelectedRoomId] = useState(roomId || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      setSelectedRoomId(roomId); // URL 변경 시 selectedRoomId 업데이트
    }
  }, [roomId]);

  const handleRoomSelect = (newRoomId) => {
    setSelectedRoomId(newRoomId);
    navigate(`/messages/${newRoomId}`); // URL 업데이트
  };

  return (
    <div className="chat-page">
      {/* 왼쪽: ChatList */}
      <div className="chat-list-container">
        <ChatList currentUser={currentUser} onRoomSelect={handleRoomSelect} />
      </div>

      {/* 오른쪽: ChatRoom */}
      <div className="chat-room-container">
        {selectedRoomId ? (
          <ChatRoom
            currentUser={currentUser}
            onMessagesRead={onMessagesRead}
            roomId={selectedRoomId}
          />
        ) : (
          <div className="empty-room">
            <p>채팅방을 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
