import { PanoramJenkinsJob, PanoramJenkins } from './jenkins';
import { PulumiClass } from './pulumi';
import yargs from 'yargs';

const JENKINS_URL = 'https://ci2.panoram.co';
const JENKINS_USERNAME = process.env.JENKINS_USERNAME ?? 'devops';
const JENKINS_TOKEN = process.env.JENKINS_TOKEN ?? '';
const PULUMI_ACCESS_TOKEN = process.env.PULUMI_ACCESS_TOKEN ?? '';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? '';
const PULUMI_STACK = process.env.PULUMI_STACK ?? '';
const AWS_REGION = process.env.AWS_REGION ?? 'eu-west-2';
const AWS_CERTIFICATE_ARN = process.env.AWS_CERTIFICATE_ARN ?? '';
const ORG_ID = process.env.ORG_ID ?? 'panoram';


const parser = yargs
    .option('inspect', {
        alias: 'i',
        describe: 'Inspect',
        type: 'boolean',
    })
    .option('list', {
        alias: 'l',
        describe: 'List jobs in folder',
        type: 'boolean',
    })
    .option('get', {
        alias: 'g',
        describe: 'Get all jobs',
        type: 'boolean',
    })
    .option('lb', {
        alias: 'b',
        describe: 'Create a load balancer',
        type: 'boolean',
    })
    .help();

async function main() {
    let pj = new PanoramJenkins(JENKINS_URL, JENKINS_TOKEN, JENKINS_USERNAME);
    let pc = new PulumiClass(PULUMI_ACCESS_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PULUMI_STACK);
    var argv = await parser.argv;
    if (argv.inspect) {
        pj.inspectQueuedBuilds().then((_) => console.log("Inspection complete")).catch((err) => console.error(err));
    } else if (argv.list) {
        pj.listJobsInFolder('infra')
            .then(pipelines => {
                console.log('List of Jenkins pipelines:', pipelines);
            })
            .catch(error => {
                console.error('Failed to get the build status:', error);
            });
    } else if (argv.get) {
        console.log("Getting jobs");
        const jobs = await pj.getAllJobs();
        for (const job of jobs) {
            pj.listJobsInFolder(job)
                .then(pipelines => {
                    console.log('folder', job, 'List of Jenkins pipelines: ', pipelines);
                })
                .catch(error => {
                    console.error('Failed to get the build status:', error);
                });
        }
    } else if (argv.lb) {

        if (AWS_CERTIFICATE_ARN === '') {
            console.error("Set your aws certificate path as an environment variable AWS_CERTIFICATE_ARN")
        } else {
            let params = {
                'DOMAIN': 'panoram.co',
                'AWS_REGION': AWS_REGION,
                'ZONE_ID': 'Z101009110XXPVF7X94YK',
                'ORG_ID': ORG_ID,
                'CERTIFICATE_ARN': AWS_CERTIFICATE_ARN
            };

            const mergedObj = { ...pc, ...params };
            let job = new PanoramJenkinsJob('apps_org_load_balancer', 'infra', mergedObj);
            pj.triggerBuild(job)
                .then((status) => console.log(status))
                .catch((err) => console.error(err));
        }
    } else {
        console.log("Please provide a valid command. Use --help for usage instructions.");
    }
}



main();