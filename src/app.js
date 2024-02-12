import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import { createServer } from "http";
import passport from "passport";
import requestIp from "request-ip";
import { Server } from "socket.io";
import { ApiError } from "./utils/ApiError.js";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";

const app = express();

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const admin = new AdminJS({
  resources: [
    User,
    SocialPost,
    SocialComment,
    SocialFollow,
    SocialLike,
    ChatMessage,
    Chat,
  ],
});

const adminRouter = AdminJSExpress.buildRouter(admin);
app.use(admin.options.rootPath, adminRouter);
admin.watch();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

// global middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(requestIp.mw());

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// * Public routes

// * App routes
import userRouter from "./routes/apps/auth/user.routes.js";

import socialBookmarkRouter from "./routes/apps/social-media/bookmark.routes.js";
import socialCommentRouter from "./routes/apps/social-media/comment.routes.js";
import socialFollowRouter from "./routes/apps/social-media/follow.routes.js";
import socialLikeRouter from "./routes/apps/social-media/like.routes.js";
import socialPostRouter from "./routes/apps/social-media/post.routes.js";
import socialProfileRouter from "./routes/apps/social-media/profile.routes.js";

import chatRouter from "./routes/apps/chat-app/chat.routes.js";
import messageRouter from "./routes/apps/chat-app/message.routes.js";
import gstnRouter from "./routes/apps/verify-gstn/gstn.routes.js";
import { User } from "./models/apps/auth/user.models.js";
import { SocialPost } from "./models/apps/social-media/post.models.js";
import { SocialComment } from "./models/apps/social-media/comment.models.js";
import { SocialFollow } from "./models/apps/social-media/follow.models.js";
import { SocialLike } from "./models/apps/social-media/like.models.js";
import { ChatMessage } from "./models/apps/chat-app/message.models.js";
import { Chat } from "./models/apps/chat-app/chat.models.js";

// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// * App apis
app.use("/api/v1/users", userRouter);

app.use("/api/v1/bnm/profile", socialProfileRouter);
app.use("/api/v1/bnm/follow", socialFollowRouter);
app.use("/api/v1/bnm/posts", socialPostRouter);
app.use("/api/v1/bnm/like", socialLikeRouter);
app.use("/api/v1/bnm/bookmarks", socialBookmarkRouter);
app.use("/api/v1/bnm/comments", socialCommentRouter);

app.use("/api/v1/bnm/chats", chatRouter);
app.use("/api/v1/bnm/messages", messageRouter);
app.use("/api/v1/bnm/verify-gstn", gstnRouter);

// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
// app.use(
//   "/",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, {
//     swaggerOptions: {
//       docExpansion: "none", // keep all the sections collapsed by default
//     },
//     customSiteTitle: "FreeAPI docs",
//   })
// );

// common error handling middleware
app.use(errorHandler);

export { httpServer };
