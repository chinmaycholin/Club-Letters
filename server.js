/**
 * Zero-Dependency Local Development Server
 * Simulates a PHP server using native Node.js modules.
 * Serves the dashboard files securely.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.php': 'text/html', // Serve index.php as standard HTML
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    // Route: Root / defaults to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Static Files Handler
    const decodedPathname = decodeURIComponent(pathname);
    const filePath = path.join(__dirname, decodedPathname);

    // Safety check: ensure file is inside the current directory
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Access Denied');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('File Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 The Malnad Technical Club Letter Generator Local Dev Server`);
    console.log(`==================================================`);
    console.log(`📍 Web Dashboard URL: http://localhost:${PORT}`);
    console.log(`💡 Club letterhead image is active.`);
    console.log(`👉 Press Ctrl+C to stop the server.\n`);
});
