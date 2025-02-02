import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "next-pocketbase-auth";
import { setupContainer } from "@/core/lib/docker-helper";
import { cookies } from "next/headers";
import { Webhooks } from "@octokit/webhooks";

const webhooks = new Webhooks({
    secret: process.env.GITHUB_WEBHOOK_SECRET || "",
});

export async function POST(req: NextRequest) {
    console.log("Webhook called");

    const webhookId = req.headers.get("X-GitHub-Hook-ID");
    if (!webhookId) {
        return NextResponse.json({ error: "Webhook ID not found in headers" }, { status: 400 });
    }

    const pb = createServerClient(await cookies());

    const signature = req.headers.get("x-hub-signature-256");
    if (!signature) {
        return NextResponse.json({ error: "Signature header missing" }, { status: 401 });
    }

    const payload = await req.text();

    if (!webhooks.verify(payload, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(payload);
    console.log("Parsed body:", body);

    if (body.ref === "refs/heads/main" && body.repository) {
        const project = await pb.collection("repositories").getFirstListItem(`webhook_id="${webhookId}"`, {
            expand: "owner",
        });

        console.log("Project:", project);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const deployment = await pb.collection("deployments").create({
            repository: project.id,
            status: "BUILDING",
            build_logs: [],
            commit: body.head_commit,
        });

        try {
            const { port, container, build_logs } = await setupContainer(
                project.url,
                pb,
                deployment,
                project.owner.access_token
            );

            await pb.collection("repositories").update(project.id, {
                docker_id: container.id,
                domain_data: {
                    domains: project.domain_data.domains,
                    port: port,
                },
            });

            return NextResponse.json({
                data: {
                    message: "Deployment successful.",
                    project: project.id,
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

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
}