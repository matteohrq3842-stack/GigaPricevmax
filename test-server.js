
(async () => {
  const http = await import('node:http');
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello world');
  });
  server.listen(3000, () => {
    console.log('Test server running on port 3000');
  });
})();
