import AppError from "../utils/AppError.js";

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
    });

    if (error) {
      const validationMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new AppError(validationMessage, 400));
    }

    Object.assign(req[source], value);

    next();
  };
};

export default validate;
