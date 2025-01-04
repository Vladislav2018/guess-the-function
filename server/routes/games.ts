import express, { Request, Response, NextFunction } from 'express';
import supabase from '../db';

const router = express.Router();

const createGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { creator_id, name, description } = req.body;
        const { data, error } = await supabase
            .from('games')
            .insert([{ creator_id, name, description }])
            .select();

        if (error) {
            console.error('Supabase error при создании игры:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error in createGame:', error);
        next(error);
    }
};

const getGameById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error при получении игры:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        if (!data) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getGameById:', error);
        next(error);
    }
};

const getGamesByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('creator_id', userId);

        if (error) {
            console.error('Supabase error при получении игр пользователя:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getGamesByUserId:', error);
        next(error);
    }
};

const updateGameStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('games')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const addStepToGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { game_id, player_id, turn_number, x_value, y_value, difficulty, result } = req.body;

        const { data, error } = await supabase
            .from('steps')
            .insert([{ game_id, player_id, turn_number, x_value, y_value, difficulty, result }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const getGameSteps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('steps')
            .select('*')
            .eq('game_id', id);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const finishGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('games')
            .update({ status: 'finished', finished_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

// Get all games with pagination
const getAllGames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let query = supabase.from('games').select('*', { count: 'exact' });

         const { page = 1, pageSize = 10 } = req.query;
        const start = (Number(page) - 1) * Number(pageSize);
        const end = start + Number(pageSize) - 1;

        query = query.range(start, end);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase error while getting all games:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json({ data, total: count });
    } catch (error) {
        console.error('Error in getAllGames:', error);
        next(error);
    }
};

// Update an existing game
const updateGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { player1_id, player2_id, status, finished_at } = req.body;

        let updateData: { player1_id?: string; player2_id?: string; status?: string, finished_at?: string } = {};

        if (player1_id) updateData.player1_id = player1_id;
        if (player2_id) updateData.player2_id = player2_id;
        if (status) updateData.status = status;
        if (finished_at) updateData.finished_at = finished_at;


        const { data, error } = await supabase
            .from('games')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error during game update:', error);
            res.status(500).json({ error: error.message });
            return;
        }

         if (!data || data.length === 0) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in updateGame:', error);
        next(error);
    }
};

const getGamesByCreator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { creatorId } = req.params;

        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('creator_id', creatorId);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

router.post('/', createGame);
router.get('/:id', getGameById);
router.get('/', getAllGames);
router.get('/user/:userId', getGamesByUserId);
router.put('/:id', updateGame);
router.put('/:id/status', updateGameStatus);
router.post('/steps', addStepToGame);
router.get('/:id/steps', getGameSteps);
router.put('/:id/finish', finishGame);
router.get('/creator/:creatorId', getGamesByCreator);

export default router;