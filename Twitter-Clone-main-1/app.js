const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const tweetRouter = require('./routes/tweetRoutes');

const app = express();

app.use('/uploads', express.static('uploads'));

// app.use(
//     cors({
//         credentials: true,
//         origin: 'http://localhost:3000',
//     })
// );
app.use(
    cors({
        credentials: true,
        origin: 'https://twitter-niket.netlify.app',
    })
);
const limiter = rateLimit({
    max: 10000, // No of requests allowed from a single IP in one window
    windowMs: 15 * 60 * 1000, // One window 15 minutes
});
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(express.json({ limit: '1mb', extended: true }));

app.use(limiter);
app.use(cookieParser());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tweets', tweetRouter);

module.exports = app;
