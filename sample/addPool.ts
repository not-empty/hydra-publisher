import * as Redis from 'redis';
import { HydraPublisher } from '../build';

const redisClient = Redis.createClient();

redisClient.connect();
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis', err);
});

async function main() {
  const numJobs = process.argv[2] ? parseInt(process.argv[2], 10) : 1;
  const hydra = new HydraPublisher({ redis: redisClient });

  for (let i = 0; i < numJobs; i++) {
    const jobId = await hydra.addJob({ sampleData: `data ${i}` });
    console.log(`added job ${jobId}`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
