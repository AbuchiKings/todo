const { Router } = require('express');
const task = require('./taskRoutes');
const user = require('./userRoutes');


const router = Router();

router.get('/', (request, response) => {
    response.status(200).json({
        status: 'success',
        message: 'Welcome to world of awesomeness.'
    });
});

router.use('/api/v1', user);
router.use('/api/v1', task);
router.all('*', (request, response) => {
    response.status(404).json({
        status: 'error',
        message: `${request.originalUrl} was not found on this platform`
    });
});

//router.use(globalErrorHandler);

module.exports = router;