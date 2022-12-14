import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import authroutes from "./routes/auth.js";
import userroutes from "./routes/user.js";
import postsroutes from "./routes/posts.js";
import { register } from "./controller/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { createPost } from "./controller/posts.js";
import { verifyToken } from "./middleware/auth.js";
import { users, posts } from "./data/data.js";

//-----Configurations-----//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* File Storage */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
})
const upload = multer({ storage });

/* Routes with files */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authroutes);
app.use("/user", userroutes);
app.use("/posts", postsroutes);

/* ADD DATA ONE TIME */
// User.insertMany(users);
// Post.insertMany(posts);

/* Mongoose */
const PORT = process.env.PORT || 5000;
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, console.log(`SERVER RUNNING: ${PORT}`))
}).catch((error) => console.log(`${error} did not connect`));