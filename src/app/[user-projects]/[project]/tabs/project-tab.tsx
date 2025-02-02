"use client";

import { LogsSection } from "@/core/components/custom/log-section";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { StatusDot } from "@/core/components/ui/status-dot";
import { Text } from "@/core/components/ui/text";
import { Tooltip } from "@/core/components/ui/tooltip";
import { useClient } from "@/core/context/client-context";
import GithubIcon from "@/core/icons/github";
import { calculateTimeDifference, formatRelativeTime, formatRelativeTimePrecise, formatTimestamp, formatTimestampLong, formatToDate, formatToTime, getNumericTimestamp, getTimeZone, toFormattedDate } from "@/core/lib/time-helpers";
import { Deployment, ProjectRepository } from "@/core/lib/types";
import { CheckIcon, ChevronRightIcon, ExternalLinkIcon, GitBranchIcon, GitCommitHorizontalIcon, InfoIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectTab({ username, project, deployment }: { username: string, project: ProjectRepository, deployment: Deployment }) {
    const router = useRouter();
    const { setSelectedTab } = useClient();
    const [settings, setSettings] = useState({
        buildLogsExpanded: false,
        runtimeLogsExpanded: false,
    });
    const [runtimeLogs, setRuntimeLogs] = useState<string[]>([]);

    const updateSettings = (key: string, value: any) => {
        setSettings({
            ...settings,
            [key]: value,
        });
    }

    useEffect(() => {
        if (settings.runtimeLogsExpanded && project.docker_id) {
            const fetchRuntimeLogs = async () => {
                try {
                    const response = await fetch(`/api/logs?containerId=${project.docker_id}`);

                    if (!response.body) {
                        console.error("No response body");
                        return;
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            break;
                        }

                        const log = decoder.decode(value);
                        setRuntimeLogs((prevLogs) => [...prevLogs, log]);
                    }
                } catch (error) {
                    console.error("Error fetching runtime logs:", error);
                }
            };

            fetchRuntimeLogs();
        }
    }, [settings.runtimeLogsExpanded, project.docker_id]);

    return (
        <section className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex items-center justify-center w-full py-8 border-border border-b">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center px-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 h-full">
                    <Text size="heading-40" className="md:text-center">{project?.name}</Text>

                    <div className="flex flex-wrap gap-1 sm:flex-row sm:gap-3 mt-4 md:mt-0">
                        <Link href={`${project.url.replace("api.github.com/repos/", "github.com/")}`} passHref>
                            <Button variant={"secondary"} className="inline-flex items-center space-x-2 !px-3.5">
                                <GithubIcon size={14} />
                                <span>Repository</span>
                            </Button>
                        </Link>
                        <Button variant={"secondary"}>
                            <span className="px-2">Usage</span>
                        </Button>

                        <Link
                            href={{ href: '/', query: { "tab": "Domains" } }}
                            passHref
                            shallow
                            replace
                            onClick={(e) => {
                                e.preventDefault();

                                setSelectedTab("Settings");

                                router.push(`?tab=Domains`, {

                                });
                            }}
                        >
                            <Button variant={"secondary"}>
                                <span className="px-2">Domains</span>
                            </Button>
                        </Link>
                        <Link href={`https://${project?.domain_data?.domains[0]}`} passHref>
                            <Button variant={"default"}>Visit</Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="px-2 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 h-full pt-12">
                <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="flex flex-col space-y-2.5">
                        <Text size="heading-24">Production Deployment</Text>
                        <Text size="label-14" color="gray-900">The deployment that is available to your visitors.</Text>
                    </div>

                    <div className="flex  flex-wrap sm:flex-row gap-1 sm:gap-3 mt-4 md:mt-0">
                        <Button variant={"secondary"} size={"sm"} onClick={() => {
                            const element = document.getElementById("build-logs");

                            updateSettings("buildLogsExpanded", true);

                            element?.scrollIntoView({ behavior: "smooth" });
                            // element?.focus();
                        }}>Build Logs</Button>
                        <Button variant={"secondary"} size={"sm"} onClick={() => {
                            const element = document.getElementById("runtime-logs");

                            updateSettings("runtimeLogsExpanded", true);

                            element?.scrollIntoView({ behavior: "smooth" });
                            // element?.focus();
                        }}>Runtime Logs</Button>
                        <Button variant={"secondary"} size={"sm"}>
                            <RotateCcwIcon size={16} className="mr-1" />
                            Instant Rolback
                        </Button>
                    </div>
                </div>
                <div className="flex pt-8">
                    <Card className="flex bg-background-100 w-full overflow-hidden">
                        <CardContent className="flex flex-col md:flex-row md:space-x-6 p-4 sm:p-6">
                            <div className="flex items-center justify-center min-h-48 w-80 sm:w-96 md:w-[27.5rem] bg-background-200 h-full rounded-md border border-border">
                                <Text size={"label-12"}>
                                    No preview available
                                </Text>
                            </div>
                            <div className="flex flex-col space-y-6 mt-6 md:mt-0">
                                <div>
                                    <Text size="label-14" color="gray-900">Deployment</Text>
                                    <Link href={`https://${project?.domain_data?.domains[0]}`}>
                                        <Text size="label-14">{project?.domain_data?.domains && project?.domain_data?.domains[0]}</Text>
                                    </Link>
                                </div>
                                <div>
                                    <Text size="label-14" color="gray-900">Domains</Text>
                                    <span className="inline-flex items-center hover:underline">
                                        <Link href={`https://${project?.domain_data?.domains[0]}`}>
                                            <Text size="label-14">{project?.domain_data?.domains && project?.domain_data?.domains[0]}</Text>
                                        </Link>
                                        <ExternalLinkIcon size={14} className="text-white ml-1.5" />
                                        {project?.domain_data?.domains && project?.domain_data?.domains.length > 1 && (

                                            <Tooltip
                                                className="cursor-pointer font-mono"
                                                delay={0}
                                                text={
                                                    <div className="flex flex-col">
                                                        {project?.domain_data?.domains.slice(1).map((domain, index) => (
                                                            <div key={index} className="flex items-center w-full">
                                                                <Text size="label-14">{domain}</Text>
                                                                <ExternalLinkIcon size={14} className="text-white ml-1.5" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                }
                                                sideOffset={0}
                                                side="top"
                                            >
                                                <Badge variant={"gray-subtle"} size={"sm"} className="ml-2">+{project?.domain_data?.domains.length - 1}</Badge>
                                            </Tooltip>
                                        )}
                                    </span>
                                </div>
                                <div className="flex space-x-8">
                                    <div>
                                        <Text size="label-14" color="gray-900">Status</Text>
                                        <div className="inline-flex space-x-2" title={`This deployment is ${deployment?.status ?? "Queued"}`} >
                                            <StatusDot state={deployment?.status ?? "QUEUED"} />
                                            <Text size="label-14" className="!lowercase first-letter:capitalize">
                                                {deployment?.status ?? "Queued"}
                                            </Text>
                                        </div>
                                    </div>

                                    <div>
                                        <Tooltip
                                            className="font-mono text-white"
                                            delay={150}
                                            text={formatTimestampLong(deployment?.created)}
                                            sideOffset={0}
                                            side="top"
                                        >
                                            <div className="flex items-center space-x-2 w-fit">
                                                <Text size="label-14" color="gray-900">Created</Text>

                                                <Badge variant={"gray-subtle"} size={"sm"} className="p-0.5 h-fit">
                                                    <InfoIcon size={14} className="text-white h-fit" />
                                                </Badge>
                                            </div>
                                        </Tooltip>
                                        <Tooltip
                                            className="text-white"
                                            delay={150}
                                            text={
                                                <div className="flex flex-col space-y-1">
                                                    <Text size="label-14">
                                                        {calculateTimeDifference(deployment?.created, new Date().toISOString())}
                                                    </Text>

                                                    <div className="flex space-x-2">
                                                        <div className="flex items-center justify-center rounded-sm bg-gray-300 text-gray-900 font-mono px-1 py-0.5">
                                                            <Text size="label-12" color="gray-900">UTC</Text>
                                                        </div>
                                                        <Text size="label-14" className="!mr-2">{formatToDate(deployment?.created)}</Text>
                                                        <Text size="label-14" color="gray-900" className="font-mono !ml-auto">
                                                            {formatToTime(deployment?.created, 'UTC')}
                                                        </Text>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <div className="flex items-center justify-center rounded-sm bg-gray-300 text-gray-900 font-mono px-1 py-0.5">
                                                            <Text size="label-12" color="gray-900">{getTimeZone()}</Text>
                                                        </div>
                                                        <Text size="label-14" className="!mr-2">{formatToDate(deployment?.created)}</Text>
                                                        <Text size="label-14" color="gray-900" className="font-mono !ml-auto">
                                                            {formatToTime(deployment?.created, 'local')}
                                                        </Text>
                                                    </div>
                                                </div>
                                            }
                                            sideOffset={0}
                                            side="top"
                                        >
                                            <div className="inline-flex items-center space-x-2">
                                                <Text size="label-14">
                                                    {toFormattedDate(deployment?.created)} by {username}
                                                </Text>
                                                <div className="rounded-full h-5 w-5 bg-gray-900"></div>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div>
                                    <Text size="label-14" color="gray-900">Source</Text>
                                    <div className="flex flex-col mt-1.5">
                                        <div className="inline-flex items-center" title="Git Branch">
                                            <GitBranchIcon size={16} className="mr-2 text-gray-900" />
                                            <Link href={`${project.url}/tree/main`} passHref>
                                                <Text size="label-14" className="font-mono hover:underline">main</Text>
                                            </Link>
                                        </div>
                                        <div className="inline-flex items-center hover:underline mt-1">
                                            <GitCommitHorizontalIcon size={16} className="mr-2 text-gray-900" />
                                            <Text size="label-14" className="font-mono">
                                                {deployment?.commit?.commit?.tree?.sha?.slice(0, 7)}
                                            </Text>
                                            <Link href={`${project.url}/commit/${deployment?.commit?.sha}`} passHref>
                                                <Text size="label-14" className="ml-1.5 truncate" title={deployment?.commit?.commit?.message ?? "Commit Message"}>
                                                    {deployment?.commit?.commit?.message}
                                                </Text>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <hr className="w-full my-12 border-border" />
            <div className="px-2 w-full md:w-4/5 lg:w-3/4 xl:w-2/3">
                <Text size="heading-24">Deployment Details</Text>
                <div className="flex flex-col divide-y divide-border border border-border rounded-lg bg-background-100 my-8 focus:ring focus:ring-blue-700" id="logs">
                    <LogsSection
                        id="build-logs"
                        title="Build Logs"
                        logs={deployment?.build_logs || []}
                        expanded={settings.buildLogsExpanded}
                        onToggle={() => updateSettings("buildLogsExpanded", !settings.buildLogsExpanded)}
                        deploymentCreated={deployment?.created}
                        status={deployment?.status}
                    />
                    <LogsSection
                        id="runtime-logs"
                        title="Runtime Logs"
                        logs={runtimeLogs}
                        expanded={settings.runtimeLogsExpanded}
                        onToggle={() => updateSettings("runtimeLogsExpanded", !settings.runtimeLogsExpanded)}
                        deploymentCreated={deployment?.created}
                        status={"INVISIBLE"}
                    />
                </div>
            </div>
        </section>
    );
}