import express from 'express';
import usersRouter from './routes/users.route';
import groupsRouter from './routes/groups.route';

const app = express();

app.use(express.json());

app.use('/users', usersRouter);
app.use('/groups', groupsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
