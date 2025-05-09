import { ShoppingCartModel } from "app/models/ShoppingCartModel";
import { DBOperation } from "./dbOperations";
import { CartItemModel } from "app/models/CartItemModel";

export class CartRepository extends DBOperation{
    constructor(){
        super()
    }

    

    async FindShoppingCart(userId: number) {
        const queryString = "SELECT cart_id,user_id FROM shopping_carts WHERE user_id=$1";
        const values = [userId];
        const result = await this.executeQuery(queryString, values);
        return result.rowCount > 0 ? (result.rows[0] as ShoppingCartModel) : false;
            //or
        //return result.rowCount > 0 ? (result.rows[0] ) : "failed to find shopping";
        //make sure you to keep null or false over there
    }

    
    async CreateShoppingCart(userId: number) {
        const queryString = "INSERT INTO shopping_carts(user_id) VALUES($1) RETURNING *";
        const values = [userId];
        const result = await this.executeQuery(queryString, values);
        return result.rowCount > 0 ? (result.rows[0] as ShoppingCartModel) : false;
            //or
        //return result.rowCount > 0 ? (result.rows[0] ) : "failed to find shopping";
        //make sure you to keep null or false over there
    }

    async FindCartItemById(){

    }

    // async FindCartItemByProductId(productId: string){
    //     const queryString="SELECT product_id,price,item_qty FROM cart_items WHERE product_id=$1 "
    //     const values=[productId]
    //     const result=await this.executeQuery(queryString,values)
    //     return result.rowCount>0?result.rows[0] as CartItemModel:"failed to find FindCartItemByProductId "
    // }

    async FindCartItemByProductId(productId: string) {
        const queryString = "SELECT product_id, price, item_qty FROM cart_items WHERE product_id=$1";
        const values = [productId];
        const result = await this.executeQuery(queryString, values);
        return result.rowCount > 0 ? (result.rows[0] as CartItemModel) : false;
    }

    async FindCartItems(userId:number){
        /**
         * This selects specific columns from the cart_items table (aliased as ci).
         * This performs an INNER JOIN:

        Join shopping_carts (aliased as sc)

        With cart_items (aliased as ci)

        Only include rows where sc.cart_id = ci.cart_id
        → So it fetches only the items in the user's shopping cart
         */
    const queryString = `SELECT 
    ci.cart_id,
    ci.item_id,
    ci.product_id,
    ci.name,
    ci.price,
    ci.item_qty,
    ci.image_url,
    ci.created_at FROM shopping_carts sc INNER JOIN cart_items ci ON sc.cart_id=ci.cart_id WHERE sc.user_id=$1`;
    const values = [userId];
    const result = await this.executeQuery(queryString, values);
    return result.rowCount > 0 ? (result.rows as CartItemModel[]) : [];
    }

    async FindCartItemsByCartId(cartId: number) {
        const queryString =
          "SELECT product_id, name, image_url,  price, item_qty FROM cart_items WHERE cart_id = $1";
        const values = [cartId];
        const result = await this.executeQuery(queryString, values);
        return result.rowCount > 0 ? (result.rows as CartItemModel[]) : [];
      }

    async CreateCartItems({ cart_id,
        product_id,
        name,
        image_url,
        price,
        item_qty}:CartItemModel){
    const queryString="INSERT INTO cart_items(cart_id,product_id,name,image_url,price,item_qty)  VALUES($1,$2,$3,$4,$5,$6) RETURNING *";
    const values = [cart_id, product_id, name, image_url, price, item_qty];
    const result = await this.executeQuery(queryString, values);
    return result.rowCount > 0 ? (result.rows[0] as CartItemModel) : false;
    }

    async UpdateCartItemById(itemId: number, qty: number){
        const queryString="UPDATE cart_items SET item_qty=$1 WHERE item_id=$2 RETURNING *"
        const values=[qty,itemId]
        const result=await this.executeQuery(queryString,values)
        return result.rowCount>0?result.rows[0] as CartItemModel:false
    }

    async UpdateCartItemByProductId(productId: string, qty: number){
        const queryString="UPDATE cart_items SET item_qty=$1 WHERE product_id=$2 RETURNING *"
        const values=[qty,productId]
        const result=await this.executeQuery(queryString,values)
        return result.rowCount > 0 ? (result.rows[0] as CartItemModel) : "failed to update";
    }

    async DeleteCartItem(itemId:Number){
        const queryString="DELETE FROM cart_items WHERE item_id=$1"
        const values=[itemId]
        return this.executeQuery(queryString, values);
    }
}