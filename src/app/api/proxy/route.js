import axios from 'axios';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Adjust the size limit as needed
    },
  },
};

export default async function handler(req, res) {
  try {
    const response = await axios({
      url: 'http://35.156.80.11:8000/upload/', // Ensure this URL is correct and accessible
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      data: req.method === 'POST' ? req.body : undefined, // Send body only on POST
    });

    // Return the response with the correct status and data
    res.status(response.status).json(response.data);
  } catch (error) {
    // Log error for debugging purposes
    console.error('Error in handler:', error);

    // Return a more detailed error response
    res.status(error.response ? error.response.status : 500).json({
      message: error.message,
      ...(error.response && { data: error.response.data }), // Include error details if available
    });
  }
}
