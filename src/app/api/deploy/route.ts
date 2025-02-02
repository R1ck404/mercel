import { NextApiRequest, NextApiResponse } from "next";
import Docker from "dockerode";
import { exec } from "child_process";
import { cookies } from "next/headers";
import { createServerClient } from "next-pocketbase-auth";
import { NextRequest, NextResponse } from "next/server";
import { setupContainer } from "@/core/lib/docker-helper";
import { createGitHubWebhook, getLatestCommit } from "@/core/lib/github-helper";

export async function POST(req: NextRequest) {
    const pb = createServerClient(await cookies());
    const session = pb.authStore.record;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { repoUrl, projectId } = await req.json() as any;

    if (!repoUrl || !projectId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await validateProjectOwnership(projectId, session.id);

    if (!project) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = project.url.replace("https://github.com/", "");
    const [owner, name] = url.split("/");

    if (!owner || !name) {
        return NextResponse.json({ error: "Invalid repository URL" }, { status: 400 });
    }

    const latestCommit = await getLatestCommit(session.access_token, owner, name);

    const deployment = await pb.collection("deployments").create({
        repository: projectId,
        status: "BUILDING",
        build_logs: [],
        commit: latestCommit[0],
    });

    try {
        const repository_url = repoUrl.replace("https://api.github.com/repos/", "https://github.com/");
        const { port, container, build_logs } = await setupContainer(repository_url, pb, deployment, session.access_token);

        const public_url = `${process.env.NEXT_PUBLIC_API_URL}`;
        const webhookUrl = `${public_url}api/webhook/listen`;
        const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "webhook_secret";
        const webhookId = await createGitHubWebhook(session.access_token, project.full_name, webhookUrl, webhookSecret).catch((error: any) => {
            console.error("Error creating webhook:", error);
            return "unknown";
        });

        await pb.collection("repositories").update(projectId, {
            docker_id: container.id,
            domain_data: {
                domains: project.domain_data.domains,
                port: port,
            },
            commit: latestCommit[0],
            webhook_id: webhookId,
        }).catch((error: any) => {
            console.error("Error updating repository:", error);
        });

        return NextResponse.json({
            data: {
                message: "Deployment successful.",
                projectId,
                port,
                deploymentId: deployment.id,
            },
            status: 200,
        }, { status: 200 });
    } catch (error: any) {
        const updatedBuildLogs = Array.isArray(deployment?.build_logs) ? deployment.build_logs : [];
        updatedBuildLogs.push(error.message);

        await pb.collection("deployments").update(deployment.id, {
            status: "ERROR",
            build_logs: updatedBuildLogs,
        });

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function validateProjectOwnership(projectId: string, userId: string) {
    const project = await fetchProjectFromDatabase(projectId);
    return project?.owner === userId ? project : null;
}

async function fetchProjectFromDatabase(projectId: string) {
    const pb = createServerClient(await cookies());
    return pb.collection("repositories").getOne(projectId);
}