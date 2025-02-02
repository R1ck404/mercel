import * as React from "react"

import { cn } from "@/core/lib/utils"

type State = "QUEUED" | "BUILDING" | "ERROR" | "READY" | "CANCELED"

const labels: Record<State, string> = {
    QUEUED: "Queued",
    BUILDING: "Building",
    ERROR: "Error",
    READY: "Ready",
    CANCELED: "Canceled",
}

const colors: Record<State, string> = {
    QUEUED: "bg-status-queued",
    BUILDING: "bg-status-building",
    ERROR: "bg-status-error",
    READY: "bg-status-ready",
    CANCELED: "bg-status-canceled",
}

interface StatusDotProps {
    state: State
    label?: boolean
    className?: string
}

const StatusDot: React.FC<StatusDotProps> = ({ state, label, className }) => {
    return (
        <div className={cn("flex items-center", className)}>
            <div className={cn("h-2.5 w-2.5 rounded-full", colors[state])} />
            {label && <p className="ml-2 text-sm leading-4">{labels[state]}</p>}
        </div>
    )
}

export { StatusDot }
