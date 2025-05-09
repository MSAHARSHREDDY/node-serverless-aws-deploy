import { ProductInput } from "../dto/product-input";
import { products,ProductDoc} from "../models";

export class ProductRepository{
    constructor(){}

    // async CreateProduct({name,description,price,category_id,image_url,seller_id}:ProductInput){
    //     return products.create({name,description,price,category_id,image_url,availability:true,seller_id})
    // }

    async CreateProduct({name,description,price,category_id,image_url,seller_id }: ProductInput) {
        try {
          const product = await products.create({name,description,price,category_id,image_url,availability: true,seller_id,});
          console.log("✅ Product inserted:", product);
          return product;
        } catch (err) {
          console.error("❌ Failed to insert product:", err);
          throw err;
        }
      }
    

    async GetAllProducts(offset=0,pages?:number){
        return products.find().skip(offset).limit(pages?pages:500)
    }

    async GetProductById(id:string){
        return await products.findById(id) as ProductDoc
    }

    async UpdateProduct({id,name,description,price,category_id,image_url,availability}:ProductInput){
        let existingProduct = (await products.findById(id)) as ProductDoc;
    existingProduct.name = name;
    existingProduct.description = description;
    existingProduct.price = price;
    existingProduct.category_id = category_id;
    existingProduct.image_url = image_url;
    existingProduct.availability = availability;
    return existingProduct.save();
    }

    async DeleteProduct(id:string){
        const {category_id}=await products.findById(id) as ProductDoc
        const deleteResult=await products.deleteOne({_id:id})
        return {category_id,deleteResult}
    }

    async GetAllSellerProducts(seller_id: number) {
        return products.find({ seller_id: seller_id });
      }
}