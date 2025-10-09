# Function Boilerplate

This directory contains a simple boilerplate for creating an AWS Lambda function using TypeScript.

It includes a tsconfig.json file for TypeScript configuration, a package.json file for managing dependencies with PNPM, some sample Lambda function code, and a build.config.json file for configuring the build process.

The build script expects a `src` directory containing an `index.ts` or `index.js` file with the Lambda function code. A `build.config.json` file is also required, even if empty.

The included package.json has the [`@types/aws-lambda`](https://www.npmjs.com/package/@types/aws-lambda) and [`@types/node`](https://www.npmjs.com/package/@types/node) packages installed for type definitions, you may remove these if you don't need them. You may also want to install various [AWS SDK (v3) clients](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) for interacting with other AWS services. For lightweight, simple, non-critical use cases, you may also use the built-in AWS SDK that comes pre-installed in the Lambda execution environment. But due to potential future runtime updates, it is generally recommended to bundle the AWS SDK with your deployment package.

The build config can be used to customize the runtime target, disable building of the function if it's disabled in the terraform.tfvars file, and skip the build or zip steps if the code doesn't not need to be transpiled or zipped.

Code that doesn't need to built is typically code that is written in plain JavaScript without any dependencies.

Code that doesn't need to be zipped can include cloudfront functions, which are not supplied as zip files to Terraform.

If you disable infrastructure outside of the terraform.tfvars file, such as using a remote variable or environment variable, this will not be picked up by the build script. You can manually set the `disable` field in the `build.config.json` file to true to skip that function entirely. Setting `disable` to true is the same as setting both `skipBuild` and `skipZip` to true.

## Resources

- [Building Lambda functions with TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html)
