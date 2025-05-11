const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator'); 
require('dotenv').config();

const Otp = require('../models/Otp');

const {
    isLoggedIn,
    saveRedirectUrl,
    isAdmin,
    ensureAuthenticated,
  } = require("../middlewares/login.js");

const Blog = require("../models/Blog.js");


//   const blog = await Blog.findById(blogId)
//   .populate('author', 'name email');

// const comments = await Comment.find({ blog: blogId })
//   .populate('user', 'name')
//   .sort({ createdAt: -1 }); // optional: newest first


  //All Blogs
  router.get('/show/all/blogs', async (req,res)=>{
    const blogs = await Blog.find()
    .populate('author','name email');
    res.render('student/allBlogs.ejs');
  })

  //This Blog
  router.get('/show/this/bolg/:id', async ()=>{
    res.render('student/thisBlog.ejs');
  })

  //new blog
  router.get('/add/new/blog', async(req,res)=>{
    res.render('student/newBlog.ejs');
  })

  router.post('/add/new/blog', async (req, res) => {
    try {
      const user = req.user.id;
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ status: 'error', message: 'Title and content are required.' });
      }
      const newBlog = new Blog({ title, content,author:user });
      await newBlog.save();
      res.status(201).json({ status: 'ok', message: 'Blog added successfully', blog: newBlog });
    } catch (error) {
      console.error('Error adding blog:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });
  

module.exports = router;