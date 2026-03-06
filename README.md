
# Node server (summary)

This repository includes `nodeserver.ts`, a small TypeScript Node.js HTTP server that listens on port 3000 and implements several demonstration endpoints used for Exercise 2.

How to run
- Build and run the compiled JavaScript:

```bash
npm run build
npm start
# or: node nodeserver.js
```

- Run directly from TypeScript (development):

```bash
npx ts-node nodeserver.ts
```

Quick test
- The project includes integration tests in `test.ts`. Run them with:

```bash
npm test
```

Endpoints and current functionality
- `/get` — returns `hello <key>` when `?key=...` is provided; otherwise returns `key not passed`.
- `/daysbetweendates` — query params `date1` and `date2`; returns the integer number of days between the two dates.
- `/validatephonenumber` — query param `phoneNumber`; validates Spanish phone numbers of the form `+34#########` and returns `valid` or `invalid`.
- `/validatespanishdni` — query param `dni`; expects `NNNNNNNNL` (8 digits + letter), computes expected DNI letter and returns `valid` or `invalid`.
- `/returncolorcode` — query param `color`; reads `colors.json` and returns the matched color's hex code (e.g. `#FF0000`).
- `/tellmeajoke` — returns a random joke retrieved from `https://official-joke-api.appspot.com/random_joke`.
- `/moviesbydirector` — query param `director`; uses OMDB (requires `OMDB_API_KEY` env var) to fetch movie details and returns matching movies.
- `/parseurl` — query param `someurl`; parses the provided URL and returns JSON with protocol, host, port, path, querystring and hash.
- `/listfiles` — returns the list of files in the current working directory as JSON.
- `/getfulltextfile` — reads `sample.txt` and returns lines containing the word `Fusce`.
- `/getlinebylinefromttextfile` — reads `sample.txt` line-by-line and returns lines containing `Fusce` (memory-efficient for large files).
- `/calculatememoryconsumption` — returns the process memory consumption in GB (rounded to two decimals).
- `/randomeuropeancountry` — returns a random European country and ISO code from an internal list.

Notes
- The `moviesbydirector` endpoint requires an OMDB API key set as `OMDB_API_KEY` in the environment.
- If port `3000` is already in use you will see `EADDRINUSE`; stop the conflicting process or change the port in `nodeserver.ts`.

This README intentionally describes only the Node server and its current functionality; the original lab instruction text is not included here.

Examples
-------

Here are a few quick curl examples you can run (URL-encode `+` as `%2B` when needed):

- Get greeting (no key):

```bash
curl http://localhost:3000/get
# -> key not passed
```

- Get greeting with key:

```bash
curl "http://localhost:3000/get?key=world"
# -> hello world
```

- Days between two dates:

```bash
curl "http://localhost:3000/daysbetweendates?date1=2024-01-01&date2=2024-01-11"
# -> 10
```

- Validate Spanish phone number (URL-encoded `+`):

```bash
curl "http://localhost:3000/validatephonenumber?phoneNumber=%2B34666777888"
# -> valid
```

- Validate Spanish DNI:

```bash
curl "http://localhost:3000/validatespanishdni?dni=12345678Z"
# -> valid
```

- Return color hex from `colors.json` (example `red`):

```bash
curl "http://localhost:3000/returncolorcode?color=red"
# -> #FF0000
```

- List files in working directory:

```bash
curl "http://localhost:3000/listfiles"
# -> ["README.md","nodeserver.ts",...]
```

- Read lines containing "Fusce" (full read):

```bash
curl "http://localhost:3000/getfulltextfile"
```

- Read lines containing "Fusce" (streamed, line-by-line):

```bash
curl "http://localhost:3000/getlinebylinefromttextfile"
```

