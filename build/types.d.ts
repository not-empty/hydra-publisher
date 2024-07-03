export interface PoolJob<T> {
    id: string;
    data: T;
}
export declare enum JobUpdateEvent {
    STARTED = "STARTED",
    FINISHED = "FINISHED",
    ADDED = "ADDED"
}
