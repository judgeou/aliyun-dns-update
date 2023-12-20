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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var alidns20150109_1 = require("@alicloud/alidns20150109"), $Alidns20150109 = alidns20150109_1;
var $OpenApi = require("@alicloud/openapi-client");
var tea_util_1 = require("@alicloud/tea-util"), $Util = tea_util_1;
var dotenv_1 = require("dotenv");
var https_1 = require("https");
var dayjs_1 = require("dayjs");
var node_os_1 = require("node:os");
(0, dotenv_1.config)();
var _a = process.env, ALIBABA_CLOUD_DOMAIN_NAME = _a.ALIBABA_CLOUD_DOMAIN_NAME, ALIBABA_CLOUD_DOMAIN_RRKEYWORD = _a.ALIBABA_CLOUD_DOMAIN_RRKEYWORD;
var Client = /** @class */ (function () {
    function Client() {
    }
    /**
     * 使用AK&SK初始化账号Client
     * @param accessKeyId
     * @param accessKeySecret
     * @return Client
     * @throws Exception
     */
    Client.createClient = function () {
        var config = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
            // 必填，您的 AccessKey Secret
            accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
        });
        // 访问的域名
        config.endpoint = "alidns.cn-shenzhen.aliyuncs.com";
        return new alidns20150109_1.default(config);
    };
    return Client;
}());
function getDomainIp(type) {
    var _a;
    if (type === void 0) { type = 'A'; }
    return __awaiter(this, void 0, void 0, function () {
        var client, describeDomainRecordsRequest, runtime, body, record, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = Client.createClient();
                    describeDomainRecordsRequest = new $Alidns20150109.DescribeDomainRecordsRequest({
                        domainName: ALIBABA_CLOUD_DOMAIN_NAME,
                        type: type,
                        RRKeyWord: ALIBABA_CLOUD_DOMAIN_RRKEYWORD
                    });
                    runtime = new $Util.RuntimeOptions({});
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.describeDomainRecordsWithOptions(describeDomainRecordsRequest, runtime)];
                case 2:
                    body = (_b.sent()).body;
                    record = (_a = body.domainRecords) === null || _a === void 0 ? void 0 : _a.record;
                    if (record && record.length > 0) {
                        return [2 /*return*/, record[0]];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    tea_util_1.default.assertAsString(err_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setDomainIp(ip, recordId, type) {
    if (type === void 0) { type = 'A'; }
    return __awaiter(this, void 0, void 0, function () {
        var client, updateDomainRecordRequest, runtime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = Client.createClient();
                    updateDomainRecordRequest = new $Alidns20150109.UpdateDomainRecordRequest({
                        recordId: recordId,
                        RR: "@",
                        type: type,
                        value: ip,
                    });
                    runtime = new $Util.RuntimeOptions({});
                    return [4 /*yield*/, client.updateDomainRecordWithOptions(updateDomainRecordRequest, runtime)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getMyIp() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var req = https_1.default.get('https://x.oza-oza.top:4321', function (res) {
                        var data = '';
                        res.on('data', function (chunk) {
                            data += chunk;
                        });
                        res.on('end', function () {
                            resolve(data);
                        });
                        res.on('error', reject);
                    });
                    req.on('error', reject);
                })];
        });
    });
}
function getMyIpv6() {
    var interfaces = node_os_1.default.networkInterfaces();
    var faceNames = Object.keys(interfaces);
    for (var _i = 0, faceNames_1 = faceNames; _i < faceNames_1.length; _i++) {
        var faceName = faceNames_1[_i];
        var iface = interfaces[faceName];
        var iface_r = iface === null || iface === void 0 ? void 0 : iface.filter(function (item) {
            return item.family === 'IPv6' &&
                item.internal === false &&
                /^2\w\w\w:.+/.test(item.address);
        });
        if (iface_r && (iface_r === null || iface_r === void 0 ? void 0 : iface_r.length) > 0) {
            iface_r.sort(function (a, b) { return a.address.length - b.address.length; });
            return iface_r[0].address;
        }
    }
    return null;
}
function updateIp() {
    return __awaiter(this, void 0, void 0, function () {
        var domainIp, myIp, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDomainIp()];
                case 1:
                    domainIp = _a.sent();
                    return [4 /*yield*/, getMyIp()];
                case 2:
                    myIp = _a.sent();
                    now = (0, dayjs_1.default)().format('YYYY-MM-DD HH:mm:ss');
                    if (!(domainIp && domainIp.value !== myIp)) return [3 /*break*/, 4];
                    console.log("[".concat(now, "] ipv4 changed: ").concat(myIp));
                    return [4 /*yield*/, setDomainIp(myIp, domainIp.recordId)];
                case 3:
                    _a.sent();
                    console.log('ipv4 updated');
                    return [3 /*break*/, 5];
                case 4:
                    console.log("[".concat(now, "] ipv4 not changed"));
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateIpv6() {
    return __awaiter(this, void 0, void 0, function () {
        var domainIpv6, myIpv6, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDomainIp('AAAA')];
                case 1:
                    domainIpv6 = _a.sent();
                    myIpv6 = getMyIpv6();
                    now = (0, dayjs_1.default)().format('YYYY-MM-DD HH:mm:ss');
                    if (!(myIpv6 && domainIpv6 && domainIpv6.value !== myIpv6)) return [3 /*break*/, 3];
                    console.log("[".concat(now, "] ipv6 changed: ").concat(myIpv6));
                    return [4 /*yield*/, setDomainIp(myIpv6, domainIpv6.recordId, 'AAAA')];
                case 2:
                    _a.sent();
                    console.log('ipv6 updated');
                    return [3 /*break*/, 4];
                case 3:
                    console.log("[".concat(now, "] ipv6 not changed"));
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function wait(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    setTimeout(resolve, ms);
                })];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!1) return [3 /*break*/, 7];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, updateIp()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, updateIpv6()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error(err_2);
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, wait(1000 * 60)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main();
