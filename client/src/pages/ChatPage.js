import React, { useState } from "react";
import ChatList from "../components/ChatList";
import ChatRoom from "../components/ChatRoom";
import "./styles/ChatPage.css"; // 스타일 추가

const ChatPage = ({ currentUser, onMessagesRead }) => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  return (
    <div className="chat-page">
      {/* 왼쪽: ChatList */}
      <div className="chat-list-container">
        <ChatList currentUser={currentUser} onRoomSelect={setSelectedRoomId} />
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
