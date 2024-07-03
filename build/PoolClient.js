"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydraPublisher = void 0;
const redis_1 = __importDefault(require("redis"));
const ulid_1 = require("ulid");
const types_1 = require("./types");
function getRedisClient(options) {
    if (options.redis) {
        return options.redis;
    }
    return redis_1.default.createClient(options.redisOptions);
}
class HydraPublisher {
    constructor(options) {
        this.redisClient = getRedisClient(options);
        this.prefix = options.prefix || 'hydra';
        this.keys = {
            POOL_PENDING: `${this.prefix}_pending`,
            POOL_INITIALIZED: `${this.prefix}_initialized`,
            POOL_EXECUTING: `${this.prefix}_executing`,
            POOL_JOB: `${this.prefix}_job`,
            JOB_UPDATE_EVENT: `${this.prefix}_job_update`,
        };
    }
    addJob(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = {
                id: (0, ulid_1.ulid)(),
                data
            };
            yield this.redisClient.lPush(this.keys.POOL_PENDING, JSON.stringify(job));
            yield this.redisClient.publish(this.keys.JOB_UPDATE_EVENT, types_1.JobUpdateEvent.ADDED);
            return job.id;
        });
    }
    finishJob(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.del(`${this.keys.POOL_JOB}:${jobId}`);
            yield this.redisClient.sRem(this.keys.POOL_EXECUTING, jobId);
            yield this.redisClient.sRem(this.keys.POOL_INITIALIZED, jobId);
            yield this.redisClient.publish(this.keys.JOB_UPDATE_EVENT, types_1.JobUpdateEvent.FINISHED);
        });
    }
    showPool() {
        return __awaiter(this, void 0, void 0, function* () {
            const executing = yield this.redisClient.sMembers(this.keys.POOL_EXECUTING);
            const initialized = yield this.redisClient.sMembers(this.keys.POOL_INITIALIZED);
            const pending = yield this.redisClient.lRange(this.keys.POOL_PENDING, 0, -1);
            return {
                initialized,
                executing,
                pending
            };
        });
    }
}
exports.HydraPublisher = HydraPublisher;
