import axiosInstance from "./axios";

// 내가 받은 팔로우 요청
export const getIncomingFollowRequests = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/incoming/${userId}`);

    if (response.data && Array.isArray(response.data.incomingRequests)) {
      return response.data.incomingRequests; // 올바른 데이터 반환
    }

    console.error("Unexpected server response format:", response.data);
    return []; // 잘못된 데이터 형식인 경우 빈 배열 반환

  } catch (error) {
    console.error("Failed to fetch incoming follow requests:", error);
    return []; // 요청 실패 시 빈 배열 반환
  }
};

// 팔로우 요청 보내기
export const sendFollowRequest = async (followerId, followingId) => {
  try {
    const response = await axiosInstance.post("/follow/create", {
      followerId,
      followingId,
    });

    return response.data;

  } catch (error) {
    console.error("팔로우 요청 실패:", error);
    throw error;
  }
};

// 팔로우 요청 수락
export const acceptFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/accept/${followId}`);
    return response.data;
  } catch (error) {
    console.error("팔로우 요청 수락 실패:", error);
    throw error;
  }
};

// 팔로우 요청 거절
// 거절되면 DB에서 삭제? 유지? ----------> 확인해야 함함
export const rejectFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/reject/${followId}`);
    return response.data;
  } catch (error) {
    console.error("팔로우 요청 거절 실패:", error);
    throw error;
  }
};

// 내가 보낸 팔로우 요청
export const getPendingFollowRequests = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/pending/${userId}`);
    return response.data.pendingRequests; // 요청 중 목록 반환
  } catch (error) {
    console.error("요청 중인 팔로우 목록 조회 실패:", error);
    throw error;
  }
};

// 이미 팔로우 된 상태인데 X 버튼 클릭 시, 팔로우 취소됨
export const deleteFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.delete(`/follow/${followId}`);
    return response.data; // 성공 메시지 반환
  } catch (error) {
    console.error("팔로우 요청 삭제 실패:", error);
    throw error; // 에러를 호출한 쪽으로 전달
  }
};