# Hydra Async Pool Pulisher
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

![Architecture sample](https://github.com/not-empty/hydra-publisher/blob/main/hydra.png)

**Hydra Async Pool** is an open-source project designed to manage and limit asynchronous concurrency in high availability and high resource-demanding environments. This tool is essential for applications that need to restrict the number of simultaneous executions of certain tasks due to rate limits or resource constraints.

## Introduction

In high-demand environments, managing the execution of asynchronous concurrent tasks is crucial and hard. Whether dealing with services that impose rate limits, databases with connection limits, or systems with constrained resources, you need a solution that can handle asynchronous concurrency gracefully. **Hydra Async Pool** provides a robust and flexible way to manage and limit the number of concurrent asynchronous jobs, ensuring your system remains stable and performs optimally.

## Features

- **Concurrency Limiting**: Define the maximum number of asynchronous concurrent jobs to prevent brake rate limits or resource exhaustion.
- **Redis Integration**: Uses Redis for efficient and reliable job queue management.
- **Job States Management**: Track and manage job states, including pending, executing, and finished jobs.
- **Real-time Updates**: Subscribe to job updates for real-time monitoring and control.
- **Scalability**: Designed to scale with your application's needs, making it suitable for both small and large deployments.

## Hydra Async Pool

You will need to setup and install the **Hydra Async Pool** from [here](https://github.com/not-empty/hydra. 

## instalation

Install the publisher in all your projects that need to publish and finish jobs

```sh
npm install hydra-publisher
```

## Publish/Finish

Now just publish and finish jobs as you want to, The **Hydra Async Pool** will manage the concurrence and assures that you always have your maximum limit respected.

The Hydra Publisher handles the communication between job publishers, worker nodes, and the job manager. By publishing new jobs and reporting finished jobs, the manager can effectively orchestrate job pooling and ensure that concurrency limits are respected

## Usage

## Publishing
```javascript
import { HydraPublisher } from 'hydra-publisher';

const publisher = new HydraPublisher({ redisOptions: { url: 'redis://localhost:6379' } });

const jobId = await publisher.addJob({ task: 'exampleTask' });
console.log(`Job added with ID: ${jobId}`);
```

## Finishing
```javascript
import { HydraPublisher } from 'hydra-publisher';

const publisher = new HydraPublisher({ redisOptions: { url: 'redis://localhost:6379' } });

// After completing the job
await publisher.finishJob(jobId);
console.log(`Job ${jobId} finished`);
```
By following this setup, the Hydra Async Pool will be able to orchestrate the job pooling, manage concurrency, and ensure efficient job execution across your system.

**Not Empty Foundation - Free codes, full minds**