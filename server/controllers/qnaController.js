const qnaService = require('../services/qnaService');

// ✅ QnA 게시글 작성
const createQnaBoard = async (req, res) => {
  try {
    const {category, title, content, images, attachments} = req.body;
    const userId = req.user.id; // JWT 인증을 통해 가져온 사용자 ID

    const qnaBoard = await qnaService.createQnaBoard(
      userId,
      category,
      title,
      content,
      images,
      attachments
    );
    res.status(201).json({message: 'QnA 게시글이 성공적으로 등록되었습니다.', qnaBoard});
  } catch (error) {
    console.error('❌ Error creating QnA Board:', error);
    res.status(500).json({error: error.message});
  }
};

// ✅ QnA 게시글 목록 조회 (페이징)
const getQnaBoards = async (req, res) => {
  try {
    const {page = 1, limit = 10, category} = req.query;

    const result = await qnaService.getQnaBoards(
      parseInt(page),
      parseInt(limit),
      category
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error fetching QnA Boards:', error);
    res.status(500).json({error: error.message});
  }
};

// ✅ 특정 QnA 게시글 조회 (상세보기)
const getQnaBoardById = async (req, res) => {
  try {
    const {qnaBoardId} = req.params;

    const qnaBoard = await qnaService.getQnaBoardById(qnaBoardId);
    res.status(200).json(qnaBoard);
  } catch (error) {
    console.error('❌ Error fetching QnA Board:', error);
    res.status(404).json({error: error.message});
  }
};

// ✅ QnA 게시글 삭제 (작성자 또는 관리자만 가능)
const deleteQnaBoard = async (req, res) => {
  try {
    const {qnaBoardId} = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin'; // 관리자 여부 확인

    const result = await qnaService.deleteQnaBoard(qnaBoardId, userId, isAdmin);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error deleting QnA Board:', error);
    res.status(403).json({error: error.message});
  }
};

// ✅ QnA 댓글 작성 (관리자 또는 사용자)
const createQnaComment = async (req, res) => {
  try {
    const {qnaBoardId} = req.params;
    const {content} = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin'; // 관리자 여부 확인

    const qnaComment = await qnaService.createQnaComment(
      qnaBoardId,
      userId,
      content,
      isAdmin
    );
    res.status(201).json({message: 'QnA 댓글이 등록되었습니다.', qnaComment});
  } catch (error) {
    console.error('❌ Error creating QnA Comment:', error);
    res.status(500).json({error: error.message});
  }
};

// ✅ QnA 댓글 목록 조회 (페이징 처리)
const getQnaComments = async (req, res) => {
  try {
    const {qnaBoardId} = req.params;
    const {page = 1, limit = 5} = req.query;

    const result = await qnaService.getQnaComments(
      qnaBoardId,
      parseInt(page),
      parseInt(limit)
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error fetching QnA Comments:', error);
    res.status(500).json({error: error.message});
  }
};

// ✅ QnA 댓글 삭제 (작성자 또는 관리자만 가능)
const deleteQnaComment = async (req, res) => {
  try {
    const {commentId} = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin'; // 관리자 여부 확인

    const result = await qnaService.deleteQnaComment(commentId, userId, isAdmin);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error deleting QnA Comment:', error);
    res.status(403).json({error: error.message});
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
