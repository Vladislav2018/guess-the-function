import express from 'express';
import usersRouter from './routes/users';
import gamesRouter from './routes/games';
import functionsRouter from './routes/functions';
import stepsRouter from './routes/steps';
import ticketsRouter from './routes/tickets';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/users', usersRouter);
app.use('/games', gamesRouter);
app.use('/functions', functionsRouter);
app.use('/steps', stepsRouter);
app.use('/tickets', ticketsRouter);

app.listen(3000, () => console.log('Server listening on port 3000'));