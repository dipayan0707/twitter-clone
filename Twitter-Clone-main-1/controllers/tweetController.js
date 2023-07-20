const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const { cloudinary } = require('../utils/cloudinary');

exports.getAllTweets = catchAsync(async (req, res, next) => {
    const tweets = await Tweet.find()
        .populate(['postedBy', 'comments'])
        .populate({ path: 'comments', populate: { path: 'postedBy' } })
        .sort({ postedOn: -1 });

    res.status(200).json({
        status: 'success',
        data: {
            tweets,
        },
    });
});

exports.postTweet = catchAsync(async (req, res, next) => {
    console.log(req.file);
    let cloudinaryResponse;
    if (req.file) {
        cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'dev_setups',
        });
    }

    const tweet = await Tweet.create({
        postedBy: req.user,
        tweet: req.body.tweet,
        image: cloudinaryResponse?.url,
    });

    const user = req.user._id;
    const postedUser = await User.findById(user);
    postedUser.tweets.push(tweet._id);
    const updatedUser = await User.findByIdAndUpdate(user, postedUser);
    res.status(200).json({
        status: 'success',
        data: {
            tweet,
        },
    });
});

exports.deleteTweet = catchAsync(async (req, res, next) => {
    // 1) This should have been a protected route
    // 2) Only the user who has posted should be able to delete it

    const user = req.user._id;
    const tweet = await Tweet.findById(req.params.id);
    const postedUser = tweet.postedBy;
    if (JSON.stringify(user) === JSON.stringify(postedUser)) {
        const deletedTweet = await Tweet.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: 'success',
            data: { deletedTweet },
        });
    } else {
        res.status(401).json({
            status: 'fail',
            message: 'You dont have access to do this',
        });
    }
});

exports.retweet = catchAsync(async (req, res, next) => {
    const user = req.user._id;
    const tweetId = req.params.id;
    const tweet = await Tweet.findById(tweetId);
    const retweetedUsers = tweet.retweets;
    if (retweetedUsers.includes(user)) {
        tweet.retweets = retweetedUsers.filter(
            (a) => JSON.stringify(a) !== JSON.stringify(user)
        );
    } else {
        tweet.retweets.push(user);
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, tweet, {
        new: true,
    }).populate('postedBy');
    res.status(200).json({
        status: 'success',
        data: {
            updatedTweet,
        },
    });
});

exports.like = catchAsync(async (req, res, next) => {
    const user = req.user._id;
    const tweetId = req.params.id;
    const tweet = await Tweet.findById(tweetId);
    const likedUsers = tweet.likes;
    if (likedUsers.includes(user)) {
        tweet.likes = likedUsers.filter(
            (a) => JSON.stringify(a) !== JSON.stringify(user)
        );
    } else {
        tweet.likes.push(user);
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, tweet, {
        new: true,
    }).populate('postedBy');
    res.status(200).json({
        status: 'success',
        data: {
            updatedTweet,
        },
    });
});

exports.addComment = catchAsync(async (req, res, next) => {
    const user = req.user._id;
    const tweetId = req.params.id;
    const tweet = await Tweet.findById(tweetId);
    const postedUser = await User.findById(user);

    const comment = await Tweet.create({
        postedBy: req.user,
        tweet: req.body.tweet,
    });

    tweet.comments.push(comment._id);
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, tweet);
    postedUser.comments.push({
        comment: comment._id,
        commentOn: tweetId,
    });

    const updatedUser = await User.findByIdAndUpdate(user, postedUser);

    res.status(200).json({
        status: 'success',
        data: {
            comment,
        },
    });
});
