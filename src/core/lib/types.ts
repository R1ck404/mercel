interface GithubRepository {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    forks: number;
    permissions: {
        admin: boolean;
        pull: boolean;
        triage: boolean;
        push: boolean;
        maintain: boolean;
    };
    owner: {
        name?: string | null;
        email?: string | null;
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        gravatar_id?: string | null;
        starred_at?: string;
        user_view_type?: string;
    };
    private: boolean;
    html_url: string;
    description?: string | null;
    fork: boolean;
    url: string;
    archive_url: string;
    assignees_url: string;
    blobs_url: string;
    branches_url: string;
    collaborators_url: string;
    comments_url: string;
    commits_url: string;
    compare_url: string;
    contents_url: string;
    contributors_url: string;
    deployments_url: string;
    downloads_url: string;
    events_url: string;
    forks_url: string;
    git_commits_url: string;
    git_refs_url: string;
    git_tags_url: string;
    git_url: string;
    issue_comment_url: string;
    issue_events_url: string;
    issues_url: string;
    keys_url: string;
    labels_url: string;
    languages_url: string;
    merges_url: string;
    milestones_url: string;
    notifications_url: string;
    pulls_url: string;
    releases_url: string;
    ssh_url: string;
    stargazers_url: string;
    statuses_url: string;
    subscribers_url: string;
    subscription_url: string;
    tags_url: string;
    teams_url: string;
    trees_url: string;
    clone_url: string;
    mirror_url?: string | null;
    hooks_url: string;
    svn_url: string;
    homepage?: string | null;
    language?: string | null;
    forks_count: number;
    stargazers_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    open_issues_count: number;
    is_template?: boolean;
    topics?: string[];
    has_issues?: boolean;
    has_projects?: boolean;
    has_wiki?: boolean;
    has_pages?: boolean;
    has_downloads?: boolean;
    has_discussions?: boolean;
    archived?: boolean;
    disabled?: boolean;
    visibility?: string;
    pushed_at?: Date | string | null;
    created_at?: Date | string | null;
    updated_at?: Date | string | null;
    allow_rebase_merge?: boolean;
    temp_clone_token?: string;
    allow_squash_merge?: boolean;
    allow_auto_merge?: boolean;
    delete_branch_on_merge?: boolean;
    allow_update_branch?: boolean;
    use_squash_pr_title_as_default?: boolean;
    squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE";
    squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK";
}

interface GitHubCommit {
    url: string;
    sha: string;
    node_id: string;
    html_url: string;
    comments_url: string;
    commit: {
        url: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            url: string;
            sha: string;
        };
        comment_count: number;
        verification: {
            verified: boolean;
            reason: string;
            signature: string | null;
            payload: string | null;
            verified_at: string | null;
        };
    };
    author: GitHubUser | null;
    committer: GitHubUser | null;
    parents: {
        url: string;
        sha: string;
    }[];
}

interface GitHubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

interface ProjectRepository {
    id: string;
    owner: string;
    name: string;
    full_name?: string;
    url: string;
    description?: string;
    node_id?: string;
    docker_id?: string;
    webhook_id?: string;
    commit?: GitHubCommit;
    created: string;
    updated: string;
    metadata?: {};
    domain_data?: DomainData;
}

interface Deployment {
    id: string;
    repository: string;
    status: "QUEUED" | "BUILDING" | "ERROR" | "READY" | "CANCELED";
    build_logs: string[];
    enviroment?: string;
    branch?: string;
    timeAgo?: string;
    builtTime?: string;
    commit?: GitHubCommit;
    by?: string;
    port?: number;
    created: string;
    updated: string;
}

interface DomainData {
    port: number;
    domains: string[];
}

export type {
    GithubRepository,
    ProjectRepository,
    Deployment,
    DomainData,
    GitHubCommit,
    GitHubUser
}