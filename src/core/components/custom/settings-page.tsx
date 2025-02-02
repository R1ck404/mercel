import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Input } from "../ui/input";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ExternalLinkIcon, HelpCircleIcon } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Tooltip } from "../ui/tooltip";

const TABS = [
    "General",
    "Domains",
];

const DISABLED_TABS = [
    "Security",
    "Notifications",
    "Integrations",
    "Advanced"
];

export default function SettingsPage({ project }: { project: any }) {
    const query = useSearchParams();
    const [selectedTab, setSelectedTab] = useState(query?.get("tab") || "General");
    const [newDomains, setNewDomains] = useState<string[]>([]);

    useEffect(() => {
        setSelectedTab(query?.get("tab") || "General");
    }, [query]);

    const addDomain = (domain: string) => {
        setNewDomains([...newDomains, domain]);
    }

    const removeDomain = (domain: string) => {
        setNewDomains(newDomains.filter(d => d !== domain));
    }

    const domains = project?.domain_data?.domains || [];

    return (
        <section className="flex flex-col justify-center items-center w-full h-full">
            <div className="flex items-center justify-center w-full py-8 border-border border-b">
                <div className="flex justify-between items-center px-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 h-full">
                    <Text size="heading-40" className="text-center">Project Settings</Text>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row space-x-1 sm:space-x-10 px-4 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 h-full pt-8">
                <div className="flex mb-4 sm:mb-0 flex-col w-72">
                    {TABS.map(tabName => (
                        <Button key={tabName} variant={"tertiary"} className={`flex justify-start ${selectedTab === tabName ? "text-gray-1000" : "text-gray-900"}`} onClick={() => setSelectedTab(tabName)}>
                            <span>{tabName}</span>
                        </Button>
                    ))}
                </div>

                <div className="flex flex-col w-full">
                    {selectedTab === "General" && <GeneralPage project={project} />}
                    {selectedTab === "Domains" && <DomainsPage addDomain={addDomain} removeDomain={removeDomain} domains={domains} port={project?.domain_data?.port} project_id={project?.id} />}
                </div>
            </div>
        </section>
    )
}

const GeneralPage = ({ project }: { project: any }) => {
    return (
        <div className="flex flex-col space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Project Name
                    </CardTitle>
                    <CardDescription>
                        Used to identify your Project on the Dashboard, Vercel CLI, and in the URL of your Deployments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Input placeholder="Project Name" defaultValue={project?.name} prefix={`mercel.com/user-projects/`} />
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Text size="label-14">Learn more about Project Name</Text>
                    <Button disabled size={"sm"}>
                        Save
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Build & Development Settings
                    </CardTitle>
                    <CardDescription>
                        When using a framework for a new project, it will be automatically detected. As a result, several project settings are automatically configured to achieve the best result. You can override them below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Text size="label-12" color="gray-900">Framework</Text>
                    <Input placeholder="Next.js" disabled />

                    <div className="flex justify-between items-center mt-4">
                        <div className="inline-flex items-center space-x-2">
                            <Text size="label-12">Build Command</Text>
                            <Tooltip
                                className="text-white"
                                text="The command that builds your application for production."
                            >
                                <HelpCircleIcon size={18} className="text-gray-500" />
                            </Tooltip>
                        </div>
                        <div className="flex items-center">
                            <Input placeholder="`npm run build` or `next build`" disabled />
                            <Text size="label-12" className="ml-3 mr-2">Override</Text>
                            <Toggle size={"large"} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="inline-flex items-center space-x-2">
                            <Text size="label-12">Output Directory</Text>
                            <Tooltip
                                className="text-white"
                                text="The directory that contains the output of your build command."
                            >
                                <HelpCircleIcon size={18} className="text-gray-500" />
                            </Tooltip>
                        </div>
                        <div className="flex items-center">
                            <Input placeholder="Next.js default" disabled />
                            <Text size="label-12" className="ml-3 mr-2">Override</Text>
                            <Toggle size={"large"} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="inline-flex items-center space-x-2">
                            <Text size="label-12">Install Command</Text>
                            <Tooltip
                                className="text-white"
                                text="The command that Install your application's dependencies."
                            >
                                <HelpCircleIcon size={18} className="text-gray-500" />
                            </Tooltip>
                        </div>
                        <div className="flex items-center">
                            <Input placeholder="`yarn install`, `pnpm install`, `npm install`, or `bun install`" disabled />
                            <Text size="label-12" className="ml-3 mr-2">Override</Text>
                            <Toggle size={"large"} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="inline-flex items-center space-x-2">
                            <Text size="label-12">Development Command</Text>
                            <Tooltip
                                className="text-white"
                                text="The command that starts your development server."
                            >
                                <HelpCircleIcon size={18} className="text-gray-500" />
                            </Tooltip>
                        </div>
                        <div className="flex items-center">
                            <Input placeholder="next" disabled />
                            <Text size="label-12" className="ml-3 mr-2">Override</Text>
                            <Toggle size={"large"} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Text size="label-14">Learn more about Build and Development Settings</Text>
                    <Button disabled size={"sm"}>
                        Save
                    </Button>
                </CardFooter>
            </Card>
        </div >
    );
}

