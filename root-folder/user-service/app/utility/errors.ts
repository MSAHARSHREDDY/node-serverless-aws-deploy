// import { ValidationError, validate } from "class-validator";

// export const AppValidationError = async (
//   input: any
// ): Promise<ValidationError[] | false> => {
//   const error = await validate(input, {
//     ValidationError: { target: true },
//   });

//   if (error.length) {
//     return error;
//   }
//   return false;
// };


import { validate } from "class-validator";

export const AppValidationError = async (
  input: any
): Promise<string | false> => {
  const errors = await validate(input);

  if (errors.length) {
    const messages = errors
      .map((err) => Object.values(err.constraints || {}))
      .flat()
      .join(", ");
    return messages;
  }

  return false;
};
