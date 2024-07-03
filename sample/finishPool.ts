import * as Redis from 'redis';
import { HydraPublisher } from '../build';

const redisClient = Redis.createClient();

redisClient.connect();
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis', err);
});

async function main() {
  const jobId = process.argv[2];
  if (jobId) {
    const hydra = new HydraPublisher({ redis: redisClient });

    await hydra.finishJob(jobId);
    process.exit(0);
  } else {
    console.error('Please provide a jobId to finish');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
