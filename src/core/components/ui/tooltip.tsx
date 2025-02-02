"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/core/lib/utils"

const Tooltip = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
        text: string | React.ReactNode,
        delay?: number,
    }
>(({ className, sideOffset = 5, text, children, delay, ...props }, ref) => (
    <TooltipPrimitive.Provider delayDuration={delay}>
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    ref={ref}
                    sideOffset={sideOffset}
                    className={cn(
                        "z-50 overflow-hidden rounded-md border border-border bg-background-100 px-3 py-2 text-[13px] text-gray-100 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                        className
                    )}
                    {...props}
                >
                    <p>{text}</p>
                    <TooltipPrimitive.Arrow className="fill-gray-100" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
))
Tooltip.displayName = TooltipPrimitive.Content.displayName

export { Tooltip }
