const mqttOptions = {
  clientId: "70519268-8c62-4402-8aa1-f7dc83f70b7f",
  host: "127.0.0.1",
  port: 1883, // Adjust for secure connections
  username: "admin",
  password: "passcode",
  // TLS/SSL configuration (optional):
  // rejectUnauthorized: false, // Set to true for strict checking
  // cert: fs.readFileSync('path/to/client-cert.pem'), // Provide client certificate if needed
  // key: fs.readFileSync('path/to/client-key.pem'),
  // ca: fs.readFileSync('path/to/ca-cert.pem') // Trusted CA certificate
};

export { mqttOptions };
