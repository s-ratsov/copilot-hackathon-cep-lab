import axios from 'axios';
import fs from 'fs';
import http from 'http';
import path from 'path';
import readline from 'readline';

/**
 * Shape of entries in colors.json.
 * Used by /returncolorcode to map a color name to a hex value.
 */
type ColorFileItem = {
    color: string;
    code: {
        rgba: [number, number, number, number];
        hex: string;
    };
};

const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';

/**
 * Small in-memory catalog used by /randomeuropeancountry.
 */
const europeanCountries: Array<{ country: string; isoCode: string }> = [
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
 * Sends a plain text HTTP 200 response.
 */
const sendText = (res: http.ServerResponse, text: string): void => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(text);
};

/**
 * Sends a JSON HTTP 200 response.
 */
const sendJson = (res: http.ServerResponse, value: unknown): void => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(value));
};

/**
 * Returns all lines from in-memory text that contain a target word.
 */
const listLinesContainingWord = (content: string, word: string): string[] => {
    return content.split(/\r?\n/).filter((line) => line.includes(word));
};

/**
 * Streams a file and returns lines that contain a target word.
 * This avoids loading large files fully into memory.
 */
const readLinesContainingWord = async (filePath: string, word: string): Promise<string[]> => {
    const found: string[] = [];
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const reader = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    for await (const line of reader) {
        if (line.includes(word)) {
            found.push(line);
        }
    }

    return found;
};

/**
 * Demo HTTP API server used by the lab.
 *
 * Endpoints:
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
const nodeServer = http.createServer((req, res) => {
    void (async () => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost:3000'}`);
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
            const dni = (url.searchParams.get('dni') ?? '').toUpperCase();
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
            const color = (url.searchParams.get('color') ?? '').toLowerCase();
            if (!color) {
                sendText(res, 'color is required');
                return;
            }

            const colorsPath = path.join(__dirname, 'colors.json');
            const fileContent = fs.readFileSync(colorsPath, 'utf-8');
            const colors: ColorFileItem[] = JSON.parse(fileContent) as ColorFileItem[];
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
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
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

            const searchResponse = await axios.get('https://www.omdbapi.com/', {
                params: {
                    apikey: apiKey,
                    s: director,
                    type: 'movie'
                }
            });

            const searchResults = Array.isArray(searchResponse.data?.Search)
                ? searchResponse.data.Search
                : [];

            const detailedMovies = await Promise.all(
                searchResults.map(async (movie: { imdbID?: string }) => {
                    if (!movie.imdbID) {
                        return null;
                    }

                    const detailResponse = await axios.get('https://www.omdbapi.com/', {
                        params: {
                            apikey: apiKey,
                            i: movie.imdbID,
                            plot: 'short'
                        }
                    });

                    return detailResponse.data;
                })
            );

            const filtered = detailedMovies.filter((movie): movie is Record<string, unknown> => {
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

            let parsed: URL;
            try {
                parsed = new URL(someUrl);
            } catch {
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
            const files = await fs.promises.readdir(process.cwd());
            sendJson(res, files);
            return;
        }

        if (pathname === '/getfulltextfile') {
            const samplePath = path.join(__dirname, 'sample.txt');
            const content = fs.readFileSync(samplePath, 'utf-8');
            const lines = listLinesContainingWord(content, 'Fusce');
            sendJson(res, lines);
            return;
        }

        if (pathname === '/getlinebylinefromttextfile') {
            const samplePath = path.join(__dirname, 'sample.txt');
            const lines = await readLinesContainingWord(samplePath, 'Fusce');
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
    })().catch((error: unknown) => {
        // Centralized catch to avoid unhandled promise rejections in async route logic.
        const message = error instanceof Error ? error.message : 'unknown error';
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`internal server error: ${message}`);
    });
});

// Fixed lab port used by tests and curl examples.
nodeServer.listen(3000, () => {
    console.log('server is listening on port 3000');
});