import express, { Request, Response, NextFunction } from 'express';
import supabase from '../db';


const router = express.Router();

const createFunction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { creator_id, expression, y_min, y_max } = req.body;
        const { data, error } = await supabase
            .from('functions')
            .insert([{ creator_id, expression, y_min, y_max }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }
        res.status(201).json(data);
    } catch (error) {
        console.error('Error in createFunction:', error);
        next(error);
    }
};

const getFunctionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('functions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        if (!data) {
            res.status(404).json({ error: 'Function not found' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getFunctionById:', error);
        next(error);
    }
};

const getFunctionsByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('functions')
            .select('*')
            .eq('creator_id', userId);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in getFunctionsByUserId:', error);
        next(error);
    }
};

// Get all functions with pagination
const getAllFunctions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let query = supabase.from('functions').select('*', { count: 'exact' });

        const { page = 1, pageSize = 10 } = req.query;
        const start = (Number(page) - 1) * Number(pageSize);
        const end = start + Number(pageSize) - 1;

        query = query.range(start, end);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase error while getting all functions:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json({ data, total: count });
    } catch (error) {
         console.error('Error in getAllFunctions:', error);
         next(error);
    }

};

// Update an existing function
const updateFunction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { expression, y_min, y_max } = req.body;
  
      let updateData: { expression?: string; y_min?: number; y_max?: number } = {};
  
        if (expression) updateData.expression = expression;
        if (y_min) updateData.y_min = y_min;
        if (y_max) updateData.y_max = y_max;
  
  
  
      const { data, error } = await supabase
        .from('functions')
        .update(updateData)
        .eq('id', id)
        .select();
  
      if (error) {
        console.error('Supabase error during function update:', error);
        res.status(500).json({ error: error.message });
        return;
      }
  
      if (!data || data.length === 0) {
          res.status(404).json({ error: 'Function not found' });
          return;
      }
  
      res.json(data);
    } catch (error) {
      console.error('Error in updateFunction:', error);
      next(error);
    }
  };
  
  
  // Delete a function
  const deleteFunction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
          const { id } = req.params;
  
          const { error } = await supabase
              .from('functions')
              .delete()
              .eq('id', id);
  
  
          if (error) {
              console.error('Supabase error during function deletion:', error);
              res.status(500).json({ error: error.message });
              return;
          }
  
          res.status(204).send();
      } catch (error) {
          console.error('Error in deleteFunction:', error);
          next(error);
      }
  };
  
  // Search functions by expression (partial match)
  const searchFunctionsByExpression = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { query } = req.query;
  
          if (!query) {
              res.status(400).json({ error: 'Search query is required' });
              return;
          }
  
          const { data, error } = await supabase
              .from('functions')
              .select('*')
              .ilike('expression', `%${query}%`);
  
          if (error) {
              console.error('Supabase error during function search:', error);
              res.status(500).json({ error: error.message });
              return;
          }
  
          res.json(data);
      } catch (error) {
          console.error('Error in searchFunctionsByExpression:', error);
          next(error);
      }
  };

  const getFunctionsByRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { min, max } = req.query;

        if (!min || !max) {
            res.status(400).json({ error: 'min and max are required' });
            return;
        }

        const { data, error } = await supabase
            .from('functions')
            .select('*')
            .gte('y_min', min)
            .lte('y_max', max);

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
  
router.post('/', createFunction);
router.get('/:id', getFunctionById);
router.get('/', getAllFunctions);
router.get('/user/:userId', getFunctionsByUserId);
router.put('/:id', updateFunction);
router.delete('/:id', deleteFunction);
router.get('/search', searchFunctionsByExpression);
router.get('/range', getFunctionsByRange);
export default router;
