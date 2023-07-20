const express = require('express');
const tweetController = require('../controllers/tweetController');
const authController = require('../controllers/authController');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '_' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/webp'
    )
        cb(null, true);
    else cb(null, false);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: fileFilter,
});

const router = express.Router();

router.get('/getAllTweets', tweetController.getAllTweets);
router.post(
    '/postTweet',
    authController.protect,
    upload.single('tweetImage'),
    tweetController.postTweet
);
router.delete(
    '/deleteTweet/:id',
    authController.protect,
    tweetController.deleteTweet
);
router.patch('/retweet/:id', authController.protect, tweetController.retweet);
router.patch('/like/:id', authController.protect, tweetController.like);
router.post(
    '/addComment/:id',
    authController.protect,
    tweetController.addComment
);

module.exports = router;
