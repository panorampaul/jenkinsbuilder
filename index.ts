import { PanoramJenkinsJob, PanoramJenkins } from './jenkins';
import { PulumiClass } from './pulumi';

const JENKINS_URL = 'https://ci2.panoram.co';
const JENKINS_USERNAME = process.env.JENKINS_USERNAME ?? 'devops';
const JENKINS_TOKEN = process.env.JENKINS_TOKEN ?? '';
const PULUMI_ACCESS_TOKEN = process.env.PULUMI_ACCESS_TOKEN ?? '';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? '';
const PULUMI_STACK = process.env.PULUMI_STACK ?? '';
const AWS_REGION = process.env.AWS_REGION ?? 'eu-west-2';

function main() {
    let pj = new PanoramJenkins(JENKINS_URL, JENKINS_TOKEN, JENKINS_USERNAME);

    pj.inspectQueuedBuilds().then((_) => console.log("Inspection complete")).catch((err) => console.error(err));

    pj.listJobsInFolder('infra')
        .then(pipelines => {
            console.log('List of Jenkins pipelines:', pipelines);
        })
        .catch(error => {
            console.error('Failed to get the build status:', error);
        });

}
main();