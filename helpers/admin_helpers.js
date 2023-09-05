var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt = require('bcrypt')
const { response } = require('express')
const fs = require('fs')
const ObjectId = require('mongodb').ObjectId




module.exports = {



    doSignup :(firstName,lastName,email,password)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let user = await db.get().collection(collection.ADMIN_DETAILS).findOne({email:email});
                if(!user){
                    const hashPassword = await bcrypt.hash(password,10)
                    console.log(email);
                    console.log(hashPassword);
                    await db.get().collection(collection.ADMIN_DETAILS).insertOne({
                    firstName : firstName,
                    lastName : lastName,
                    email : email,
                    password :hashPassword,
                    
                    }).then(async response=>{
                        let admin = await db.get().collection(collection.ADMIN_DETAILS).findOne({email:email})
                        console.log(admin);
                    resolve({status:"ok",admin})
                    }).catch(err=>{
                    reject({msg:"Error while creating Account "})
                    })
                }else{
                    reject({msg:"Admin exists "})
                }
                

            }catch(err){
                reject({msg:"Error while creating Account "})
            }
        })

    },


    doLogin:(email,password)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                
                let user = await db.get().collection(collection.ADMIN_DETAILS).findOne({email:email});
                if(user){
                    console.log(user.firstName);
                    console.log(user.password);
                    //const hash = await bcrypt.hash(password,10);
                     await bcrypt.compare(password,user.password).then(async result=>{
                        let admin  =  await db.get().collection(collection.ADMIN_DETAILS).findOne({email:email})
                        console.log(admin);
                        resolve({status:"ok",admin})
                    }).catch(err=>{
                        reject({msg:err})
                    })
                }
               


            }catch(err){
                reject({msg:"error in catch"})

            }
        })
},

deleteProductData : (id)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id: ObjectId(id)}).then(response=>{
                if(response){
                    console.log(response);
                    resolve({status:"ok"})
                    console.log("success");
                }
                else{
                    reject({msg:"error while deleting"})
                }
            })

        }catch(err){
            console.log(err);
            reject({msg:"error while deleting"})
        }

    })
},


deleteProductFile : (id)=>{
    return new Promise((resolve,reject)=>{
        try{
            
            fs.unlink('./shoppingCart/../public/product-images/'+id+'.jpg',(err)=>{
                console.log(err);
                if(!err){
                    resolve({status:"ok"})
                    console.log("okkkk");
                }
                else{
                    reject({msg:"error while deleting productFile"})
                }
                
            })
            

        }
        catch(err){
            reject({msg:"error while deleting productFile"})
            console.log("okkkkkk");
        }
    })


},
getProductDetails : (id)=>{
    return new Promise((resolve,rejects)=>{
        try{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : ObjectId(id)}).then(product=>{
                console.log(product);
                resolve(product)
            })

        }
        catch(err){

        }
    })

},

updateProductData : (id,name,price,category,description)=>{
    return new Promise((resolve,reject)=>{
        try{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id : ObjectId(id)},
            {
                $set:{name : name,
                    price : price,
                    category : category,
                    description : description,
                    }
            }).then(response=>{
                resolve({status:"ok"})
            }).catch(err=>{
                reject({msg: "error while updating"})
            })

        }catch(err){
            reject({msg: "error while updating"})

        }
    })
},

updateProductFile : (id, file)=>{
    return new Promise((resolve,reject)=>{
        try{
            file.mv('./public/product-images/'+id+'.jpg',(err)=>{
                if(!err){
                    resolve({status:"ok"})
                    
                }
            })

        }catch(err){
            console.log(err);
            reject({msg: "error while updating"})
        }
    })
} 




}