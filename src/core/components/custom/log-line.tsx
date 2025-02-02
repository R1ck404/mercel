import { Text } from "@/core/components/ui/text";
import { Tooltip } from "@/core/components/ui/tooltip";
import { formatRelativeTime, formatRelativeTimePrecise, formatTimestamp, formatTimestampLong, getNumericTimestamp } from "@/core/lib/time-helpers";

interface LogLineProps {
    log: string;
    index: number;
    previousLog?: string;
    deploymentCreated: string;
}

export const LogLine = ({ log, index, previousLog, deploymentCreated }: LogLineProps) => {
    const [timestamp, message] = log.split("]");

    if (!timestamp || !message) {
        return null;
    }

    const cleanedTimestamp = timestamp.replace("[", "");
    const formattedLastTimestamp = previousLog?.split("]")[0].replace("[", "");

    return (
        <div className="inline-flex items-center space-x-2 hover:bg-background-100 px-6" key={index}>
            <Tooltip
                className="cursor-pointer font-mono"
                delay={0}
                text={
                    <div className="flex flex-col">
                        <div className="flex items-center w-full">
                            <Text size="label-12" color="gray-900" className="w-40">Local</Text>
                            <Text size="label-14">{formatTimestampLong(cleanedTimestamp)}</Text>
                        </div>

                        <div className="flex items-center w-full">
                            <Text size="label-12" color="gray-900" className="w-40">UTC</Text>
                            <Text size="label-14">{formatTimestamp(cleanedTimestamp)}</Text>
                        </div>

                        <div className="flex items-center w-full">
                            <Text size="label-12" color="gray-900" className="w-40">Timestamp</Text>
                            <Text size="label-14">{getNumericTimestamp(cleanedTimestamp)}</Text>
                        </div>

                        <div className="flex items-center w-full">
                            <Text size="label-12" color="gray-900" className="w-40">Relative to start</Text>
                            <Text size="label-14">
                                {formatRelativeTime(
                                    getNumericTimestamp(cleanedTimestamp) - getNumericTimestamp(deploymentCreated)
                                )}
                            </Text>
                        </div>

                        <div className="flex items-center w-full">
                            <Text size="label-12" color="gray-900" className="w-40">Relative to previous</Text>
                            <Text size="label-14">
                                {formattedLastTimestamp ? (
                                    formatRelativeTimePrecise(
                                        getNumericTimestamp(cleanedTimestamp) -
                                        getNumericTimestamp(formattedLastTimestamp)
                                    )
                                ) : (
                                    "N/A"
                                )}
                            </Text>
                        </div>
                    </div>
                }
                sideOffset={0}
                side="right"
            >
                <span className="text-sm w-28 font-mono py-0.5">{formatTimestamp(cleanedTimestamp)}</span>
            </Tooltip>
            <Text size="label-14" className="py-0.5">{message}</Text>
        </div>
    );
};