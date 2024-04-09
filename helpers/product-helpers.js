const { ObjectID } = require('bson');
var db=require('../config/connection')
var collection = require('../config/collection')

module.exports={


    addProduct:(product,admin,callback)=>{
        console.log(product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne({
            name:product.name,
            price:product.price,
            category:product.category,
            descripion:product.descripion,
            ownerId:admin
        }).then((data)=>{
            
            console.log(data.insertedId);
                callback(data.insertedId)
        })
    },


    getAllProducts:(id)=>{
        return new Promise(async (resolve,reject)=>{
            let productsArray= await db.get().collection(collection.PRODUCT_COLLECTION).find({
                ownerId:id
            }).toArray()
            resolve(productsArray)
        })

    },

    getAllProductsForUser:()=>{
        return new Promise(async (resolve,reject)=>{
            let productsArray= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(productsArray)
        })

    }



}