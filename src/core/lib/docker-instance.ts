import Docker from 'dockerode';

class DockerSingleton {
    private static instance: DockerSingleton;
    private docker: Docker;

    private constructor() {
        this.docker = new Docker();
    }

    public static getInstance(): DockerSingleton {
        if (!DockerSingleton.instance) {
            DockerSingleton.instance = new DockerSingleton();
        }
        return DockerSingleton.instance;
    }

    public getDocker(): Docker {
        return this.docker;
    }
}

export default DockerSingleton;