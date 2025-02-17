import axios from 'axios';

// API 기본 URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/qna';

// ✅ QnA 게시글 생성 (파일이 있을 경우 `FormData`, 없을 경우 `JSON`)
export const createQnaBoard = async (data, isMultipart = false) => {
  try {
    let headers = {'Content-Type': 'application/json'}; // 기본적으로 JSON 요청
    let requestData = data;

    // ✅ FormData로 변환이 필요한 경우
    if (isMultipart) {
      headers['Content-Type'] = 'multipart/form-data';
      const formData = new FormData();

      formData.append('category', data.category);
      formData.append('title', data.title);
      formData.append('content', data.content);

      if (data.images) {
        Array.from(data.images).forEach(file => formData.append('images', file));
      }
      if (data.attachments) {
        Array.from(data.attachments).forEach(file =>
          formData.append('attachments', file)
        );
      }

      requestData = formData;
    }

    console.log('📡 요청 데이터:', requestData);

    const response = await axios.post(`${API_BASE_URL}`, requestData, {
      headers,
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('❌ QnA 게시글 생성 오류:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ QnA 게시글 목록 조회 (페이징)
export const getQnaBoards = async (page = 1, limit = 10, category = null) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {page, limit, category},
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ QnA 게시글 목록 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ 특정 QnA 게시글 조회 (상세보기)
export const getQnaBoardById = async qnaBoardId => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${qnaBoardId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ QnA 게시글 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ QnA 게시글 삭제 (본인 또는 관리자)
export const deleteQnaBoard = async qnaBoardId => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${qnaBoardId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ QnA 게시글 삭제 오류:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ QnA 댓글 작성
export const createQnaComment = async (qnaBoardId, content) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${qnaBoardId}/comments`,
      {content},
      {withCredentials: true}
    );
    return response.data;
  } catch (error) {
    console.error('❌ QnA 댓글 작성 오류:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ QnA 댓글 목록 조회 (페이징)
export const getQnaComments = async (qnaBoardId, page = 1, limit = 5) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${qnaBoardId}/comments`, {
      params: {page, limit},
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ QnA 댓글 목록 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ QnA 댓글 삭제 (본인 또는 관리자)
export const deleteQnaComment = async commentId => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ QnA 댓글 삭제 오류:', error.response?.data || error.message);
    throw error;
  }
};
