import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuthStore} from '../store/authStore';

const Header = () => {
  const {user, isAuthenticated, fetchUserProfile, logout} = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  //  로그인된 경우에만 프로필 불러오기 (401 방지)
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user, fetchUserProfile]);

  //  로그아웃 처리 (쿠키 삭제 + 상태 초기화 + 리디렉션)
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error.message || '알 수 없는 오류 발생');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/main">
          Our Real Trip
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/main">
                메인
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/flights">
                항공
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accommodations/search">
                숙소 검색
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tourTicket/list">
                투어/티켓
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/travelItems">
                여행 용품
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/notification">
                알림
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/qna">
                고객 문의
              </Link>
            </li>

            {isAuthenticated && user ? (
              <>
                {/* 관리자(admin) 전용 메뉴 */}

                {user?.roles.includes('admin') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/product">
                      +상품+
                    </Link>
                  </li>
                )}

                {/* 다른 사용자들도 접근 가능한 메뉴 */}
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle"
                    onClick={toggleDropdown}
                    style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                    프로필
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isDropdownOpen && (
                    <ul className="dropdown-menu show">
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          내 프로필
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/booking/my?status=completed">
                          내 예약 목록
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/coupons/my">
                          내 쿠폰함
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/mileage">
                          내 마일리지
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/favorite-list">
                          즐겨찾기
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* 사용자 이름 표시 */}
                <li className="nav-item d-flex align-items-center">
                  <span className="nav-link text-primary fw-bold">
                    {user?.username}님
                  </span>
                </li>

                {/* 로그아웃 버튼 */}
                <li className="nav-item">
                  <button className="btn btn-outline-danger" onClick={handleLogout}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* 비로그인 사용자 메뉴 */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    로그인
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    회원가입
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
