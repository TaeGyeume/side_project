const fs = require('fs');
const path = require('path');
const busboy = require('busboy');
const qnaService = require('../services/qnaService');

const createQnaBoard = async (req, res) => {
  try {
    const bb = busboy({headers: req.headers});
    const uploadDir = path.join(__dirname, '../uploads/qna');

    let formData = {
      category: '',
      title: '',
      content: '',
      images: [],
      attachments: []
    };

    let fileUploadPromises = [];
    let filesProcessed = 0;

    // ✅ 파일 저장
    bb.on('file', (name, file, info) => {
      console.log(`📌 파일 업로드 시작: ${info.filename}, 필드명: ${name}`);
      const {filename} = info;
      const saveTo = path.join(uploadDir, `${Date.now()}-${filename}`);
      const stream = fs.createWriteStream(saveTo);

      file.pipe(stream);

      file.on('end', () => {
        console.log(`✅ 파일 저장 완료: ${saveTo}`);

        // if (name === 'images') {
        // 'images' 또는 'images[]' 모두 허용
        if (name.startsWith('images')) {
          formData.images.push(`/uploads/qna/${path.basename(saveTo)}`);
          console.log(`📌 images 배열 추가됨: ${formData.images}`);
        } else if (name.startsWith('attachments')) {
          formData.attachments.push(`/uploads/qna/${path.basename(saveTo)}`);
        }
      });

      stream.on('error', err => {
        console.error('❌ 파일 저장 오류:', err);
      });

      fileUploadPromises.push(
        new Promise(resolve => {
          stream.on('finish', () => {
            console.log(`📌 파일 스트림 종료: ${saveTo}`);
            filesProcessed++;
            resolve();
          });
        })
      );
    });

    // ✅ 텍스트 필드 처리
    bb.on('field', (name, value) => {
      console.log(`📌 폼 필드 수신: ${name} = ${value}`);
      formData[name] = value;
    });

    // ✅ 모든 파일이 업로드될 때까지 기다린 후 데이터 처리
    bb.on('finish', async () => {
      try {
        console.log('✅ 모든 파일과 필드 수신 완료');
        await Promise.all(fileUploadPromises);

        console.log('📌 최종 저장할 데이터:', formData);
        const {category, title, content, images, attachments} = formData;
        const userId = req.user?.id;

        if (!category || !title || !content) {
          return res.status(400).json({error: '카테고리, 제목, 내용을 입력해야 합니다.'});
        }

        const qnaBoard = await qnaService.createQnaBoard(
          userId,
          category,
          title,
          content,
          images,
          attachments
        );

        console.log('✅ MongoDB 저장 완료:', qnaBoard);

        return res.status(201).json({
          message: 'QnA 게시글이 성공적으로 등록되었습니다.',
          qnaBoard
        });
      } catch (error) {
        console.error('❌ QnA 게시글 생성 오류:', error);
        return res.status(500).json({error: error.message});
      }
    });

    bb.on('error', err => {
      console.error('❌ Busboy 에러 발생:', err);
      return res.status(500).json({error: '파일 업로드 중 오류가 발생했습니다.'});
    });

    bb.on('close', () => {
      console.log('🚨 Busboy 스트림이 닫혔습니다.');
    });

    // ✅ 🚀 요청을 `busboy`로 전달
    req.pipe(bb);
    req.on('end', () => {
      console.log("📌 요청 종료됨 (req.on('end') 실행됨)");
    });
  } catch (error) {
    console.error('❌ QnA 처리 중 오류 발생:', error);
    return res.status(500).json({error: '서버 오류 발생'});
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
    // console.error('❌ Error fetching QnA Boards:', error);
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
    // console.error('❌ Error fetching QnA Board:', error);
    res.status(404).json({error: error.message});
  }
};

// ✅ QnA 게시글 삭제 (작성자 또는 관리자만 가능)
const deleteQnaBoard = async (req, res) => {
  try {
    const {qnaBoardId} = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.roles.includes('admin');

    console.log(`🛠 게시글 삭제 요청:`, {
      boardId: qnaBoardId,
      userId,
      roles: req.user.roles
    });

    // ✅ 1. 삭제할 게시글 정보 가져오기
    const qnaBoard = await qnaService.getQnaBoardById(qnaBoardId);
    if (!qnaBoard) {
      return res.status(404).json({error: '게시글을 찾을 수 없습니다.'});
    }

    // ✅ 2. 해당 게시글의 이미지 & 첨부파일 삭제
    const uploadDir = path.join(__dirname, '../uploads/qna');

    if (qnaBoard.images.length > 0) {
      qnaBoard.images.forEach(filePath => {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    if (qnaBoard.attachments.length > 0) {
      qnaBoard.attachments.forEach(filePath => {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // ✅ 3. 게시글 삭제
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
    // console.error('❌ Error fetching QnA Comments:', error);
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

//  QnA 게시글 수정 (작성자만 수정 가능)
const updateQnaBoard = async (req, res) => {
  try {
    const {qnaBoardId} = req.params;
    const {
      category,
      title,
      content,
      images,
      attachments,
      deletedImages,
      deletedAttachments
    } = req.body;
    const userId = req.user.id;

    //  1. 기존 파일 삭제 (deletedImages, deletedAttachments 전달 시)
    const uploadDir = path.join(__dirname, '../uploads/qna');

    if (deletedImages && deletedImages.length > 0) {
      deletedImages.forEach(filePath => {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath); // 서버에서 이미지 삭제
        }
      });
    }

    if (deletedAttachments && deletedAttachments.length > 0) {
      deletedAttachments.forEach(filePath => {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath); // 서버에서 첨부파일 삭제
        }
      });
    }

    //  2. 게시글 업데이트
    const result = await qnaService.updateQnaBoard(
      qnaBoardId,
      userId,
      category,
      title,
      content,
      images,
      attachments
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({error: error.message});
  }
};

// ✅ 파일 업로드 포함한 라우트 (Multer 사용)
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
