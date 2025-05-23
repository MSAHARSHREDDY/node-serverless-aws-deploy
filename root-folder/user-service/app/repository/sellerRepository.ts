import { UserModel } from "app/models/UserModel";
import { DBOperation } from "./dbOperations";
import { AddressInput } from "app/models/dto/AddressInput";
import { PaymentMethodInput, SellerProgramInput } from "app/models/dto/JoinSellerProgramInput";
import { PaymentMethodModel } from "app/models/dto/PaymentMethodModel";

export class SellerRepository extends DBOperation {
  constructor() {
    super();
  }

  async CheckEnrolledProgram(userId: number) {
    const queryString =
      "SELECT user_type from users WHERE user_id=$1 AND user_type=$2";
    const result = await this.executeQuery(queryString, [userId, "SELLER"]);
    if (result.rowCount > 0) {
      return true;
    }
    return false;
  }

  async UpdateProfile(input: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    user_id: number;
  }) {
    const queryString =
      "UPDATE users set first_name=$1,last_name=$2,phone=$3,user_type=$4 WHERE user_id=$5 RETURNING *";
    const values = [
      input.firstName,
      input.lastName,
      input.phoneNumber,
      "SELLER",
      input.user_id,
    ];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount > 0) {
      return result.rows[0] as UserModel;
    } else {
      return false;
    }
  }

  async UpdateAddress(input: AddressInput & { user_id: number }) {
    const addressQuery = "SELECT * FROM address WHERE user_id=$1";
    const addressResult = await this.executeQuery(addressQuery, [
      input.user_id,
    ]);
    //If address doesnot exist just insert into addrress table
    let queryString = `INSERT INTO address(
            address_line1,
            address_line2,
            city,
            post_code,
            country,
            user_id
        ) VALUES ($1,$2,$3,$4,$5,$6)`;

    const values = [
      input.addressLine1,
      input.addressLine2,
      input.city,
      input.postCode,
      input.country,
      input.user_id,
    ];

    //If address exists just update the address
    if (addressResult.rowCount > 0) {
      queryString = `UPDATE address
            SET address_line1=$1,
                address_line2=$2,
                city=$3,
                post_code=$4,
                country=$5
            WHERE user_id=$6
             `;
    }

    return this.executeQuery(queryString, values);
  }

  async CreatePaymentMethod({bankAccountNumber,swiftCode,paymentType,user_id}:SellerProgramInput &{user_id:number}){
    const queryString="INSERT INTO payment_methods(bank_account,swift_code,payment_type,user_id)VALUES($1,$2,$3,$4)";
    const values=[Number(bankAccountNumber),swiftCode,paymentType,user_id]
    const result=await this.executeQuery(queryString,values)
    return result.rowCount>0
  }

  async GetPaymentMethods(userId:number){
    const queryString="SELECT * FROM payment_methods WHERE user_id=$1"
    const values=[userId]
    const result=await this.executeQuery(queryString,values)
    if (result.rowCount < 1) {
        throw new Error("payment methods does not exist!");
      }
      return result.rows[0] as PaymentMethodModel;
  }

  async UpdatePaymentMethod({bankAccountNumber,
    swiftCode,
    paymentType,
    payment_id,
    user_id,
  }: PaymentMethodInput & { payment_id: number; user_id: number}){
    const queryString="UPDATE payment_methods SET bank_account=$1,swift_code=$2,payment_type=$3 WHERE id=$4  AND user_id=$5";
    const values=[Number(bankAccountNumber),swiftCode,paymentType,payment_id,user_id]
    const result=await this.executeQuery(queryString,values)
    return result
  }
}
