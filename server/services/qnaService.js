const QnaBoard = require('../models/QnaBoard');
const QnaComment = require('../models/QnaComment');

// ✅ QnA 게시글 작성
const createQnaBoard = async (
  userId,
  category,
  title,
  content,
  images = [],
  attachments = []
) => {
  try {
    console.log('📌 QnA 게시글 저장 데이터:', {
      userId,
      category,
      title,
      content,
      images,
      attachments
    });

    if (!category || !title || !content) {
      throw new Error('카테고리, 제목, 내용을 입력해야 합니다.');
    }

    const qnaBoard = new QnaBoard({
      user: userId,
      category,
      title,
      content,
      images,
      attachments
    });

    await qnaBoard.save();
    return qnaBoard;
  } catch (error) {
    console.error('❌ Error creating QnA Board:', error);
    throw new Error('QnA 게시글 생성 중 오류 발생');
  }
};

// ✅ QnA 게시글 목록 조회 (페이징 처리)
const getQnaBoards = async (page = 1, limit = 10, category = null) => {
  try {
    const query = category ? {category} : {}; // 특정 카테고리 필터 적용

    const qnaBoards = await QnaBoard.find(query)
      .populate({
        path: 'user', // 🔹 유저 정보 가져오기
        select: 'username email userid' // ✅ username과 email을 반드시 가져오도록 설정
      })
      .sort({createdAt: -1}) // 최신순 정렬
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await QnaBoard.countDocuments(query);

    return {qnaBoards, total, totalPages: Math.ceil(total / limit)};
  } catch (error) {
    console.error('❌ Error fetching QnA Boards:', error);
    throw new Error('QnA 게시글 목록 조회 중 오류 발생');
  }
};

// ✅ 특정 QnA 게시글 조회 (상세보기)
const getQnaBoardById = async qnaBoardId => {
  try {
    const qnaBoard = await QnaBoard.findById(qnaBoardId)
      .populate('user', 'name userid email roles') // ✅ 사용자 정보 추가
      .lean();

    if (!qnaBoard) throw new Error('QnA 게시글을 찾을 수 없습니다.');
    return qnaBoard;
  } catch (error) {
    console.error('❌ Error fetching QnA Board:', error);
    throw new Error('QnA 게시글 조회 중 오류 발생');
  }
};

// ✅ QnA 게시글 삭제
const deleteQnaBoard = async (qnaBoardId, userId, isAdmin = false) => {
  try {
    const qnaBoard = await QnaBoard.findById(qnaBoardId);
    if (!qnaBoard) throw new Error('QnA 게시글을 찾을 수 없습니다.');

    if (!isAdmin && qnaBoard.user.toString() !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await QnaBoard.deleteOne({_id: qnaBoardId});
    await QnaComment.deleteMany({qnaBoard: qnaBoardId});
    return {message: 'QnA 게시글이 삭제되었습니다.'};
  } catch (error) {
    console.error('❌ Error deleting QnA Board:', error);
    throw new Error('QnA 게시글 삭제 중 오류 발생');
  }
};

// ✅ QnA 댓글 작성
const createQnaComment = async (qnaBoardId, userId, content, isAdmin = false) => {
  try {
    const qnaBoard = await QnaBoard.findById(qnaBoardId);
    if (!qnaBoard) throw new Error('QnA 게시글을 찾을 수 없습니다.');

    const qnaComment = new QnaComment({
      qnaBoard: qnaBoardId,
      user: userId,
      content,
      isAdmin
    });

    await qnaComment.save();

    if (isAdmin) {
      qnaBoard.isAnswered = true;
      await qnaBoard.save();
    }

    return qnaComment;
  } catch (error) {
    console.error('❌ Error creating QnA Comment:', error);
    throw new Error('QnA 댓글 작성 중 오류 발생');
  }
};

// ✅ QnA 댓글 목록 조회
const getQnaComments = async (qnaBoardId, page = 1, limit = 5) => {
  try {
    const comments = await QnaComment.find({qnaBoard: qnaBoardId})
      .populate('user', 'name userid email roles') // ✅ 사용자 정보 추가
      .sort({createdAt: -1})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await QnaComment.countDocuments({qnaBoard: qnaBoardId});

    return {comments, total, totalPages: Math.ceil(total / limit)};
  } catch (error) {
    console.error('❌ Error fetching QnA Comments:', error);
    throw new Error('QnA 댓글 조회 중 오류 발생');
  }
};

// ✅ QnA 댓글 삭제
const deleteQnaComment = async (commentId, userId, isAdmin = false) => {
  try {
    if (!commentId || commentId === 'undefined') {
      throw new Error('유효한 댓글 ID가 필요합니다.');
    }

    const qnaComment = await QnaComment.findById(commentId);
    if (!qnaComment) throw new Error('QnA 댓글을 찾을 수 없습니다.');

    if (!isAdmin && qnaComment.user.toString() !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await QnaComment.deleteOne({_id: commentId});

    return {message: 'QnA 댓글이 삭제되었습니다.'};
  } catch (error) {
    console.error('❌ Error deleting QnA Comment:', error);
    throw new Error('QnA 댓글 삭제 중 오류 발생');
  }
};

module.exports = {
  createQnaBoard,
  getQnaBoards,
  getQnaBoardById,
  deleteQnaBoard,
  createQnaComment,
  getQnaComments,
  deleteQnaComment
};
