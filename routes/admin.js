var express = require('express');
const fileUpload = require('express-fileupload');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const Admin_Helpers = require('../helpers/admin_helpers')


const verifyLogin =(req,res,next)=>{
  if(req.session.loggedInByAdmin){
     next()
  }
  else{
     res.redirect('/admin/login')
  }
}



router.get('/', function(req, res, next) {
  let status =  req.session.loggedInByAdmin;
  let admin_data  = req.session.admin;
  if(status){
      productHelpers.getAllProducts().then((Products)=>{
      console.log(Products);
      res.render('admin/view-products',{admin:true,Products,status,admin_data})
     })
  }else{
    res.redirect('/admin/login')
  }


 

});

router.get('/login',(req,res)=>{
  res.render('admin/login',{admin:true})
})


router.get('/signup',(req,res)=>{
  res.render('admin/signup',{admin:true})
})

router.get('/add-products',(req,res)=>{
    res.render('admin/add-products',{admin:true})
})

router.get('/delete-product/:key',(req,res)=>{
  const id = req.params.key
  Promise.all([Admin_Helpers.deleteProductData(id),Admin_Helpers.deleteProductFile(id)]).then(response=>{
    if(response[0].status === "ok" && response[1].status === "ok"){
      res.redirect('/admin')
      console.log("success deletion");
    }
  }).catch(err=>{
    res.send(err.msg)
  })
})


router.get('/edit-product/:key',(req,res)=>{
  let id = req.params.key;
  Admin_Helpers.getProductDetails(id).then(response=>{
    res.render('admin/edit-product',{product:response,admin:true})
  }).catch(err=>{
    res.send(err.msg)
  })
})

router.get('/logout',(req,res)=>{
   req.session.destroy();
   res.redirect('/admin/login')
})









           //            POST METHODS

router.post('/add-products',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  productHelpers.addProduct(req.body,(id)=>{
  console.log(id);
    var image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        productHelpers.getAllProducts().then((Products)=>{
          console.log(Products);
          res.render('admin/view-products',{admin:true,Products})
      })
      }
      else{
        console.log(err);
      }
    })
  })
})




router.post('/login',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  Admin_Helpers.doLogin(email,password).then(result=>{
     if(result.status === "ok"){
      req.session.loggedInByAdmin=true;
      req.session.admin = result.admin;
      res.redirect('/admin')
        console.log("succesful" )

     }
  }).catch(err=>{
   console.log(err.msg);
  })
})




router.post('/signup',async(req,res)=>{
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;
  const password = req.body.password;

  Admin_Helpers.doSignup(firstName,lastName,email,password).then(response=>{
     if(response.status === "ok"){
        req.session.loggedInByAdmin=true;
        req.session.admin = response.admin;
        res.redirect('/admin')
        console.log("Account created");
       // alert("success signup")
       // res.render('../views/user/view-products.hbs',{admin:true})
     }
  }).catch(err=>{
     res.send(err.msg)
  })
 
})

router.post('/edit-product/:key',(req,res)=>{
  const id = req.params.key;
  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const description = req.body.description;
  if(!req?.files?.Image){
    Admin_Helpers.updateProductData(id,name, price, category, description).then(response=>{
        if(response.status === "ok"){
          res.redirect('/admin')
        }
    }).catch(err=>{
      res.send(err.msg)
    })
    
  }else{
    Promise.all(
      [Admin_Helpers.updateProductData(name, price, category, description),
      Admin_Helpers.updateProductFile(id,req.files.Image)]).then(response=>{
        if(response[0].status === "ok" && response[1].status === "ok"){
          res.redirect('/admin')
        }
      }).catch(err=>{
        res.send(err.msg)
      })
  }


})
module.exports = router;


