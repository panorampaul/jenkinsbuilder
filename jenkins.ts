import axios, { AxiosRequestConfig } from 'axios';

interface IJenkinsJob {
    jobName: string;
    params: object;
}


abstract class JenkinsJob implements IJenkinsJob {
    jobName: string;
    params: object;
    folder?: string;
    constructor(jobName: string, folder: string, params: object,) {
        this.jobName = jobName;
        this.params = params;
        this.folder = folder;
    }
}

//concrete class for use in index.ts
export class PanoramJenkinsJob extends JenkinsJob {

}

interface IJenkins {
    url: string;
    apiKey: string;
    username: string;
    headers: AxiosRequestConfig['headers'];
    auth?: AxiosRequestConfig['auth'];
    triggerBuild(job: JenkinsJob): Promise<void>;
    getLastBuildStatus(job: JenkinsJob): Promise<string>;
    getAllJobs(): Promise<string[]>;
    listJobsInFolder(folder: string): Promise<string>;

    inspectQueuedBuilds(): Promise<void>;
}

abstract class Jenkins implements IJenkins {
    url: string;
    apiKey: string;
    username: string;
    crumbData: any;
    headers: AxiosRequestConfig['headers'];
    auth?: AxiosRequestConfig['auth'];

    constructor(url: string, apiKey: string, username: string) {
        this.url = url;
        this.apiKey = apiKey;
        this.username = username;
        this.crumbData = this.getAuthorisationCrumb();
        this.auth = {
            username: this.username,
            password: this.apiKey
        },
            this.headers = {
                'Content-Type': 'application/json',
                [this.crumbData.crumbRequestField]: this.crumbData.crumb
            }
    }
    protected getAuthorisationCrumb(): Promise<any> {
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
            resolve(crumbData);
        })
    }
    triggerBuild(job: JenkinsJob): Promise<any> {
        return new Promise(async (resolve) => {
            try {
                let url = `${this.url}/job/${job.folder}/job/${job.jobName}/buildWithParameters`;
                // Trigger the Jenkins build
                const response = await axios.post(
                    url,
                    null,
                    {
                        params: job.params,
                        auth: this.auth,
                        headers: this.headers
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
        return new Promise(async (resolve) => {
            try {
                let url = `${this.url}/job/${job.folder}/job/${job.jobName}/lastBuild/api/json`;
                const response = await axios.get(url, {
                    auth: this.auth,
                    headers: this.headers
                });
                resolve(response.data);

            } catch (error) {
                throw error;
            }
        });
    }
    listJobsInFolder(folder: string): Promise<string> {
        const url = `${this.url}/job/${folder}/api/json`;
        return new Promise(async (resolve) => {
            try {

                const response = await axios.get(url, {
                    auth: this.auth,
                    headers: this.headers
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
    inspectQueuedBuilds(): Promise<void> {
        const url = `${this.url}/queue/api/json`;
        return new Promise(async (resolve) => {
            try {
                const response = await axios.get(url, {
                    auth: this.auth,
                    headers: this.headers
                });
                const items = response.data.items;
                for (const item of items) {
                    console.log(`ID: ${item.id}`);
                    console.log(`Task Name: ${item.task.name}`);
                    console.log(`Blocked: ${item.blocked}`);
                    console.log(`Buildable: ${item.buildable}`);
                    console.log(`In Queue Since: ${new Date(item.inQueueSince).toLocaleString()}`);
                    console.log(`Reason: ${item.why}`);
                    console.log('------');
                }

                if (Array.isArray(items) && items.length == 0) {
                    console.log("There are no queued builds");
                    console.log('------');
                }

                resolve();
            } catch (error) {
                throw error;
            }

        });
    }
    getAllJobs(): Promise<string[]> {
        return new Promise<string[]>(async (resolve) => {
            try {
                const response = await axios.get(`${this.url}/api/json?tree=jobs[name]`, {
                    auth: this.auth,
                    headers: this.headers
                });
                const data = response.data.jobs.map((job: any) => job.name);
                resolve(data);

            } catch (error) {
                throw error;
            }
        });
    }
}

//concrete class for use in index.ts
export class PanoramJenkins extends Jenkins {


}