"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const messagesRoute_1 = __importDefault(require("./routes/messagesRoute"));
const socket = require("socket.io");
const app = (0, express_1.default)();
require("dotenv").config();
app.use((0, cors_1.default)());
app.use(function (req, res, next) {
    // intercept OPTIONS method
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});
//: Parses JSON and urlencoded request bodies with a maximum size of 30MB.
app.use(body_parser_1.default.json({ limit: "30mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "30mb", extended: true }));
app.use(express_1.default.json());
//: Mounts the user authentication and messaging routes under the "/api/auth" path.
app.use("/api/auth", userRoutes_1.default);
app.use("/api/messages", messagesRoute_1.default);
mongoose_1.default
    .connect(process.env.MONGO_URL)
    .then(() => {
    console.log("DB Connection Succesfull!");
})
    .catch((err) => {
    console.log(err.message);
});
const server = app.listen(process.env.PORT, () => {
    console.log(`Speak Lord!! Your server is running on Port ${process.env.PORT}`);
});
const io = socket(server, {
    cors: {
        origin: ["*", "https://talku-copy-b9uu.vercel.app", "https://talku-copy-n0xb5q8lc-sam-boasmans-projects.vercel.app", "https://talku-copy.vercel.app"],
        credentials: true,
    },
});
global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });
});
