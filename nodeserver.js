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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
/**
 * In-memory list of European countries used by `/randomeuropeancountry`.
 */
const europeanCountries = [
    { country: 'Spain', isoCode: 'ES' },
    { country: 'France', isoCode: 'FR' },
    { country: 'Germany', isoCode: 'DE' },
    { country: 'Italy', isoCode: 'IT' },
    { country: 'Portugal', isoCode: 'PT' },
    { country: 'Netherlands', isoCode: 'NL' },
    { country: 'Belgium', isoCode: 'BE' },
    { country: 'Sweden', isoCode: 'SE' },
    { country: 'Norway', isoCode: 'NO' },
    { country: 'Poland', isoCode: 'PL' },
    { country: 'Ireland', isoCode: 'IE' },
    { country: 'Switzerland', isoCode: 'CH' },
    { country: 'Austria', isoCode: 'AT' },
    { country: 'Greece', isoCode: 'GR' },
    { country: 'Denmark', isoCode: 'DK' }
];
/**
 * Send a plain-text HTTP 200 response.
 * @param res HTTP response object
 * @param text Body text to send
 */
const sendText = (res, text) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(text);
};
/**
 * Send a JSON HTTP 200 response.
 * @param res HTTP response object
 * @param value Value to JSON-stringify and send
 */
const sendJson = (res, value) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(value));
};
/**
 * Return lines from an in-memory text blob that contain `word`.
 * @param content Full text to search
 * @param word Substring to match
 * @returns Array of matching lines
 */
const listLinesContainingWord = (content, word) => {
    return content.split(/\r?\n/).filter((line) => line.includes(word));
};
/**
 * Stream a file and return lines that contain `word`.
 * This is memory-efficient for large files.
 * @param filePath Path to the file to read
 * @param word Substring to match
 * @returns Array of matching lines
 */
const readLinesContainingWord = (filePath, word) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const found = [];
    const stream = fs_1.default.createReadStream(filePath, { encoding: 'utf-8' });
    const reader = readline_1.default.createInterface({
        input: stream,
        crlfDelay: Infinity
    });
    try {
        for (var _d = true, reader_1 = __asyncValues(reader), reader_1_1; reader_1_1 = yield reader_1.next(), _a = reader_1_1.done, !_a; _d = true) {
            _c = reader_1_1.value;
            _d = false;
            const line = _c;
            if (line.includes(word)) {
                found.push(line);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = reader_1.return)) yield _b.call(reader_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return found;
});
/**
 * Simple demo HTTP API server used for exercises and examples.
 *
 * Supported endpoints:
 * - /get
 * - /daysbetweendates
 * - /validatephonenumber
 * - /validatespanishdni
 * - /returncolorcode
 * - /tellmeajoke
 * - /moviesbydirector
 * - /parseurl
 * - /listfiles
 * - /getfulltextfile
 * - /getlinebylinefromttextfile
 * - /calculatememoryconsumption
 * - /randomeuropeancountry
 */
