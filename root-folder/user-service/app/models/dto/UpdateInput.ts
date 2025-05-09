import { IsString, Length } from "class-validator";

export class VerificationInput {
  @IsString()
  @Length(6, 6, { message: "Code must be 6 characters long" })
  code: string;
}
