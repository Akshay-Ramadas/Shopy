var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');


const Product_Helpers=require('../helpers/product-helpers')
const User_Helpers = require('../helpers/user_helpers');
const { log } = require('handlebars/runtime');
// const { log } = require('handlebars/runtime');
// const { __localsAsData } = require('hbs');
const verifyLogin =(req,res,next)=>{
   if(req.session.loggedIn){
      next()
   }
   else{
      res.redirect('/user/login')
   }
}





            //GET METHODS   

router.get('/', async function(req, res, next) {
   try{
      var user = req.session.user;
      var status = req.session.loggedIn;
      console.log("test");
      console.log(status);
      console.log(user);
      var cartcount = 0;
      if(user){
               cartcount = await User_Helpers.cartCount(user._id);

      }
      const Products = await Product_Helpers.getAllProductsForUser();
      res.render('../views/user/view-products', { Products, user, status ,cartcount});
      }
      catch(err){
         console.log(err);
      }
   
});


router.get('/user/login', (req,res)=>{
   console.log("hello");
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

router.get('/user/cart',verifyLogin,async(req,res,)=>{
  // const userId = req.params.id;

   let status = req.session.loggedIn;
   let user = req.session.user;
   let cartcount = await User_Helpers.cartCount(user._id)
   await User_Helpers.list_Cart(user._id).then(result=>{
      let cart  =  result
       console.log(cart);
      res.render('../views/user/cart.hbs',{cart,user,status,cartcount});
   })
  
   
})
router.get('/user/addtocart/:id',(req,res)=>{
   console.log("api call");
   const product_id=req.params.id;
   let userId = req.session.user._id
   User_Helpers.addToCart(product_id,userId).then(response=>{
      // if(response.status==="ok"){
      //    res.redirect('/')
      // }
      if(response.exist){
         res.json({
         status:true,
         exist:true,
      })
      }else{
         res.json({
            status:true,
            
         })
      }
      
   }).catch(err=>{
      console.log(err.msg);
   })
})

router.get('/removeCart/:key',verifyLogin,(req,res)=>{
   var user = req.session.user;
   var status = req.session.loggedIn;
   const id = req.params.key
  User_Helpers.removeCartElement(id,user._id).then(response=>{
   res.redirect('/user/cart')
  });
})

//POST METHODS


router.post('/user/signup',async(req,res)=>{
   const firstName = req.body.fName;
   const lastName = req.body.lName;
   const email = req.body.email;
   const password = req.body.password;

   User_Helpers.doSignup(firstName,lastName,email,password).then(response=>{
      if(response.status === "ok"){
         console.log("hiiiii guddd");
         req.session.loggedIn = true
         req.session.user = response.user
         res.redirect('/')
      }
   }).catch(err=>{
      res.redirect('/user/login')
   })
  
})

router.post('/user/login',async(req,res)=>{
   try{
       const email = req.body.email;
   const password = req.body.password;
   User_Helpers.doLogin(email,password).then( result=>{
      if(result.status === "ok"){
         console.log("okk");
         req.session.loggedIn = true;
         req.session.user = result.user;
         console.log(req.session.loggedIn);
        // console.log(req.session.loggedIn);
        
         res.redirect('/')
      }
   }).catch(err=>{
      req.session.loginErr= true;
      res.redirect('/user/login')
    console.log(err);
   })
   } catch(err){
      console.log(err);
   }
  
})

module.exports = router;
