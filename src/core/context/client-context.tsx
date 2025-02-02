"use client";
import { createBrowserClient } from "next-pocketbase-auth";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { CommandMenu } from "../components/custom/command-menu";
interface ClientContextType {
    selectedProject: string;
    selectedTeam: string;
    selectedTab: string;
    user: any;
    setUser: (user: any) => void;
    setSelectedProject: (project: string) => void;
    setSelectedTeam: (team: string) => void;
    setSelectedTab: (tab: string) => void;
    pb: any;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pb = createBrowserClient();

    const [user, setUser] = useState<any>(
        pb.authStore.record || null
    );
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState<string>("");

    useEffect(() => {
        setUser(pb.authStore.record);
    }, []);

    return (
        <ClientContext.Provider
            value={{
                selectedProject,
                selectedTeam,
                selectedTab,
                user,
                setUser,
                setSelectedProject,
                setSelectedTeam,
                setSelectedTab,
                pb,
            }}
        >
            {children}
            <CommandMenu user={user} />
        </ClientContext.Provider>
    );
};

export const useClient = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error("useClient must be used within a ClientProvider");
    }
    return context;
};