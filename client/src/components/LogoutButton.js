import {logoutUser} from '../api/axios';

const LogoutButton = () => {
  const handleLogout = async () => {
    await logoutUser();
    alert('로그아웃 되었습니다.');
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;
