import {
    BellIcon,
    CheckIcon,
    ChevronsUpDownIcon,
    LogOutIcon,
    PlusCircleIcon,
    SearchIcon,
    MenuIcon,
    ArrowLeftIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";
import { MenuContainer, MenuButton, MenuItem, Menu, DropdownMenuLabel } from "../ui/menu";
import { Input } from "../ui/input";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { useClient } from "@/core/context/client-context";
import { Kbd } from "../ui/kbd";
import { ThemeSwitcher } from "../ui/theme-switcher";
import { createBrowserClient } from "next-pocketbase-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Breadcrumb {
    logo?: boolean;
    team?: boolean;
    project?: {
        id: string;
        name: string;
    } | null;
}

interface NavbarProps {
    breadcrumbs?: Breadcrumb;
}

export default function Navbar({ breadcrumbs }: NavbarProps) {
    const router = useRouter();
    const { user } = useClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logout = async () => {
        const pb = createBrowserClient();
        pb.authStore.clear();
        router.push("/login");
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <nav className="flex justify-between items-center w-full pt-4 pb-2 px-6 bg-background-100">
            <div className="flex items-center space-x-2">
                <div className="lg:hidden">
                    <Button variant="tertiary" size="sm" onClick={handleBack}>
                        <ArrowLeftIcon size={20} />
                    </Button>
                </div>

                <div className="hidden lg:flex items-center space-x-2">
                    <Breadcrumbs breadcrumbs={breadcrumbs} user={user} />
                </div>
            </div>

            <div className="flex items-center space-x-5">
                <div className="hidden lg:flex items-center space-x-2">
                    <Button variant="secondary" size="sm" className="text-gray-900">
                        Feedback
                    </Button>
                    <Button variant="tertiary" size="sm" className="text-gray-900">
                        Changelog
                    </Button>
                    <Button variant="tertiary" size="sm" className="text-gray-900">
                        Help
                    </Button>
                    <Button variant="tertiary" size="sm" className="text-gray-900">
                        Docs
                    </Button>
                </div>

                <div className="lg:hidden">
                    <Button variant="tertiary" size="sm" onClick={toggleMobileMenu}>
                        <MenuIcon size={20} />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="hidden lg:block">
                        <Button variant="secondary" size="tiny" shape="circle" className="relative">
                            <BellIcon size={16} />
                            <div className="absolute -top-0 -right-0 bg-blue-900 w-2.5 h-2.5 rounded-full"></div>
                        </Button>
                    </div>

                    <UserMenu user={user} logout={logout} />
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-16 right-0 bg-background-100 w-full py-4 shadow-lg z-20">
                    <div className="mb-4 flex items-center space-x-2 px-4 border-y py-2">
                        <Breadcrumbs breadcrumbs={breadcrumbs} user={user} />

                        <Button variant="secondary" size="tiny" shape="circle" className="relative !ml-auto">
                            <BellIcon size={16} />
                            <div className="absolute -top-0 -right-0 bg-blue-900 w-2.5 h-2.5 rounded-full"></div>
                        </Button>
                    </div>

                    <div className="p-4">
                        <Button variant="tertiary" size="sm" className="w-full mb-2">
                            Feedback
                        </Button>
                        <Button variant="tertiary" size="sm" className="w-full mb-2">
                            Changelog
                        </Button>
                        <Button variant="tertiary" size="sm" className="w-full mb-2">
                            Help
                        </Button>
                        <Button variant="tertiary" size="sm" className="w-full">
                            Docs
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}

const Breadcrumbs = ({ breadcrumbs, user }: { breadcrumbs?: Breadcrumb; user: any }) => {
    return (
        <>
            {breadcrumbs?.logo && (
                <Link href="/">
                    <svg
                        className="hidden md:block"
                        width="25.0333"
                        height="21.6667"
                        viewBox="0 0 76 65"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#ffffff" />
                    </svg>
                </Link>
            )}

            {breadcrumbs?.logo && breadcrumbs?.team && (
                <svg
                    data-testid="geist-icon"
                    height="16"
                    strokeLinejoin="round"
                    className="hidden md:block w-[22px] h-[22px] text-gray-alpha-400"
                    viewBox="0 0 16 16"
                    width="16"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
                        fill="currentColor"
                    />
                </svg>
            )}

            {breadcrumbs?.team && (
                <>
                    <Link href="/" className="flex items-center space-x-2">
                        {user && <img src={user?.avatar ?? ""} alt="avatar" className="w-5 h-5 rounded-full" />}
                        <Text size="button-14">{user?.username}</Text>
                        <Badge variant="gray-subtle" size="sm">
                            Hobby
                        </Badge>
                    </Link>

                    <MenuContainer>
                        <MenuButton variant="tertiary" size="sm" className="px-0">
                            <ChevronsUpDownIcon size={16} className="text-gray-900" />
                        </MenuButton>
                        <Menu width={250}>
                            <div className="flex items-center relative px-2">
                                <SearchIcon size={24} className="text-gray-700" />
                                <Input placeholder="Find User..." className="w-full border-none" />
                            </div>
                            <DropdownMenuSeparator className="w-full h-px bg-border my-2" />
                            <DropdownMenuLabel className="text-gray-900 font-normal">Users</DropdownMenuLabel>
                            <MenuItem onClick={() => undefined} className="space-x-2 relative">
                                <img src={user?.avatar ?? ""} alt="avatar" className="w-5 h-5 rounded-full" />
                                <Text size="button-14">{user?.username}</Text>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-900">
                                    <CheckIcon size={18} />
                                </div>
                            </MenuItem>
                            <MenuItem onClick={() => undefined} className="space-x-2">
                                <PlusCircleIcon size={18} className="text-blue-900" />
                                <Text size="button-14">Add User</Text>
                            </MenuItem>
                        </Menu>
                    </MenuContainer>
                </>
            )}

            {breadcrumbs?.team && breadcrumbs?.project && (
                <svg
                    data-testid="geist-icon"
                    height="16"
                    strokeLinejoin="round"
                    className="w-[22px] h-[22px] text-gray-alpha-400"
                    viewBox="0 0 16 16"
                    width="16"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
                        fill="currentColor"
                    />
                </svg>
            )}

            {breadcrumbs?.project && (
                <>
                    <Link
                        href={`/${user?.username?.toLowerCase()}s-projects/${breadcrumbs?.project?.id}`}
                        className="flex items-center space-x-2.5"
                    >
                        <svg width="22" height="22" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#ffffff" />
                        </svg>
                        <Text size="button-14">{breadcrumbs?.project?.name}</Text>
                    </Link>

                    <MenuContainer>
                        <MenuButton variant="tertiary" size="sm" className="px-0">
                            <ChevronsUpDownIcon size={16} className="text-gray-900" />
                        </MenuButton>
                        <Menu width={250}>
                            <div className="flex items-center relative px-2">
                                <SearchIcon size={24} className="text-gray-700" />
                                <Input placeholder="Find Project..." className="w-full border-none" />
                            </div>
                            <DropdownMenuSeparator className="w-full h-px bg-border my-2" />
                            <DropdownMenuLabel className="text-gray-900 font-normal">Projects</DropdownMenuLabel>
                            <MenuItem onClick={() => undefined} className="space-x-2 relative">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-800 to-green-700"></div>
                                <Text size="button-14">{breadcrumbs?.project?.name}</Text>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-900">
                                    <CheckIcon size={18} />
                                </div>
                            </MenuItem>
                            <MenuItem onClick={() => undefined} className="space-x-2">
                                <PlusCircleIcon size={18} className="text-blue-900" />
                                <Text size="button-14">Add Project</Text>
                            </MenuItem>
                        </Menu>
                    </MenuContainer>
                </>
            )}
        </>
    );
};

const UserMenu = ({ user, logout }: { user: any; logout: () => void }) => {
    return (
        <MenuContainer>
            <MenuButton variant="tertiary" size="sm" shape="circle" className="!p-0">
                {user && <img src={user?.avatar ?? ""} alt="avatar" className="w-8 h-8 rounded-full" />}
            </MenuButton>
            <Menu width={250} align="end">
                <Text size="label-14" className="!font-semibold text-white p-2">
                    {user?.email}
                </Text>
                <MenuItem className="text-gray-900 hover:text-gray-1000">Dashboard</MenuItem>
                <MenuItem className="text-gray-900 hover:text-gray-1000">Account Settings</MenuItem>
                <MenuItem className="inline-flex justify-between items-center w-full text-gray-900 hover:text-gray-1000">
                    Add User
                    <PlusCircleIcon size={18} className="text-gray-900" />
                </MenuItem>

                <DropdownMenuSeparator className="w-[calc(100% + 0.5rem)] h-px bg-border my-2 -mx-2" />

                <MenuItem
                    className="inline-flex justify-between items-center w-full text-gray-900 hover:text-gray-1000"
                    onClick={() => {
                        document.dispatchEvent(
                            new KeyboardEvent("keydown", {
                                key: "k",
                                code: "KeyK",
                                metaKey: false,
                                ctrlKey: true,
                                shiftKey: false,
                                altKey: false,
                            })
                        );
                    }}
                >
                    Command Menu
                    <div className="space-x-2">
                        <Kbd small>⌘</Kbd>
                        <Kbd small>K</Kbd>
                    </div>
                </MenuItem>

                <div className="inline-flex justify-between items-center w-full text-gray-900 text-sm px-2 h-10" onClick={() => null}>
                    Theme
                    <ThemeSwitcher />
                </div>

                <DropdownMenuSeparator className="w-[calc(100% + 0.5rem)] h-px bg-border my-2 -mx-2" />
                <MenuItem className="text-gray-900 hover:text-gray-1000">Help</MenuItem>
                <MenuItem className="flex justify-between items-center text-gray-900 hover:text-gray-1000" onClick={logout}>
                    <span>Log Out</span>
                    <LogOutIcon size={18} className="text-gray-900" />
                </MenuItem>

                <DropdownMenuSeparator className="w-[calc(100% + 0.5rem)] h-px bg-border my-2 -mx-2" />

                <Link href="https://github.com/R1ck404/mercel" passHref>
                    <Button className="w-full" size="sm">
                        Give us a star!
                    </Button>
                </Link>
            </Menu>
        </MenuContainer>
    );
};