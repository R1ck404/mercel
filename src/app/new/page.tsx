"use client";
// pages/index.js
import { useState, useEffect } from "react";
import Navbar from "@/core/components/custom/navbar";
import { Input } from "@/core/components/ui/input";
import { ChevronDownIcon, LockIcon, SearchIcon } from "lucide-react";
import { MenuContainer, MenuButton, MenuItem, Menu } from "@/core/components/ui/menu";
import { Button } from "@/core/components/ui/button";
import { Text } from "@/core/components/ui/text";
import { Card, CardContent, CardFooter, CardHeader } from "@/core/components/ui/card";
import { useClient } from "@/core/context/client-context";
import { createBrowserClient } from "next-pocketbase-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GithubRepository } from "@/core/lib/types";
import { createGitHubWebhook } from "@/core/lib/github-helper";

const reposUrl = `https://api.github.com/user/repos`;
const ITEMS_PER_PAGE = 5;

export default function New() {
    const { user } = useClient();
    const [repos, setRepos] = useState<GithubRepository[] | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        console.log(user);
        fetch(`${reposUrl}?per_page=100&type=all`, {
            headers: {
                Authorization: `Bearer ${user?.access_token}`,
                Accept: "application/vnd.github.v3+json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                const sortedRepos = data?.sort((a: { updated_at: string | number | Date; }, b: { updated_at: string | number | Date; }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                setRepos(sortedRepos);

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching repositories:", error);
                setIsLoading(false);
            });
    }, []);

    const totalPages = repos && Math.ceil(repos?.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedRepos = repos && repos?.length > 0 && repos?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

    const handleNextPage = () => {
        if (currentPage < (totalPages || 0)) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const createProject = async (repository: {
        node_id: string;
        name: string;
        full_name: string;
        url: string;
        description?: string;
    }) => {
        setIsCreatingProject(true);
        const pb = createBrowserClient();

        if (!user.id) {
            console.error("User not found");
            return;
        }

        const promise = pb.collection("repositories").create({
            owner: user.id,
            name: repository.name,
            full_name: repository.full_name,
            url: repository.url,
            description: repository.description,
            node_id: repository.node_id,
            domain_data: {
                domains: [
                    `${process.env.NEXT_PUBLIC_SERVER_IP}`,
                ]
            },
        });

        promise.then(async (project) => {
            console.log("Project created:", project);

            const projectId = project.id;
            toast.loading("Deploying project...");

            setIsCreatingProject(false);
            router.push(`/${user?.username.toLowerCase()}s-projects/${project.id}`);

            await fetch(`/api/deploy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    repoUrl: repository.url,
                    projectId: projectId,
                }),
            });

            toast.getHistory().forEach((t) => toast.dismiss(t.id));
            toast.success("Project deployed successfully");
        }).catch((error) => {
            console.error("Error creating project:", error);
            setIsCreatingProject(false);
        });

        toast.promise(promise, {
            loading: "Cloning repository...",
            success: (data) => `Repository cloned successfully`,
            error: (error) => `An error occurred while cloning the repository: ${error}`,
        });
    }

    return (
        <>
            <Navbar breadcrumbs={{
                logo: true,
                team: true,
            }} />

            <div className="w-full h-36 flex items-center justify-center border-b border-border">
                <div className="flex items-start justify-end flex-col w-3/5 h-full pb-8 space-y-2">
                    <Text size="heading-40" className="text-center">Let's build something new.</Text>
                    <p className="text-center text-gray-900">To deploy a new Project, import an existing Git Repository or get started with one of our Templates.</p>
                </div>
            </div>

            <section className="flex justify-center items-center w-full h-full pt-6 relative">
                <div className="flex w-3/5 min-h-[35rem] max-h-[35rem] overflow-hidden h-full space-x-2 relative z-10">
                    {isLoading ? (
                        <Card className="bg-background-100 w-1/2 relative">
                            <CardHeader>
                                <span className="h-6 w-1/3 bg-border rounded-md animate-pulse"></span>

                                <div className="flex space-x-2">
                                    <span className="h-6 w-full bg-border rounded-md animate-pulse"></span>
                                    <span className="h-6 w-full bg-border rounded-md animate-pulse"></span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border border-border divide-y">
                                    {[1, 2, 3, 4, 5].map((_, index) => (
                                        <div key={index} className="flex items-center justify-between p-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="h-5 w-5 rounded-full bg-border"></span>
                                                <span className="h-6 w-24 bg-border rounded-md animate-pulse"></span>
                                                <span className="h-1 w-1 bg-border rounded-full animate-pulse"></span>
                                                <span className="h-6 w-16 bg-border rounded-md animate-pulse"></span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="h-6 w-20 bg-border rounded-md animate-pulse"></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button size={"sm"} disabled>Previous</Button>
                                <Text color="gray-900">{`Page 0 of 1`}</Text>
                                <Button size={"sm"} disabled>Next</Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="bg-background-100 w-1/2 relative">
                            {isCreatingProject && (
                                <div className="absolute top-0 left-0 w-full h-full bg-background-100/40 flex items-center justify-center">
                                </div>
                            )}
                            <CardHeader>
                                <Text size="heading-24">Import a Repository</Text>
                                <div className="flex space-x-2">
                                    <MenuContainer>
                                        <MenuButton className="flex justify-between text-nowrap w-full" variant={"secondary"}>
                                            <span>{user?.username}</span>
                                            <ChevronDownIcon size={18} />
                                        </MenuButton>
                                        <Menu width={256}>
                                            <MenuItem onClick={() => alert("one")} className="relative">
                                                <span>Project</span>
                                            </MenuItem>
                                            <MenuItem onClick={() => alert("one")} className="relative">
                                                <span>Domain</span>
                                            </MenuItem>
                                        </Menu>
                                    </MenuContainer>
                                    <Input placeholder="Search..." className="w-full" prefix={<SearchIcon size={18} />} />
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="rounded-md border border-border divide-y">
                                    {paginatedRepos && paginatedRepos?.length > 0 && paginatedRepos?.map((repo, index) => (
                                        <div key={index} className="flex items-center justify-between p-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-800 to-green-700"></div>
                                                <Text size="label-14">{repo?.name}</Text>

                                                {repo?.private && (
                                                    <LockIcon size={16} className="text-gray-900" />
                                                )}

                                                <div className="rounded-full w-0.5 h-0.5 bg-gray-900"></div>

                                                <Text size="label-14" color="gray-900">{new Date(repo?.updated_at ?? "").toLocaleDateString()}</Text>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button size={"sm"} className="px-2.5" onClick={() => createProject({
                                                    node_id: repo?.node_id,
                                                    name: repo?.name,
                                                    full_name: repo?.full_name,
                                                    url: repo?.html_url,
                                                    description: repo?.description ?? "",
                                                })} disabled={isCreatingProject}>Import</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button onClick={handlePrevPage} disabled={currentPage === 1 || !repos || isLoading} size={"sm"}>
                                    Previous
                                </Button>
                                <Text color="gray-900">{`Page ${currentPage ?? 0} of ${totalPages ?? 0}`}</Text>
                                <Button onClick={handleNextPage} disabled={currentPage === totalPages || !repos || isLoading} size={"sm"}>
                                    Next
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    <Card className="bg-background-200 w-1/2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <Text size="heading-24">Clone Template</Text>
                        </CardHeader>

                        <CardContent className="">
                            <Text size="label-14" className="text-gray-900">No templates available</Text>
                        </CardContent>

                        <CardFooter>
                            <Button variant={"tertiary"}>Browse All Templates</Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>
        </>
    );
}
