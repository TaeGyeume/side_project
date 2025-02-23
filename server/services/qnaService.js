const fs = require('fs');
const path = require('path');
const QnaBoard = require('../models/QnaBoard');
const QnaComment = require('../models/QnaComment');

//  QnA 게시글 작성
const createQnaBoard = async (
  userId,
  category,
  title,
  content,
  images = [],
  attachments = []
) => {
  try {
    console.log(' QnA 게시글 저장 데이터:', {
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

    //  MongoDB 저장 직전 데이터 검사
    if (!userId) {
      throw new Error('유효한 사용자 ID가 필요합니다.');
    }

    //  게시글 저장
    const qnaBoard = new QnaBoard({
      user: userId,
      category,
      title,
      content,
      images,
      attachments
    });

    console.log(' MongoDB에 저장할 데이터:', qnaBoard);

    await qnaBoard.save();

    console.log(' MongoDB 저장 완료:', qnaBoard);

    return qnaBoard;
  } catch (error) {
    console.error(' QnA 게시글 저장 중 오류 발생:', error);
    throw new Error('QnA 게시글 생성 중 오류 발생');
  }
};

//  QnA 게시글 목록 조회 (페이징 처리)
const getQnaBoards = async (page = 1, limit = 10, category = null) => {
  try {
    const query = category ? {category} : {}; // 특정 카테고리 필터 적용

    const qnaBoards = await QnaBoard.find(query)
      .populate({
        path: 'user',
        select: 'username email userid'
      })
      .sort({createdAt: -1}) // 최신순 정렬
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await QnaBoard.countDocuments(query);

    return {qnaBoards, total, totalPages: Math.ceil(total / limit)};
  } catch (error) {
    throw new Error('QnA 게시글 목록 조회 중 오류 발생');
  }
};

//  특정 QnA 게시글 조회 (상세보기)
const getQnaBoardById = async qnaBoardId => {
  try {
    const qnaBoard = await QnaBoard.findById(qnaBoardId)
      .populate('user', 'name userid email roles username')
      .lean();

    if (!qnaBoard) throw new Error('QnA 게시글을 찾을 수 없습니다.');
    return qnaBoard;
  } catch (error) {
    throw new Error('QnA 게시글 조회 중 오류 발생');
  }
};

//  QnA 게시글 삭제 (관련 댓글도 함께 삭제)
const deleteQnaBoard = async (qnaBoardId, userId, isAdmin = false) => {
  try {
    const qnaBoard = await QnaBoard.findById(qnaBoardId);
    if (!qnaBoard) throw new Error('QnA 게시글을 찾을 수 없습니다.');

    if (!isAdmin && qnaBoard.user.toString() !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    const uploadDir = path.join(__dirname, '../uploads/qna');

    //  1. 해당 게시글의 이미지 및 첨부파일 삭제
    [...qnaBoard.images, ...qnaBoard.attachments].forEach(filePath => {
      const fullPath = path.join(uploadDir, path.basename(filePath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    //  2. 게시글 및 댓글 삭제
    await QnaBoard.deleteOne({_id: qnaBoardId});
    await QnaComment.deleteMany({qnaBoard: qnaBoardId});

    return {message: 'QnA 게시글이 삭제되었습니다.'};
  } catch (error) {
    throw new Error('QnA 게시글 삭제 중 오류 발생');
  }
};

//  QnA 댓글 작성
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
    throw new Error('QnA 댓글 작성 중 오류 발생');
  }
};

//  QnA 댓글 목록 조회
const getQnaComments = async (qnaBoardId, page = 1, limit = 5) => {
  try {
    const comments = await QnaComment.find({qnaBoard: qnaBoardId})
      .populate('user', 'username email')
      .sort({createdAt: -1})
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await QnaComment.countDocuments({qnaBoard: qnaBoardId});

    return {comments, total, totalPages: Math.ceil(total / limit)};
  } catch (error) {
    throw new Error('QnA 댓글 조회 중 오류 발생');
  }
};

//  QnA 댓글 삭제
const deleteQnaComment = async (commentId, userId, userRoles) => {
  try {
    const comment = await QnaComment.findById(commentId);
    if (!comment) {
      throw new Error('해당 댓글을 찾을 수 없습니다.');
    }

    if (comment.user.toString() !== userId && !userRoles.includes('admin')) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await QnaComment.findByIdAndDelete(commentId);
    return {message: 'QnA 댓글이 삭제되었습니다.'};
  } catch (error) {
    throw new Error('QnA 댓글 삭제 중 오류 발생');
  }
};

const updateQnaBoard = async (
  qnaBoardId,
  userId,
  category,
  title,
  content,
  images = [],
  attachments = [],
  deletedImages = [],
  deletedAttachments = []
) => {
  try {
    console.log('🛠️ [DEBUG] QnA 게시글 수정 요청 수신');
    console.log('📌 수정할 게시글 ID:', qnaBoardId);
    console.log('👤 사용자 ID:', userId);
    console.log('📂 삭제할 이미지:', deletedImages);
    console.log('📄 삭제할 첨부파일:', deletedAttachments);
    console.log('📎 새로 업로드된 이미지:', images);
    console.log('📑 새로 업로드된 첨부파일:', attachments);

    // 1) 게시글 찾기
    const qnaBoard = await QnaBoard.findById(qnaBoardId);
    if (!qnaBoard) throw new Error('QnA 게시글을 찾을 수 없습니다.');
    if (qnaBoard.user.toString() !== userId) {
      throw new Error('수정 권한이 없습니다.');
    }

    const uploadDir = path.join(__dirname, '../uploads/qna');

    // 2) 삭제할 파일들 처리
    const deleteFiles = (files, type) => {
      if (!Array.isArray(files)) {
        console.warn(`⚠️ [WARN] ${type}가 배열이 아닙니다:`, files);
        return;
      }
      files.forEach(filePath => {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, err => {
            if (err) console.error(`❌ ${type} 삭제 실패: ${fullPath}`, err);
            else console.log(`✅ 삭제된 ${type}: ${fullPath}`);
          });
        } else {
          console.warn(`⚠️ 삭제할 ${type}가 존재하지 않음: ${fullPath}`);
        }
      });
    };

    deleteFiles(deletedImages, '이미지');
    deleteFiles(deletedAttachments, '첨부파일');

    // 3) 기존 이미지에서 deletedImages에 포함된 것은 제외
    const remainingOldImages = qnaBoard.images.filter(
      imgPath => !deletedImages.includes(imgPath)
    );
    // 새로 들어온 images를 합쳐 최종 배열 구성
    // => 기존 + 새 이미지
    const mergedImages = [...remainingOldImages, ...images];

    // 4) 첨부파일도 마찬가지
    const remainingOldAttachments = qnaBoard.attachments.filter(
      filePath => !deletedAttachments.includes(filePath)
    );
    const mergedAttachments = [...remainingOldAttachments, ...attachments];

    // 5) DB에 최종 반영
    qnaBoard.category = category || qnaBoard.category;
    qnaBoard.title = title || qnaBoard.title;
    qnaBoard.content = content || qnaBoard.content;
    qnaBoard.images = mergedImages; // 이미지 병합 결과
    qnaBoard.attachments = mergedAttachments; // 첨부파일 병합 결과

    console.log('✅ 최종 업데이트할 이미지:', qnaBoard.images);
    console.log('✅ 최종 업데이트할 첨부파일:', qnaBoard.attachments);

    await qnaBoard.save();

    console.log('✅ QnA 게시글 수정 완료:', qnaBoard);
    return {message: 'QnA 게시글이 수정되었습니다.', qnaBoard};
  } catch (error) {
    console.error('❌ QnA 게시글 수정 중 오류 발생:', error);
    throw new Error('QnA 게시글 수정 중 오류 발생: ' + error.message);
  }
};

module.exports = {
  createQnaBoard,
  getQnaBoards,
  getQnaBoardById,
  deleteQnaBoard,
  createQnaComment,
  getQnaComments,
  deleteQnaComment,
  updateQnaBoard
};
