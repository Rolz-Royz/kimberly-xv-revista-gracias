// Tiny static server for local preview (supports Range requests for video).
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = process.env.PORT || 4630;
const types = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg' };
http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(root)) return res.writeHead(403).end();
  fs.stat(p, (err, st) => {
    if (err || !st.isFile()) return res.writeHead(404).end('Not found');
    const type = types[path.extname(p)] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const [s, e] = range.replace('bytes=', '').split('-');
      const start = +s, end = e ? +e : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(p, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(p).pipe(res);
  });
}).listen(port, () => console.log('kimberly-magazine-gracias on http://localhost:' + port));
