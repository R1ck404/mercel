import { Octokit } from "@octokit/rest";
import { createServerClient } from "next-pocketbase-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const pb = createServerClient(await cookies());
    const session = pb.authStore.record;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { accessToken, repoFullName, webhookId } = await req.json() as any;

    if (!accessToken || !repoFullName || !webhookId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    try {
        const octokit = new Octokit({ auth: accessToken });
        const [owner, repo] = repoFullName.split("/");

        await octokit.repos.deleteWebhook({
            owner,
            repo,
            hook_id: webhookId,
        });

        console.log("GitHub webhook deleted successfully");
    } catch (error) {
        console.error("Error deleting GitHub webhook:", error);
        throw new Error("Failed to delete GitHub webhook");
    }
};