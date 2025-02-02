import Docker from "dockerode";
import getPort, { portNumbers } from "get-port";
import DockerSingleton from "./docker-instance";

const StreamCleanser = require("docker-stream-cleanser");

const executeCommand = async (command: string, container: Docker.Container, background: boolean = false): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const fullCommand = background ? `${command} > /app/output.log 2>&1 &` : command;

        container.exec({
            Cmd: ['sh', '-c', fullCommand],
            AttachStdout: true,
            AttachStderr: true
        }, (err: any, exec: any) => {
            if (err) return reject(err);

            exec.start((err: any, stream: any) => {
                if (err) return reject(err);

                const logs: string[] = [];
                const streamCleanser = new StreamCleanser();

                stream
                    .pipe(streamCleanser)
                    .on('data', (chunk: Buffer) => {
                        const timestamp = new Date().toISOString();
                        const logLines = chunk.toString().split('\n');

                        logLines.forEach((line) => {
                            if (line.trim()) {
                                const logLine = `[${timestamp}] ${line}`;
                                logs.push(logLine);
                            }
                        });
                    })
                    .on('error', reject)
                    .on('end', () => {
                        if (background) {
                            const timestamp = new Date().toISOString();
                            const logLine = `[${timestamp}] Command started in background: ${command}`;

                            resolve([logLine]);
                        } else {
                            exec.inspect((err: any, data: any) => {
                                if (err) return reject(err);

                                const exitCode = data?.State?.ExitCode ?? 0;
                                console.log(`Command: ${command}`);
                                console.log(`Exit Code: ${exitCode}`);
                                console.log(`Output: ${logs.join('\n')}`);

                                if (exitCode === 0) {
                                    resolve(logs);
                                } else {
                                    reject(`Command failed with exit code ${exitCode}: ${logs.join('\n')}`);
                                }
                            });
                        }
                    });
            });
        });
    });
};

const detectFrameworkAndRun = async (container: Docker.Container, port: number): Promise<string[]> => {
    const packageJsonOutputArray = await executeCommand('cat package.json', container);

    const packageJsonContent = packageJsonOutputArray
        .map((log) => {
            return log.replace(/^\[.*?\] /, '');
        })
        .join('\n')
        .trim();

    let packageJson: { dependencies?: Record<string, string>, devDependencies?: Record<string, string> };
    try {
        packageJson = JSON.parse(packageJsonContent);
    } catch (error: any) {
        throw new Error(`Failed to parse package.json: ${error?.message}\nContent: ${packageJsonContent}`);
    }

    const framework = Object.keys(packageJson.dependencies || {}).concat(Object.keys(packageJson.devDependencies || {}))
        .find(dep => ['react', 'vue', 'svelte', 'next'].includes(dep));

    const commands: Record<string, string> = {
        'react': `npm install && PORT=${port} npm run start`,
        'vue': `npm install && PORT=${port} npm run serve`,
        'svelte': `npm install && PORT=${port} npm run dev`,
        'next': `npm install && PORT=${port} npm run dev`
    };

    const command = commands[framework as keyof typeof commands] || `npm install && PORT=${port} npm start`;

    const [setupCommand, runCommand] = command.split(' && ');

    const setupLogs = await executeCommand(setupCommand, container);
    const runLogs = await executeCommand(runCommand, container, true);

    return [...setupLogs, ...runLogs];
};

const setupContainer = async (
    repoUrl: string,
    pb: any,
    deployment: any,
    accessToken?: string
): Promise<{ container: Docker.Container, port: number, build_logs: string[] }> => {
    const temp_logs: string[] = [];
    const docker = DockerSingleton.getInstance().getDocker();
    const port = await getPort({ port: portNumbers(3000, 3100) });

    const project = await pb.collection("repositories").getOne(deployment.repository);
    const existingContainerId = project.docker_id;

    if (existingContainerId) {
        try {
            const existingContainer = docker.getContainer(existingContainerId);
            await existingContainer.stop();
            await existingContainer.remove(); 
            temp_logs.push("Stopped and removed existing container.");
        } catch (error: any) {
            temp_logs.push(`Failed to stop/remove existing container: ${error.message}`);
        }
    }

    const container = await docker.createContainer({
        Image: "node:23-alpine",
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
        ExposedPorts: { [`${port}/tcp`]: {} },
        HostConfig: {
            PortBindings: { [`${port}/tcp`]: [{ HostPort: `${port}` }] },
            LogConfig: {
                Type: "json-file",
                Config: {
                    "max-size": "10m",
                    "max-file": "3",
                },
            },
        },
        Env: [
            "LANG=C.UTF-8",
            "LC_ALL=C.UTF-8",
        ],
        Cmd: ["/bin/sh"],
        WorkingDir: "/app",
    });

    await container.start().catch(error => {
        pb.collection("deployments").update(deployment.id, {
            status: "ERROR",
            build_logs: {
                ...deployment?.build_logs || {},
                error: error.message
            },
            port: port,
        });
        throw new Error(`Error starting container: ${error.message}`);
    });

    try {
        await executeCommand('mkdir -p /app', container);

        const gitInstallOutput = await executeCommand('apk update && apk add --no-cache git', container);
        temp_logs.push(...gitInstallOutput);

        let authenticatedRepoUrl = repoUrl;
        if (accessToken) {
            authenticatedRepoUrl = repoUrl.replace('https://', `https://${accessToken}@`);
        }

        const gitCloneOutput = await executeCommand(`git clone ${authenticatedRepoUrl} /app`, container);
        temp_logs.push(...gitCloneOutput);

        const frameworkResponse = await detectFrameworkAndRun(container, port);
        temp_logs.push(...frameworkResponse);

        await pb.collection("deployments").update(deployment.id, {
            status: "READY",
            build_logs: temp_logs,
            port: port,
        });

        console.log('Build complete.');
    } catch (error: any) {
        await pb.collection("deployments").update(deployment.id, {
            status: "ERROR",
            build_logs: [...temp_logs, error?.message ?? 'Unknown error'],
            port: port,
        });
        throw new Error(`Error during setup: ${error?.message}`);
    }

    return { container, port, build_logs: temp_logs };
};

export { executeCommand, detectFrameworkAndRun, setupContainer };