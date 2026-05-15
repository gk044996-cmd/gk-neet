const { exec } = require('child_process');

const server = exec('node server.js', { env: { ...process.env, PORT: 5001 } });

server.stdout.on('data', data => console.log('SERVER:', data));
server.stderr.on('data', data => console.error('SERVER ERROR:', data));

setTimeout(() => {
  const http = require('http');
  const data = JSON.stringify({
    name: 'test',
    email: 'test999@gmail.com',
    password: 'password123'
  });
  const req = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/users/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
  }, res => {
    res.on('data', d => console.log('RESPONSE:', d.toString()));
    setTimeout(() => server.kill(), 1000);
  });
  req.on('error', e => console.error('REQ ERROR:', e));
  req.write(data);
  req.end();
}, 5000);
