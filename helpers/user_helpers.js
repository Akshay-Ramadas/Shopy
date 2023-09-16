var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')

module.exports={


    //isUserExists :(email)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         try{
    //            await db.get().collection(collection.USER_DETAILS).findOne({email:email}).toArray().then(response=>{
    //                 if(response.length == 0){
    //                     resolve({status:"ok"})
    //                 }else{
    //                     resolve({status:"notok"})
    //                 }
    //            })
               
    //         }
    //         catch(err){
    //             reject({msg:"error occured"})
    //         }
    //     })

    // },

    doSignup :(firstName,lastName,email,password)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let user = await db.get().collection(collection.USER_DETAILS).findOne({email:email});
                if(!user){
                    const hashPassword = await bcrypt.hash(password,10)
                    console.log(email);
                    console.log(hashPassword);
                    await db.get().collection(collection.USER_DETAILS).insertOne({
                    firstName : firstName,
                    lastName : lastName,
                    email : email,
                    password :hashPassword,
                    
                    }).then(async(response)=>{
                        let user = await db.get().collection(collection.USER_DETAILS).findOne({email:email});
                        
                    resolve({status:"ok",user})
                    }).catch(err=>{
                    reject({msg:"Error while creating Account "})
                    })
                }else{
                    reject({msg:"user exists "})
                }
                

            }catch(err){
                reject({msg:"Error while creating Account "})
            }
        })

    },



    doLogin:(email,password)=>{
            return new Promise(async(resolve,reject)=>{
                try{
                   
                    let user = await db.get().collection(collection.USER_DETAILS).findOne({email:email});
                    if(user){
                        console.log(user.firstName);
                        console.log(user.password);
                        //const hash = await bcrypt.hash(password,10);
                         await bcrypt.compare(password,user.password).then(result=>{
                            if(result){
                                resolve({status:"ok",user})
                            }
                            else{
                                console.log("error in comparison");
                                reject({msg:"login failed"})
                            }
                        })
                    }
                    else{
                        console.log("user not exist");
                        reject({msg:"login failed"})
                    }
                }catch(err){
                    reject({msg:"error in catch"})
                }
            })
    },



    addToCart : (productId,userId)=>{
        let cartobj = {
            item : ObjectId(productId),
            quantity : 1
        }
        return new Promise(async(resolve, reject) =>{
            try{
                let user = await db.get().collection(collection.CART_COLLECTION).findOne({userId: ObjectId(userId)})
                console.log(user);
                if(!user){
                 await db.get().collection(collection.CART_COLLECTION).insertOne({
                    userId : ObjectId(userId),
                    cart :[cartobj]
                }).then(async (result)=>{
                    console.log(result);
                    user = await db.get().collection(collection.CART_COLLECTION).findOne({userId: ObjectId(userId)})
                    resolve({status:"ok",user})
                }).catch(err=>{
                    reject({msg: err})
                })
                }
                else{

                    let CartDuplicateExist = user.cart.findIndex(cart=> cart.item == productId)
                    console.log(CartDuplicateExist);
                    if(CartDuplicateExist != -1){
                         await db.get().collection(collection.CART_COLLECTION).updateOne({'cart.item': ObjectId(productId)},{
                            $inc:{'cart.$.quantity':1}
                        }).then(async result => {
                            resolve({status:"ok", exist :true})
                        })
                    }
                    else{
                        await db.get().collection(collection.CART_COLLECTION).updateOne({userId: ObjectId(userId)},{
                            $push : {cart: cartobj}
                        }).then(async result => {
                            user = await db.get().collection(collection.CART_COLLECTION).findOne({userId: ObjectId(userId)})
                            resolve({status:"ok",user})
                        })
                    }
                   
            }
           
            }catch(err){
                console.log(err);
                reject({msg:"error in catch"})
            }
            
        })
    },


    list_Cart : (userId)=>{
        return new Promise(async(resolve, reject) =>{
           
             let cartItems =  await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match :{userId: ObjectId(userId)}
                },
                {
                    $unwind:'$cart'
                },
                {
                    $project:{
                        item:"$cart.item",
                        quantity:"$cart.quantity"
                    }
                },
                {
                    $lookup:{
                        from :collection.PRODUCT_COLLECTION,
                        localField:"item",
                        foreignField:"_id",
                        as: "product"
                    }  
                }
                
                // {
                //     $lookup:{
                //         from:collection.PRODUCT_COLLECTION,
                        
                //         let :  { products:'$cart'},
                //         pipeline:[
                //             {
                //                 $match:{
                //                     $expr:{
                //                         $in:['$_id','$$products']
                //                     }
                //                 }
                //             }
                //         ],
                //         as:'cartItem',

                //     }
                // }
              ]).toArray()
              resolve(cartItems)
              //console.log(cartItems);
        })
    },


    cartCount : (userId) =>{
        return new Promise(async (resolve, reject) =>{
            try{
                let cartItems =  await db.get().collection(collection.CART_COLLECTION).findOne({userId: ObjectId(userId)})
            if(cartItems){
                console.log(cartItems.cart.length);
                resolve(cartItems.cart.length)
            }
            }
            catch(err){
                console.log(err);
            }
            
            

        })
    }
}