import axios, { AxiosResponse } from 'axios';

interface IJenkinsJob {
    jobName: string;
    params: object;
}

export class PulumiClass extends Object {
    PULUMI_ACCESS_TOKEN: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    PULUMI_STACK: string;

    constructor(pulumiAccessToken: string, awsAccessKeyId: string, awsSecretAccessKey: string, pulumiStack: string) {
        super();
        this.AWS_ACCESS_KEY_ID = awsAccessKeyId;
        this.PULUMI_ACCESS_TOKEN = pulumiAccessToken;
        this.AWS_SECRET_ACCESS_KEY = awsSecretAccessKey;
        this.PULUMI_STACK = pulumiStack;
    }
}

export abstract class JenkinsJob implements IJenkinsJob {
    jobName: string;
    params: object;
    folder?: string;
    constructor(jobName: string, params: object, folder?: string) {
        this.jobName = jobName;
        this.params = params;
        this.folder = folder;
    }
}
interface IJenkins {
    url: string;
    apiKey: string;
    username: string;
    triggerBuild(job: JenkinsJob): Promise<void>;
    getLastBuildStatus(job: JenkinsJob): Promise<string>;
    getAllPipelines(): Promise<string>;
    listJobsInFolder(folder: string): Promise<string>;
    getCrumb(): Promise<any>;
}

export abstract class Jenkins implements IJenkins {
    url: string;
    apiKey: string;
    username: string;

    constructor(url: string, apiKey: string, username: string) {
        this.url = url;
        this.apiKey = apiKey;
        this.username = username;
    }
    listJobsInFolder(folder: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    getCrumb(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getAllPipelines(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    triggerBuild(job: JenkinsJob): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getLastBuildStatus(job: JenkinsJob): Promise<string> {
        throw new Error('Method not implemented.');
    }
}

export class PanoramJenkinsJob extends JenkinsJob {

}

export class PanoramJenkins extends Jenkins {
    getCrumb(): Promise<any> {
        // Panoram Jenkins server has CSRF protection enabled, get the crumb first
        return new Promise(async (resolve) => {
            // Panoram Jenkins server has CSRF protection enabled, get the crumb first
            const crumbResponse = await axios.get(`${this.url}/crumbIssuer/api/json`, {
                auth: {
                    username: this.username,
                    password: this.apiKey
                }
            });
            const crumbData = crumbResponse.data;
            console.log("getCrumb", "status", crumbResponse.status);
            resolve(crumbData);
        })
    }
    triggerBuild(job: JenkinsJob): Promise<any> {

        return new Promise(async (resolve) => {
            try {
                const crumbData = await this.getCrumb();
                let url = `${this.url}/job/${job.jobName}/buildWithParameters`;
                if(job.folder) {
                    url  = `${this.url}/job/${job.folder}/job/${job.jobName}/buildWithParameters`;
                }
                // Trigger the Jenkins build
                const response = await axios.post(
                    url,
                    job.params,
                    {
                        auth: {
                            username: this.username,
                            password: this.apiKey
                        },
                        headers: {
                            [crumbData.crumbRequestField]: crumbData.crumb
                        }
                    }
                );

                console.log('Build triggered:', response.status);
                resolve(response.data);

            } catch (error) {
                console.error('Error triggering Jenkins build:', error);
                resolve(error);
            }
        });
    }
    getLastBuildStatus(job: JenkinsJob): Promise<string> {
        let url = `${this.url}/job/${job.jobName}/lastBuild/api/json`;
        console.log("!!! getLastBuildStatus", job.folder);
        if(job.folder) {
            url  = `${this.url}/job/${job.folder}/job/${job.jobName}/lastBuild/api/json`;
        }
        return new Promise(async (resolve) => {
            try {
                const crumbData = await this.getCrumb();
                const response = await axios.get(url, {
                    auth: {
                        username: this.username,
                        password: this.apiKey
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        [crumbData.crumbRequestField]: crumbData.crumb
                    }
                });
                resolve(response.data);

            } catch (error) {
                throw error;
            }
        });
    }
    getAllPipelines(): Promise<string> {
        const url = `${this.url}/api/json`;

        return new Promise(async (resolve) => {
            try {
                const crumbData = await this.getCrumb();

                const response = await axios.get(url, {
                    auth: {
                        username: this.username,
                        password: this.apiKey
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        [crumbData.crumbRequestField]: crumbData.crumb
                    }
                });

                if (response.data && response.data.jobs) {

                    resolve(response.data.jobs.map((job: any) => job.name));
                } else {
                    resolve('[]');
                }
            } catch (error) {
                throw error;
            }
        });
    }
    listJobsInFolder(folder: string): Promise<string> {
        const url = `${this.url}/job/${folder}/api/json`;

        return new Promise(async (resolve) => {
            try {
                const crumbData = await this.getCrumb();

                const response = await axios.get(url, {
                    auth: {
                        username: this.username,
                        password: this.apiKey
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        [crumbData.crumbRequestField]: crumbData.crumb
                    }
                });

                if (response.data && response.data.jobs) {

                    resolve(response.data.jobs.map((job: any) => job.name));
                } else {
                    resolve('[]');
                }
            } catch (error) {
                throw error;
            }
        });
    }
}