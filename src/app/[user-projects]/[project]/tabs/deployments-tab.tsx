"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { DateRangePicker } from "@/core/components/ui/date-range-picker";
import { Input } from "@/core/components/ui/input";
import { Kbd } from "@/core/components/ui/kbd";
import { Menu, MenuButton, MenuContainer, MenuItem } from "@/core/components/ui/menu";
import { StatusDot } from "@/core/components/ui/status-dot";
import { Text } from "@/core/components/ui/text";
import { useClient } from "@/core/context/client-context";
import { Deployment, GitHubCommit, GithubRepository } from "@/core/lib/types";
import { CheckIcon, ChevronDownIcon, ClockIcon, CogIcon, EllipsisIcon, EllipsisVerticalIcon, ExternalLinkIcon, GitBranchIcon, GitCommitHorizontalIcon, ListIcon, PlusCircleIcon, RefreshCcwIcon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { createBrowserClient } from "next-pocketbase-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const calculateBuildTime = (created: string, updated: string) => {
    const createdDate = new Date(created);
    const updatedDate = new Date(updated);
    const diffMs = Math.abs(updatedDate.getTime() - createdDate.getTime());
    return timeToTimeAgo(diffMs);
}

const timeToTimeAgo = (timeInMillis: number) => {
    const seconds = Math.floor(timeInMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}

export default function DeploymentsTab({ project }: any) {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
    const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
    const [branchSearchQuery, setBranchSearchQuery] = useState("");

    const applyDateRange = (date: { from?: Date, to?: Date }) => {
        setDateRange(date);
        filterDeployments(date, selectedStatuses, branchSearchQuery);
    }

    const filterDeployments = (
        dateRange: { from?: Date, to?: Date },
        statuses: Set<string>,
        branchQuery: string
    ) => {
        const filtered = deployments.filter(deployment => {
            const deploymentDate = new Date(deployment.created);
            const matchesDateRange =
                (!dateRange.from || deploymentDate >= dateRange.from) &&
                (!dateRange.to || deploymentDate <= dateRange.to);

            const matchesStatus = statuses.size === 0 || statuses.has(deployment.status);

            const matchesBranch = !branchQuery || deployment.branch?.toLowerCase().includes(branchQuery.toLowerCase());

            return matchesDateRange && matchesStatus && matchesBranch;
        });
        setFilteredDeployments(filtered);
    }

    const handleStatusFilter = (status: string) => {
        const newStatuses = new Set(selectedStatuses);

        if (newStatuses.has(status)) {
            newStatuses.delete(status);
        } else {
            newStatuses.add(status);
        }

        setSelectedStatuses(newStatuses);
        filterDeployments(dateRange, newStatuses, branchSearchQuery);
    }

    const handleBranchSearch = (query: string) => {
        setBranchSearchQuery(query);
        filterDeployments(dateRange, selectedStatuses, query);
    }

    useEffect(() => {
        const pb = createBrowserClient();

        const fetchDeployments = async () => {
            setIsLoading(true);

            try {
                const deploys = await pb.collection("deployments").getFullList({
                    filter: `repository="${project.id}"`,
                    sort: "-created",
                });

                if (deploys) {
                    const formattedDeploys = deploys.map((deploy: any) => {
                        const builtTime = calculateBuildTime(deploy.created, deploy.updated);
                        return {
                            id: deploy.id,
                            env: deploy.env,
                            isCurrent: false,
                            status: deploy.status,
                            created: deploy.created,
                            builtTime: builtTime,
                            branch: deploy.branch,
                            commit: deploy.commit,
                            timeAgo: timeToTimeAgo(new Date().getTime() - new Date(deploy.created).getTime()),
                            by: deploy.by,
                        }
                    }) as any;

                    setDeployments(formattedDeploys);
                    setFilteredDeployments(formattedDeploys);
                }
            } catch (error) {
                console.error("Failed to fetch deployments:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDeployments();
    }, [project]);

    return (
        <section className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex items-center justify-center w-full py-8 border-border border-b">
                <div className="flex justify-between items-center px-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 h-full">
                    <div className="flex flex-col space-y-2.5">
                        <Text size="heading-24">Deployments</Text>
                        <div className="inline-flex items-center space-x-2">
                            <RefreshCcwIcon size={16} className="text-gray-900" />
                            <Text size="label-14" color="gray-900">
                                Continuously generated from {project.url.split("api.github.com/repos/")[1]}
                            </Text>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <MenuContainer>
                            <MenuButton size={"sm"} variant={"secondary"}>
                                <EllipsisIcon size={18} className="stroke-gray-900" />
                            </MenuButton>
                            <Menu width={200} side="bottom" align="end">
                                <MenuItem onClick={() => alert("one")} className="space-x-2">
                                    <PlusCircleIcon size={16} className="text-gray-1000" />
                                    <span>Create Deployment</span>
                                </MenuItem>
                                <MenuItem onClick={() => alert("one")} className="space-x-2">
                                    <CogIcon size={16} className="text-gray-1000" />
                                    <span>Git Settings</span>
                                </MenuItem>
                                <MenuItem onClick={() => alert("one")} className="space-x-2">
                                    <ClockIcon size={16} className="text-gray-1000" />
                                    <span>Deployment Retention</span>
                                </MenuItem>
                            </Menu>
                        </MenuContainer>
                    </div>
                </div>
            </div>
            <div className="flex flex-col px-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 h-full pt-6">
                <div className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <div className="relative flex flex-grow">
                        <SearchIcon size={18} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-700 z-10" />
                        <Input
                            placeholder="All Branches.."
                            className="w-full pl-7"
                            value={branchSearchQuery}
                            onChange={(e) => handleBranchSearch(e.target.value)}
                        />
                    </div>

                    <DateRangePicker apply={applyDateRange} />

                    <MenuContainer>
                        <MenuButton className="flex justify-between text-nowrap w-96 group" variant={"secondary"}>
                            <span>All Enviroments</span>
                            <ChevronDownIcon size={18} className="!ml-4 text-accents-3 group-hover:text-gray-1000 transition-colors" />
                        </MenuButton>
                        <Menu width={192}>
                            <MenuItem className="relative">
                                Production
                            </MenuItem>
                            <MenuItem onClick={() => alert("one")} className="relative" disabled>
                                Development
                            </MenuItem>
                        </Menu>
                    </MenuContainer>

                    <MenuContainer>
                        <MenuButton className="text-nowrap group" variant={"secondary"}>
                            <div className="flex items-center space-x-1">
                                <div className="flex -space-x-1.5 scale-90">
                                    <StatusDot state="READY" className="border border-background-100 rounded-full" />
                                    <StatusDot state="ERROR" className="border border-background-100 rounded-full" />
                                    <StatusDot state="BUILDING" className="border border-background-100 rounded-full" />
                                    <StatusDot state="QUEUED" className="border border-background-100 rounded-full" />
                                    <StatusDot state="CANCELED" className="border border-background-100 rounded-full" />
                                </div>
                                <span className="!mr-1">Status</span>
                                <Badge variant="gray-subtle" size={"sm"}>{selectedStatuses.size}/5</Badge>

                                <ChevronDownIcon size={18} className="!ml-4 text-accents-3 group-hover:text-gray-1000 transition-colors" />
                            </div>
                        </MenuButton>
                        <Menu width={192}>
                            <MenuItem onClick={() => setSelectedStatuses(new Set())} className="relative">
                                All Statuses
                            </MenuItem>
                            <MenuItem onClick={() => handleStatusFilter("READY")} className="relative">
                                Ready {selectedStatuses.has("READY") && <CheckIcon size={16} className="absolute right-2" />}
                            </MenuItem>
                            <MenuItem onClick={() => handleStatusFilter("ERROR")} className="relative">
                                Error {selectedStatuses.has("ERROR") && <CheckIcon size={16} className="absolute right-2" />}
                            </MenuItem>
                            <MenuItem onClick={() => handleStatusFilter("BUILDING")} className="relative">
                                Building {selectedStatuses.has("BUILDING") && <CheckIcon size={16} className="absolute right-2" />}
                            </MenuItem>
                            <MenuItem onClick={() => handleStatusFilter("QUEUED")} className="relative">
                                Queued {selectedStatuses.has("QUEUED") && <CheckIcon size={16} className="absolute right-2" />}
                            </MenuItem>
                            <MenuItem onClick={() => handleStatusFilter("CANCELED")} className="relative">
                                Canceled {selectedStatuses.has("CANCELED") && <CheckIcon size={16} className="absolute right-2" />}
                            </MenuItem>
                        </Menu>
                    </MenuContainer>
                </div>

                <div className="rounded-md bg-background-100 divide-y divide-border border border-border mt-2.5">
                    {isLoading ? ( // Show loading state
                        <div className="flex items-center justify-center p-6">
                            <Text size="label-14" color="gray-900">Loading deployments...</Text>
                        </div>
                    ) : filteredDeployments.length > 0 ? ( // Show filtered deployments
                        filteredDeployments.map((deployment, index) => (
                            <div className="flex items-center justify-between space-x-6 px-5 py-4 relative" key={deployment.id}>
                                <Link className="w-4/12" href={`./${project.id}/deployments/${deployment.id}`}>
                                    <Text size="label-14">
                                        <b>{deployment.id}</b>
                                    </Text>
                                    <div className="inline-flex">
                                        <Text size="label-14" color="gray-900">{"Production"}</Text>
                                        {index == 0 && <Badge variant="blue-subtle" size={"sm"} className="ml-2">Current</Badge>}
                                    </div>
                                </Link>
                                <Link className="flex flex-col w-2/12" href={`./${project.id}/deployments/${deployment.id}`}>
                                    <div className="inline-flex space-x-2">
                                        <StatusDot state={deployment.status} />
                                        <Text size="label-14" color="gray-900">{deployment.status}</Text>
                                    </div>
                                    <Text size="label-14" className="ml-[18px]" color="gray-900">{deployment.builtTime} ({deployment.timeAgo} ago)</Text>
                                </Link>
                                <div className="flex space-x-8 w-4/12 overflow-hidden text-ellipsis">
                                    <div className="flex flex-col">
                                        <div className="inline-flex space-x-2 items-center">
                                            <GitBranchIcon size={18} className="mr-1 text-gray-900" />
                                            <Text size="label-14">{deployment.branch ?? "main"}</Text>
                                        </div>
                                        <div className="inline-flex space-x-1 items-center mt-1">
                                            <GitCommitHorizontalIcon size={18} className="mr-2 text-gray-900" />
                                            <Text size="label-14" className="font-mono">{deployment?.commit?.commit?.tree.sha.slice(0, 7)}</Text>
                                            <Text size="label-14" className="!ml-2 text-nowrap text-ellipsis overflow-hidden">{deployment?.commit?.commit?.message}</Text>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="inline-flex items-center space-x-2">
                                        <Text size="label-14" color="gray-900">{deployment.timeAgo} ago by {deployment.by}</Text>
                                        <div className="rounded-full h-5 w-5 bg-gray-900"></div>
                                    </div>
                                </div>

                                <MenuContainer>
                                    <MenuButton size={"sm"} variant={"tertiary"} className="absolute !right-0 bg-background-100 sm:bg-transparent hover:bg-background-100 sm:relative sm:right-0">
                                        <EllipsisIcon size={18} className="stroke-gray-900" />
                                    </MenuButton>
                                    <Menu width={200}>
                                        <MenuItem onClick={() => alert("one")} className="flex items-center justify-between">
                                            <span>Redeploy</span>
                                            <RefreshCcwIcon size={16} className="text-gray-900" />
                                        </MenuItem>
                                        <Link href={`./${project.id}/deployments/${deployment.id}`} passHref>
                                            <MenuItem>Inspect Deployment</MenuItem>
                                        </Link>

                                        <Link href={project.url} passHref>
                                            <MenuItem>View Source</MenuItem>
                                        </Link>

                                        <MenuItem onClick={() => {
                                            navigator.clipboard.writeText(project?.domain_data?.domains[0]);
                                            toast.success("Copied URL to clipboard");
                                        }}>Copy URL</MenuItem>
                                        <MenuItem>Assign Domain</MenuItem>

                                        <Link href={`https://${project?.domain_data?.domains[0]}`} passHref>
                                            <MenuItem className="flex items-center justify-between">
                                                <span>Visit</span>
                                                <ExternalLinkIcon size={16} className="text-gray-900" />
                                            </MenuItem>
                                        </Link>
                                    </Menu>
                                </MenuContainer>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center p-6">
                            <Text size="label-14" color="gray-900">No deployments found for the selected filters.</Text>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}