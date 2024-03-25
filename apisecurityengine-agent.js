const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

function captureAPIInfo(req, res, next) {

  console.log('req.originalUrl', req.originalUrl)

  const requestId = uuidv4(); // Generate a unique ID for the request

  const requestInfo = {
    requestId: requestId,
    protocol: req.protocol,
    host: req.get('host'),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body, // The parsed JSON body
    query: req.query,
    timestamp: new Date(),
    projectType: 'Node'
  };

  // Capture request information
  console.log('API Request:', requestInfo);

  // Attach the requestId to the response headers
  res.set('X-Request-ID', requestId);

  // Capture response information
  res.on('finish', async () => {

    const responseInfo = {
      requestId: requestId,
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      body: res.body,
      timestamp: new Date()
    };
    
    console.log('API Response:', responseInfo);

    if (req.originalUrl !== '/') {

      // Send request information to the API endpoint
      try {
        
        const apiKey = process.env.APISECURITYENGINE_API_KEY; // Get the API key from the environment variable
        const requestPayload = {
          api_key: apiKey,
          the_request: requestInfo
        };

        await axios.post('https://backend.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo', requestPayload);
        console.log('Request information sent successfully.');

      } catch (error) {

        console.error('Error sending request information:', error);
      }
    }
  });

  // Pass control to the next middleware
  next();
}

module.exports = captureAPIInfo;

