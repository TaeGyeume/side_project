import React, {useState} from 'react';

const SearchBar = ({onSearch}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onSearch(searchTerm); // 부모 컴포넌트로 검색어 전달
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="숙소 이름 검색"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <button type="submit" className="btn btn-primary ms-2">
        검색
      </button>
    </form>
  );
};

export default SearchBar;
