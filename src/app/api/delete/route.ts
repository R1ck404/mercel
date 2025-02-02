import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "next-pocketbase-auth";
import Docker from "dockerode";
import { exec } from "child_process";
import { promisify } from "util";
import dns from "dns/promises";
import fs from "fs/promises";
import { Octokit } from "@octokit/rest";

const execAsync = promisify(exec);
const docker = new Docker();

export async function DELETE(req: NextRequest) {
    const pb = createServerClient(await cookies());
    const session = pb.authStore.record;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method !== "DELETE") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { projectId } = await req.json();

    if (!projectId) {
        return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    try {
        const repo = await pb.collection("repositories").getOne(projectId);
        if (!repo || repo.owner !== session.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (repo.docker_id) {
            try {
                const container = docker.getContainer(repo.docker_id);
                await container.stop();
                await container.remove();
                console.log(`Docker container ${repo.docker_id} removed`);
            } catch (error) {
                console.error("Error removing container:", error);
            }
        }

        if (repo.domain_data?.domains?.length > 0) {
            try {
                const domain = repo.domain_data.domains[0];
                await execAsync(`sudo certbot delete --non-interactive --agree-tos --cert-name ${domain}`);

                const configPath = `/etc/nginx/sites-available/${domain}`;
                const enabledPath = `/etc/nginx/sites-enabled/${domain}`;

                await fs.access(enabledPath).then(() => fs.unlink(enabledPath));
                await fs.access(configPath).then(() => fs.unlink(configPath));

                await execAsync("sudo systemctl reload nginx");
                console.log(`Domain ${domain} config removed`);
            } catch (error) {
                console.error("Error cleaning up domain:", error);
            }
        }

        if (repo.webhook_data?.webhookId) {
            try {
                const octokit = new Octokit({ auth: session.access_token });
                const [owner, repoName] = repo.url.replace("https://github.com/", "").split("/");

                await octokit.repos.deleteWebhook({
                    owner,
                    repo: repoName,
                    hook_id: repo.webhook_data.webhookId,
                });
                console.log("GitHub webhook deleted");
            } catch (error) {
                console.error("Error deleting webhook:", error);
            }
        }

        const deployments = await pb.collection("deployments").getFullList({
            filter: `repository = "${projectId}"`
        });
        await Promise.all(deployments.map(d =>
            pb.collection("deployments").delete(d.id)
        ));

        await pb.collection("repositories").delete(projectId);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete repository" },
            { status: 500 }
        );
    }
}