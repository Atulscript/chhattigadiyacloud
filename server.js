const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let fullPath = path.resolve(ROOT, '.' + reqPath);

  if (!fullPath.startsWith(ROOT)) {
    console.warn(`[403] Forbidden: ${req.url}`);
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // If path is directory, serve index.html inside it
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(fullPath, 'index.html');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.warn(`[404] Not Found: ${req.url} -> ${fullPath}`);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1><p><a href="/en/">Return to Chhattisgadhiya Cloud</a></p>');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    console.log(`[200] ${req.method} ${req.url} (${contentType})`);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(fullPath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Local server active at http://localhost:${PORT}`);
});
