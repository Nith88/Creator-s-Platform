import Post from '../models/Post.js';

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, category, status } = req.body;

    const newPost = new Post({
      title,
      content,
      category,
      status,
      author: req.user._id
    });

    const savedPost = await newPost.save();

    /* 📡 EMIT EVENT (USER-SPECIFIC) */
    req.io.to(req.user._id.toString()).emit('newPost', {
      message: `New post created by ${req.user.name}`,
      post: {
        _id: savedPost._id,
        title: savedPost.title,
        createdBy: req.user.name
      }
    });

    res.status(201).json({
      success: true,
      data: savedPost
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
};
// @desc    Get posts with pagination
// @route   GET /api/posts?page=1&limit=10
// @access  Private
export const getPosts = async (req, res) => {
  try {
    // Get page and limit from query params (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get posts for logged-in user only
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email'); // Include author info

    // Get total count for pagination
    const total = await Post.countDocuments({ author: req.user._id });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};
// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await post.deleteOne();

    /* 📡 EMIT DELETE EVENT */
    req.io.to(req.user._id.toString()).emit('post_deleted', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: { id: req.params.id }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post'
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { title, content, category, status } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (status) post.status = status;

    const updatedPost = await post.save();

    /* 📡 EMIT UPDATE EVENT */
    req.io.to(req.user._id.toString()).emit('post_updated', {
      _id: updatedPost._id,
      title: updatedPost.title,
      content: updatedPost.content,
      category: updatedPost.category,
      status: updatedPost.status
    });

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating post'
    });
  }
};
// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this post'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};