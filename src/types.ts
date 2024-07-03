export interface PoolJob<T> {
  id: string;
  data: T;
}

export enum JobUpdateEvent {
  STARTED='STARTED',
  FINISHED='FINISHED',
  ADDED='ADDED',
}
