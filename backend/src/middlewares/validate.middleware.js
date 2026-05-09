import { ZodError } from "zod";

const allowedSources = ["body", "params", "query"];

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      if (!allowedSources.includes(source)) {
        throw new Error(`Invalid validation source: ${source}`);
      }

      const validatedData = schema.parse(req[source]);

      // body & params can be overwritten safely
      if (source === "body" || source === "params") {
        req[source] = validatedData;
      }

      // query should be merged instead
      if (source === "query") {
        req.validatedQuery = validatedData;
      }

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