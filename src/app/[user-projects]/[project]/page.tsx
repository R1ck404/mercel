"use client"
// pages/index.js
import { useClient } from "@/core/context/client-context";
import Navbar from "@/core/components/custom/navbar";
import SubNavbar from "@/core/components/custom/sub-navbar";
import ProjectTab from "./tabs/project-tab";
import DeploymentsTab from "./tabs/deployments-tab";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "next-pocketbase-auth";
import SettingsPage from "@/core/components/custom/settings-page";
import { Deployment, ProjectRepository } from "@/core/lib/types";

const TABS = [
    "Project",
    "Deployments",
    "Analytics",
    "Speed Insights",
    "Logs",
    "Observability",
    "Firewall",
    "Storage",
    "Settings",
];

const DISABLED_TABS = [
    "Analytics",
    "Speed Insights",
    "Logs",
    "Observability",
    "Firewall",
    "Storage",
];

export default function Projects() {
    const { setSelectedTab, selectedTab } = useClient();
    const { user } = useClient();
    const [project, setProject] = useState<ProjectRepository | null>(null);
    const [latestDeployment, setLatestDeployment] = useState<Deployment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();

    useEffect(() => {
        if (!TABS.includes(selectedTab)) {
            setSelectedTab("Project");
        }

        const pb = createBrowserClient();

        const projectId = params?.project as string | undefined;

        const fetchProject = async () => {
            if (!projectId) {
                return;
            }

            const project = await pb.collection("repositories").getOne(projectId);

            if (project) {
                if (project?.owner !== user?.id) {
                    console.error("User does not have access to this project.");
                    return;
                }

                console.log("Project:", project);
                setProject(project as unknown as ProjectRepository);
                setIsLoading(false);
            }
        }

        const fetchLatestDeployment = async () => {
            if (!projectId) {
                return;
            }

            const deployment = await pb.collection("deployments").getList(1, 1, {
                sort: "-updated",
                filter: `repository="${projectId}"`,
            });

            if (deployment) {
                setLatestDeployment(deployment.items[0] as unknown as Deployment);

                await pb.collection("deployments").subscribe(`${deployment.items[0].id}`, function (e) {
                    const action = e.action;
                    const record = e.record;


                    console.log("Deployment event:", action, record);
                    if (action === "update") {
                        setLatestDeployment(record as unknown as Deployment);
                    }
                });
            }
        }

        fetchProject().then(() => {
            fetchLatestDeployment();
        });
    }, []);

    return (
        <>
            <Navbar breadcrumbs={{
                logo: true,
                team: true,
                project: {
                    id: project?.id || "",
                    name: project?.name || "",
                },
            }} />
            <SubNavbar tabs={TABS} disabledTabs={DISABLED_TABS} />

            {isLoading ? (
                <div className="w-full h-full">
                    <LoadingSkeleton />
                </div>
            ) : (
                    <div className="w-full h-full">
                        {selectedTab === "Project" && <ProjectTab username={user?.username} project={project as ProjectRepository} deployment={latestDeployment as Deployment} />}
                        {selectedTab === "Settings" && <SettingsPage project={project} />}
                    {selectedTab === "Deployments" && <DeploymentsTab project={project} />}
                </div>
            )}
        </>
    );
}

const LoadingSkeleton = () => {
    return (
        <section className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex items-center justify-center w-full py-8 border-border border-b">
                <div className="flex justify-between items-center w-2/3 h-full">
                    <div className="h-10 w-1/2 bg-border rounded-md animate-pulse"></div>
                    <div className="flex space-x-3">
                        <div className="h-10 w-28 bg-border rounded-md animate-pulse"></div>
                        <div className="h-10 w-20 bg-border rounded-md animate-pulse"></div>
                        <div className="h-10 w-24 bg-border rounded-md animate-pulse"></div>
                        <div className="h-10 w-20 bg-border rounded-md animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="w-2/3 h-full pt-12">
                <div className="flex justify-between">
                    <div className="flex flex-col space-y-2.5">
                        <div className="h-8 w-1/3 bg-border rounded-md animate-pulse"></div>
                        <div className="h-6 w-1/2 bg-border rounded-md animate-pulse"></div>
                    </div>
                    <div className="flex space-x-3">
                        <div className="h-8 w-24 bg-border rounded-md animate-pulse"></div>
                        <div className="h-8 w-24 bg-border rounded-md animate-pulse"></div>
                        <div className="h-8 w-36 bg-border rounded-md animate-pulse"></div>
                    </div>
                </div>
                <div className="flex pt-8">
                    <div className="flex bg-background-100 w-full p-6 rounded-md animate-pulse">
                        <div className="w-[27.5rem] h-40 bg-border rounded-md"></div>
                        <div className="flex flex-col space-y-6 w-full px-6">
                            <div className="h-6 w-1/3 bg-border rounded-md"></div>
                            <div className="h-6 w-1/2 bg-border rounded-md"></div>
                            <div className="h-6 w-1/4 bg-border rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}