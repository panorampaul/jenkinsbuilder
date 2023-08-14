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
