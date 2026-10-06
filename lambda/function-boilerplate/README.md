# Function Boilerplate

This directory contains a simple boilerplate for creating an AWS Lambda function using TypeScript.

It includes a tsconfig.json file for TypeScript configuration, a package.json file for managing dependencies with PNPM, and some sample Lambda function code.

The package.json `build` script bundles `src/index.ts` with [esbuild](https://esbuild.github.io/) into a single `dist/index.js` file. To add a new function, copy this directory into `lambda/functions/<name>`, rename the package, and add a `data "archive_file"` and `aws_lambda_function` for it in Terraform (see [api.tf](../../terraform/api.tf)). Terraform zips `dist/index.js` itself. `pnpm lambda:build` runs the `build` script of every package in `lambda/functions`.

The included package.json has the [`@types/aws-lambda`](https://www.npmjs.com/package/@types/aws-lambda) and [`@types/node`](https://www.npmjs.com/package/@types/node) packages installed for type definitions, you may remove these if you don't need them. You may also want to install various [AWS SDK (v3) clients](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) for interacting with other AWS services. For lightweight, simple, non-critical use cases, you may also use the built-in AWS SDK that comes pre-installed in the Lambda execution environment. But due to potential future runtime updates, it is generally recommended to bundle the AWS SDK with your deployment package.

## Resources

- [Building Lambda functions with TypeScript](https://docs.aws.amazon.com/lambda/latest/dg/lambda-typescript.html)
