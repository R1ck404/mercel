"use client";

import { useClient } from "@/core/context/client-context";
import Navbar from "@/core/components/custom/navbar";
import SubNavbar from "@/core/components/custom/sub-navbar";
import { Input } from "@/core/components/ui/input";
import { CheckIcon, ChevronDownIcon, EllipsisIcon, LayoutGridIcon, ListIcon, SearchIcon, StarIcon } from "lucide-react";
import { Kbd } from "@/core/components/ui/kbd";
import { MenuContainer, MenuButton, MenuItem, Menu } from "@/core/components/ui/menu";
import { Switch, SwitchControl } from "@/core/components/ui/switch";
import { Button } from "@/core/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "next-pocketbase-auth";
import { Text } from "@/core/components/ui/text";
import GithubIcon from "@/core/icons/github";
import { Badge } from "@/core/components/ui/badge";
import SettingsPage from "@/core/components/custom/settings-page";
import { ProjectRepository } from "@/core/lib/types";
import StarHoverAnimation from "@/core/components/custom/favorite-star";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/core/components/ui/modal";

const TABS = [
    "Overview",
    "Integrations",
    "Activity",
    "Domains",
    "Usage",
    "Monitoring",
    "Observability",
    "Storage",
    "AI",
    "Support",
    "Settings",
];
const DISABLED_TABS = [
    "Integrations",
    "Activity",
    "Domains",
    "Usage",
    "Monitoring",
    "Observability",
    "Storage",
    "AI",
    "Support",
    "Settings",
];

