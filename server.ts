import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

async function startServer() {
  const app = express();
  app.set('trust proxy', 1); // Trust first proxy for rate limiting
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });
  const PORT = 3000;

  // Security & Middleware
  app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP for dev
  app.use(cors());
  app.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);

  // File Upload Setup
  const upload = multer({ dest: 'uploads/' });

  // --- API ROUTES ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BharatBusinessGPT API is running' });
  });

  // Connector Endpoints
  app.post('/api/connectors/connect', (req, res) => {
    const { id, credentials } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Connector ID is required' });
    }
    // Mock validation
    const token = `conn_token_${Math.random().toString(36).substring(7)}`;
    res.json({ 
      success: true, 
      token, 
      status: 'connected',
      message: 'Successfully connected' 
    });
  });

  app.post('/api/connectors/sync', (req, res) => {
    const { id, token } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Connector ID is required' });
    }
    // Mock sync process
    res.json({
      success: true,
      lastSyncTime: new Date().toLocaleTimeString(),
      recordsProcessed: Math.floor(Math.random() * 1000) + 50,
      connectionStatus: 'connected'
    });
  });

  // File Upload Endpoint
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Mock parsing and KPI extraction
    res.json({ 
      message: 'File processed successfully', 
      filename: req.file.originalname,
      extractedKPIs: { revenue: 120000, margin: 45 }
    });
  });

  // --- WEBSOCKETS (Real-time KPIs) ---
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Simulate real-time KPI updates
    const interval = setInterval(() => {
      socket.emit('kpi_update', {
        businessHealth: Math.floor(80 + Math.random() * 10),
        grossMargin: (40 + Math.random() * 5).toFixed(1),
        burnRate: Math.floor(40000 + Math.random() * 10000),
      });
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected:', socket.id);
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
