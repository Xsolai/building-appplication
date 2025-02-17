import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios({
      url: 'http://18.184.65.167:5000/upload',
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      data: req.method === 'POST' ? req.body : undefined,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({
      message: error.message,
      ...(error.response && { data: error.response.data }),
    });
  }
}
