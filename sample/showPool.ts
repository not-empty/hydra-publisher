import * as Redis from 'redis';
import { HydraPublisher } from '../build';

const redisClient = Redis.createClient();

redisClient.connect();
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis', err);
});

async function main() {
  const hydra = new HydraPublisher({ redis: redisClient });

  const result = await hydra.showPool();

  console.log(`executing ${result.executing.length}\n${result.executing.join('\n')}\n`);
  console.log(`initialized ${result.initialized.length}\n${result.initialized.join('\n')}\n`);
  console.log(`pending ${result.pending.length}\n${result.pending.join('\n')}\n`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
