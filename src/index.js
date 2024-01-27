import dotenv from "dotenv";
import { httpServer } from "./app.js";
import connectDB from "./db/index.js";
import express from "express";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";

dotenv.config({
  path: "./.env",
});

/**
 * Starting from Node.js v14 top-level await is available and it is only available in ES modules.
 * This means you can not use it with common js modules or Node version < 14.
 */
const majorNodeVersion = +process.env.NODE_VERSION?.split(".")[0] || 0;

const startServer = () => {
  // const app = express();

  // const admin = new AdminJS({});
  // admin.watch();

  // const adminRouter = AdminJSExpress.buildRouter(admin);
  // app.use(admin.options.rootPath, adminRouter);

  httpServer.listen(process.env.PORT || 8080, () => {
    console.info(
      `📑 Visit the documentation at: http://localhost:${
        process.env.PORT || 8080
      }`
    );
    console.log("⚙️  Server is running on port: " + process.env.PORT);
    // console.log(
    //   `AdminJS started on http://localhost:${process.env.PORT}${admin.options.rootPath}`
    // );
  });
};

if (majorNodeVersion >= 14) {
  try {
    await connectDB();
    startServer();
  } catch (err) {
    console.log("Mongo db connect error: ", err);
  }
} else {
  connectDB()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      console.log("Mongo db connect error: ", err);
    });
}
