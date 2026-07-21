import { Request, Response } from 'express';
import { waService } from '../services/whatsappService';

export const getStatus = async (req: Request, res: Response) => {
  const status = waService.getStatus();
  const message = status === 'CONNECTED' ? 'WhatsApp telah terkoneksi.' : 'WhatsApp belum terkoneksi.';
  return res.status(200).json({ status, message });
};

export const requestQr = async (req: Request, res: Response) => {
  const qr = waService.getQrCode();
  const status = waService.getStatus();
  
  if (status === 'CONNECTED') {
    return res.status(200).json({ status, message: 'Sudah terkoneksi, tidak perlu QR.' });
  }

  if (!qr) {
    return res.status(202).json({ status, message: 'Sedang menyiapkan QR Code, mohon tunggu...' });
  }

  return res.status(200).json({ 
    status,
    qr,
    message: 'Silakan scan QR Code ini menggunakan WhatsApp' 
  });
};
