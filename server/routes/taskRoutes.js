const express = require('express');
const Task = require('../controllers/taskController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use('/tasks', auth.verifyToken);

router.post('/tasks', Task.createTask);
router.get('/tasks', Task.getAllTasks);
router.get('/tasks/:task_id', Task.getTask);
router.patch('/tasks/:task_id', Task.updateTask);
router.delete('/tasks/:task_id', Task.deleteTask);

module.exports = router;