const DomainsPage = ({ addDomain, removeDomain, domains, port, project_id }: {
    addDomain: (domain: string) => void,
    removeDomain: (domain: string) => void,
    domains: any[],
    port: number,
    project_id: string
}) => {
    const ref = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddDomain = async () => {
        setError(null);
        if (ref.current?.value) {
            const domain = ref.current.value.trim();
            setIsLoading(true);

            try {
                const response = await fetch("/api/domains/assign", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ project_id: project_id, domain: domain, port: port }),
                });

                if (!response.ok) {
                    throw new Error((await response.json()).error || "Failed to add domain.");
                }

                const data = await response.json();
                addDomain(data.domain.domain);
                ref.current.value = "";
            } catch (err: any) {
                setError(err.message || "Something went wrong.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col">
            <Text size="heading-24">Domains</Text>
            <Text size="label-14" className="text-wrap mt-6">
                These domains are assigned to your Production Deployments. Optionally, a different Git branch or a redirection to another domain can be configured for each one.
            </Text>
            <div className="flex items-center space-x-3 my-6 w-full">
                <Input placeholder="example.com" className="w-full" ref={ref} disabled={isLoading} />
                <Button variant="secondary" className="!px-8" onClick={handleAddDomain} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add"}
                </Button>
            </div>
            {error && <Text color="red-700" className="mt-2">{error}</Text>}

            {domains.map((domain, index) => (
                <div key={index} className="flex flex-col w-full rounded-lg border border-border bg-background-100 mt-4">
                    <div className="flex flex-row justify-between items-center w-full p-5">
                        <Text size="heading-16">{domain}</Text>
                        <div className="flex space-x-3">
                            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                                Refresh
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => removeDomain(domain.name)}>
                                Remove
                            </Button>
                        </div>
                    </div>
                    <hr className="border-t border-border" />
                    <div className="flex flex-col pt-3 pb-5 px-5">
                        <Text size="label-14" className="text-wrap">
                            Set the following record on your DNS provider to continue:
                        </Text>
                        <div className="flex flex-col w-full h-fit rounded-lg border border-border p-3 mt-3">
                            <div className="flex w-full">
                                <div className="w-2/12">
                                    <Text size="label-14" color="gray-900" className="text-wrap">Type</Text>
                                </div>
                                <div className="w-2/12">
                                    <Text size="label-14" color="gray-900" className="text-wrap">Name</Text>
                                </div>
                                <div className="w-8/12">
                                    <Text size="label-14" color="gray-900" className="text-wrap">Value</Text>
                                </div>
                            </div>
                            <div className="flex w-full mt-1">
                                <div className="w-2/12">
                                    <Text size="label-14" className="text-wrap">A</Text>
                                </div>
                                <div className="w-2/12">
                                    <Text size="label-14" className="text-wrap">@</Text>
                                </div>
                                <div className="w-8/12">
                                    <Text size="label-14" className="text-wrap">{domain}</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};