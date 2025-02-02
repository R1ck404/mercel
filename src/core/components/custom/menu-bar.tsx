"use client";

import { useState } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { Button } from "../ui/button";
import { useClient } from "@/core/context/client-context";

export default function MenuBar({
    tabs = [],
    disabledTabs = [],
}: {
    tabs?: string[];
    disabledTabs?: string[];
}) {
    const { setSelectedTab, selectedTab } = useClient();

    const [hoveringTab, setHoveringTab] = useState<string | null>(null);

    return (
        <div className="hidden md:flex items-center space-x-2" onMouseLeave={() => setHoveringTab(null)}>
            {tabs.map((tab) => (
                <Button
                    variant={"tertiary"}
                    size={"sm"}
                    className={clsx(
                        "relative cursor-pointer px-2 py-1 text-sm outline-none transition-colors hover:!bg-transparent disabled:border-none disabled:bg-transparent disabled:opacity-60",
                        hoveringTab === tab ? "text-gray-1000" : "text-gray-900",
                        selectedTab === tab && "text-gray-1000",
                        selectedTab === tab && "after:content-[\"\"] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-gray-1000 after:rounded-t-md",
                    )}
                    tabIndex={0}
                    key={tab}
                    onFocus={() => setHoveringTab(tab)}
                    onMouseOver={() => setHoveringTab(tab)}
                    onMouseLeave={() => setHoveringTab(tab)}
                    onClick={() => {
                        if (disabledTabs.includes(tab)) {
                            return;
                        }

                        setSelectedTab(tab);
                    }}
                    disabled={disabledTabs.includes(tab)}
                >
                    {hoveringTab === tab ? (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-md bg-gray-200"
                            initial={false}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    ) : null}
                    <span className="relative text-inherit">{tab}</span>
                </Button>
            ))}
        </div>
    )
}