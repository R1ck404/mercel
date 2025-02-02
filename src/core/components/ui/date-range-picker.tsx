"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/core/lib/utils"
import { Button } from "@/core/components/ui/button"
import { Calendar } from "@/core/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/core/components/ui/popover"

export function DateRangePicker({ apply, className }: { apply: (date: { from: Date, to: Date }) => void, className?: string }) {
    const [date, setDate] = React.useState<any>({ from: null, to: null });
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className={`text-nowrap ${className}`} variant={"secondary"}>
                    <span className="flex justify-between items-center space-x-1 w-full">
                        {date.from ? <span>{format(date.from, "PPP")} - {format(date.to, "PPP")}</span> : <div className="flex items-center space-x-2">
                            <CalendarIcon size={18} />
                            <span>Select Date Range</span>
                        </div>}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" onInteractOutside={() => {
                console.log("focus outside");
                if (hasSubmitted) {
                    setHasSubmitted(false);
                } else {
                    setDate({ from: null, to: null });
                }
            }}>
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />

                <div className="p-1 bg-background-100">
                    <Button onClick={() => {
                        setHasSubmitted(true);
                        apply(date);
                        setIsOpen(false);
                    }} className="w-full" variant="secondary">
                        <span>Apply</span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
