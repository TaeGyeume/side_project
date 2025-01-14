import React from "react";
import {Link} from "react-router-dom";
import BoardList from "../components/BoardList";

const Board = () => {
  return (
    <div>
      <h1>메인 페이지!</h1>
      <Link to="/create">
        <button>게시물 작성하기</button> 
      </Link>
      <BoardList />
    </div>
  );
};

export default Board;