import * as assert from 'assert';
import * as http from 'http';

const makeRequest = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3000${path}`, (res: http.IncomingMessage) => {
            let data = '';
            res.on('data', (chunk: Buffer | string) => {
                data += chunk.toString();
            });
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
    });
};

describe('Node Server', () => {
    it('should return "key not passed" if key is not passed', async () => {
        const data = await makeRequest('/get');
        assert.strictEqual(data, 'key not passed');
    });

    it('should return "hello world" if key is equal to world', async () => {
        const data = await makeRequest('/get?key=world');
        assert.strictEqual(data, 'hello world');
    });

    it('should return number of days between two dates', async () => {
        const data = await makeRequest('/daysbetweendates?date1=2024-01-01&date2=2024-01-11');
        assert.strictEqual(data, '10');
    });

    it('should return valid for a valid Spanish phone number', async () => {
        const encodedPhoneNumber = encodeURIComponent('+34666777888');
        const data = await makeRequest(`/validatephonenumber?phoneNumber=${encodedPhoneNumber}`);
        assert.strictEqual(data, 'valid');
    });

    it('should return invalid for an invalid Spanish phone number', async () => {
        const data = await makeRequest('/validatephonenumber?phoneNumber=666777888');
        assert.strictEqual(data, 'invalid');
    });

    it('should return valid for a valid Spanish DNI', async () => {
        const data = await makeRequest('/validatespanishdni?dni=12345678Z');
        assert.strictEqual(data, 'valid');
    });

    it('should return invalid for an invalid Spanish DNI', async () => {
        const data = await makeRequest('/validatespanishdni?dni=12345678A');
        assert.strictEqual(data, 'invalid');
    });

    it('should return the hex code for red', async () => {
        const data = await makeRequest('/returncolorcode?color=red');
        assert.strictEqual(data, '#FF0000');
    });

    it('should parse a URL and return the parsed host', async () => {
        const encodedUrl = encodeURIComponent('https://example.com:8080/path?a=1#hash');
        const data = await makeRequest(`/parseurl?someurl=${encodedUrl}`);
        const parsed = JSON.parse(data) as {
            parsedHost: string;
            protocol: string;
            path: string;
        };
        assert.strictEqual(parsed.parsedHost, 'example.com:8080');
        assert.strictEqual(parsed.protocol, 'https:');
        assert.strictEqual(parsed.path, '/path');
    });

    it('should return files from the current directory', async () => {
        const data = await makeRequest('/listfiles');
        const files = JSON.parse(data) as string[];
        assert.ok(files.includes('nodeserver.ts'));
        assert.ok(files.includes('test.ts'));
    });

    it('should return lines containing Fusce from full text file read', async () => {
        const data = await makeRequest('/getfulltextfile');
        const lines = JSON.parse(data) as string[];
        assert.ok(lines.length > 0);
        assert.ok(lines.every((line) => line.includes('Fusce')));
    });

    it('should return lines containing Fusce using line-by-line file read', async () => {
        const data = await makeRequest('/getlinebylinefromttextfile');
        const lines = JSON.parse(data) as string[];
        assert.ok(lines.length > 0);
        assert.ok(lines.every((line) => line.includes('Fusce')));
    });

    it('should return process memory consumption in GB with 2 decimals', async () => {
        const data = await makeRequest('/calculatememoryconsumption');
        assert.ok(/^\d+\.\d{2}$/.test(data));
    });

    it('should return a random European country and ISO code', async () => {
        const data = await makeRequest('/randomeuropeancountry');
        const country = JSON.parse(data) as { country: string; isoCode: string };
        assert.ok(country.country.length > 0);
        assert.ok(/^[A-Z]{2}$/.test(country.isoCode));
    });

});