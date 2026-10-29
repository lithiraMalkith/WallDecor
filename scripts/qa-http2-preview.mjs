import http2 from 'node:http2';
import http from 'node:http';
import fs from 'node:fs';
const hop = new Set(['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'proxy-connection']);
const [keyFile, certFile] = process.argv.slice(2);
if (!keyFile || !certFile) throw new Error('Usage: node scripts/qa-http2-preview.mjs <local-key.pem> <local-cert.pem>');
// Local QA transport only. Never install the temporary certificate in a trust store.
const server = http2.createSecureServer({ key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile), allowHTTP1: true });
server.on('request', (req, res) => {
  const headers = Object.fromEntries(Object.entries(req.headers).filter(([name]) => !name.startsWith(':') && !hop.has(name)));
  headers.host = 'localhost:3000';
  const upstream = http.request({ hostname: '127.0.0.1', port: 3000, path: req.url, method: req.method, headers }, incoming => {
    const responseHeaders = Object.fromEntries(Object.entries(incoming.headers).filter(([name]) => !hop.has(name)));
    res.writeHead(incoming.statusCode, responseHeaders);
    incoming.pipe(res);
  });
  upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
  req.pipe(upstream);
});
server.listen(3443, '127.0.0.1', () => console.log('Local-only HTTP/2 QA proxy ready'));
