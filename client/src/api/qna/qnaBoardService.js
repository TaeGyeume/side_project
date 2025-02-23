import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/qna';

//  QnA 게시글 생성 (Busboy 사용)
// QnA 게시글 생성 (Busboy 사용)
export const createQnaBoard = async data => {
  try {
    const hasFiles =
      (data.images && data.images.length > 0) ||
      (data.attachments && data.attachments.length > 0);

    let requestData;
    let headers = {};

    if (hasFiles) {
      requestData = new FormData();
      requestData.append('category', data.category?.trim() || '');
      requestData.append('title', data.title?.trim() || '');
      requestData.append('content', data.content?.trim() || '');

      // 이미지 파일 추가
      data.images?.forEach(file => {
        if (file instanceof File) {
          requestData.append('images', file);
        }
      });

      // 첨부파일 추가
      data.attachments?.forEach(file => {
        if (file instanceof File) {
          requestData.append('attachments', file);
        }
      });

      headers = {'Content-Type': 'multipart/form-data'}; // 명확하게 설정
    } else {
      requestData = new FormData(); // 파일이 없어도 FormData로 강제
      requestData.append('category', data.category?.trim() || '');
      requestData.append('title', data.title?.trim() || '');
      requestData.append('content', data.content?.trim() || '');
      headers = {'Content-Type': 'multipart/form-data'};
    }

    // 서버로 전송할 FormData 로그 출력 (디버깅용)
    console.log('✅ 전송할 FormData 내용:');
    for (let [key, value] of requestData.entries()) {
      console.log(`🔹 ${key}:`, value);
    }

    const response = await axios.post(`${API_BASE_URL}`, requestData, {
      headers,
      withCredentials: true // 쿠키 포함
    });

    return response.data;
  } catch (error) {
    console.error('⛔ QnA 게시글 생성 오류:', error.response?.data || error.message);
    throw error;
  }
};

//  QnA 게시글 목록 조회 (페이징)
export const getQnaBoards = async (page = 1, limit = 10, category = null) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {page, limit, category},
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(' QnA 게시글 목록 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

//  특정 QnA 게시글 조회 (상세보기)
export const getQnaBoardById = async qnaBoardId => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${qnaBoardId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(' QnA 게시글 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

//  QnA 게시글 삭제 요청 (URL 수정)
export const deleteQnaBoard = async qnaBoardId => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${qnaBoardId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(' QnA 게시글 삭제 오류:', error);
    throw error.response?.data || {error: 'QnA 게시글 삭제 중 오류 발생'};
  }
};

//  QnA 댓글 작성
export const createQnaComment = async (qnaBoardId, content) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${qnaBoardId}/comments`,
      {content},
      {withCredentials: true}
    );
    return response.data;
  } catch (error) {
    console.error(' QnA 댓글 작성 오류:', error.response?.data || error.message);
    throw error;
  }
};

//  QnA 댓글 목록 조회 (페이징)
export const getQnaComments = async (qnaBoardId, page = 1, limit = 5) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${qnaBoardId}/comments`, {
      params: {page, limit},
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(' QnA 댓글 목록 조회 오류:', error.response?.data || error.message);
    throw error;
  }
};

//  QnA 댓글 삭제 (본인 또는 관리자)
export const deleteQnaComment = async commentId => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(' QnA 댓글 삭제 오류:', error.response?.data || error.message);
    throw error;
  }
};

// QnA 게시글 수정 (파일이 있을 경우 FormData, 없을 경우 JSON)
export const updateQnaBoard = async (qnaBoardId, data, isMultipart = false) => {
  try {
    let requestData = data;
    let headers = {};

    if (isMultipart) {
      const formData = new FormData();

      formData.append('category', data.category);
      formData.append('title', data.title);
      formData.append('content', data.content);

      if (data.images && data.images.length > 0) {
        data.images.forEach(file => formData.append('images', file));
      }
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => formData.append('attachments', file));
      }

      requestData = formData;
      headers = {'Content-Type': 'multipart/form-data'}; // Axios가 자동 처리
    } else {
      headers = {'Content-Type': 'application/json'};
    }

    console.log(' 수정 요청 데이터:', requestData);

    const response = await axios.put(`${API_BASE_URL}/${qnaBoardId}`, requestData, {
      headers,
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error(' QnA 게시글 수정 오류:', error.response?.data || error.message);
    throw error;
  }
};
