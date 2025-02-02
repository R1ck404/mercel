"use client"
import { useState } from "react";
import MenuBar from "./menu-bar";
import { useClient } from "@/core/context/client-context";
import { Button } from "../ui/button";

export default function SubNavbar({
    tabs = [],
    disabledTabs = [],
}: {
    tabs?: string[];
    disabledTabs?: string[];
}) {
    const { setSelectedTab, selectedTab } = useClient();
    const [isOpened, setIsOpened] = useState(false);
    return (
        <nav className="flex justify-between items-center w-full py-1.5 px-2.5 border-b border-border bg-background-100 sticky top-0">
            <MenuBar tabs={tabs} disabledTabs={disabledTabs} />

            <div className="md:hidden flex flex-col items-center w-full">
                <button
                    className="p-1.5 rounded-md bg-primary-500 text-white"
                    onClick={() => setIsOpened((prev) => !prev)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 !ml-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isOpened ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        )}
                    </svg>
                </button>
                {isOpened && (
                    <div className="flex flex-col items-center w-full">
                        {tabs.map((tab) => (
                            <Button key={tab} variant="tertiary" size="sm" className="justify-start w-full disabled:border-none disabled:bg-transparent disabled:opacity-60" onClick={() => setSelectedTab(tab)} disabled={disabledTabs.includes(tab)}>
                                {tab}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

        </nav>
    );
}