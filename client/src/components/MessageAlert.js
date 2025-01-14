import React from "react";
import { NavLink } from "react-router-dom";

const MessageAlert = ({ unreadMessageAlert }) => {
  return (
    <NavLink to="/messages" className="nav-item">
      <i className="fas fa-envelope"></i> 메시지{unreadMessageAlert && <span className="alert-badge">📨</span>}
    </NavLink>
  );
};

export default MessageAlert;
