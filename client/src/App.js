import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import UserList from "./components/UserList";
import ChatRoom from "./components/ChatRoom";
import AddUser from "./components/AddUser";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Stored user in localStorage:", storedUser); // 디버깅
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <div>
        <nav style={{ display: "flex", gap: "20px", justifyContent: "center", padding: "10px" }}>
          <Link to="/login">Login</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/add-user">Add User</Link> {/* Add User 링크 추가 */}
        </nav>
        <Routes>
          {!currentUser ? (
            <Route path="*" element={<Login setCurrentUser={setCurrentUser} />} />
          ) : (
            <>
              <Route path="/messages" element={<UserList currentUser={currentUser} />} />
              <Route path="/chat/:roomId" element={<ChatRoom currentUser={currentUser} />} />
              <Route path="/add-user" element={<AddUser />} /> {/* AddUser 라우트 추가 */}
            </>
          )}
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
