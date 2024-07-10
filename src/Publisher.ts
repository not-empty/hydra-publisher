import { RedisClientOptions, RedisClientType, createClient } from 'redis';
import { ulid } from 'ulid';
import { PoolJob, JobUpdateEvent, HydraHandlers, JobUpdateEventType } from './types';

type RedisClientGeneric = RedisClientType<any, any, any>;
type RedisOptionsGeneric = RedisClientOptions<any, any, any>;

export interface PoolList {
  initialized: string[];
  executing: string[];
  pending: string[];
}

export interface PoolKeys {
  POOL_PENDING: string;
  POOL_INITIALIZED: string;
  POOL_EXECUTING: string;
  POOL_JOB: string;
  JOB_UPDATE_EVENT: string;
}

export interface HydraPublisherOptions<R extends RedisClientGeneric, O extends RedisOptionsGeneric> {
  redis?: R,
  redisOptions?: O,
  prefix?: string
}

function getRedisClient<R extends RedisClientGeneric, O extends RedisOptionsGeneric>(options: HydraPublisherOptions<R, O>) {
  if (options.redis) {
    return options.redis;
  }

  const client = createClient(options.redisOptions) as R;
  client.connect();
  return client;
}

export class HydraPublisher<R extends RedisClientGeneric, O extends RedisOptionsGeneric> {

  private redisClient: R;

  private prefix: string;

  private keys: PoolKeys;

  constructor(options: HydraPublisherOptions<R, O>) {
    this.redisClient = getRedisClient<R, O>(options);
    this.prefix = options.prefix || 'hydra';
    this.keys = {
      POOL_PENDING: `${this.prefix}_pending`,
      POOL_INITIALIZED: `${this.prefix}_initialized`,
      POOL_EXECUTING: `${this.prefix}_executing`,
      POOL_JOB: `${this.prefix}_job`,
      JOB_UPDATE_EVENT: `${this.prefix}_job_update`,
    };

  }

  public async addJob<T>(data: T, handlers?: HydraHandlers): Promise<string> {
    const job: PoolJob<T> = {
      id: ulid(),
      handlers,
      data
    };

    await this.redisClient.lPush(this.keys.POOL_PENDING, JSON.stringify(job));
    await this.sendJobUpdateEvent(job.id, JobUpdateEventType.ADDED);
    return job.id;
  }

  public async finishJob(jobId: string) {
    await this.redisClient.del(`${this.keys.POOL_JOB}:${jobId}`);
    await this.redisClient.sRem(this.keys.POOL_EXECUTING, jobId);
    await this.redisClient.sRem(this.keys.POOL_INITIALIZED, jobId);
    await this.sendJobUpdateEvent(jobId, JobUpdateEventType.FINISHED);
  }

  public async showPool(): Promise<PoolList> {
    const executing = await this.redisClient.sMembers(this.keys.POOL_EXECUTING);
    const initialized = await this.redisClient.sMembers(this.keys.POOL_INITIALIZED);
    const pending = await this.redisClient.lRange(this.keys.POOL_PENDING, 0, -1);

    return {
      initialized,
      executing,
      pending
    };
  }

  public async getJob<T>(jobId: string): Promise<PoolJob<T> | null> {
    const job = await this.redisClient.get(`${this.keys.POOL_JOB}:${jobId}`);
  
    if (!job) {
      return null;
    }
  
    return JSON.parse(job) as PoolJob<T>;
  }

  public async sendToPending(jobId: string) {
    const job = await this.getJob(jobId);

    if (!job) {
      return;
    }

    await this.redisClient.sRem(this.keys.POOL_EXECUTING, jobId);
    await this.redisClient.sRem(this.keys.POOL_INITIALIZED, jobId);
    await this.redisClient.lPush(this.keys.POOL_PENDING, JSON.stringify(job));
    await this.sendJobUpdateEvent(job.id, JobUpdateEventType.ADDED);
  }

  private async sendJobUpdateEvent(jobId: string, type: JobUpdateEventType) {
    const event: JobUpdateEvent = {
      type: JobUpdateEventType.ADDED,
      jobId
    }

    await this.redisClient.publish(this.keys.JOB_UPDATE_EVENT, JSON.stringify(event));
  }

}