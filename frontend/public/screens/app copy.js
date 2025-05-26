 appScript = `     
 window.showNotifications = function (){
     alert("No notifications yet!");
 }



window.splashFn = function (){
                     alert("This is the splash screen!");
                 };



window.initSwiper = function (){  
 new Swiper('.swiper-container', {
     pagination: '.swiper-pagination',
     paginationClickable: true
 });      
 $('#swiper_container').css('position','fixed');
 $('#menuDiscover').css('position','fixed');
 $('#swiper_container').css('top','0px');
 $('#swiper_container').css('width','100%');
 $('#swiper_container').css('z-index','100000000000');
 $('#close_swipe').click(function(){
     $('#swiper_container').fadeOut();
 });
};
if(localStorage.getItem("slide_seen") == null){
 initSwiper();
}
localStorage.setItem("slide_seen","seen");
 

/*payFundingWithPaystack*/
window.payFundingWithPaystack = function (){
var get_fund_amount = Number(document.getElementById("fundWallet-amount-card").value);
/*alert(get_fund_amount);*/
/*var paid_amount = (get_fund_amount * 100) + (get_fund_amount * 100 * 1.5 / 100) + (100 * 100);*/
var paid_amount = get_fund_amount * 100;
var handler = PaystackPop.setup({
 key: appData.settings.paystack_pubic_key,
 /*key: appData.settings.paystack_pubic_key,*/
 email: user_info.signup_email,
 amount: paid_amount,
 currency: "NGN",
 ref: ''+Math.floor((Math.random() * 1000000000) + 1), /*generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you*/
 metadata: {
    custom_fields: [
       {
           member_id: user_info.member_id,
           display_name: user_info.signup_first_name + " " + user_info.signup_last_name,
           phone: user_info.signup_phone,
           email: user_info.signup_email,
           NID: "####",
           stage: "1",
           due_amount: get_fund_amount,
           paid_amount:  paid_amount
       }
    ]
 },
 callback: function(response){
     console.log(response);
     /*alert('success. transaction ref is ' + response.reference);*/
     swal("Successful!", 'Transaction reference is ' + response.reference, "success");
    var trans_data = {};
   trans_data.meta = {
                         member_id: user_info.member_id,
                         display_name: user_info.signup_first_name + " " + user_info.signup_last_name,
                         phone: user_info.signup_phone,
                         email: user_info.signup_email,
                         NID: "####",
                         stage: "1",
                         due_amount: get_fund_amount,
                         paid_amount:  paid_amount
                   };
   trans_data.response = response;
   verifyFundingpayment(trans_data);
 },
 onClose: function(){
     alert('window closed');
 }
});
handler.openIframe();
}



window.successCallbackfn = function (resp){
/*   alert('Charge successful, Ref: ' + JSON.stringify(resp)); */
 var get_fund_amount = Number(document.getElementById("fundWallet-amount-card").value);
/*   alert(get_fund_amount); */
 /*var paid_amount = (get_fund_amount * 100) + (get_fund_amount * 100 * 1.5 / 100) + (100 * 100);*/
 var paid_amount = get_fund_amount * 100;            
 var transaction = Math.ceil(Math.random() * 1000000000);
/* alert("Verifying transaction..."); */
 var trans_data = {};
 trans_data.meta = { member_id: user_info.member_id,
                         display_name: user_info.signup_first_name + " " + user_info.signup_last_name,
                         phone: user_info.signup_phone,
                         email: user_info.signup_email,
                         NID: "####",
                         stage: "1",
                         due_amount: get_fund_amount,
                         paid_amount:  paid_amount
                   };
 var response = {
                 message:	"Approved",
                 redirecturl:	"?trxref=" + resp.reference + "&reference=" + resp.reference + "",
                 reference:	resp.reference + "",
                 status:	"success",
                 trans:	transaction + "",
                 transaction:	transaction + "",
                 trxref:	resp.reference + "",
 };
 trans_data.response = response;
/* alert("Verifying transaction...");   */    
 verifyFundingpayment(trans_data);
};
window.failureCallbackfn = function (resp){
 if(resp.code == 427){
     smallBottomFade(resp.error, "white","red");
 }else{
     hide_loading1();
     smallBottomFade(resp.error, "white","red");
 }
 
};


window.doPay = function (){           
 try {
     var get_fund_amount = Number(document.getElementById("fundWallet-amount-card").value);
     /*alert(get_fund_amount);*/
     /*var paid_amount = (get_fund_amount * 100) + (get_fund_amount * 100 * 1.5 / 100) + (100 * 100);*/
     var paid_amount = get_fund_amount * 100;              
     var chargeParams = {    cardNumber: document.getElementById("fund_wallet_card_number").value.split(" ").join(""), 
                             expiryMonth: document.getElementById("fund_wallet_exiration").value.split("/")[0], 
                             expiryYear: document.getElementById("fund_wallet_exiration").value.split("/")[1],
                             cvc: document.getElementById("fund_wallet_security").value,
                             email: user_info.signup_email,
                             amountInKobo: paid_amount
     };     
     show_loading1();
     window.PaystackPlugin.chargeCard(successCallbackfn, failureCallbackfn, chargeParams);
 }
 catch(err) {
     alert(err.message);
 }               
}


/*verifyFundingpayment*/
window.verifyFundingpayment = function (trans_data){
 /*alert("try verify Funding!");*/
 var formData = trans_data;
 /*VALIDATE*/
 /*submit to database;*/
 let api = "/api/verify_funding";
 let url_data = "";
 let route_link = serverHost + api + url_data;
 reqAsyncJSON("POST", route_link ,formData,"verifyFundingpaymentResponse",{trans_data: trans_data});			
}
 
/*verifyFundingpaymentResponse*/
window.verifyFundingpaymentResponse = function (data){
 if(JSON.parse(data[0])){
     if(JSON.parse(data[0]).success){
         if(JSON.parse(data[0]).success == 1){
             /*alert("Transaction complete! " + JSON.parse(data[0]).message);*/
             swal("Transaction Successful!", JSON.parse(data[0]).message, "success");
             document.getElementById("fundWallet-amount-card").value = 0;
             balancePage();
             getTransactions();
             hide_loading1();
             console.log(JSON.parse(data[0]));
             $(".show-home").click();
         }else{
             /*alert(JSON.parse(data[0]).message);*/
             swal(JSON.parse(data[0]).message);
             hide_loading1();
         }
     }else{
         /*(alert(JSON.parse(data[0]).message);*/
         swal(JSON.parse(data[0]).message);
         hide_loading1();
     }
 }else{
     /*alert("An error occured with transaction contact Admin");*/
     /*swal("Error","An error occured with transaction contact Admin","error");*/
 }
 
}


window.balancePage = function (){
 w3.getHttpObject(appData.root_url + "api/wallet/balance_page/" + user_info.member_id, balancePageRender);
}

     
window.balancePageRender = function (dataObject) {
 appData.balance_page=dataObject;
 $(".total_balance").html(dataObject.total_balance.toLocaleString('en-US', 'numeric'));
 $(".total_deposit").html(dataObject.total_deposit.toLocaleString('en-US', 'numeric'));
 $(".total_withdraw").html(dataObject.total_withdraw.toLocaleString('en-US', 'numeric'));
 $(".total_charges").html(dataObject.total_charges.toLocaleString('en-US', 'numeric'));
}       


window.formatCardExpString = function (e) {
var inputChar = String.fromCharCode(event.keyCode);
var code = event.keyCode;
var allowedKeys = [8];
if (allowedKeys.indexOf(code) !== -1) {
 return;
}

event.target.value = event.target.value.replace(
 /^([1-9]\\/|[2-9])$/g, '0$1/'
).replace(
 /^(0[1-9]|1[0-2])$/g, '$1/'
).replace(
 /^([0-1])([3-9])$/g, '0$1/$2'
).replace(
 /^(0?[1-9]|1[0-2])([0-9]{2})$/g, '$1/$2'
).replace(
 /^([0]+)\\/|[0]+$/g, '0'
).replace(
 /[^\\d\\/]|^[\\/]*$/g, ''
).replace(
 /\\/\\//g, '/'
);
}

          
          
$('#fund_wallet_card_number').on('keyup', function(e){
 var val = $(this).val();
 var newval = '';
 val = val.replace(/\\s/g, '');
 for(var i = 0; i < val.length; i++) {
     if(i%4 == 0 && i > 0) newval = newval.concat(' ');
     newval = newval.concat(val[i]);
 }
 $(this).val(newval);
});
          


 window.withdraw_validate1 = function (){
     if($("#withdraw_bank").val() == "--Select Bank--"){
         smallBottomFade("Please select a bank","white","red");
         return false;
     }
     if($("#withdraw_acc_no").val().length < 5){
         smallBottomFade("Please enter a valid account number","white","red");
         return false;
     }
     return true;
 };


 window.withdrawlControl = function (){
     if(appData.balance_page.total_balance < appData.settings.withdrawal_minimum){
         withdrawal_message = appData.settings.withdrawal_submmited.replaceAll("@amount", "₦" + Number(appData.settings.withdrawal_minimum).toLocaleString('en-US', 'numeric'));
         swal('Failed',withdrawal_message,'error');
     }else{
         swal('Processing',appData.settings.withdrawal_proccessing,'warning');        
     }
 }


 window.addWithdrawal = function(){
     /*
     if(Number($("#withdraw_amount").val()) < Number(appData.settings.withdrawal_minimum)){
         smallBottomFade("Please enter amount greater than ₦" + Number(appData.settings.withdrawal_minimum).toLocaleString('en-US', 'numeric'),"white","red");
         return false;
     }
     */
     
     if(Number($("#withdraw_amount").val()) > Number(appData.balance_page.total_balance)){
         /*smallBottomFade("Please enter amount lesser than your wallet balance ₦" + Number(appData.balance_page.total_balance).toLocaleString('en-US', 'numeric'),"white","red");*/
         smallBottomFade("The amount selected is more than avialable balance","white","red");
         return false;
     }
                    
     var payload = {
         member_id : user_info.member_id,
         amount: $("#withdraw_amount").val(),
         account: $("#withdraw_bank").val() + "-" + $("#withdraw_acc_no").val(),
         description: $("#withdraw_description").val()
     }
     show_loading1();
     reqAsyncJSON("POST", serverHost + api_prefix + "api/wallet/request_withdrawal", payload, 
     "WithdrawalResponse","Withdrawal request");
 }


 window.WithdrawalResponse = function (res){
     console.log(res);
     if(JSON.parse(res[0]).success != true){
         hide_loading1();
         smallBottomFade(JSON.parse(res[0]).message,"white","red");
         return false;
     }
     hide_loading1();
     /*swal("Successful",JSON.parse(res[0]).message,"success");*/
     $(".widthdrawal-header").html("Submitted");
     $(".widthdrawal-body").html(JSON.parse(res[0]).message);
     $(".show-widthdrawal-response").click();    

     balancePage();
     getTransactions();
 }
  


 window.checkWithdrawal = function(){
     if(typeof user_info != "undefined"){
         reqAsyncJSON("GET", serverHost + api_prefix + "api/check_withdrawal/" + user_info.member_id, 
         {}, 
         "checkWithdrawalResponse","Working!");
     }         
 }
       

 window.checkWithdrawalResponse = function (res){
     console.log(res);
     if(JSON.parse(res[0]).success == true){
     /*    swal("Declined",JSON.parse(res[0]).message,"error"); */
         $(".widthdrawal-header").html(JSON.parse(res[0]).header);
         $(".widthdrawal-body").html(JSON.parse(res[0]).message);
         $(".show-widthdrawal-response").click();      
         balancePage();
         getTransactions();              
         return false;
     }
 }
  

 window.setInterval(checkWithdrawal, 6000);



 window.allow_loan = false;
 window.calcLoan = function (element){
     var loanInput = element;

     if(Number(loanInput.value) > Number(loanInput.max)){
         swal("Maximum loan amount exceeded. Please reduce amount");
         window.allow_loan = false;
         return false;
     }
     if(Number(loanInput.value) < Number(loanInput.min)){
         swal("Minimum loan amount not reached. Please top amount");
         window.allow_loan = false;
         return false;
     }

     $(".loan-due-amount").html(((Number(appData.settings.loan_interest)/100 * Number(loanInput.value)) + Number(loanInput.value)).toLocaleString('en-US', 'numeric'));
     $(".loan-amount").html(( Number(loanInput.value)).toLocaleString('en-US', 'numeric'));
     $(".loan-interest").html(((Number(appData.settings.loan_interest)/100 * Number(loanInput.value))).toLocaleString('en-US', 'numeric'));
     var today = new Date();
     today.setDate(today.getDate() + Number(appData.settings.loan_duration));
     /*$(".loan-due-date").html(today.toDateString());*/
     $(".loan-due-date").html(Number(appData.settings.loan_duration) + " Days");
     window.allow_loan = true;
 }


 window.createLoan = function(){
     calcLoan(document.getElementById("input-loan-amount"));
      var member_id = user_info.member_id;
      var loan_amount = $("#page-lite-loan  #input-loan-amount").val();
      var repayment = ((Number(appData.settings.loan_interest)/100 * Number(loan_amount)) + Number(loan_amount));
      var purpose = $("#page-lite-loan #loan_purpose").val();
      var disbursement_account = $("#page-lite-loan #loan_account").val();
      var due_time = $("#page-lite-loan .loan-due-date").html();

      if(window.allow_loan == false || disbursement_account == "" || purpose==""){
         alert("Please complete loan application form!");
         return false;
      }

      if($("#page-lite-loan #agreeterms_loan").is(':checked') == false){
         alert("Please accept our terms to continue!");
         return false;
      }                 

      show_loading1();
      reqAsyncJSON("POST", serverHost + api_prefix + "api/create_loan", 
      {
         member_id: member_id, 
         loan_amount: loan_amount, 
         repayment: repayment,
         purpose: purpose,
         disbursement_account: disbursement_account,
         due_time: due_time
      }, 
      "createLoanResponse","Working!");
  }


  window.createLoanResponse = function (res){
     console.log(res);
     if(JSON.parse(res[0]).success != true){
         hide_loading1();
         swal("An Error Occured",JSON.parse(res[0]).message,"error");
         return false;
     }
     hide_loading1();
     /* swal(JSON.parse(res[0]).header,JSON.parse(res[0]).message,JSON.parse(res[0]).status); */
     $(".loan-success-header").html(JSON.parse(res[0]).header);
     $(".loan-success-body").html(JSON.parse(res[0]).message);
     $(".show-lite-loan-submitted").click();
     getBanks();
  }




 window.checkLoan = function(){
     if(typeof user_info != "undefined"){
         reqAsyncJSON("GET", serverHost + api_prefix + "api/check_loan/" + user_info.member_id, 
         {}, 
         "checkLoanResponse","Working!");
     }         
 }


 window.checkLoanResponse = function (res){
     console.log(res);
     if(JSON.parse(res[0]).success == true){
     /*    swal("Declined",JSON.parse(res[0]).message,"error"); */
         $(".loan-decline-header").html("Declined");
         $(".loan-decline-body").html(JSON.parse(res[0]).message);
         $(".show-lite-loan-failed").click();                    
         return false;
     }
 }
  

 window.setInterval(checkLoan, 6000);
  


const inputml = document.querySelector('#proceed-to-morgage-loan-upload-documment');
const buttonml = document.querySelector('#proceed-to-morgage-loan-upload-button');
buttonml.onclick = function () {
inputml.click()
};


window.mortgageAlert = function (){
 swal(appData.settings.mortgage_message);
};


window.submitMorgageLoan = function (){
 mortgage_loan_document = $("#proceed-to-morgage-loan-upload-documment").val();
 mortgage_loan_bank_name = $("#mortgage_loan_bank_name").val();
 mortgage_loan_account_number = $("#mortgage_loan_account_number").val();

 if(mortgage_loan_document.trim() == ""){
     smallBottomFade("Please upload document","white","red");
     return false;
 }

 if(mortgage_loan_bank_name.trim() == ""){
     smallBottomFade("Please enter bank name","white","red");
     return false;
 } 

 if(mortgage_loan_account_number.trim().length < 10){
     smallBottomFade("Please enter valid account number","white","red");
     return false;
 }  

 show_loading1();
 setTimeout(()=>{ swal("Submitted","Application in review", "success"); hide_loading1(); }, 2000);
};



 ele = document.getElementsByClassName("list-investment-company")[0];
 init_scroll = 0;
 if(init_scroll == 0){
     increment = 1;
     init_scroll += 1;
 }

 if(ele.scrollLeft == ele.scrollLeftMax){
     increment = -1;
 }
 if(ele.scrollLeft == 0){
     increment = 1;
 }
 ele.scrollLeft = ele.scrollLeft + (increment);


 window.upLoadDoc = function (docs){
     show_loading1();
     docs = docs;
     setTimeout(function(docs){swal("Success", "Document upload " +" completed!", "success"), hide_loading1();}, 2000);
 }


 window.submitDoc = function (){
     if($("#upload-doc1").val() == "" && $("#upload-doc2").val() == "" && $("#upload-doc3").val() == ""){
        swal("Please upload at least on means of Identifcation"); 
        return false;
     }                
     show_loading1();
     setTimeout(function(docs){swal("Submitted", "Kindly wait for approval", "success"), hide_loading1();}, 1000);
 }
     

 
     window.network_logo = { "GLO":"images/networks/glo_logo.jpg",
                             "MTN":"images/networks/mtn_logo.jpg",
                             "AIRTEL":"images/networks/airtel_logo.jpg",
                             "9mobile":"images/networks/9mobile.jpg"
                             };
 
 
     window.dataPlans = { "GLO":["50MB @ ₦50/1 DAY","150MB @ ₦100/1 DAY","350MB @ ₦200/2 DAYS","1.8GB @ ₦500/14 DAYS","3.9GB @ ₦1000/30 DAYS","7.5GB @ ₦1,500/30 DAYS","9.2GB @ ₦2,000/30 DAYS",
                                 "10.8GB @ ₦2,500/30 DAYS","14GB @ ₦3,000/30 DAYS","14GB @ ₦3,000/30 DAYS","18GB @ ₦4,000/30 DAYS","24GB @ ₦5,000/30 DAYS","29.5GB @ ₦8,000/30 DAYS","50GB @ ₦10,000/30 DAYS"],
                             "MTN":["40MB @ ₦50/1 DAY","200MB @ ₦60/1 DAY","100MB @ ₦100/1 DAY","1GB @ ₦300/1 DAY","2GB @ ₦500/2 DAYS","2.5GB @ ₦500/2 DAYS","450GB @ ₦120/7 DAYS","6GB @ ₦1,500/7 DAYS","10GB @ ₦2,500/30 DAYS",
                             "12GB @ ₦3500/30 DAYS","25GB @ ₦6,000/3 DAYS","40GB @ ₦10,000/30 DAYS"],
                             "AIRTEL":["50MB @ ₦40/1 DAY","200MB @ ₦100/1 DAY","350MB @ ₦200/2 DAYS","1.8GB @ ₦500/14 DAYS","3.9GB @ ₦1000/30 DAYS","7.5GB @ ₦1,500/30 DAYS","9.2GB @ ₦2,000/30 DAYS",
                                 "10.8GB @ ₦2,500/30 DAYS","14GB @ ₦3,000/30 DAYS","14GB @ ₦3,000/30 DAYS","18GB @ ₦4,000/30 DAYS","24GB @ ₦5,000/30 DAYS","29.5GB @ ₦8,000/30 DAYS","50GB @ ₦10,000/30 DAYS"],
                             "9mobile":["100MB @ ₦50/1 DAY","250MB @ ₦100/1 DAY","450MB @ ₦200/2 DAYS","1.8GB @ ₦500/14 DAYS","3.9GB @ ₦1000/30 DAYS","7.5GB @ ₦1,500/30 DAYS","9.2GB @ ₦2,000/30 DAYS",
                                 "10.8GB @ ₦2,500/30 DAYS","14GB @ ₦3,000/30 DAYS","14GB @ ₦3,000/30 DAYS","18GB @ ₦4,000/30 DAYS","24GB @ ₦5,000/30 DAYS","29.5GB @ ₦8,000/30 DAYS","50GB @ ₦10,000/30 DAYS"],
                             };
 
 
     window.initArtime = function (network){
         $(".network-icon").attr("src", network_logo[network]);
         $("#pay_bill_airtime_service_provider").val(network);                    
        /* alert(network);*/
     };
     window.doRecharge =  function(){             
         var member_id = user_info.member_id;
         var service_type = "Airtime";
         var service_provider = $("#pay_bill_airtime_service_provider").val();
         var service_number = $("#pay_bill_airtime_service_number").val();
         var service_amount = $("#pay_bill_airtime_service_amount").val();
         var service_customer = $("#pay_bill_data_service_customer").val();
         var service_note = $("#pay_bill_airtime_service_note").val();

         if(service_amount.trim() == ""){
             smallBottomFade("Please enter recharge amount","white","red");
             return false;
         }

         if(service_number.trim() == ""){
             smallBottomFade("Please enter phone number","white","red");
             return false;
         }                    

         if(service_number.trim().length < 11){
             smallBottomFade("Please enter a valid phone number","white","red");
             return false;
         }   

         var payload =   {
             member_id: member_id, 
             service_type: service_type, 
             service_provider: service_provider,
             service_number: service_number,
             service_amount: service_amount,
             service_customer: service_customer,
             service_note: service_note,
         };

         addService(payload);
     };
 
 
     window.initData = function (network){
         $(".network-icon").attr("src", network_logo[network]);
         $("#pay_bill_data_service_provider").val(network);                    
         var plans = dataPlans[network];
         var options = "";
             options += "<option value=''>--CHOOSE PLAN--</option>";
             for(var x =0; x<plans.length; x++){
                 /*50MB @ ₦50/1 DAY*/
                 var amount = plans[x].split("₦")[1].split("/")[0].replaceAll(",","");
                 options += "<option value='" + amount + "-" + plans[x] + "'>" + plans[x]  + "</option>";
             }
         $("#pay_bill_data_service_amount").html(options);
        
     };
     window.doData =  function(){             
         var member_id =  user_info.member_id;
         var service_type = "Data";
         var service_provider = $("#pay_bill_data_service_provider").val();
         var service_number = $("#pay_bill_data_service_number").val();
         var service_amount = $("#pay_bill_data_service_amount").val();
         var service_customer = $("#pay_bill_airtime_service_name").val();
         var service_note = $("#pay_bill_data_service_note").val();

         if(service_amount.trim() == ""){
             smallBottomFade("Please select a data package","white","red");
             return false;
         }

         if(service_number.trim() == ""){
             smallBottomFade("Please enter phone number","white","red");
             return false;
         } 
         
         if(service_number.trim().length < 11){
             smallBottomFade("Please enter a valid phone number","white","red");
             return false;
         }                     

         var payload =   {
             member_id: member_id, 
             service_type: service_type, 
             service_provider: service_provider,
             service_number: service_number,
             service_amount: service_amount,
             service_customer: service_customer,
             service_note: service_note,
         };

         addService(payload);
     };
 
 
     window.addService = function(payload){
         show_loading1();
         reqAsyncJSON("POST", serverHost + api_prefix + "api/add_service/" + payload.member_id, payload, 
         "addServiceResponse",payload.service_type);
     }
 
 
     window.addServiceResponse = function (res){
         console.log(res);
         if(JSON.parse(res[0]).success != true){
             hide_loading1();
             smallBottomFade(JSON.parse(res[0]).message,"white","red");
             return false;
         }
         hide_loading1();
         swal("Successful",JSON.parse(res[0]).message,"success");
         balancePage();
         getTransactions();
     }
             


window.saveNow = function (){
 swal(appData.settings.savings_message);
};



window.doLogin = function(){
     show_loading1();
     var get_username = $(".login-form-item  #email").val();
     var get_password = $(".login-form-item  #password").val();
     reqAsyncJSON("GET", serverHost + api_prefix + "api/generate_auth_cookie/" + get_username + "/" + get_password, 
     {
         username: get_username, 
         password: get_password, 
         seconds: "4000000"
     }, 
     "loginResponse","Working!");
 }


 window.loginResponse = function (cookie){
     console.log(cookie);
         if(JSON.parse(cookie[0]).success != true){
             hide_loading1();
             smallBottomFade(JSON.parse(cookie[0]).message,"white","red");
             return false;
         }
         prep_cookie ={"cookie": "fluttercookie" + "-" + JSON.parse(cookie[0]).message, "" : "Succesful Registration!"};
         getUserInfo([JSON.stringify(prep_cookie), cookie[1]]);
         hide_loading1();
         smallBottomFade("Login succesful!","white","green");
 }


window.doPassword = function(){
     show_loading1();
     var get_username = $("#p-email").val();
     reqAsyncJSON("POST", serverHost + api_prefix + "api/get_password/", 
     {
         username: get_username,
         seconds: "4000000"
     }, 
     "passwordResponse","Working!");
 }


 window.passwordResponse = function (cookie){
     console.log(cookie);
         if(JSON.parse(cookie[0]).success != true){
             hide_loading1();
             smallBottomFade(JSON.parse(cookie[0]).message,"white","red");
             return false;
         }
         hide_loading1();
         swal("Successful",JSON.parse(cookie[0]).message,"success");
 }


 /*Auto login*/
 /*
 setTimeout(function (){
         if(localStorage.getItem("cookie")){
             getUserInfo([localStorage.getItem("cookie"), "Auto Login"]);
         }else{
             document.getElementsByClassName("show-login")[0].click();
         }
     },100);
     */


 window.logout = function (){
     localStorage.removeItem("cookie");
     localStorage.removeItem("user_data");
     delete user_info;
     $(".show-login").click();
 }            



     
         window.snap = function(){
             alert("opening camera");
             navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
                 destinationType: Camera.DestinationType.DATA_URL
             });                      
         }                    
     
     
         window.onSuccess = function(imageData) {
             var image = document.getElementById('myImage');
             image.src = "data:image/jpeg;base64," + imageData;
         }
     
     
         window.onFail = function(message) {
             alert('Failed because: ' + message);
         }
     

 
     var signup_otp = 0;
     window.OTP = function(){
         var signup_phone =  $("#signup_phone").val();
         signup_otp = Math.ceil(Math.random() * 8999) + 1000;
         reqAsyncJSON('GET', appData.settings.sms_api.replace("$phone", signup_phone) + "ITOPMONEY CODE:" + signup_otp, {phone:signup_phone,otp: signup_otp}, 
                 "OTPResponse","OTP Created!");
     }
 
 
     window.OTPResponse = function (cookie){
         /*
         console.log(cookie);
         if(JSON.parse(cookie[0]).success != true){
             hide_loading1();
             smallBottomFade(JSON.parse(cookie[0]).message,"white","red");
             return false;
         }
         */
         myPrompt = prompt("Enter 4-digit code sent to your phone:");
         if(myPrompt == signup_otp){
             swal("Successful", "Your phone number is validated", "success");
             window.bvnValidated = true;
         }else{
             swal("Failed", "invalid Code, try again", "error");
         }
     }
 
 
     window.loadFile = function(event) {
         var output = document.getElementById('image-preview');
         output.src = window.URL.createObjectURL(event.target.files[0]);
         output.onload = function() {
             window.URL.revokeObjectURL(output.src);
         };
     };
             
 
     window.bvnValidated = false;
     window.signUp = function (){                         
             var signup_first_name =  $("#signup_first_name").val();
             var signup_last_name =  $("#signup_last_name").val();
             var signup_phone =  $("#signup_phone").val();
             var signup_email =  $("#signup_email").val();
             var signup_educational_status =  $("#signup_educational_status").val();  
             var signup_dob_day =  $("#signup_dob_day").val();  
             var signup_dob_month =  $("#signup_dob_month").val();  
             var signup_dob_year =  $("#signup_dob_year").val();  
             var signup_gender =  $("#signup_gender").val();  
             var signup_country =  $("#signup_country").val();  
             var signup_province_state =  $("#signup_province_state").val();  
             var signup_city =  $("#signup_city").val();  
             var signup_house_street =  $("#signup_house_street").val();  
             var signup_employment_status =  $("#signup_employment_status").val();  
             var signup_employer_name =  $("#signup_employer_name").val();  
             var signup_employer_address =  $("#signup_employer_address").val();  
             var signup_employer_date =  $("#signup_employer_date").val();  
             var signup_employment_salaray =  $("#signup_employment_salaray").val();  
             var signup_state_of_origin =  $("#signup_state_of_origin").val();  
             var signup_lga_of_origin =  $("#signup_lga_of_origin").val();  
             var signup_marital_status =  $("#signup_marital_status").val();  
             var signup_guarantor_name1 =  $("#signup_guarantor_name1").val();  
             var signup_guarantor_phone1 =  $("#signup_guarantor_phone1").val();  
             var signup_guarantor_relationship1 =  $("#signup_guarantor_relationship1").val();  
             var signup_guarantor_name2 =  $("#signup_guarantor_name2").val();  
             var signup_guarantor_phone2 =  $("#signup_guarantor_phone2").val();  
             var signup_guarantor_relationship2 =  $("#signup_guarantor_relationship2").val();  

             /*PAGE 2*/
             var signup_password =  $("#signup_password").val();  
             var signup_password2 =  $("#signup_password2").val();  
             var signup_transaction_pin =  $("#signup_transaction_pin").val();  
             var signup_bvn =  $("#signup_bvn").val();  
             var signup_photo =  $("#signup_photo").val();  
         
             /*KEYS*/
             var agreeterms = $("#agreeterms").is(":checked");
             var agreeterms2 = $("#agreeterms2").is(":checked");

             var signupObj = {
                 signup_first_name: signup_first_name, 
                 signup_last_name: signup_last_name, 
                 signup_phone: signup_phone.trim(), 
                 signup_email: signup_email.trim(), 
                 signup_educational_status: signup_educational_status,
                 signup_gender: signup_gender,
                 signup_dob_day: signup_dob_day,
                 signup_dob_month: signup_dob_month,
                 signup_dob_year: signup_dob_year,
                 signup_country: signup_country,
                 signup_province_state: signup_province_state,
                 signup_city: signup_city,
                 signup_house_street: signup_house_street,
                 signup_employment_status: signup_employment_status,
                 signup_employer_name: signup_employer_name,
                 signup_employer_address: signup_employer_address,
                 signup_employer_date: signup_employer_date,
                 signup_employment_salaray: signup_employment_salaray,
                 signup_state_of_origin: signup_state_of_origin,
                 signup_lga_of_origin: signup_lga_of_origin,
                 signup_marital_status: signup_marital_status,
                 signup_guarantor_name1: signup_guarantor_name1,
                 signup_guarantor_phone1: signup_guarantor_phone1,
                 signup_guarantor_relationship1: signup_guarantor_relationship1,
                 signup_guarantor_name2: signup_guarantor_name2,
                 signup_guarantor_phone2: signup_guarantor_phone2,
                 signup_guarantor_relationship2: signup_guarantor_relationship2,
                 signup_password: signup_password,
                 signup_password2: signup_password2,
                 signup_transaction_pin: signup_transaction_pin,
                 signup_bvn: signup_bvn,
                 signup_photo: signup_photo,
                 agreeterms: agreeterms,
                 agreeterms2: agreeterms2,
                 };

                 signupObj.copy_members = "submit";
                 console.log(signupObj);
                 if(validate_signup(signupObj) != true){
                     return false;
                 }
                 
                 if(bvnValidated == true){
                 
                 }else{
                     swal("PHONE NUMBER NOT VALIDATED");
                     return false;
                 }

                 

                show_loading1();           
                reqAsyncJSON('POST', serverHost + api_prefix + "api/register_member", signupObj, 
                 "signUpResponse","Account Created!");
     }       
 
 
     window.validate_signup = function (signupObj){
       /**/
         if(signupObj.signup_first_name.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your First name is Reqired!");
             return false;
         }

                           if(signupObj.signup_last_name.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Last name is Reqired!");
             return false;
         }

                                             if(signupObj.signup_phone.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Contact number is Reqired!");
             return false;
         }

                                                               if(signupObj.signup_email.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Email is Reqired!");
             return false;
         }


         if(signupObj.signup_educational_status.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Educational Status is Reqired!");
             return false;
         }
         
         if(signupObj.signup_gender.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Gender is Reqired!");
             return false;
         }
         
         if(signupObj.signup_dob_day.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Day of birth is Reqired!");
             return false;
         }
         
         if(signupObj.signup_dob_month.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Month of birth is Reqired!");
             return false;
         }
         
         if(signupObj.signup_dob_year.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Year of Birth is Reqired!");
             return false;
         }

                                                               if(signupObj.signup_country.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Counrty is Reqired!");
             return false;
         }
                                                               if(signupObj.signup_province_state.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your State is Reqired!");
             return false;
         }                  

                                                             if(signupObj.signup_city.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your City is Reqired!");
             return false;
         }     
       
                                                               if(signupObj.signup_house_street.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Street is Reqired!");
             return false;
         }
if(signupObj.signup_employment_status.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Work status is Reqired!");
             return false;
         }                    
if(signupObj.signup_employment_status.trim() == "Employed"){

          if(signupObj.signup_employer_name.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Employer name is Reqired!");
             return false;
         }  
                                                               if(signupObj.signup_employer_address.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Employer Address is Reqired!");
             return false;
         }                     
       
                                                                               
                                                                                 if(signupObj.signup_employment_salaray.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your employment salary is Reqired!");
             return false;
         }                     
            


}    
       
      
       if(signupObj.signup_state_of_origin.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your State of Origin is Reqired!");
             return false;
         }  
                                                               if(signupObj.signup_lga_of_origin.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your LGA of Origin is Reqired!");
             return false;
         }                     
                                                                if(signupObj.signup_marital_status.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("Your Marital is Reqired!");
             return false;
         }                     
                        
                                                               if(signupObj.signup_guarantor_name1.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("1st Gauarator name is Reqired!");
             return false;
         }                     
                                                                                 if(signupObj.signup_guarantor_phone1.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("1st Gauarator Phone Number is Reqired!");
             return false;
         }                     

                                                                                 if(signupObj.signup_guarantor_name2.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("2nd Gauarator name is Reqired!");
             return false;
         }                     
                                                                                 if(signupObj.signup_guarantor_phone2.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("2nd Gauarator phone is Reqired!");
             return false;
         }                     
                                                                                 if(signupObj.signup_guarantor_relationship2.trim() == ""){
             document.getElementsByClassName("show-signup")[0].click();
             swal("2nd Gauarator relationship is Reqired!");
             return false;
         }                     
/**/
       
   if(signupObj.agreeterms == true){
    
  }else{
             document.getElementsByClassName("show-signup")[0].click();               
    swal("Accept Terms and Privacy to continue");
    return false;
  }     
       
       
   if(signupObj.signup_password.length < 6){
             document.getElementsByClassName("show-signup2")[0].click();
             swal("Password must be  6 characters or more!");
             return false;
         }     

                         
   if(signupObj.signup_password != signupObj.signup_password2){
             document.getElementsByClassName("show-signup2")[0].click();
             swal("Passwords do not match!");
             return false;
         }     
       
       
    if(signupObj.signup_transaction_pin.length != 4){
             document.getElementsByClassName("show-signup2")[0].click();
             swal("Enter your 4 Digit verification!");
             return false;
         }                    
       
    if(signupObj.signup_bvn.length != 11){
             document.getElementsByClassName("show-signup2")[0].click();
             swal("BVN must be 11 digits!");
             return false;
         }                     
       
       
       
     return true; 
       
       
     }
 
 
     window.signUpResponse = function (cookie){
         console.log(cookie);
         if(JSON.parse(cookie[0]).success != true){
             hide_loading1();
             smallBottomFade(JSON.parse(cookie[0]).message,"white","red");
             return false;
         }
         prep_cookie ={"cookie": "fluttercookie" + "-" + JSON.parse(cookie[0]).message, "" : "Succesful Registration!"};
         getUserInfo([JSON.stringify(prep_cookie), cookie[1]]);
         hide_loading1();
         smallBottomFade("Registration succesful!","white","green");
     }
 
 
 window.getUserInfo = function (cookie){
     var cookoie_value = JSON.parse(cookie[0]).cookie;
     if(cookoie_value.search("fluttercookie") != -1){
         reqAsyncJSON("GET", serverHost + api_prefix + "api/get_currentuserinfo/" + cookoie_value, {},
                 "render_user",cookie[1]); 
         hide_loading1();
         localStorage.setItem("cookie", cookie[0]);
         /*localStorage.setItem("password", $(".login-form-item  #password").val()); */
         
     }else{
         smallBottomFade("invalid login details!", "white", "red");
         hide_loading1();
     }
 }                
 
 
     window.render_user = function (user_data){ 
         console.log(user_data);
                 
             if(JSON.parse(user_data[0]).success == false){
                 smallBottomFade(JSON.parse(user_data[0]).detail,"white","red");
                 document.getElementsByClassName("show-login")[0].click();
                 return false;
             }else{
                 localStorage.setItem("user_data",user_data[0]);
                 user_info = JSON.parse(user_data[0]);
                 /*
                 $('.logged-user-email').html(user_info.email);
                 $('.address-fullName').val(user_info.signup_phone);
                 $('#address-email').val(user_info.signup_country);
                 */
                 var x;
                 var userInfo = JSON.parse(user_data[0]);
                 for(x in userInfo){
                     var className = x.replace("signup_","update_");
                     $('.' + className).val(userInfo[x]);
                     $('#' + className).val(userInfo[x]);
                     if($('#' + className).prop('tagName') != "SELECT" || $('#' + className).prop('tagName')  != "SELECT"){
                         $('.' + className).html(userInfo[x]);
                         $('#' + className).html(userInfo[x]);
                     }
                 }
                 $(".show-home").click();
                 balancePage();
                 getBanks();
                 getTransactions();
             /*    hideSplash(); */
                 setTimeout(function (){$("#screen-1").hide();},2500);
                 setTimeout(function (){$("#swiper_container").hide()},3000);
                 $("#page-login").hide();
                 $("#page-home").show();
             }                       
             /*show_login();*/                      
             if(user_data[1] != "Auto Login"){
                 document.querySelector(".page-home").click();
             }
             
             
     }                
 
 

window.getTransactions = function (){
 w3.getHttpObject(appData.root_url + "api/wallet/all_transaction/" + user_info.member_id, printTransactions);
}


window.printTransactions = function(data){
 if(data.length>0){
     $(".home-transactions-none").hide();
     var trans ={transaction: data.slice(0,3)};
     $(".home-transactions").show();
     w3.displayObject("home-transactions", trans);

     $(".transactions").show();
     $(".transactions-none").hide();
     var trans ={transaction: data};
     w3.displayObject("transactions", trans);
 }
}



 window.addBank = function(){
      show_loading1();
      var bank_name = $("#page-banks  #bank_name").val();
      var account_name = $("#page-banks  #account_name").val();
      var account_number = $("#page-banks #account_number").val();

      reqAsyncJSON("POST", serverHost + api_prefix + "api/add_bank/" + user_info.member_id, 
      {
         bank_name: bank_name, 
         account_name: account_name, 
         account_number: account_number
      }, 
      "addBankResponse","Working!");
  }


  window.addBankResponse = function (res){
     console.log(res);
     if(JSON.parse(res[0]).success != true){
         hide_loading1();
         smallBottomFade(JSON.parse(res[0]).message,"white","red");
         return false;
     }
     hide_loading1();
     smallBottomFade(JSON.parse(res[0]).message,"white","green");
     getBanks();
  }


 window.getBanks = function (){
     w3.getHttpObject(appData.root_url + "api/get_banks/" + user_info.member_id, printBanks);
 }


 window.printBanks = function(data){
     if(data[0].length>0){
         $(".banks").show();
         $(".banks-none").hide();
         var banks ={bank1: data[0]};
         w3.displayObject("banks1", banks);
         w3.displayObject("loan_account", banks);
     }
 }


 window.deleteBank = function (id){
     w3.getHttpObject(appData.root_url + "api/delete_bank/" + user_info.member_id + "/" + id, delBanks);
 }


 window.delBanks = function(data){
     swal("Record deleted!");
     getBanks();
 }
            


 window.show_loading1 = function (){
     $(document).ready(function(){    
             $("#loading1").css("display", "");
     });
 }
 
            
 window.hide_loading1 = function (){
     $(document).ready(function(){    
             $("#loading1").css("display", "none");
     });
 }



window.defaultFn = function(params){
 alert("I have been called!");
};
/* alert("Welcome to ITOPMONEY");*/
`;