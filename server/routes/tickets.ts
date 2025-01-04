import express, { Request, Response, NextFunction } from 'express';
import supabase from '../db';

const router = express.Router();

const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { user_id, subject, message } = req.body;
        const { data, error } = await supabase
            .from('tickets')
            .insert([{ user_id, subject, message }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return 
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error in createTicket:', error);
        next(error);
    }
};

const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return; 
        }

        if (!data) {
            res.status(404).json({ error: 'Ticket not found' });
            return; 
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getTicketById:', error);
        next(error);
    }
};

const getTicketsByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return 
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getTicketsByUserId:', error);
        next(error);
    }
};

// Добавлены маршруты для обновления и удаления тикетов
const updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { subject, message, status, priority } = req.body; // Получаем поля для обновления

        const { data, error } = await supabase
            .from('tickets')
            .update({ subject, message, status, priority }) // Обновляем указанные поля
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return 
        }

        if (!data || data.length === 0) {
            res.status(404).json({ error: 'Ticket not found' });
            return; 
        }

        res.json(data);
    } catch (error) {
        console.error('Error in updateTicket:', error);
        next(error);
    }
};

const deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return 
        }

        res.status(204).send(); // 204 No Content (успешное удаление)
    } catch (error) {
        console.error('Error in deleteTicket:', error);
        next(error);
    }
};



router.post('/', createTicket);
router.get('/:id', getTicketById);
router.get('/user/:userId', getTicketsByUserId);
router.put('/:id', updateTicket); // Маршрут для обновления
router.delete('/:id', deleteTicket); // Маршрут для удаления

export default router;