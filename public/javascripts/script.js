
 function addToCart(id){
    $.ajax({
        url:'/user/addtocart/' + id,
        method: 'GET',
        success:(response)=>{
            if(response.status){
                if(!response.exist){
                 //this code for getting and changing the values of a particular attribute in the html tag
                let count = document.getElementById("badge")
                var cartcountValue = parseInt(count.getAttribute("value"))+1;
                count.setAttribute('value', cartcountValue)
                //its code only for value in the html tag
                //let count = $('#badge').html();
                //let newcount  = parseInt(count)+1;
                //$('#badge').html(count);
                }
               
            }
            
        }
    })
}
