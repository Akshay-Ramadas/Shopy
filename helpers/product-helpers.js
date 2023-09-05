const { ObjectID } = require('bson');
var db=require('../config/connection')
var collection = require('../config/collection')

module.exports={


    addProduct:(product,callback)=>{
        console.log(product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            
            console.log(data.insertedId);
                callback(data.insertedId)
        })
    },


    getAllProducts:()=>{
        return new Promise(async (resolve,reject)=>{
            let productsArray= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(productsArray)
        })

    }




}