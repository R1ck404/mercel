import { Octokit } from "@octokit/rest";

const createGitHubWebhook = async (accessToken: string, repoFullName: string, webhookUrl: string, secret: string) => {
    const octokit = new Octokit({ auth: accessToken });

    try {
        const [owner, repo] = repoFullName.split("/");

        const response = await octokit.repos.createWebhook({
            owner,
            repo,
            name: "web",
            active: true,
            events: ["push"],
            config: {
                url: webhookUrl,
                content_type: "json",
                secret,
            },
        });

        return response.data.id;
    } catch (error) {
        console.error("Error creating GitHub webhook:", error);
        throw new Error("Failed to create GitHub webhook");
    }
};

const getLatestCommit = async (accessToken: string, username: string, projectname: string) => {
    const response = await fetch(`https://api.github.com/repos/${username}/${projectname}/commits?per_page=1`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });

    return response.json();
}

export { createGitHubWebhook, getLatestCommit };