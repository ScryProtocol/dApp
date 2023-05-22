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
exports.JsonRpcMulticallProvider = void 0;
const contracts_1 = require("@ethersproject/contracts");
const logger_1 = require("@ethersproject/logger");
const providers_1 = require("@ethersproject/providers");
const Multicall_json_1 = __importDefault(require("./Multicall.json"));
const logger = new logger_1.Logger('0.1.0');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasSigner(obj) {
    return obj.getSigner !== undefined;
}
// Multicall3 is deployed at the same create2 address on basically every chain
// https://github.com/mds1/multicall
const multicall3Address = '0xcA11bde05977b3631167028862bE2a173976CA11';
class JsonRpcMulticallProvider extends providers_1.BaseProvider {
    constructor(provider) {
        super(provider.getNetwork());
        this.parent = provider;
    }
    getSigner(addressOrIndex) {
        if (!hasSigner(this.parent)) {
            return logger.throwError('Parent provider does not support getSigner', logger_1.Logger.errors.NOT_IMPLEMENTED, {
                parent: this.parent,
            });
        }
        return this.parent.getSigner(addressOrIndex);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    perform(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (method === 'call') {
                const reqParams = params;
                const target = reqParams.transaction.to;
                const callData = reqParams.transaction.data;
                // If there is no call data or unknown multicall contract, just passthrough to parent
                if (!target || !callData) {
                    return this.parent.perform(method, params);
                }
                if (!this._pendingBatch) {
                    this._pendingBatch = [];
                }
                const newCall = { request: { target, callData }, resolve: null, reject: null };
                const promise = new Promise((resolve, reject) => {
                    newCall.resolve = resolve;
                    newCall.reject = reject;
                });
                this._pendingBatch.push(newCall);
                if (!this._pendingBatchAggregator) {
                    const provider = this.parent;
                    this._pendingBatchAggregator = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        const batch = this._pendingBatch;
                        if (!batch) {
                            return;
                        }
                        this._pendingBatch = null;
                        this._pendingBatchAggregator = null;
                        const multicall = new contracts_1.Contract(multicall3Address, Multicall_json_1.default.abi, provider);
                        // returns [blockNumber, call results], so results are at index 1
                        const multicallResult = yield multicall.aggregate(batch.map(i => i.request));
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        multicallResult[1].map((result, i) => batch[i].resolve(result));
                        this._pendingBatch = null;
                        this._pendingBatchAggregator = null;
                    }), 10);
                }
                return promise;
            }
            else {
                return this.parent.perform(method, params);
            }
        });
    }
    detectNetwork() {
        return this.parent.detectNetwork();
    }
}
exports.JsonRpcMulticallProvider = JsonRpcMulticallProvider;
//# sourceMappingURL=JsonRpcMulticallProvider.js.map