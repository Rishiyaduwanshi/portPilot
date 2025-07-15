import http from 'http'
const PORT = 9870;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end(`Hello, this is a test server! running on ${PORT}`);
});


server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
