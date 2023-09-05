var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');


const Product_Helpers=require('../helpers/product-helpers')
const User_Helpers = require('../helpers/user_helpers');
const { log } = require('handlebars/runtime');
const verifyLogin =(req,res,next)=>{
   if(req.session.loggedIn){
      next()
   }
   else{
      res.redirect('/user/login')
   }
}





            //GET METHODS   

router.get('/', function(req, res, next) {
   let user = req.session.user;
   let status = req.session.loggedIn;
   //console.log(user);
   //let Name = `${user.firstName}${user.lastName}`
   //let user.fullName = Name;
   Product_Helpers.getAllProducts().then((Products)=>{
    res.render('../views/user/view-products.hbs',{Products,user,status});
   })
  
 
});

router.get('/user/login',(req,res)=>{
   let status =  req.session.loggedIn;
   if(status){
      res.redirect('/')
   }else{
         res.render('../views/user/login',{loginErr:req.session.loginErr})
         req.session.loginErr=false;
   }
})

router.get('/user/signup',(req,res)=>{
   res.render('../views/user/signup.hbs',)
})

router.get('/user/logout',(req,res)=>{
   req.session.destroy()
   res.redirect('/user/login')
})

router.get('/user/cart/:id',verifyLogin,(req,res,)=>{
   const userId = req.params.id;
   let status = req.session.loggedIn;
   let user = req.session.user;
   User_Helpers.list_Cart(userId).then(result=>{
      let cart  =  result.cartItem
      
      
      

      res.render('../views/user/cart.hbs',{cart,user,status});
   })
  
   
})

router.get('/user/addtocart/:id',verifyLogin,(req,res)=>{
   const product_id=req.params.id;
   let userId = req.session.user._id
   User_Helpers.addToCart(product_id,userId).then(response=>{
      if(response.status==="ok"){
         res.redirect('/')
      }
   }).catch(err=>{
      console.log(err.msg);
   })
})





















//POST METHODS


router.post('/user/signup',async(req,res)=>{
   const firstName = req.body.fName;
   const lastName = req.body.lName;
   const email = req.body.email;
   const password = req.body.password;

   User_Helpers.doSignup(firstName,lastName,email,password).then(response=>{
      if(response.status === "ok"){
         req.session.loggedIn = true
         req.session.user = response.user
         res.redirect('/')
      }
   }).catch(err=>{
      res.redirect('/user/login')
   })
  
})

router.post('/user/login',async(req,res)=>{
   const email = req.body.email;
   const password = req.body.password;
   User_Helpers.doLogin(email,password).then( result=>{
      if(result.status === "ok"){
         req.session.loggedIn = true;
         req.session.user = result.user;
        // console.log(req.session.loggedIn);
         console.log("succesfully logged in" )
         res.redirect('/')
      }
   }).catch(err=>{
      req.session.loginErr= true;
      res.redirect('/user/login')
    console.log(err.msg);
   })
})

module.exports = router;
