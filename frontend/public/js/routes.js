     //PAGE ROUTES   
    ///EVENT CLICK LISTNERS
function initRoutes(){
    
    $('.page-back').click(function (){
        $(this).parent().fadeToggle();
    });
    
    $('.page-back2').click(function (){
        //$(this).parent().fadeToggle();
    });

    $('.show-home').click(function (){
        $('.app-page').hide();
        if(typeof user_info  != "undefined"){
            $('#page-home').show();
        }else{
            $('#page-signup').show();
        }
    });

    $('.show-login').click(function (){
        $('.app-page').hide();
        $('#page-home').hide();
        $('#page-login').show();
        resetScroll();
    });  

    
    $('.show-exam').click(function (){ //FIX
        $('.app-page').hide();
        $('#page-home').hide();
        $('#page-exam').show();
        resetScroll();
    });  


    $('.show-forgot-password').click(function (){
        $('.app-page').hide();
        $('#page-home').hide();
        $('#page-forgot-password').toggle();
        resetScroll();
    });  

    $('.show-signup').click(function (){
        $('.app-page').fadeOut();
        $('#page-home').hide();
        $('#page-signup').fadeToggle();
        resetScroll();
    });  

    $('.show-signup2').click(function (){
        if(validate_signup_1()==false){
            return false;
        }
        $('.app-page').fadeOut();
        $('#page-signup2').fadeToggle();
        resetScroll();
    });  

    $('.show-fund-wallet').click(function (){
        $('.app-page').fadeOut();
        $('#page-fund-wallet').fadeToggle();
        resetScroll();
    });  

    $('.show-fund-wallet-deposit').click(function (){
        $('.app-page').fadeOut();
        $('#page-fund-wallet-deposit').fadeToggle();
        resetScroll();
    });  

    $('.show-withdraw').click(function (){
        $('.app-page').fadeOut();
        $('#page-withdraw').fadeToggle();
        resetScroll();
    });  

    $('.show-withdraw-submit').click(function (){
        var check_val = withdraw_validate1();
        if(check_val== false){
            return false;
        }
        $('.app-page').fadeOut();
        $('#page-withdraw-submit').fadeToggle();
        resetScroll();
    });  

    $('.show-widthdrawal-response').click(function (){
        $('.app-page').fadeOut();
        $('#page-widthdrawal-response').fadeToggle();
        resetScroll();
    });  

    $('.show-enaira').click(function (){
        $('.app-page').fadeOut();
        $('#page-enaira').fadeToggle();
        resetScroll();
    });  

    $('.show-enaira-login').click(function (){
        $('.app-page').fadeOut();
        $('#page-enaira-login').fadeToggle();
        resetScroll();
    });  

    $('.show-lite-loan').click(function (){
        $('.app-page').fadeOut();
        $('#page-lite-loan').fadeToggle();
        resetScroll();
    });  

    $('.show-lite-loan-submitted').click(function (){
        $('.app-page').fadeOut();
        $('#page-lite-loan-submitted').fadeToggle();
        resetScroll();
    });  

    $('.show-lite-loan-failed').click(function (){
        $('.app-page').fadeOut();
        $('#page-lite-loan-failed').fadeToggle();
        resetScroll();
    });  

    $('.show-mortgage-loan').click(function (){
        $('.app-page').fadeOut();
        $('#page-mortgage-loan').fadeToggle();
        resetScroll();
    });  

    $('.show-mortgage-loan-submit').click(function (){
        $('.app-page').fadeOut();
        $('#page-mortgage-loan-submit').fadeToggle();
        resetScroll();
    });  

    $('.show-pay-bills').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills').fadeToggle();
        resetScroll();
    });  

    $('.show-pay-bills-data-net').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills-data-net').fadeToggle();
        resetScroll();
    });  

    $('.show-pay-bills-tv-net').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills-tv-net').fadeToggle();
        resetScroll();
    });  


    $('.show-pay-bills-airtime-net').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills-airtime-net').fadeToggle();
        resetScroll();
    });  

    $('.show-pay-bills-airtime').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills-airtime').fadeToggle();
        initArtime($(this).attr("datan"));
        resetScroll();
    });  

    $('.show-pay-bills-data').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills-data').fadeToggle();
        initData($(this).attr("datan"));
        resetScroll();
    });  

    $('.show-pay-bills-tv').click(function (){
        $('.app-page').fadeOut();
        $('#page-pay-bills-tv').fadeToggle();
        initTV($(this).attr("datan"));
        resetScroll();
    });  

    $('.show-invest').click(function (){
        if(user_info.has_usd_card == false){
            $('.app-page').fadeOut();
            $('#page-invest').fadeToggle();
        }else{
            $('.app-page').fadeOut();
            $('#page-invest-begin').fadeToggle();
        }
        resetScroll();
    });  

    $('.show-invest-begin').click(function (){
        show_loading1();
        setTimeout(function(){
            $('.app-page').fadeOut();
            $('#page-invest-begin').fadeToggle();
            resetScroll();
            hide_loading1();
        }, 9000);
    });  


    $('.show-withdraw-usd').click(function (){
        if(window.usd_balance < 0.01){
            return false;
        }
        $('.app-page').fadeOut();
        $('#page-withdraw-usd').fadeToggle();
        resetScroll();
    }); 

    $('.show-invest-begin3').click(function (){
        show_loading1();
        setTimeout(function(){
            $('.app-page').fadeOut();
            $('#page-invest-begin3').fadeToggle();
            resetScroll();
            hide_loading1();
        }, 400);
    });  

    $('.show-invest-begin-doc').click(function (){
        $('.app-page').fadeOut();
        $('#page-invest-begin-doc').fadeToggle();
        resetScroll();
    });  

    $('.show-invest-begin-doc2').click(function (){
        $('.app-page').fadeOut();
        $('#page-invest-begin-doc2').fadeToggle();     
        resetScroll();
    });  

    $('.show-save-money').click(function (){
        $('.app-page').fadeOut();
        $('#page-save-money').fadeToggle();
        resetScroll();
    });  

    $('.show-save-money-option').click(function (){
        $('.app-page').fadeOut();
        $('#page-save-money-option').fadeToggle();
        resetScroll();
    });  

    $('.show-save-money-fixed').click(function (){
        $('.app-page').fadeOut();
        $('#page-save-money-fixed').fadeToggle();
        resetScroll();
    });  

    $('.show-setting').click(function (){
        $('.app-page').fadeOut();
        $('#page-setting').fadeToggle();
        resetScroll();
    });  

    $('.show-profile').click(function (){
        $('.app-page').fadeOut();
        $('#page-profile').fadeToggle();
        resetScroll();
    });  

    $('.show-profile2').click(function (){
        $('.app-page').fadeOut();
        $('#page-profile2').fadeToggle();
        resetScroll();
    });  

    $('.show-transactions').click(function (){
        $('.app-page').fadeOut();
        $('#page-transactions').fadeToggle();
        resetScroll();
    });  

    $('.show-banks').click(function (){
        $('.app-page').fadeOut();
        $('#page-banks').fadeToggle();
        resetScroll();
    });  

    $('.show-terms').click(function (){
        $('.app-page').fadeOut();
        $('#page-terms').fadeToggle();
        resetScroll();
    });  


    $('#menu-back-grey').click(function (){
        $(this).fadeToggle();
        $('#home-slide-menu').slideToggle();
        if(side_category_rendered != true){
           renderCategoryListSide(); 
        }
        resetScroll();
    });

    $('.top-icon-menu img').click(function (event){
        event.stopPropagation();
        $('.app-page').fadeOut(); ///change later
        $('#menu-back-grey').fadeToggle();
        $('#home-slide-menu').slideToggle();
        resetScroll();
    });
       
    
        
} 
