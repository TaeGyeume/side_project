import React, {useState, useEffect, useRef} from 'react';
import {fetchSuggestions} from '../../api/accommodation/accommodationService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/SearchBar.css';

const SearchBar = ({onSearch}) => {
  const [searchTerm, setSearchTerm] = useState('서울');
  const [startDate, setStartDate] = useState(new Date()); // 체크인 날짜
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  ); // 체크아웃 날짜
  const [adults, setAdults] = useState(1); // 기본 성인 1명

  const [suggestions, setSuggestions] = useState([]); // 자동완성 목록
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null); // 🔹 입력 필드 및 자동완성 목록 감지용 ref

  // 🔍 검색 실행
  const handleSearch = () => {
    onSearch({
      searchTerm,
      startDate: startDate.toISOString().split('T')[0], // yyyy-MM-dd 형식
      endDate: endDate.toISOString().split('T')[0], // yyyy-MM-dd 형식
      adults
    });
  };

  // 🔎 자동완성 API 호출 (디바운싱 적용)
  useEffect(() => {
    if (searchTerm.length === 0) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const results = await fetchSuggestions(searchTerm);
      setSuggestions(results);
    }, 300); // ⏳ 300ms 후 실행

    return () => clearTimeout(delayDebounceFn); // 이전 요청 취소
  }, [searchTerm]);

  // 🔹 자동완성 항목을 클릭하면 검색창에 반영
  const handleSelectSuggestion = suggestion => {
    setSearchTerm(suggestion.name); // 🔹 선택한 검색어 입력창에 반영
    setShowSuggestions(false); // 🔹 자동완성 목록 닫기
  };

  // 🔹 입력 필드 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false); // 🔹 검색창 바깥 클릭 시 닫기
      } else {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔹 검색어와 일치하는 부분 강조
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span class="highlight">$1</span>`);
  };

  return (
    <div ref={searchRef} className="searchBar-container">
      {/* 여행지 입력 */}
      <div className="input-group">
        <label>여행지</label>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="input"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onMouseDown={e => {
                  e.preventDefault();
                  handleSelectSuggestion(suggestion);
                }}
                className="suggestion-item"
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(suggestion.name, searchTerm)
                }} // 🔹 검색어 하이라이트
              />
            ))}
          </ul>
        )}
      </div>

      {/* 날짜 선택 */}
      <div className="input-group">
        <label>일정</label>
        <div className="date-container">
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            onKeyDown={e => e.preventDefault()} // 수동 입력 방지
            className="date-picker"
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
            onKeyDown={e => e.preventDefault()} // 수동 입력 방지
            className="date-picker"
          />
        </div>
      </div>

      {/* 숙박 인원 선택 */}
      <div className="input-group">
        <label>성인</label>
        <div className="guest-selector">
          <button
            onClick={() => setAdults(prev => Math.max(1, prev - 1))}
            className="button">
            -
          </button>
          <span>{adults}</span>
          <button onClick={() => setAdults(prev => prev + 1)} className="button">
            +
          </button>
        </div>
      </div>

      {/* 숙소 검색 버튼 */}
      <button onClick={handleSearch} className="search-button">
        숙소 검색
      </button>
    </div>
  );
};

export default SearchBar;
