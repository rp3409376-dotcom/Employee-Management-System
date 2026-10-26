import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import usersRouter from "./routes/users.js";
import leavesRouter from "./routes/leaves.js";
import salariesRouter from "./routes/salaries.js";
import connectToDatabase from "./db/db.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/department",departmentRouter)
app.use("/api/users", usersRouter);
app.use("/api/leaves", leavesRouter);
app.use("/api/salaries", salariesRouter);

const startServer = async () => {
    await connectToDatabase();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
});