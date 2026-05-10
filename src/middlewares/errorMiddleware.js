const errorMiddleware = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    err.statusCode = 400;
    err.status = "fail";
    err.message = "Malformed JSON in request body";
  }

  if (err.code === "ER_DUP_ENTRY") {
    err.statusCode = 409;
    err.status = "fail";
    err.message = "Duplicate resource detected";
  }

  if (err.code === "ER_LOCK_DEADLOCK" || err.code === "ER_LOCK_WAIT_TIMEOUT") {
    err.statusCode = 503;
    err.status = "error";
    err.message =
      "Database is temporarily busy. Please retry your request shortly.";
  }

  if (
    err.code === "ER_BAD_NULL_ERROR" ||
    err.code === "ER_DATA_TOO_LONG" ||
    err.code === "ER_TRUNCATED_WRONG_VALUE"
  ) {
    err.statusCode = 400;
    err.status = "fail";
    err.message = "Invalid data provided";
  }

  err.statusCode = err.statusCode || 500;

  err.status = err.status || "error";

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || "Internal Server Error",
  });
};

export default errorMiddleware;
