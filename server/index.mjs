const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { exec } = require("child_process");
const Docker = require("dockerode");
const PocketBase = require('pocketbase/cjs')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 3001;
const docker = new Docker();
const activePorts = new Set();
const activeProjects = {};

app.use(cors());
app.use(express.json());

const pb = new PocketBase("http://127.0.0.1:8090/");
pb.admins.authWithPassword("server@admin.com", "rUcjYvE5KagPU4v");

// Utility function to find an available port.
const findAvailablePort = async (start = 5000, end = 6000) => {
    for (let port = start; port <= end; port++) {
        if (!activePorts.has(port)) {
            activePorts.add(port);
            return port;
        }
    }
    throw new Error("No available ports.");
};

const cleanupPort = (port) => activePorts.delete(port);

const setupContainer = async (repoUrl, socket) => {
    socket.emit("log", "Cloning repository...");
    const repoName = repoUrl.split("/").pop().replace(".git", "");
    const workingDir = `/tmp/${repoName}`;

    try {
        await execPromise(`git clone ${repoUrl} ${workingDir}`);
        socket.emit("log", "Repository cloned successfully.");

        const port = await findAvailablePort();

        const container = await docker.createContainer({
            Image: "node:23-slim",
            Cmd: ["sh", "-c", `cd /app && npm install && npm start`],
            HostConfig: {
                Binds: [`${workingDir}:/app`],
                PortBindings: { "3000/tcp": [{ HostPort: port.toString() }] },
            },
        });

        socket.emit("log", "Starting Docker container...");
        await container.start();

        container.on("die", () => {
            cleanupPort(port);
            socket.emit("log", `Container stopped. Port ${port} is now available.`);
        });

        socket.emit("log", `Deployment successful. Running on port ${port}.`);
        return { port };
    } catch (error) {
        socket.emit("log", `Error during deployment: ${error.message}`);
        throw error;
    }
};

const execPromise = (cmd) =>
    new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) reject(stderr || stdout);
            else resolve(stdout);
        });
    });

// Socket.IO logic.
io.on("connection", (socket) => {
    console.log("Client connected.");

    socket.on("join_project", (projectId) => {
        if (!projectId) {
            socket.disconnect(true);
            return;
        }

        socket.join(projectId);
        socket.data.projectId = projectId;

        console.log(`Client joined project: ${projectId}`);
        activeProjects[projectId] = activeProjects[projectId] || [];
        activeProjects[projectId].push(socket.id);

        socket.emit("log", `Joined project ${projectId}`);
    });

    socket.on("deploy", async (repoUrl) => {
        const projectId = socket.data.projectId;
        if (!repoUrl || !projectId) {
            socket.emit("error", "Repository URL and Project ID are required.");
            return;
        }

        try {
            io.to(projectId).emit("log", `Starting deployment for ${repoUrl}...`);
            const { port } = await setupContainer(repoUrl, socket);

            pb.collections.update(projectId, {})
            io.to(projectId).emit("log", `Deployment successful on port ${port}.`);
        } catch (error) {
            io.to(projectId).emit("log", `Deployment failed: ${error.message}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected.");
        const projectId = socket.data.projectId;
        if (projectId) {
            activeProjects[projectId] = activeProjects[projectId].filter((id) => id !== socket.id);
            if (activeProjects[projectId].length === 0) {
                delete activeProjects[projectId];
            }
        }
    });
});

// Middleware to validate project connection.
io.use((socket, next) => {
    const projectId = socket.handshake.auth.projectId;
    if (!projectId) {
        return next(new Error("Project ID is required to connect."));
    }
    socket.data.projectId = projectId;
    next();
});

// Health check endpoint.
app.get("/", (req, res) => {
    res.send("Server is running.");
});

// Start the server.
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
