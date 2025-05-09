import { IsNumber, Length } from "class-validator";

export class ProductInput{
    id:string;

    @Length(3,12)
    name:string

    @Length(3,256)
    description:string

    category_id:string;

    image_url:string;

    @IsNumber()
    price:number

    availability:boolean

    seller_id:number;
}