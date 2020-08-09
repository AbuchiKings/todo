
function responseHandler(response, result, next, statusCode, message, numOfResults) {
  result && result.password ? result.password = '' : {};
  if (result instanceof Error) {
    return next(result);
  } else {
    return response.status(statusCode).json({
      status: 'success',
      message,
      results: numOfResults,
      data: result
    });
  }
}

module.exports = responseHandler;
