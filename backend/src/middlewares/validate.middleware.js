import { ZodError } from "zod";

const allowedSources = ["body", "params", "query"];

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      if (!allowedSources.includes(source)) {
        throw new Error(`Invalid validation source: ${source}`);
      }

      const validatedData = schema.parse(req[source]);

      // overwrite validated/sanitized data
      req[source] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
};

export default validate;