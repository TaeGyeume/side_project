const Board = require('../models/Board');

// 게시물 생성
exports.createBoard = async (req, res) => {
  try {
    const { title, content, media } = req.body;

    // media 필드 유효성 검사
    if (!media || media.length === 0) {
      return res.status(400).json({ message: '이미지 또는 영상을 최소 하나 이상 포함해야 합니다.' });
    }

    const newPost = new Board({ title, content, media });
    await newPost.save();

    res.status(201).json({ message: '게시물이 성공적으로 생성되었습니다.', post: newPost });
  } catch (error) {
    res.status(500).json({ message: '게시물 생성 중 오류가 발생했습니다.', error });
  }
};

// 게시물 목록 조회
exports.getBoards = async (req, res) => {
  try {
    const posts = await Board.find().sort({ createdAt: -1 }); // 최신순 정렬
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: '게시물 목록을 불러오는 중 오류가 발생했습니다.', error });
  }
};

// 특정 게시물 조회
exports.getBoardById = async (req, res) => {
  try {
    const post = await Board.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: '게시물을 불러오는 중 오류가 발생했습니다.', error });
  }
};
