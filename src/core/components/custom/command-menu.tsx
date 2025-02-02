"use client"

import { Kbd } from "../ui/kbd"
import { Text } from "../ui/text"
import { Button } from "../ui/button"
import { CoffeeIcon, CogIcon, CopyIcon, LayoutGridIcon, LogOutIcon, MessageCircleIcon, MonitorIcon, PlusIcon, StarIcon, UserIcon, ChevronLeftIcon } from "lucide-react"
import { JSX, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { createBrowserClient } from "next-pocketbase-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

type MenuItem = {
    id: string
    label: string
    icon: JSX.Element
    shortcut?: string
    action?: "event" | "link" | "submenu"
    event?: () => void
    link?: string
    submenu?: MenuItem[]
}

type MenuSection = {
    label: string
    items: MenuItem[]
}

export function CommandMenu({ user }: { user: any }) {
    const { setTheme } = useTheme()
    const [open, setOpen] = useState(false)
    const [currentMenu, setCurrentMenu] = useState<MenuSection[]>([])
    const [menuStack, setMenuStack] = useState<MenuSection[][]>([])
    const router = useRouter();

    const logout = async () => {
        const pb = createBrowserClient();
        pb.authStore.clear();

        router.push("/login");
    };

    const mainMenuSections: MenuSection[] = [
        {
            label: "Projects",
            items: [
                {
                    id: "search-projects",
                    label: "Search Projects",
                    icon: <LayoutGridIcon size={18} className="text-gray-900" />,
                    shortcut: "Shift + P",
                    action: "submenu",
                    submenu: [
                        {
                            id: "project-1",
                            label: "Project 1",
                            icon: <LayoutGridIcon size={18} className="text-gray-900" />,
                            action: "event",
                        },
                        {
                            id: "project-2",
                            label: "Project 2",
                            icon: <LayoutGridIcon size={18} className="text-gray-900" />,
                            action: "event",
                        },
                        {
                            id: "project-3",
                            label: "Project 3",
                            icon: <LayoutGridIcon size={18} className="text-gray-900" />,
                            action: "event",
                        },
                    ],
                },
                {
                    id: "create-project",
                    label: "Create New Project...",
                    icon: <PlusIcon size={18} className="text-gray-900" />,
                    action: "link",
                    link: "/new",
                },
            ],
        },
        {
            label: "General",
            items: [
                {
                    id: "change-theme",
                    label: "Change Theme",
                    icon: <MonitorIcon size={18} className="text-gray-900" />,
                    shortcut: "T",
                    action: "submenu",
                    submenu: [
                        {
                            id: "light",
                            label: "Light",
                            icon: <MonitorIcon size={18} className="text-gray-900" />,
                            action: "event",
                            event: () => setTheme("light"),
                        },
                        {
                            id: "dark",
                            label: "Dark",
                            icon: <MonitorIcon size={18} className="text-gray-900" />,
                            action: "event",
                            event: () => setTheme("dark"),
                        },
                        {
                            id: "system",
                            label: "System",
                            icon: <MonitorIcon size={18} className="text-gray-900" />,
                            action: "event",
                            event: () => setTheme("system"),
                        },
                    ],
                },
                {
                    id: "copy-url",
                    label: "Copy Current URL",
                    icon: <CopyIcon size={18} className="text-gray-900" />,
                    action: "event",
                    event: () => {
                        toast.success("URL copied to clipboard")
                        navigator.clipboard.writeText(window.location.href)
                    },
                },
            ],
        },
        {
            label: "Quick Copy",
            items: [
                {
                    id: "copy-user-id",
                    label: "Copy User ID",
                    icon: <CopyIcon size={18} className="text-gray-900" />,
                    action: "event",
                    event: () => {
                        toast.success("User ID copied to clipboard")
                        navigator.clipboard.writeText("user-123")
                    },
                },
                {
                    id: "scope-settings",
                    label: "Scope Settings...",
                    icon: <CogIcon size={18} className="text-gray-900" />,
                    action: "event",
                    event: () => console.log("Scope Settings clicked"),
                },
                {
                    id: "switch-scope",
                    label: "Switch Scope...",
                    icon: <UserIcon size={18} className="text-gray-900" />,
                    action: "submenu",
                    submenu: [
                        {
                            id: "user-1",
                            label: user?.username,
                            icon: <img src={user?.avatar} alt={user?.username} className="w-6 h-6 rounded-full" />,
                        },
                        {
                            id: "add-user",
                            label: "Add User",
                            icon: <UserIcon size={18} className="text-gray-900" />,
                            action: "event",
                        },
                    ],
                },
                {
                    id: "log-out",
                    label: "Log Out",
                    icon: <LogOutIcon size={18} className="text-gray-900" />,
                    action: "event",
                    event: () => logout(),
                },
            ],
        },
        {
            label: "Extra",
            items: [
                {
                    id: "buy-coffee",
                    label: "Buy Me A Coffee!",
                    icon: <CoffeeIcon size={18} className="text-gray-900" />,
                    action: "link",
                    link: "https://buymeacoffee.com/r1ck404",
                },
                {
                    id: "send-feedback",
                    label: "Send Feedback...",
                    icon: <MessageCircleIcon size={18} className="text-gray-900" />,
                    action: "link",
                    link: "https://github.com/r1ck404/mercel/issues",

                },
                {
                    id: "star-github",
                    label: "Star On GitHub",
                    icon: <StarIcon size={18} className="text-gray-900" />,
                    action: "link",
                    link: "https://github.com/r1ck404/mercel",
                },
            ],
        },
    ]

    useEffect(() => {
        if (open) {
            setCurrentMenu(mainMenuSections)
        }
    }, [open])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            } else if (e.key === "Escape") {
                if (menuStack.length > 0) {
                    setCurrentMenu(menuStack[menuStack.length - 1])
                    setMenuStack((stack) => stack.slice(0, -1))
                } else {
                    setOpen(false)
                }
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [menuStack])

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.action === "submenu" && item.submenu) {
            setMenuStack((stack) => [...stack, currentMenu])
            setCurrentMenu([{ label: item.label, items: item.submenu }])
        } else if (item.action === "event" && item.event) {
            item.event()
        }
    }

    return (
        <>
            {open && (
                <>
                    <div className="fixed w-screen h-screen top-0 left-0 flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-screen h-screen bg-background-100/80 transition-colors z-10" onClick={() => setOpen(false)}></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                            transition={{ duration: 0.05 }}
                            className="bg-background-100 rounded-xl border border-border shadow-lg w-[640px] relative z-50"
                        >
                            <div className="p-2 relative">
                                {menuStack.length > 0 && (
                                    <Button
                                        variant={"tertiary"}
                                        className="absolute top-1/2 -translate-y-1/2 left-2 p-2"
                                        onClick={() => {
                                            setCurrentMenu(menuStack[menuStack.length - 1])
                                            setMenuStack((stack) => stack.slice(0, -1))
                                        }}
                                    >
                                        <ChevronLeftIcon size={18} className="text-gray-900" />
                                    </Button>
                                )}
                                <input type="text" className="focus:outline-none px-2 text-xl w-full h-10 rounded-lg bg-transparent text-gray-900 placeholder:text-gray-900" placeholder="What do you need?" />
                                <Kbd className="absolute top-1/2 -translate-y-1/2 right-4 hover:border-white">Esc</Kbd>
                            </div>
                            <hr />

                            <div className="flex flex-col p-2 max-h-[27.5rem] overflow-y-scroll">
                                <AnimatePresence mode="wait">
                                    {currentMenu.map((section) => (
                                        <div key={section.label}>
                                            <Text size="label-14" className="px-2 py-3" color="gray-900">
                                                {section.label}
                                            </Text>
                                            {section.items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10, filter: "blur(12px)" }}
                                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                                    exit={{ opacity: 0, y: -10, filter: "blur(12px)" }}
                                                    transition={{ duration: 0.05 }}
                                                >
                                                    {item.action === "link" ? (
                                                        <Link href={item.link || ""} passHref>
                                                            <Button variant={"tertiary"} className="inline-flex justify-between items-center w-full" onClick={() => handleMenuItemClick(item)}>
                                                                <div className="flex items-center space-x-4">
                                                                    {item.icon}
                                                                    <Text size="label-14">{item.label}</Text>
                                                                </div>
                                                                {item.shortcut && (
                                                                    <div className="flex space-x-2 items-center">
                                                                        <Kbd>{item.shortcut}</Kbd>
                                                                    </div>
                                                                )}
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant={"tertiary"} className="inline-flex justify-between items-center w-full" onClick={() => handleMenuItemClick(item)}>
                                                            <div className="flex items-center space-x-4">
                                                                {item.icon}
                                                                <Text size="label-14">{item.label}</Text>
                                                            </div>
                                                            {item.shortcut && (
                                                                <div className="flex space-x-2 items-center">
                                                                    <Kbd>{item.shortcut}</Kbd>
                                                                </div>
                                                            )}
                                                        </Button>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </>
    )
}