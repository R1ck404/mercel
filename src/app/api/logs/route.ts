import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "next-pocketbase-auth";
import { cookies } from "next/headers";
import DockerSingleton from "@/core/lib/docker-instance";
const StreamCleanser = require("docker-stream-cleanser");

export async function GET(req: NextRequest) {
    const pb = createServerClient(await cookies());
    const session = pb.authStore.record;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get("containerId");

    if (!containerId) {
        return NextResponse.json({ error: "Missing containerId" }, { status: 400 });
    }

    const docker = DockerSingleton.getInstance().getDocker();
    const container = docker.getContainer(containerId);

    try {
        const exec = await container.exec({
            Cmd: ["sh", "-c", "tail -f /app/output.log"],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({});

        const readableStream = new ReadableStream({
            start(controller) {
                const streamCleanser = new StreamCleanser();

                stream.on("data", (chunk: Buffer) => {
                    console.log("Received chunk from Docker:", chunk.toString());
                    streamCleanser.write(chunk);
                });

                streamCleanser.on("data", (cleanedChunk: Buffer) => {
                    const timestamp = new Date().toISOString();
                    const logLines = cleanedChunk.toString().split("\n");

                    logLines.forEach((line) => {
                        if (line.trim()) {
                            const logLine = `[${timestamp}] ${line}`;
                            console.log("Cleaned log line:", logLine);
                            controller.enqueue(logLine + "\n");
                        }
                    });
                });

                stream.on("end", () => {
                    console.log("Exec stream ended");
                    controller.close();
                });

                stream.on("error", (err) => {
                    console.error("Exec stream error:", err);
                    controller.error(err);
                });
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                "Content-Type": "text/plain",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Error streaming logs:", error);
        return NextResponse.json({ error: "Failed to stream logs" }, { status: 500 });
    }
};