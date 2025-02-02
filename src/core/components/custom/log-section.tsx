// LogsSection.tsx
import { useState } from "react";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { Text } from "@/core/components/ui/text";
import { LogLine } from "./log-line";

interface LogsSectionProps {
    id?: string;
    title: string;
    logs: string[];
    expanded: boolean;
    onToggle: () => void;
    deploymentCreated: string;
    status: "QUEUED" | "BUILDING" | "ERROR" | "READY" | "CANCELED" | "INVISIBLE";
}

const getIcon = (status: LogsSectionProps["status"]) => {
    switch (status) {
        case "QUEUED":
            return <div className="w-5 h-5 rounded-full bg-yellow-700"></div>;
        case "BUILDING":
            return <div className="w-5 h-5 rounded-full bg-orange-700"></div>;
        case "ERROR":
            return <div className="w-5 h-5 rounded-full bg-red-700"></div>
        case "READY":
            return <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-700">
                <CheckIcon size={14} className="text-card-foreground" strokeWidth={3} />
            </div>;
        case "CANCELED":
            return <div className="w-5 h-5 rounded-full bg-gray-700"></div>;
        case "INVISIBLE":
            return <></>
    }
}

export const LogsSection = ({ id, title, logs, expanded, onToggle, deploymentCreated, status }: LogsSectionProps) => {
    return (
        <>
            <div className="flex justify-between p-6 cursor-pointer" onClick={onToggle} id={id}>
                <div className="flex items-center space-x-3">
                    <ChevronRightIcon size={20} className={`text-gray-900 transition-all ${expanded ? "rotate-90" : "rotate-0"}`} />
                    <Text size="button-14">{title}</Text>
                </div>

                <div className="flex space-x-2">
                    {getIcon(status)}
                </div>
            </div>

            {expanded && (
                <div className="flex flex-col bg-accents-1 overflow-hidden">
                    {logs.map((log, index) => (
                        <LogLine
                            key={`${title}-${index}`}
                            log={log}
                            index={index}
                            previousLog={logs[index - 1]}
                            deploymentCreated={deploymentCreated}
                        />
                    ))}
                    {logs.length === 0 && (
                        <div className="p-6">
                            <Text size="button-14">No logs available</Text>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};