const express = require('express');
const Task = require('../controllers/taskController');
const auth = require('../middleware/auth');
const router = express.Router();
const { validateTask, validateId, validationHandler } = require('../middleware/validator')


router.use('/tasks', auth.verifyToken);

router.post('/tasks', validateTask, validationHandler,Task.createTask);
router.get('/tasks', Task.getAllTasks);
router.get('/tasks/:task_id', validateId, validationHandler, Task.getTask);
router.patch('/tasks/:task_id', validateId, validationHandler, Task.updateTask);
router.delete('/tasks/:task_id', validateId, validationHandler,Task.deleteTask);
router.delete('/tasks', Task.deleteAllTasks);

module.exports = router;