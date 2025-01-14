import axiosInstance from "./axios";

/**
 * 사용자에게 온 알림 가져오기 (팔로우 요청 등)
 * @param {string} userId - 현재 사용자 ID
 * @returns {Promise<Array>} 알림 목록
 */
export const getIncomingFollowRequests = async (userId) => {
  try {
    const response = await axiosInstance.get(`/follow/incoming/${userId}`);
    return response.data.incomingRequests;
  } catch (error) {
    console.error("Failed to fetch incoming follow requests:", error);
    throw error;
  }
};

/**
 * 팔로우 요청 수락
 * @param {string} followId - 팔로우 요청 ID
 * @returns {Promise<Object>} 업데이트된 요청 정보
 */
export const acceptFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/accept/${followId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to accept follow request:", error);
    throw error;
  }
};

/**
 * 팔로우 요청 거절
 * @param {string} followId - 팔로우 요청 ID
 * @returns {Promise<Object>} 업데이트된 요청 정보
 */
export const rejectFollowRequest = async (followId) => {
  try {
    const response = await axiosInstance.put(`/follow/reject/${followId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to reject follow request:", error);
    throw error;
  }
};

/**
 * 알림 전체 목록 가져오기 (확장 가능)
 * @param {string} userId - 현재 사용자 ID
 * @returns {Promise<Array>} 알림 목록
 */
export const getNotifications = async (userId) => {
  try {
    const response = await axiosInstance.get(`/notifications/${userId}`);
    return response.data.notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
};

/**
 * 알림 읽음 처리
 * @param {string} notificationId - 알림 ID
 * @returns {Promise<Object>} 읽음 처리된 알림 정보
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/notifications/mark-as-read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
};

/**
 * 모든 알림 읽음 처리
 * @param {string} userId - 현재 사용자 ID
 * @returns {Promise<Object>} 읽음 처리 결과
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await axiosInstance.put(`/notifications/mark-all-as-read/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
};