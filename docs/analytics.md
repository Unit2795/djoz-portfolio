# Analytics

- [Analytics](#analytics)
  - [Links](#links)
  - [Overview](#overview)
  - [Structure](#structure)
    - [Client Side](#client-side)
    - [Serverless Backend (Lambda Functions)](#serverless-backend-lambda-functions)
    - [Local Analytics Dashboard](#local-analytics-dashboard)
  - [Using the Dashboard](#using-the-dashboard)

## Links

[Return to main README.md](../README.md) | [Setup Guide](./setup.md) | [Live Demo](https://acedev.us/) | [Use This Template](https://github.com/Unit2795/djoz-portfolio/generate)

## Overview

This site provides a simple analytics setup to track page visits and user interactions. This includes the client side code to send analytics events, the serverless backend to ingest and process events, and a simple local dashboard to visualize and browse analytics data.

## Structure

### Client Side

The client side code is located in [`client/src/utils/analytics.ts`](../client/src/utils/analytics.ts). It provides some simple utility functions that can be used to send analytics events to the backend.

### Serverless Backend (Lambda Functions)

The serverless backend is implemented using AWS Lambda functions. There are two key functions:

1. [**Analytics Ingest Function**](../lambda/functions/analytics-ingest/src/index.ts): This function receives analytics events from the client side and stores them in SQS for later processing.
2. [**Analytics Processor Function**](../lambda/functions/analytics-processor/src/index.ts): This function runs once a day, shortly after midnight UTC. It processes events from the SQS queue and stores them in S3 as NDJSON files for cost effective warehousing, so the dashboard shows events up to the end of the previous day.

### Local Analytics Dashboard

The local analytics dashboard is a Next.js application that can be run locally to visualize and browse analytics data. It reads the NDJSON files stored in S3 into DuckDB, an efficient OLAP database.

## Using the Dashboard

To use the local analytics dashboard, follow these steps:

1. Ensure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.
2. Duplicate the `.env.example` file in the `analytics` directory and rename it to `.env`.
3. Create a AWS IAM user
4. Create a IAM policy and attach it to the IAM user with the following permissions:
   1. `s3:GetObject`
   2. `s3:GetObjectVersion`
   3. `s3:ListBucket`
   4. Here's an example policy, adjust the bucket name and prefix as needed:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "VisualEditor0",
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": "arn:aws:s3:::analytics-dump-djoz-portfolio",
         "Condition": {
           "StringLike": {
             "s3:prefix": "events/*"
           }
         }
       },
       {
         "Sid": "VisualEditor1",
         "Effect": "Allow",
         "Action": ["s3:GetObject", "s3:GetObjectVersion"],
         "Resource": "arn:aws:s3:::analytics-dump-djoz-portfolio/events/*"
       }
     ]
   }
   ```
5. Create an access key for the IAM user and add the access key ID and secret access key to the `.env` file.
6. Run `pnpm install` to install dependencies in the `analytics` directory.
7. Run `pnpm build` to build the dashboard.
8. Run `pnpm start` to start the dashboard.
9. Open your browser and navigate to `http://localhost:3000` to view the dashboard.
10. Click `Sync` to import new event files from S3 into DuckDB, then select a date range for the analytics data you want to view.
    1. The first sync may take a while. Later syncs only download files that haven't been imported yet.
    2. The data is saved into the DB and persists across restarts of the dashboard. Page loads only read the local DB, so click `Sync` again whenever you want newer data.
    3. If your data in DuckDB is corrupted or stale for some reason, stop the dashboard, delete `analytics/.data`, start it again and click `Sync`.
11. You can apply filters and sorting to the table to find specific events or patterns. The filters and sorting can be combined. The filters can be inclusive/exclusive and can match against partial strings.
12. ℹ️Note: You can use `pnpm dev` to run the dashboard in development mode with hot reloading if you want to make changes to the dashboard code.
13. ⚠️Note: The dashboard is an experimental testbed and simple proof of concept. It is not intended to be a production ready analytics solution. It is intended to be run locally for personal use only. If you want a more robust analytics solution, consider using a third party service like Google Analytics, Plausible, or Fathom.
