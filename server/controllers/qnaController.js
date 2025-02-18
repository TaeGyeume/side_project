const qnaService = require('../services/qnaService');
const multer = require('multer');

// ✅ Multer 설정 (파일 업로드 경로 및 파일 필터링)
const upload = multer({dest: 'uploads/'});

// ✅ QnA 게시글 작성
const createQnaBoard = async (req, res) => {
  try {
    // ✅ 요청 데이터 확인 (디버깅용)
    console.log('📌 Received QnA Data:', req.body);
    console.log('📌 Uploaded Files:', req.files);

    const {category, title, content} = req.body;
    const userId = req.user.id; // JWT 인증을 통해 가져온 사용자 ID

    // ✅ 파일 업로드 처리 (이미지 & 첨부파일)
    const images = req.files?.images ? req.files.images.map(file => file.path) : [];
    const attachments = req.files?.attachments
      ? req.files.attachments.map(file => file.path)
      : [];

    // ✅ 필수 데이터 확인
    if (!category || !title || !content) {
      return res.status(400).json({error: '카테고리, 제목, 내용을 입력해야 합니다.'});
    }

    // ✅ 서비스 호출
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
    const userId = req.user._id; // 🔥 req.user에서 가져옴
    const isAdmin = req.user.roles.includes('admin');

    console.log(`🛠 게시글 삭제 요청:`, {
      boardId: qnaBoardId,
      userId,
      roles: req.user.roles
    });

    const result = await qnaService.deleteQnaBoard(qnaBoardId, userId, isAdmin);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({error: error.message});
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

// QnA 댓글 삭제 (작성자 또는 관리자만 가능)
const deleteQnaComment = async (req, res) => {
  try {
    const {commentId} = req.params;
    const {id: userId, roles: userRoles} = req.user; // `req.user`에서 id와 roles 가져오기

    console.log('🛠 댓글 삭제 요청:', {commentId, userId, userRoles});

    const result = await qnaService.deleteQnaComment(commentId, userId, userRoles);
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error deleting QnA Comment:', error);
    return res.status(403).json({error: error.message});
  }
};

// ✅ 파일 업로드 포함한 라우트 (Multer 사용)
module.exports = {
  createQnaBoard: [
    upload.fields([
      {name: 'images', maxCount: 3},
      {name: 'attachments', maxCount: 5}
    ]),
    createQnaBoard
  ],
  getQnaBoards,
  getQnaBoardById,
  deleteQnaBoard,
  createQnaComment,
  getQnaComments,
  deleteQnaComment
};
