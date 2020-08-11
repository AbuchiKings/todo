const responseHandler = require('../utils/responseHandler');
const errorHandler = require('../utils/errorHandler');
const Task = require('../models/task');


class TaskController {

    /**
     * @description Creates a new Task
     * @returns Response 
     * @static
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @memberof TaskController
    */
    static async createTask(req, res, next) {
        try {
            const createdOn = Date();
            const editedOn = Date();
            const task = await Task.create({ ...req.body, createdBy: req.user._id, createdOn, editedOn, isComplete: false });
            return responseHandler(res, task, next, 201, 'Task was created successfully');
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }


    /**
     * @description Fetches all Tasks
     * @returns Response
     * @static
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @memberof TaskController
    */
    static async getAllTasks(req, res, next) {
        try {
            const page = req.query.page && parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit || 10;
            const skip = (page - 1) * limit;
            let previousTasks = skip >= limit ? true : false;
            const totalTasks = await Task.countDocuments({ createdBy: req.user._id });

            let nextTasks = skip + limit >= totalTasks ? false : true;

            if (skip >= totalTasks) return errorHandler(404, 'Not task found');

            const tasks = await Task.find({ createdBy: req.user._id }).skip(skip).limit(limit).lean();
            const pagination = { previousTasks, nextTasks };
            console.log(pagination, skip)
            return responseHandler(res, { tasks, pagination }, next, 200, 'Tasks retrieved successfully', tasks.length);
        } catch (error) {
            return next(error);
        }

    }

    /**
     * @description Gets a specific Task
     * @returns Response
     * @static
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @memberof TaskController
    */
    static async getTask(req, res, next) {
        try {
            const task = await Task.findOne({ createdBy: req.user._id, _id: req.params.task_id }).lean();
            if (!task) {
                return errorHandler(404, 'Task not found');
            }
            return responseHandler(res, task, next, 200, 'Task retrieved successfully', 1);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @description Updates a specific task
     * @returns Response
     * @static
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @memberof TaskController
    */
    static async updateTask(req, res, next) {
        try {
            const { createdBy, createdOn, _id, ...updateData } = req.body;
            const editedOn = Date();
            const task = await Task.findOneAndUpdate({ createdBy: req.user._id, _id: req.params.task_id }, { ...updateData, editedOn }, {
                runValidators: true,
                new: true
            }).lean();
            if (!task) {
                return errorHandler(404, 'Task not found');
            }
            return responseHandler(res, task, next, 200, 'Task updated successfully', 1);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @description Deletes a specified Task
     * @returns Response
     * @static
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @memberof TaskController
    */
    static async deleteTask(req, res, next) {
        try {
            const task = await Task.findOneAndDelete({ createdBy: req.user._id, _id: req.params.task_id }).lean();
            if (!task) {
                return errorHandler(404, 'Task not found');
            }
            return responseHandler(res, null, next, 204, 'Task deleted sucessfully', 1);
        } catch (error) {
            return next(error);
        }
    }
    static async deleteAllTasks(req, res, next) {
        try {
            await Task.deleteMany({ createdBy: req.user._id });
            return responseHandler(res, null, next, 204, 'Task deleted sucessfully', 1);
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = TaskController;