import express, { Request, Response, NextFunction } from 'express';
import supabase from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const createStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { game_id, step_number, function_id, user_answer } = req.body;
    const { data, error } = await supabase
      .from('steps')
      .insert([{ game_id, step_number, function_id, user_answer }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: error.message });
      return; 
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in createStep:', error);
    next(error);
  }
};

const getStepsByGameId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { gameId } = req.params;
    const { data, error } = await supabase
      .from('steps')
      .select('*')
      .eq('game_id', gameId);

    if (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getStepsByGameId:', error);
    next(error);
  }
};

// Get all steps with pagination
const getAllSteps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let query = supabase.from('steps').select('*', { count: 'exact' });

         const { page = 1, pageSize = 10 } = req.query;
        const start = (Number(page) - 1) * Number(pageSize);
        const end = start + Number(pageSize) - 1;

        query = query.range(start, end);

        const { data, error, count } = await query;

        if (error) {
           console.error('Supabase error while getting all steps:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json({ data, total: count });
    } catch (error) {
        console.error('Error in getAllSteps:', error);
         next(error);
    }
};
  
  
  // Get steps by player ID
  const getStepsByPlayerId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId } = req.params;
      const { data, error } = await supabase
        .from('steps')
        .select('*')
        .eq('player_id', playerId);
  
      if (error) {
        console.error('Supabase error while getting steps by player ID:', error);
        res.status(500).json({ error: error.message });
        return;
      }
  
      res.json(data);
    } catch (error) {
      console.error('Error in getStepsByPlayerId:', error);
      next(error);
    }
  };
  
  // Update an existing step
  const updateStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
          const { id } = req.params;
          const { turn_number, x_value, y_value, difficulty, result } = req.body;
  
          let updateData: { turn_number?: number; x_value?: number; y_value?: number; difficulty?: number, result?: string } = {};
  
  
          if(turn_number) updateData.turn_number = turn_number;
          if(x_value) updateData.x_value = x_value;
          if(y_value) updateData.y_value = y_value;
          if(difficulty) updateData.difficulty = difficulty;
          if(result) updateData.result = result;
  
          const { data, error } = await supabase
              .from('steps')
              .update(updateData)
              .eq('id', id)
              .select();
  
          if (error) {
              console.error('Supabase error during step update:', error);
              res.status(500).json({ error: error.message });
              return;
          }
  
           if (!data || data.length === 0) {
              res.status(404).json({ error: 'Step not found' });
              return;
          }
  
          res.json(data);
      } catch (error) {
           console.error('Error in updateStep:', error);
           next(error);
      }
  };
  
  // Delete a step
  const deleteStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
          const { id } = req.params;
  
          const { error } = await supabase
              .from('steps')
              .delete()
              .eq('id', id);
  
  
          if (error) {
              console.error('Supabase error during step deletion:', error);
              res.status(500).json({ error: error.message });
              return;
          }
  
          res.status(204).send();
      } catch (error) {
           console.error('Error in deleteStep:', error);
          next(error);
      }
  };

  const getStepsByDifficulty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { difficulty } = req.params;

        const { data, error } = await supabase
            .from('steps')
            .select('*')
            .eq('difficulty', difficulty);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getStepsByDifficulty:', error);
        next(error);
    }
};

const getStepsByFunction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { functionId } = req.params;

        const { data, error } = await supabase
            .from('steps')
            .select('*')
            .eq('function_id', functionId);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getStepsByFunction:', error);
        next(error);
    }
};

const getStepsByTurnNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { gameId, turnNumber } = req.params;

        const { data, error } = await supabase
            .from('steps')
            .select('*')
            .eq('game_id', gameId)
            .eq('turn_number', turnNumber);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getStepsByTurnNumber:', error);
        next(error);
    }
};



router.post('/', createStep);
router.get('/game/:gameId', getStepsByGameId);
router.get('/', getAllSteps);
router.get('/player/:playerId', getStepsByPlayerId);
router.put('/:id', updateStep);
router.delete('/:id', deleteStep);
router.get('/difficulty/:difficulty', getStepsByDifficulty);
router.get('/function/:functionId', getStepsByFunction);
router.get('/game/:gameId/turn/:turnNumber', getStepsByTurnNumber);


export default router;