    //REQUEST LOADER
    function reqAsyncJSON(request_type, endPoint,req_data,func_name,element) {
                    try {
              var url = endPoint;
              var url = endPoint;
              var response;
              var response_body;             
               // console.log("request starting");			   
                    if((url != "")){
                        var xmlhttp;
                        if (window.XMLHttpRequest)
                          {// code for IE7+, Firefox, Chrome, Opera, Safari
                          xmlhttp=new XMLHttpRequest();
                          }
                        else
                          {// code for IE6, IE5
                          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                          }

                        xmlhttp.onreadystatechange=function()
                          {
                                 if (xmlhttp.readyState==1)
                              {
                                 //document.getElementById(stag).innerHTML="Loading...";
                                 // alert("is loading");
                              }                              
                            //  if (xmlhttp.readyState==4 && xmlhttp.status==200)
                              if (xmlhttp.readyState==4)
                                {
                                    // Function name to invoke
                                    var fnName = func_name;
                                    // Params to pass to the function
                                   var params = [xmlhttp.responseText, element];
                                    // Call function using Window object
								//	console.log(xmlhttp.responseText);
                                    if(fnName.trim() != ""){
                                      window[fnName](params);
                                    }
                                    return  xmlhttp.responseText;
                                }
                          }

                        //change this url to same script
                        xmlhttp.open(request_type,url,true);
                    //    xmlhttp.open("GET",url);
                        xmlhttp.setRequestHeader("Content-type","application/json; charset=utf-8");
                        req_string = {};
                        for(reqx in req_data){
                            req_string[reqx] = req_data[reqx];
                        }
                        req = JSON.stringify(req_string);
                        //alert(req)
                        //xmlhttp.setRequestHeader("Content-length", req.length);
						// xmlhttp.setRequestHeader("Connection", "close");
                        xmlhttp.send(req);
                    }
                 //console.log("End request");
            } catch (e) {
             console.log(e);
            }
    }

$("document").ready(function(){
	//var file_content = $("[file-upload]");
    var file_content = document.querySelectorAll("[file-upload]");
    var f;
    for(f=0; f<file_content.length; f++){
      var file_id = Math.ceil(Math.random() * 1000000) + "fileupload";
      file_content[f].id = file_id;
      $("<br /><input onchange='uploadFile(this)' type='file'" + "for='" + file_id + "'" + " />").insertAfter("#" + file_id);
    }
});	

	async function uploadFile(fileupload) {
	  var file_owner_id = fileupload.getAttribute("for");
	  var file_owener_element = document.getElementById(file_owner_id); 
	  let formData = new FormData(); 
	  formData.append("file_data", fileupload.files[0], fileupload.files[0].name);
	  formData.set("file_name", fileupload.files[0].name);
	  formData.set("file_path", file_owener_element.getAttribute("file-upload"));
	  let get_response = await fetch('/api/services/fileupload', {
		method: "POST", 
		body: formData
	  }); 
	  alert('The file has been uploaded successfully.');
	  //console.log(get_response); 
	  let resDataJson = await get_response.json();
	  //let resDataText = await get_response.text();	 	  
	  console.log(resDataJson);
	  file_owener_element.value = resDataJson.file_path;
	}
  
 