import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "next-pocketbase-auth";
import { exec } from "child_process";
import dns from "dns/promises";
import fs from "fs";

export async function POST(req: NextRequest) {
    const pb = createServerClient(await cookies());
    const session = pb.authStore.record;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { project_id, domain, port } = await req.json();
    console.log("args:", project_id, domain, port);

    if (!project_id || !domain || !port || domain.length === 0) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serverIP = process.env.NEXT_PUBLIC_SERVER_IP || "89.117.134.119";

    try {
        const records = await dns.resolve(domain, "A");

        if (!records.includes(serverIP)) {
            return NextResponse.json({ error: "DNS record not pointing to the server IP." }, { status: 400 });
        }

        const newDomain = await pb.collection("repositories").update(project_id, {
            domain_data: {
                domains: [domain],
                port: port,
            },
        });

        const nginxConfig = `
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
        `;

        const configPath = `/etc/nginx/sites-available/${domain}`;
        fs.writeFileSync(configPath, nginxConfig);

        fs.symlinkSync(configPath, `/etc/nginx/sites-enabled/${domain}`);

        exec("sudo systemctl reload nginx", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error reloading Nginx: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Nginx stderr: ${stderr}`);
                return;
            }
            console.log(`Nginx reloaded: ${stdout}`);
        });

        exec(`sudo certbot --nginx -d ${domain} --non-interactive --agree-tos --redirect`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error obtaining SSL certificate: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Certbot stderr: ${stderr}`);
                return;
            }
            console.log(`SSL certificate obtained: ${stdout}`);
        });

        return NextResponse.json({ domain: newDomain }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}