console.log('Testing imports...');

import express from 'express';
console.log('✅ Express imported');

import cors from 'cors';
console.log('✅ CORS imported');

import dotenv from 'dotenv';
console.log('✅ Dotenv imported');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Test successful!' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
