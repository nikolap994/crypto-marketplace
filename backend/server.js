const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.send({ message: 'PONG' });
});

app.listen(process.env.PORT , () => {
  console.log('Backend running on http://localhost:4000');
});
