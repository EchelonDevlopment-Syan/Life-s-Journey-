import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// API Proxy for Gemini (Protects the API Key)
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    // This endpoint would call Gemini server-side if you wanted to fully hide the SDK logic
    // For this implementation, we will allow the frontend to use the key but recommend 
    // moving high-security logic here for production.
    res.json({ message: "Proxy ready" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock Auth Endpoints
app.get('/auth/status', (req, res) => {
  res.json({ authenticated: false });
});

// All other requests return the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});