export default function Home() {
    const { user, setSelectedTab, selectedTab } = useClient();
    const [repos, setRepos] = useState<ProjectRepository[]>([]);
    const [filteredRepos, setFilteredRepos] = useState<ProjectRepository[]>([]);
    const [view, setView] = useState<string>("list");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<"activity" | "name">("activity");
    const router = useRouter();

    useEffect(() => {
        if (!TABS.includes(selectedTab)) {
            setSelectedTab("Overview");
        }

        const pb = createBrowserClient();

        pb.collection("repositories").getFullList({
            filter: `owner="${user?.id}"`,
        }).then((data: any) => {
            setRepos(data);
            setFilteredRepos(data);
            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        let filtered = repos;

        if (searchQuery) {
            filtered = filtered.filter(repo =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.domain_data?.domains[0]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortBy === "activity") {
            filtered.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
        } else if (sortBy === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredRepos(filtered);
    }, [searchQuery, sortBy, repos]);

    const deleteRepo = (id: string) => {
        const api = fetch("/api/delete", {
            method: "DELETE",
            body: JSON.stringify({ projectId: id }),
        });

        toast.promise(api, {
            loading: "Deleting repository...",
            success: "Repository deleted successfully.",
            error: "Failed to delete repository.",
        });
    };

    return (
        <>
            <Navbar breadcrumbs={{
                logo: true,
                team: true,
                project: null,
            }} />
            <SubNavbar tabs={TABS} disabledTabs={DISABLED_TABS} />

            {selectedTab === "Overview" && (
                <section className="flex justify-center items-center w-full h-full pt-6">
                    <div className="w-full px-2 md:w-4/5 lg:w-3/4 xl:w-2/3 h-full">
                        <div className="flex flex-col space-x-0 md:flex-row md:space-x-2">
                            <div className="relative w-full">
                                <SearchIcon size={18} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-700 z-10" />
                                <Input
                                    placeholder="Search Repositories and Projects..."
                                    className="w-full pl-7"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="flex space-x-2 absolute right-2 top-1/2 -translate-y-1/2">
                                    <Kbd small>⌘</Kbd>
                                    <Kbd small>K</Kbd>
                                </div>
                            </div>

                            <div className="flex space-x-2 mt-2 md:mt-0">
                            <MenuContainer>
                                    <MenuButton className="text-nowrap w-32 md:w-56" variant={"secondary"}>
                                    <span className="flex justify-between items-center space-x-1 w-full">
                                        <span>Sort by {sortBy}</span>
                                            <ChevronDownIcon size={18} className="!ml-10 hidden md:block" />
                                    </span>
                                </MenuButton>
                                <Menu width={192}>
                                    <MenuItem onClick={() => setSortBy("activity")} className="relative">
                                        <span>Sort by activity</span>
                                        {sortBy === "activity" && <CheckIcon size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-900" />}
                                    </MenuItem>
                                    <MenuItem onClick={() => setSortBy("name")} className="relative">
                                        <span>Sort by name</span>
                                        {sortBy === "name" && <CheckIcon size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-900" />}
                                    </MenuItem>
                                </Menu>
                            </MenuContainer>

                                <Switch defaultValue={view}>
                                <SwitchControl defaultChecked label={<LayoutGridIcon size={18} />} value="grid" onClick={() => setView("grid")} />
                                <SwitchControl label={<ListIcon size={18} />} value="list" onClick={() => setView("list")} />
                            </Switch>

                            <MenuContainer>
                                <MenuButton className="text-nowrap">
                                    <div className="flex items-center">
                                        <span>Add new...</span>
                                            <ChevronDownIcon size={18} className="!ml-4 hidden md:block" />
                                    </div>
                                </MenuButton>
                                <Menu width={192}>
                                    <Link href="/new/">
                                        <MenuItem className="relative">
                                            <span>Project</span>
                                        </MenuItem>
                                    </Link>
                                    <MenuItem onClick={() => { }} className="relative" disabled>
                                        <span>Domain</span>
                                    </MenuItem>
                                    <MenuItem onClick={() => { }} className="relative" disabled>
                                        <span>Store</span>
                                    </MenuItem>
                                    <MenuItem onClick={() => { }} className="relative" disabled>
                                        <span>Team Member</span>
                                    </MenuItem>
                                </Menu>
                            </MenuContainer>
                            </div>
                        </div>

                        {view === "grid" && (
                            <>
                                {isLoading ? (
                                    <RepositorySkeleton view={view} />
                                ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                            {filteredRepos.length > 0 ? (
                                                filteredRepos.map((repo, index) => (
                                                    <div key={index} className="bg-background-100 border border-border rounded-lg p-5 space-y-2.5 hover:border-gray-500 overflow-hidden">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-4">
                                                                <img src={"https://vercel.com/api/v0/deployments/dpl_DBG1cygyjbF8vgM5aHzcT26385N3/favicon?project=gambling-website&readyState=READY&teamId=team_MjTaG6dUKbn0zLuucHl7GTgX"} className="w-8 h-8 rounded" />
                                                                <div className="flex flex-col">
                                                                    <Link href={`/${user?.username.toLowerCase()}s-projects/${repo?.id}`}>
                                                                        <Text size="label-14">{repo?.name}</Text>
                                                                    </Link>
                                                                    <Link href={`https://${repo?.domain_data?.domains[0]}`}>
                                                                        <Text size="label-14" color="gray-900" className="hover:underline">{repo?.domain_data?.domains[0]}</Text>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            <MenuContainer>
                                                                <MenuButton size={"sm"} variant={"tertiary"}>
                                                                    <EllipsisIcon size={18} className="stroke-gray-900" />
                                                                </MenuButton>
                                                                <Menu width={200}>
                                                                    <MenuItem onClick={() => {
                                                                        router.push(`/${user?.username.toLowerCase()}s-projects/${repo?.id}`);
                                                                    }}>View Logs</MenuItem>
                                                                    <MenuItem onClick={() => {
                                                                        setSelectedTab("Settings");
                                                                        router.push(`/${user?.username.toLowerCase()}s-projects/${repo?.id}?tab=Domains`);
                                                                    }}>Manage Domains</MenuItem>
                                                                    <MenuItem onClick={() => {
                                                                        setSelectedTab("Settings");
                                                                        router.push(`/${user?.username.toLowerCase()}s-projects/${repo?.id}?tab=Settings`);
                                                                    }}>Settings</MenuItem>
                                                                    <Modal.Modal>
                                                                        <Modal.Trigger asChild>
                                                                            <Button className="text-start justify-start w-full" variant={"tertiary"}>Delete</Button>
                                                                        </Modal.Trigger>
                                                                        <Modal.Content>
                                                                            <Modal.Body>
                                                                                <Modal.Header>
                                                                                    <Modal.Title>Delete Project</Modal.Title>
                                                                                    <Modal.Description>
                                                                                        Are you sure you want to delete this project?
                                                                                    </Modal.Description>
                                                                                </Modal.Header>
                                                                            </Modal.Body>
                                                                            <Modal.Actions>
                                                                                <Modal.Cancel>Cancel</Modal.Cancel>
                                                                                <Modal.Action onClick={() => deleteRepo(repo.id)}>Continue</Modal.Action>
                                                                            </Modal.Actions>
                                                                        </Modal.Content>
                                                                    </Modal.Modal>
                                                                </Menu>
                                                            </MenuContainer>
                                                        </div>
                                                        <Link href={repo?.url}>
                                                            <Badge variant="gray-subtle" className="flex space-x-0.5 w-fit lowercase !pl-1.5">
                                                                <GithubIcon className="text-white" />
                                                                <Text size="label-14" className="hover:underline">{repo?.url}</Text>
                                                            </Badge>
                                                        </Link>
                                                        <Link href={`/${user?.username.toLowerCase()}s-projects/${repo?.id}`} className="flex flex-col space-y-1 !mt-3">
                                                            <Text size="label-14" color="gray-900">{repo?.commit?.commit?.message ?? "No Commit Found."}</Text>
                                                            <Text size="label-14" color="gray-900">
                                                                {new Date(repo?.updated).toLocaleDateString()} on master
                                                            </Text>
                                                        </Link>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-3 flex items-center justify-center p-6">
                                                    <Text size="label-14" color="gray-900">No repositories found.</Text>
                                                </div>
                                            )}
                                        </div>
                                )}
                            </>
                        )}

                        {view === "list" && (
                            <>
                                {isLoading ? (
                                    <RepositorySkeleton view={view} />
                                ) : (
                                        <div className="flex flex-col space-y-4 mt-4">
                                            {filteredRepos.length > 0 ? (
                                                filteredRepos.map((repo, index) => (
                                                    <div className="flex flex-col overflow-hidden " key={index}>
                                                        <div className="inline-flex space-x-4 items-center px-0 md:px-2">
                                                            <GithubIcon className="text-white hidden md:block" />
                                                            <Link href={repo?.url}>
                                                                <Text size="heading-16" className="hover:underline truncate">{repo?.url}</Text>
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center w-full border border-border rounded-lg p-4 space-x-4 bg-background-100 mt-3 hover:border-gray-500 relative">
                                                            <img src={"https://vercel.com/api/v0/deployments/dpl_DBG1cygyjbF8vgM5aHzcT26385N3/favicon?project=gambling-website&readyState=READY&teamId=team_MjTaG6dUKbn0zLuucHl7GTgX"} className="w-8 h-8 rounded" />
                                                            <Link className="flex flex-col w-5/12" href={`/${user?.username.toLowerCase()}s-projects/${repo?.id}`}>
                                                                <Text size="label-14">{repo?.name}</Text>
                                                                <Text size="label-14" color="gray-900">{repo?.domain_data?.domains[0]}</Text>
                                                            </Link>
                                                            <div className="flex flex-col w-full">
                                                                <Text size="label-14" color="gray-900">
                                                                    {repo?.commit?.commit?.message ?? "No Commit Found."}
                                                                </Text>
                                                                <Text size="label-14" color="gray-900">
                                                                    {new Date(repo?.updated).toLocaleDateString()} on master
                                                                </Text>
                                                            </div>
                                                            <MenuContainer>
                                                                <MenuButton size={"sm"} variant={"tertiary"} className="absolute top-1/2 -translate-y-1/2 right-2 bg-background-100">
                                                                    <EllipsisIcon size={18} className="stroke-gray-900" />
                                                                </MenuButton>
                                                                <Menu width={200}>
                                                                    <MenuItem onClick={() => {
                                                                        router.push(`/${user?.username.toLowerCase()}s-projects/${repo?.id}`);
                                                                    }}>View Logs</MenuItem>
                                                                    <MenuItem onClick={() => {
                                                                        setSelectedTab("Settings");
                                                                        router.push(`/${user?.username.toLowerCase()}s-projects/${repo?.id}?tab=Domains`);
                                                                    }}>Manage Domains</MenuItem>
                                                                    <MenuItem onClick={() => {
                                                                        setSelectedTab("Settings");
                                                                        router.push(`/${user?.username.toLowerCase()}s-projects/${repo?.id}?tab=Settings`);
                                                                    }}>Settings</MenuItem>
                                                                    <Modal.Modal>
                                                                        <Modal.Trigger asChild>
                                                                            <Button className="text-start justify-start w-full" variant={"tertiary"}>Delete</Button>
                                                                        </Modal.Trigger>
                                                                        <Modal.Content>
                                                                            <Modal.Body>
                                                                                <Modal.Header>
                                                                                    <Modal.Title>Delete Project</Modal.Title>
                                                                                    <Modal.Description>
                                                                                        Are you sure you want to delete this project?
                                                                                    </Modal.Description>
                                                                                </Modal.Header>
                                                                            </Modal.Body>
                                                                            <Modal.Actions>
                                                                                <Modal.Cancel>Cancel</Modal.Cancel>
                                                                                <Modal.Action onClick={() => deleteRepo(repo.id)}>Continue</Modal.Action>
                                                                            </Modal.Actions>
                                                                        </Modal.Content>
                                                                    </Modal.Modal>

                                                                </Menu>
                                                            </MenuContainer>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-center p-6">
                                                    <Text size="label-14" color="gray-900">No repositories found.</Text>
                                                    </div>
                                            )}
                                        </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            )}
        </>
    );
}

const RepositorySkeleton = ({ view }: { view: "grid" | "list" }) => {
    return (
        <div className="w-full h-full">
            {view === "grid" && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-background-100 border border-border rounded-lg p-5 space-y-2.5 hover:border-gray-500 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-gray-300 rounded" />
                                    <div className="flex flex-col space-y-1">
                                        <div className="w-24 h-4 bg-gray-300 rounded" />
                                        <div className="w-32 h-4 bg-gray-300 rounded" />
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-gray-300 rounded" />
                            </div>
                            <div className="flex space-x-2 w-fit">
                                <div className="w-4 h-4 bg-gray-300 rounded" />
                                <div className="w-24 h-4 bg-gray-300 rounded" />
                            </div>
                            <div className="w-48 h-4 bg-gray-300 rounded" />
                            <div className="w-48 h-4 bg-gray-300 rounded" />
                        </div>
                    ))}
                </div>
            )}

            {view === "list" && (
                <div className="flex flex-col space-y-4 mt-4">
                    {[...Array(6)].map((_, index) => (
                        <div className="flex flex-col animate-pulse" key={index}>
                            <div className="inline-flex space-x-4 items-center px-2">
                                <div className="w-4 h-4 bg-gray-300 rounded" />
                                <div className="w-24 h-4 bg-gray-300 rounded" />
                            </div>
                            <div className="flex items-center w-full border border-border rounded-lg p-4 space-x-4 bg-background-100 mt-3 hover:border-gray-500">
                                <div className="w-12 h-8 bg-gray-300 rounded" />
                                <div className="flex flex-col w-5/12 space-y-1">
                                    <div className="w-24 h-4 bg-gray-300 rounded" />
                                    <div className="w-32 h-4 bg-gray-300 rounded" />
                                </div>
                                <div className="flex flex-col w-full space-y-1">
                                    <div className="w-48 h-4 bg-gray-300 rounded" />
                                    <div className="w-48 h-4 bg-gray-300 rounded" />
                                </div>
                                <div className="w-12 h-8 bg-gray-300 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};