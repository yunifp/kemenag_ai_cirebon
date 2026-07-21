import { Router } from 'express';
import { getTickets, getTicketMessages, replyTicket, closeTicket } from '../controllers/ticketController';

const router = Router();
router.get('/', getTickets);
router.get('/:id/messages', getTicketMessages);
router.post('/reply', replyTicket);
router.post('/:id/close', closeTicket);

export default router;
