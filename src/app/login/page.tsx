"use client";

import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Text } from "@/core/components/ui/text";
import { useClient } from "@/core/context/client-context";
import { createBrowserClient } from "next-pocketbase-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
    const [submitError, setSubmitError] = useState<string>("");
    const { setUser, user } = useClient();
    const router = useRouter();

    const handleGitHubLogin = async () => {
        const pb = createBrowserClient();
        try {
            setSubmitError("");

            const user = await pb.collection("users").authWithOAuth2({ provider: "github", scopes: ["user:email", "read:user", "repo", "repo_deployment", "repo:status", "public_repo"] });
            await pb.collection("users").update(user.record.id, {
                access_token: user.meta?.accessToken,
                avatar: user.meta?.avatarURL,
                username: user.meta?.username,
            });

            const completeUser = {
                ...user.record,
                access_token: user.meta?.accessToken,
                avatar: user.meta?.avatarURL,
                username: user.meta?.username,
            }

            setUser(completeUser);

            router.push("/");
        } catch {
            setSubmitError("An unexpected error occurred");
        }
    };

    return (
        <section className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col">
                <>
                    <Text size="heading-32" className="text-center">Log in to Mercel</Text>
                    <div className="flex flex-col space-y-2 mt-6 w-80">
                        <Button variant={"default"} className="bg-[#24292b] text-white" onClick={handleGitHubLogin}>Log in with GitHub</Button>
                    </div>
                </>
            </div>
        </section>
    )
}