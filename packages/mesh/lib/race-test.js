"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var test_1 = require("./test");
var index_1 = require("./index");
describe(__filename + "#", function () {
    it("can be called", function () {
        index_1.race();
    });
    it("can return yielded values from one function", function () { return __awaiter(_this, void 0, void 0, function () {
        var fn, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fn = index_1.race(function (a) { return a + 1; });
                    _a = chai_1.expect;
                    return [4 /*yield*/, index_1.readAll(fn(1))];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.eql([2]);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns one yielded value of multiple called functions", function () { return __awaiter(_this, void 0, void 0, function () {
        var fn, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fn = index_1.race(function (a) { return a + 1; }, function (b) { return b + 2; }, function (c) { return c + 3; });
                    _a = chai_1.expect;
                    return [4 /*yield*/, index_1.readAll(fn(1))];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.eql([2]);
                    return [2 /*return*/];
            }
        });
    }); });
    it("returns yielded values from the fastest target function", function () { return __awaiter(_this, void 0, void 0, function () {
        var fn, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fn = index_1.race(function (a) { return test_1.timeout(100).then(function () { return a + 1; }); }, function (a) { return test_1.timeout(50).then(function () { return a + 2; }); }, function (a) { return test_1.timeout(150).then(function () { return a + 3; }); });
                    _a = chai_1.expect;
                    return [4 /*yield*/, index_1.readAll(fn(1))];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.eql([3]);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=race-test.js.map