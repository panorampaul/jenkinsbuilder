# Introduction

Run Jenkins jobs via CLI

```
pj.listJobsInFolder('infra')
        .then(pipelines => {
            console.log('List of Jenkins pipelines:', pipelines);
        })
        .catch(error => {
            console.error('Failed to get the build status:', error);
        });

```

```

pj.getLastBuildStatus(job)
    .then(status => {
        console.log('Build status:', status);
    })
    .catch(error => {
        console.error('Failed to get the buildstatus:', error);
    });
        
```

## Create a new load balancer

```

let pj = new PanoramJenkins(JENKINS_URL, JENKINS_TOKEN, USERNAME);

let pc = new PulumiClass(PULUMI_ACCESS_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PULUMI_STACK);

let params = {
    'DOMAIN': 'panoram.co',
    'AWS_REGION': AWS_REGION,
    'ZONE_ID': 'Z101009110XXPVF7X94YK',
    'ORG_ID': 'totum',
    'CERTIFICATE_ARN': 'arn:aws:acm:eu-west-2:659554164570:certificate/fcb8eb47-f5d9-4550-a004-1f3ed5caa7f2'
};

const mergedObj = { ...pc, ...params };
let job = new PanoramJenkinsJob('apps_org_load_balancer', 'infra', mergedObj);
pj.triggerBuild(job)
    .then((status) => console.log(status))
    .catch((err) => console.error(err));

```

## Inspect the build queue

```

let pj = new PanoramJenkins(JENKINS_URL, JENKINS_TOKEN, JENKINS_USERNAME);

pj.inspectQueuedBuilds().then((_)=> console.log("Inspection complete")).catch((err)=> console.error(err));


```