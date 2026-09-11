require('dotenv').config();
const express = require('express');
const cors = require('cors');

const scanRoutes = require('./routes/scan');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'tritorc-tender-scanner-backend' });
});

app.use('/api/scan', scanRoutes);

// Basic error handler for multer / unexpected errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unexpected error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Tritorc Tender Scanner backend running on port ${PORT}`);
});
