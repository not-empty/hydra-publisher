import { RedisClientOptions, RedisClientType } from 'redis';
import { PoolJob, HydraHandlers } from './types';
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
    redis?: R;
    redisOptions?: O;
    prefix?: string;
}
export declare class HydraPublisher<R extends RedisClientGeneric, O extends RedisOptionsGeneric> {
    private redisClient;
    private prefix;
    private keys;
    constructor(options: HydraPublisherOptions<R, O>);
    addJob<T>(data: T, handlers?: HydraHandlers): Promise<string>;
    finishJob(jobId: string): Promise<void>;
    showPool(): Promise<PoolList>;
    getJob<T>(jobId: string): Promise<PoolJob<T> | null>;
    sendToPending(jobId: string): Promise<void>;
    connect(): Promise<void>;
    close(): Promise<void>;
    private sendJobUpdateEvent;
}
export {};
