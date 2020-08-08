const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    task: {
        type: String,
        required: [true, 'Please Provide a task'],
        trim: true
    },
    notes: {
        type: String
    },
    createdOn: {
        type: String,
        select: false
    },
    editedOn: {
        type: String,
        select: false
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

taskSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Task', taskSchema);