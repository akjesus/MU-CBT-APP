/* sz.JS 1.2 June 2019 by sztdev.com */
"use strict";
let sz = {};
sz.findObj = function(obj, key, index=false, exact=false, single=true){
	var i;
    var matches_keys = [];
    var matches_data = [];
    for(i=0;i<obj.length;i++){
        var objKeys = Object.keys(obj[i]);
        var keyKeys = Object.keys(key);
        var j;
        var matched = 0;
        for(j=0;j<keyKeys.length; j++){
        	if(obj[i][keyKeys[j]]){
            	if(!exact){
                  if(obj[i][keyKeys[j]].indexOf(key[keyKeys[j]]) != -1){
                      matched += 1;
                  }
                }else{
                    if(obj[i][keyKeys[j]] == key[keyKeys[j]]){
                      matched += 1;
                  }              
                }
            }
        }
        if(matched == keyKeys.length){
        	matches_keys.push(i);
            matches_data.push(obj[i]);
        }
    }
    if(!index){
		if(matches_data.length == 1 && single==true){
			matches_data=matches_data[0];
		}
    	return matches_data;
    }
	if(matches_keys.length == 1 && single==true){
		matches_keys=matches_keys[0];
	}
    return matches_keys;
}

sz.formObj = function (container_element){
    let formSelector = "#" + container_element;
    let formDataElement = $(formSelector + ' [name]');
    let i;
    let formData = {};
    for(i=0; i<formDataElement.length; i++){
        formData[formDataElement[i].name] = $(formSelector + " [name=" + $(formSelector + ' [name]')[i].name + "]").val();			
    }    
    return formData;
}