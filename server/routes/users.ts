import express, { Request, Response, NextFunction } from 'express';
import supabase from '../db';
import bcrypt from 'bcrypt';

const router = express.Router();

const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username, password: hashedPassword, email }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return; // Прекращаем выполнение функции
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error); // Передаем ошибку обработчику ошибок Express
    }
};

const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        if (!data) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let query = supabase.from('users').select('*');

        const { page = 1, pageSize = 10 } = req.query;
        const start = (Number(page) - 1) * Number(pageSize);
        const end = start + Number(pageSize) - 1;

        query = query.range(start, end);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json({ data, total: count });
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;

        let updateData: { username?: string; email?: string; password?: string } = {};

        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return; // Прекращаем выполнение функции
        }

        if (!data || data.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return; // Прекращаем выполнение функции
        }

        res.json(data);
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error); // Передаем ошибку обработчику ошибок Express
    }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return; // Прекращаем выполнение функции
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error); // Передаем ошибку обработчику ошибок Express
    }
};

const searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`username.ilike.%${query}%,email.ilike.%${query}%`);

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

const checkAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email } = req.query;

        if (!username && !email) {
            res.status(400).json({ error: 'Username or email is required' });
            return;
        }

        let query = supabase.from('users').select('*');

        if (username) query = query.eq('username', username);
        if (email) query = query.eq('email', email);

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        const isAvailable = data.length === 0;
        res.json({ isAvailable });
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

// Get user roles by user ID
const getUserRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('user_roles')
            .select('role_id, roles(name)')
            .eq('user_id', id);

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

// Assign a role to a user
const assignRoleToUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, roleId } = req.body;

        const { data, error } = await supabase
            .from('user_roles')
            .insert([{ user_id: userId, role_id: roleId, assigned_at: new Date().toISOString() }])
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

// Remove a role from a user
const removeRoleFromUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, roleId } = req.params;

        const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role_id', roleId);

        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const getUserStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const [
            { count: gamesCount },
            { count: ticketsCount },
            { count: functionsCount },
        ] = await Promise.all([
            supabase.from('games').select('*', { count: 'exact', head: true }).or(`player1_id.eq.${id},player2_id.eq.${id}`),
            supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', id),
            supabase.from('functions').select('*', { count: 'exact', head: true }).eq('creator_id', id),
        ]);

        res.json({ gamesCount, ticketsCount, functionsCount });
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};

const getUserFunctions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('functions')
            .select('*')
            .eq('creator_id', id);

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

const getUserSteps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('steps')
            .select('*')
            .eq('player_id', id);

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

// User login/authentication
const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password } = req.body;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();


        if (error) {
            console.error('Supabase error:', error);
            res.status(500).json({ error: error.message });
            return;
        }

        if (!data) {
            res.status(401).json({ error: 'Invalid credentials' }); // User not found
            return;
        }

        const passwordMatch = await bcrypt.compare(password, data.password_hash);

        if (!passwordMatch) {
           res.status(401).json({ error: 'Invalid credentials' }); // Password mismatch
           return;
        }


        // If authentication is successful, return the user data
        res.json({
            id: data.id,
            username: data.username,
            email: data.email,
        });
    } catch (error) {
        console.error('Error in try/catch:', error);
        next(error);
    }
};


router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/check-availability', checkAvailability);
router.get('/search', searchUsers);
router.get('/:id/roles', getUserRoles);
router.post('/assign-role', assignRoleToUser);
router.delete('/:userId/roles/:roleId', removeRoleFromUser);
router.get('/:id/statistics', getUserStatistics);
router.get('/:id/functions', getUserFunctions);
router.get('/:id/steps', getUserSteps);
router.post('/login', authenticateUser);
export default router;