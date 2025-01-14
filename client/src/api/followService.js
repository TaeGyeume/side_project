import axiosInstance from "./axios";

// 팔로워 목록 가져오기
export const getFollowers = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/followers/${userId}`);
    return response.data.followers;
  } catch (error) {
    console.error("Error fetching followers:", error);
    throw error;
  }
};

// 팔로잉 목록 가져오기
export const getFollowings = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/followings/${userId}`);
    return response.data.followings;
  } catch (error) {
    console.error("Error fetching followings:", error);
    throw error;
  }
};

// 자신에게 온 팔로우 요청 가져오기
export const getIncomingFollowRequests = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/incoming/${userId}`);
    return response.data.incomingRequests;
  } catch (error) {
    console.error("Failed to fetch incoming follow requests:", error);
    throw error;
  }
};

// 요청 중인 팔로우 목록 가져오기
export const getPendingFollowRequests = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/pending/${userId}`);
    return response.data.pendingRequests;
  } catch (error) {
    console.error("Failed to fetch pending follow requests:", error);
    throw error;
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
    console.error("Failed to send follow request:", error);
    throw error;
  }
};

// 팔로우 요청 수락
export const acceptFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/accept/${followId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to accept follow request:", error);
    throw error;
  }
};

// 팔로우 요청 거절
export const rejectFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/reject/${followId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to reject follow request:", error);
    throw error;
  }
};

// 팔로우 삭제
export const deleteFollow = async (followId) => {
  try {
    const response = await axiosInstance.delete(`/follow/delete/${followId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete follow with ID ${followId}:`, error);
    throw error;
  }
};

// 전체 사용자 조회
export const fetchUsersWithStatus = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/usersWithStatus/${userId}`);
    const filteredUsers = response.data.filter(user => user._id !== userId); // 로그인한 사용자 제외
    return filteredUsers;
  } catch (error) {
    console.error("Failed to fetch users with follow status:", error.response?.data || error.message);
    throw error;
  }
};

