const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()
        .populate('tweets')
        .populate({ path: 'tweets', populate: { path: 'postedBy' } });
    res.status(200).json({
        status: 'success',
        data: {
            users,
        },
    });
});

exports.follow = catchAsync(async (req, res, next) => {
    const follower = req.user._id;
    const following = req.params.id;

    if (JSON.stringify(follower) !== JSON.stringify(following)) {
        const followerUser = await User.findById(follower);
        const followingUser = await User.findById(following);

        if (followerUser.following.includes(following)) {
            followerUser.following = followerUser.following.filter(
                (a) => JSON.stringify(a) !== JSON.stringify(following)
            );
            followingUser.followers = followingUser.followers.filter(
                (a) => JSON.stringify(a) !== JSON.stringify(follower)
            );
        } else {
            followerUser.following.push(following);
            followingUser.followers.push(follower);
        }

        const updatedUser = await User.findByIdAndUpdate(
            follower,
            followerUser,
            { new: true }
        );
        const updatedUser2 = await User.findByIdAndUpdate(
            following,
            followingUser
        );

        res.status(200).json({
            status: 'success',
            data: {
                updatedUser,
            },
        });
    } else {
        res.status(401).json({
            status: 'fail',
            message: 'You cannot follow yourself !!',
        });
    }
});

exports.editProfile = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            aboutMe: req.body.aboutMe,
        },
        { new: true }
    )
        .populate('tweets')
        .populate({ path: 'tweets', populate: { path: 'postedBy' } });

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser,
        },
    });
});
