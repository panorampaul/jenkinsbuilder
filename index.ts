import { PulumiClass, PanoramJenkinsJob, PanoramJenkins } from './jenkins';

const JENKINS_URL = 'https://ci2.panoram.co';
const USERNAME = 'paul';
const JENKINS_TOKEN = process.env.JENKINS_TOKEN ?? '';
const PULUMI_ACCESS_TOKEN = process.env.PULUMI_ACCESS_TOKEN ?? '';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? '';
const PULUMI_STACK = process.env.PULUMI_STACK ?? '';
const ORG_ID = process.env.ORG_ID ?? '';
function main() {
    let pj = new PanoramJenkins(JENKINS_URL, JENKINS_TOKEN, USERNAME);

    let pc = new PulumiClass(PULUMI_ACCESS_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PULUMI_STACK);

    let params = {
        'CERTIFICATE_ARN': 'arn:aws:acm:eu-west-2:659554164570:certificate/f3949cd6-ee6f-4958-82ac-bf1c5c620c53',
        'DOMAIN': 'panoram.co',
        'REGION': 'eu-west-2',
        'ZONE_ID': 'Z101009110XXPVF7X94YK',
        'ORG_ID': 'totum',
    
    };
    const mergedObj = { ...pc, ...params };
    let job = new PanoramJenkinsJob('apps_org_load_balancer', mergedObj, 'infra'
    );

    pj.listJobsInFolder('infra')
        .then(pipelines => {
            console.log('List of Jenkins pipelines:', pipelines);
        })
        .catch(error => {
            console.error('Failed to get the build status:', error);
        });

    pj.getLastBuildStatus(job)
        .then(status => {
            console.log('Build status:', status);
        })
        .catch(error => {
            console.error('Failed to get the build status:', error);
        });
}
main();