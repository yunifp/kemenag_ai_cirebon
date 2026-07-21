import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

import knowledgeRoutes from './routes/knowledge';
import authRoutes from './routes/auth';
import rbacRoutes from './routes/rbac';
import whatsappRoutes from './routes/whatsapp';
import ticketRoutes from './routes/tickets';
import publicRoutes from './routes/public';
import notificationRoutes from './routes/notifications';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/notifications', notificationRoutes);

import { waService } from './services/whatsappService';

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Core API Service is running' });
});

import http from 'http';
import { initSocket } from './lib/socket';

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Initialize WhatsApp Baileys
  waService.initialize();
});