const nodeServer = http_1.default.createServer((req, res) => {
    void (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const url = new URL((_a = req.url) !== null && _a !== void 0 ? _a : '/', `http://${(_b = req.headers.host) !== null && _b !== void 0 ? _b : 'localhost:3000'}`);
        const pathname = url.pathname.toLowerCase();
        // Basic greeting endpoints.
        if (pathname === '/get') {
            const key = url.searchParams.get('key');
            if (!key) {
                sendText(res, 'key not passed');
                return;
            }
            sendText(res, `hello ${key}`);
            return;
        }
        // Date and validation endpoints.
        if (pathname === '/daysbetweendates') {
            const date1 = url.searchParams.get('date1');
            const date2 = url.searchParams.get('date2');
            if (!date1 || !date2) {
                sendText(res, 'date1 and date2 are required');
                return;
            }
            const firstDate = new Date(date1);
            const secondDate = new Date(date2);
            if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
                sendText(res, 'invalid date format');
                return;
            }
            const msDifference = Math.abs(firstDate.getTime() - secondDate.getTime());
            const days = Math.round(msDifference / (1000 * 60 * 60 * 24));
            sendText(res, String(days));
            return;
        }
        if (pathname === '/validatephonenumber') {
            const phoneNumber = url.searchParams.get('phoneNumber');
            if (!phoneNumber) {
                sendText(res, 'invalid');
                return;
            }
            const spanishPhoneRegex = /^\+34\d{9}$/;
            sendText(res, spanishPhoneRegex.test(phoneNumber) ? 'valid' : 'invalid');
            return;
        }
        if (pathname === '/validatespanishdni') {
            const dni = ((_c = url.searchParams.get('dni')) !== null && _c !== void 0 ? _c : '').toUpperCase();
            const dniMatch = dni.match(/^(\d{8})([A-Z])$/);
            if (!dniMatch) {
                sendText(res, 'invalid');
                return;
            }
            const dniNumber = Number(dniMatch[1]);
            const dniLetter = dniMatch[2];
            const expectedLetter = dniLetters[dniNumber % 23];
            sendText(res, dniLetter === expectedLetter ? 'valid' : 'invalid');
            return;
        }
        // File-based lookup endpoint.
        if (pathname === '/returncolorcode') {
            const color = ((_d = url.searchParams.get('color')) !== null && _d !== void 0 ? _d : '').toLowerCase();
            if (!color) {
                sendText(res, 'color is required');
                return;
            }
            const colorsPath = path_1.default.join(__dirname, 'colors.json');
            const fileContent = fs_1.default.readFileSync(colorsPath, 'utf-8');
            const colors = JSON.parse(fileContent);
            const found = colors.find((item) => item.color.toLowerCase() === color);
            if (!found) {
                sendText(res, 'color not found');
                return;
            }
            sendText(res, found.code.hex);
            return;
        }
        // External API integrations.
        if (pathname === '/tellmeajoke') {
            const response = yield axios_1.default.get('https://official-joke-api.appspot.com/random_joke');
            sendJson(res, response.data);
            return;
        }
        if (pathname === '/moviesbydirector') {
            const director = url.searchParams.get('director');
            if (!director) {
                sendText(res, 'director is required');
                return;
            }
            const apiKey = process.env.OMDB_API_KEY;
            if (!apiKey) {
                sendText(res, 'OMDB_API_KEY is required');
                return;
            }
            const searchResponse = yield axios_1.default.get('https://www.omdbapi.com/', {
                params: {
                    apikey: apiKey,
                    s: director,
                    type: 'movie'
                }
            });
            const searchResults = Array.isArray((_e = searchResponse.data) === null || _e === void 0 ? void 0 : _e.Search)
                ? searchResponse.data.Search
                : [];
            const detailedMovies = yield Promise.all(searchResults.map((movie) => __awaiter(void 0, void 0, void 0, function* () {
                if (!movie.imdbID) {
                    return null;
                }
                const detailResponse = yield axios_1.default.get('https://www.omdbapi.com/', {
                    params: {
                        apikey: apiKey,
                        i: movie.imdbID,
                        plot: 'short'
                    }
                });
                return detailResponse.data;
            })));
            const filtered = detailedMovies.filter((movie) => {
                if (!movie || typeof movie.Director !== 'string') {
                    return false;
                }
                return movie.Director.toLowerCase().includes(director.toLowerCase());
            });
            sendJson(res, filtered);
            return;
        }
        // URL parsing and filesystem utility endpoints.
        if (pathname === '/parseurl') {
            const someUrl = url.searchParams.get('someurl');
            if (!someUrl) {
                sendText(res, 'someurl is required');
                return;
            }
            let parsed;
            try {
                parsed = new URL(someUrl);
            }
            catch (_f) {
                sendText(res, 'invalid url');
                return;
            }
            sendJson(res, {
                protocol: parsed.protocol,
                host: parsed.host,
                port: parsed.port,
                path: parsed.pathname,
                querystring: parsed.search,
                hash: parsed.hash,
                parsedHost: parsed.host
            });
            return;
        }
        if (pathname === '/listfiles') {
            const files = yield fs_1.default.promises.readdir(process.cwd());
            sendJson(res, files);
            return;
        }
        if (pathname === '/getfulltextfile') {
            const samplePath = path_1.default.join(__dirname, 'sample.txt');
            const content = fs_1.default.readFileSync(samplePath, 'utf-8');
            const lines = listLinesContainingWord(content, 'Fusce');
            sendJson(res, lines);
            return;
        }
        if (pathname === '/getlinebylinefromttextfile') {
            const samplePath = path_1.default.join(__dirname, 'sample.txt');
            const lines = yield readLinesContainingWord(samplePath, 'Fusce');
            sendJson(res, lines);
            return;
        }
        // Process and random-data utility endpoints.
        if (pathname === '/calculatememoryconsumption') {
            const memoryInGb = process.memoryUsage().heapUsed / (1024 * 1024 * 1024);
            sendText(res, memoryInGb.toFixed(2));
            return;
        }
        if (pathname === '/randomeuropeancountry') {
            const randomIndex = Math.floor(Math.random() * europeanCountries.length);
            sendJson(res, europeanCountries[randomIndex]);
            return;
        }
        sendText(res, 'method not supported');
    }))().catch((error) => {
        // Centralized error handler for async route logic.
        const message = error instanceof Error ? error.message : 'unknown error';
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`internal server error: ${message}`);
    });
});
// Server listens on port 3000 by default (used by tests and examples).
nodeServer.listen(3000, () => {
    console.log('server is listening on port 3000');
});
