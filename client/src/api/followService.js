import axiosInstance from "./axios";

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
export const rejectFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/reject/${followId}`);
    return response.data;
  } catch (error) {
    console.error("팔로우 요청 거절 실패:", error);
    throw error;
  }
};

// 팔로워 목록 가져오기
export const getFollowers = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/followers/${userId}`);
    return response.data.followers;
  } catch (error) {
    console.error("팔로워 목록 조회 실패:", error);
    throw error;
  }
};

// 팔로잉 목록 가져오기
export const getFollowings = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/following/${userId}`);
    return response.data.followings;
  } catch (error) {
    console.error("팔로잉 목록 조회 실패:", error);
    throw error;
  }
};

// 요청 중인 팔로우 목록 가져오기 (PENDING 상태)
export const getPendingFollowRequests = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/pending/${userId}`);
    return response.data.pendingRequests; // 요청 중 목록 반환
  } catch (error) {
    console.error("요청 중인 팔로우 목록 조회 실패:", error);
    throw error;
  }
};