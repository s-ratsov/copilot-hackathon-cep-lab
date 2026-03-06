"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const http = __importStar(require("http"));
const makeRequest = (path) => {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk.toString();
            });
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
};
describe('Node Server', () => {
    it('should return "key not passed" if key is not passed', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/get');
        assert.strictEqual(data, 'key not passed');
    }));
    it('should return "hello world" if key is equal to world', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/get?key=world');
        assert.strictEqual(data, 'hello world');
    }));
    it('should return number of days between two dates', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/daysbetweendates?date1=2024-01-01&date2=2024-01-11');
        assert.strictEqual(data, '10');
    }));
    it('should return valid for a valid Spanish phone number', () => __awaiter(void 0, void 0, void 0, function* () {
        const encodedPhoneNumber = encodeURIComponent('+34666777888');
        const data = yield makeRequest(`/validatephonenumber?phoneNumber=${encodedPhoneNumber}`);
        assert.strictEqual(data, 'valid');
    }));
    it('should return invalid for an invalid Spanish phone number', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/validatephonenumber?phoneNumber=666777888');
        assert.strictEqual(data, 'invalid');
    }));
    it('should return valid for a valid Spanish DNI', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/validatespanishdni?dni=12345678Z');
        assert.strictEqual(data, 'valid');
    }));
    it('should return invalid for an invalid Spanish DNI', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/validatespanishdni?dni=12345678A');
        assert.strictEqual(data, 'invalid');
    }));
    it('should return the hex code for red', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/returncolorcode?color=red');
        assert.strictEqual(data, '#FF0000');
    }));
    it('should parse a URL and return the parsed host', () => __awaiter(void 0, void 0, void 0, function* () {
        const encodedUrl = encodeURIComponent('https://example.com:8080/path?a=1#hash');
        const data = yield makeRequest(`/parseurl?someurl=${encodedUrl}`);
        const parsed = JSON.parse(data);
        assert.strictEqual(parsed.parsedHost, 'example.com:8080');
        assert.strictEqual(parsed.protocol, 'https:');
        assert.strictEqual(parsed.path, '/path');
    }));
    it('should return files from the current directory', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/listfiles');
        const files = JSON.parse(data);
        assert.ok(files.includes('nodeserver.ts'));
        assert.ok(files.includes('test.ts'));
    }));
    it('should return lines containing Fusce from full text file read', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/getfulltextfile');
        const lines = JSON.parse(data);
        assert.ok(lines.length > 0);
        assert.ok(lines.every((line) => line.includes('Fusce')));
    }));
    it('should return lines containing Fusce using line-by-line file read', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/getlinebylinefromttextfile');
        const lines = JSON.parse(data);
        assert.ok(lines.length > 0);
        assert.ok(lines.every((line) => line.includes('Fusce')));
    }));
    it('should return process memory consumption in GB with 2 decimals', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/calculatememoryconsumption');
        assert.ok(/^\d+\.\d{2}$/.test(data));
    }));
    it('should return a random European country and ISO code', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeRequest('/randomeuropeancountry');
        const country = JSON.parse(data);
        assert.ok(country.country.length > 0);
        assert.ok(/^[A-Z]{2}$/.test(country.isoCode));
    }));
});
