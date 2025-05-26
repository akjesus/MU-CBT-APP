let helpers = {};
resetScroll =   function (){
                            div_scroll_set = document.querySelectorAll(".page-fliud-body");
                            for(v=0; v<div_scroll_set.length; v++){
                            div_scroll_set[v].scrollIntoView()
                            }            
                        }

function smallBottomFade(text,textcolor='black',bgcolor='#cccccc'){
    $(document).ready(function(){
        $("#small-bottom-fade .content-text").html(text);
        $("#small-bottom-fade .content-text").css("background", bgcolor);
        $("#small-bottom-fade .content-text").css("color", textcolor);
        $("#small-bottom-fade").fadeIn(1000).fadeOut(4000);
    });
}
function bigTopSlide(text,textcolor='black',bgcolor='#cccccc'){
    $(document).ready(function(){
        $("#big-top-slide .content-text").html(text);
        $("#big-top-slide .content-text").css("background", bgcolor);
        $("#big-top-slide .content-text").css("color", textcolor);
        $("#big-top-slide").slideDown("fast").fadeOut(2000);
    });
}

function toDP(num){
    if(num.indexOf(".") == -1){
      num = num + ".00"
    }else if(num.indexOf(".") != -1 && num.split(".")[1].length == 1){
      num = num + "0"
    }else if(num.indexOf(".") != -1 && num.split(".")[1].length == 0){
      num = num + "00"
    }else if(num.indexOf(".") != -1 && num.split(".")[1].length > 2){
      //num = num + "00"
      var first_part = num.split(".")[0];
      var second_part = num.split(".")[1];
      var second_part_to_deci = (Number("." + second_part)).toFixed(2)
      num = first_part + "." + second_part_to_deci.toString().split(".")[1];
    }
    return num;
  }