// Init App
var myApp = new Framework7({
    modalTitle: 'Escape Network Mobile',
    // Enable Material theme
    material: true,
    cache: false,
    tapHold: true , //enable tap hold events
    
});

// Expose Internal DOM library
var $$ = Dom7;
var endpoint = 'http://condivision.escapenetwork.com/fl_api/';
var parent_id = 0;
var recordId = 1;
var usr_id = localStorage.getItem("usr_id");
var usr_name = localStorage.getItem("usr_name");
var usr_uid = localStorage.getItem("usr_uid");
var usr_fbname = localStorage.getItem("usr_fbname");

if(usr_name) $$('#welkome').html("Welcome "+usr_name);
if(usr_name) $$('#welkome').html("Welcome "+usr_fbname);
if(usr_name) $$('#welcome').html(""+usr_name);
if(usr_name) $$('#profilename').html("@"+usr_name);
if(!usr_name) $$('#main-menu').hide();
if(!usr_name)  myApp.openModal('.login-screen');

var $_GET = {};
document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
 }
 $_GET[decode(arguments[1])] = decode(arguments[2]);
 });

if($_GET['id']) recordId = $_GET['id'];
if($_GET['parent_id']) parent_id = $_GET['parent_id'];

// Add main view
var mainView = myApp.addView('.view-main', {
});
// Add another view, which is in right panel
var rightView = myApp.addView('.view-right', {
});

$$('#open-logout').on('click', function () {
var fcmToken =  localStorage.getItem("fcmToken");

  $$.getJSON(endpoint, {usrLogout:'1', userId: usr_id,token:'api',fcmToken:fcmToken}, function (data) { 
    usr_id = 0;
    usr_name = 0;
    localStorage.clear();
    localStorage.setItem('fcmToken',fcmToken);
    location.reload(true);
    $$('#welkome').html("Logged out");
    $$('#main-menu').hide();
    myApp.openModal('.login-screen');      
  });


});




// Show/hide preloader for remote ajax loaded pages
$$(document).on('ajaxStart', function (e) {
	
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests		
        return;
    }
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.hideIndicator();
});



/* ===== Swipe to delete events callback demo ===== */
myApp.onPageInit('swipe-delete', function (page) {
    $$('.demo-remove-callback').on('deleted', function () {
        myApp.alert('Thanks, item removed!');
    });
});
myApp.onPageInit('swipe-delete media-lists', function (page) {
    $$('.demo-reply').on('click', function () {
        myApp.alert('Reply');
    });
    $$('.demo-mark').on('click', function () {
        myApp.alert('Mark');
    });
    $$('.demo-forward').on('click', function () {
        myApp.alert('Forward');
    });
});

/* ===== Infinite Scroll Page ===== */
myApp.onPageInit('infinite-scroll', function (page) {
    // Loading trigger
    var loading = false;
    // Last loaded index, we need to pass it to script
    var lastLoadedIndex = $$('.infinite-scroll .list-block li').length;
    // Attach 'infinite' event handler
    $$('.infinite-scroll').on('infinite', function () {
        // Exit, if loading in progress
        if (loading) return;
        // Set loading trigger
        loading = true;
        // Request some file with data
        $$.get('infinite-scroll-load.php', {leftIndex: lastLoadedIndex + 1}, function (data) {
            loading = false;
            if (data === '') {
                // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
                myApp.detachInfiniteScroll($$('.infinite-scroll'));
            }
            else {
                // Append loaded elements to list block
                $$('.infinite-scroll .list-block ul').append(data);
                // Update last loaded index
                lastLoadedIndex = $$('.infinite-scroll .list-block li').length;
            }
        });
    });
});


/* ===== Login screen page events ===== */
myApp.onPageInit('login-screen-embedded', function (page) {
    $$(page.container).find('.button').on('click', function () {
        var username = $$(page.container).find('input[name="username"]').val();
        var password = $$(page.container).find('input[name="password"]').val();
        myApp.alert('Username: ' + username + ', password: ' + password, function () {
            mainView.router.back();
        });
    });
});


myApp.onPageInit('insertExperience', function (page) {
 
 
  $$.getJSON(endpoint, {get_items:'1', item_rel:5,token:'api'}, function (data) { //Positions       
  $$.each(data.dati, function (i, val) {
          console.log(val);   
          option = '<option value="'+val.label+'">'+val.label+'</option>';
          $$('.impiego').append(option);
          });       
     }); 

  $$(page.container).find('#profile_rel').prop('value',recordId);
  

  $$(page.container).find('.button').on('click', function () {
   
    var forml = $$(page.container).find('#FormInsertExperience');
    var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form


     $$.ajax({
                url: endpoint+'?insertExperience&token=api',
                method: 'POST',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                    mainView.router.loadPage('experienceList.html'); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})

myApp.onPageInit('experienceList', function (page) {
	
    var experience = [];
     
	
    $$.getJSON(endpoint, {getExperiences:'1', userId: recordId, token:'api'}, function (data) {        
     console.log(data);
		  $$.each(data.results, function (i, val) {
		    
			experience.push({
            experienceId: val.id ,
            date_start: val.data_inizio,
            date_end: val.data_termine,
            position: val.impiego,
            company: val.company,
            city: val.citta,
            country: val.paese,
            company_rel: 0
       		 });	

			
		   });  
		
		

    // Create virtual list
    var virtualList = myApp.virtualList($$(page.container).find('#virtual-list'), {
        // Pass array with items
        items: experience,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.indexOf(query) >= 0 || query.trim() === '') found.push(items[i]);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
        template: '<li>' +
                   '<div class="item-content">' +
                   '<div class="item-media"></div>' +
                   '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title">{{position}}</div>' +
                        '<div class="item-after"><i style="font-size: 18px;" class="material-icons">mode_edit</i></div>' +
                      '</div>' +
                        '<div class="item-subtitle">{{date_start}} to {{date_end}}</div>' +           
                      '<div class="item-text">{{company}}</div>' +
                     '</div>' +
                    '</div>'+ 
                    '<div class="sortable-handler"></div>' +
                  '</li>'  ,

                  
        // Item height
        height: 73,
    });
});



});


myApp.onPageInit('educationList', function (page) {
  
    var education = [];
     
  
    $$.getJSON(endpoint, {getEducations:'1', userId: recordId, token:'api'}, function (data) {        
     console.log(data);
      $$.each(data.results, function (i, val) {
        
      education.push({
            educationId: val.id ,
            date_start: val.data_avvio,
            date_end: val.data_termine,
            title: val.titolo_di_studio,
            university: val.school,
            date: val.conseguimento,
            description: val.descrizione,
            mark: val.vote,
            company_rel: 0
           });  

      
       });  
    
    

    // Create virtual list
    var virtualList = myApp.virtualList($$(page.container).find('#virtual-list'), {
        // Pass array with items
        items: education,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.indexOf(query) >= 0 || query.trim() === '') found.push(items[i]);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
        template: '<li>' +
                   '<div class="item-content">' +
                   '<div class="item-media"></div>' +
                   '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title">{{title}}</div>' +
                        '<div class="item-after"><i style="font-size: 18px;" class="material-icons">mode_edit</i></div>' +
                      '</div>' +
                        '<div class="item-subtitle">{{date_start}} to {{date_end}}</div>' +           
                      '<div class="item-text">{{school}}</div>' +
                           '<div class="item-text">{{description}}</div>' +
                           '<div class="item-text">{{vote}}</div>' +
                     '</div>' +
                    '</div>'+ 
                    '<div class="sortable-handler"></div>' +
                  '</li>'  ,

                  
        // Item height
        height: 73,
    });
});



});



myApp.onPageInit('paymentRegister', function (page) {


      

  
    var payments = [];
    var rowsCount = 0;
    var total = 0;

    $$.getJSON(endpoint, {getPayments:'1', userId: recordId, token:'api'}, function (data) {        
     console.log(data);
      $$.each(data.results, function (i, val) {
      rowsCount++;  
      total += parseFloat(val.importo);

      payments.push({
            paymentId: val.id ,
            customerName: val.customer_rel,
            rifordine: val.rif_ordine,
            quantity: val.importo,
            currency: val.valuta,
            datePayment: val.data_operazione,
            lastDate: val.scadenza_pagamento,
            paymentMethod: val.metodo_di_pagamento,
            commission: val.commissione,
            promoter: val.proprietario,
            company_rel: 0
           });  

      
       });  
    
   
        $$('#countRows').html(total+' £ '+' - '+rowsCount +' results' );
   
    // Create virtual list
    var virtualList = myApp.virtualList($$(page.container).find('#payments-list'), {
        // Pass array with items
        items: payments,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.indexOf(query) >= 0 || query.trim() === '') found.push(items[i]);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
     
        template: '<li class="swipeout" value="{{paymentId}}">' +
                  '<div class="swipeout-content">' + 
                  
                  '<label class="label-checkbox item-content">' +
            ' <input type="checkbox"  name="payments" value="{{paymentId}}""> ' + 
               '<div class="item-media"><i class="icon icon-form-checkbox"></i></div>' +
                '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title"><strong>{{customerName}}</strong> to {{promoter}}</div>' +
                        '<div class="item-after" style="font-size: smaller;">{{datePayment}}</div>' +
                      '</div>' +
                        '<div class="item-subtitle">{{quantity}} - {{currency}} paid by {{paymentMethod}}</div>' +           
                      '<div class="item-text"></div>' +
                  '</div>' +
                  
                '</div>'+ 
                 '</div>'+
                    '<div class="swipeout-actions-right"><a href="editPayment.html" onclick="recordId={{paymentId}}"   class="bg-blue edit" >Edit</a></div>' +
                    '<div class="sortable-handler"></div>' +
                    '</li>',

                  
        // Item height
        height: 73,
    });
});





  $$(page.container).find('.button').on('click', function () {
   
    var forml = $$(page.container).find('#paymentRegister2');
    var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form
    //console.log(forml+' '+storedData); // IS NOT READING 1 input data DATA FROM THE FORM

    // THE AJAX SENDING AND THE SERVICE IS OK

    $$.ajax({
                url: endpoint+'?registerPayments&token=api&operatore='+usr_id,
                method: 'GET',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    if(data.esito > 0) {
                     console.log(data);
                     myApp.addNotification({
                     message: 'Payments Registered!',
                     button: {
                            text: 'Ok',
                            color: 'lightgreen'
                     },
                     onClose: function () {     
                        mainView.router.back();        
                        }
                    });

                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito + ' User: ' + usr_id); 
                    }
                }
            });

 });

recordId  =  1;


});


myApp.onPageInit('editPayment', function (page) {


var payment = [];
var pid=recordId.toString();

  $$.getJSON(endpoint, {getRecordData:'1', token:'api', gtx:'43', id: pid}, function (data) {   


  // Pass array with items
                 
 var val = data.recordData;
 console.log(val);


                  payment.push({
            paymentId: val.id ,
            quantity: val.importo,
            currency: val.valuta,
            datePayment: val.data_operazione,
            paymentMethod: val.metodo_di_pagamento,
            commission: val.commissione,
            promoter: val.proprietario,
            company_rel: 0
           });  

     $$("#propietario").html(data.propietario);

$$('.propietario').val(val.proprietario);
          option2 = '<option value="'+val.metodo_di_pagamento+'">'+val.label+'</option>';
          $$('.metodo_di_pagamento').append(option2);
          $$('.importo').val(val.importo);
          $$('.data_operazione').val(val.data_operazione);
            $$('.commissione').val(val.commissione);
            console.log(val.commissione);
           
     

            
          
          
        

         




       

  
     }); 

   

   $$(page.container).find('.button').on('click', function () {
   
    var formEdit = $$(page.container).find('#editPayment2');
    var storedData = $$.serializeObject(myApp.formToJSON(formEdit)); // Serialize Form
    console.log(formEdit+' '+storedData); 


   $$.ajax({
                url: endpoint+'?savePayment&token=api&id='+recordId,
                method: 'GET',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    if(data.esito > 0) {
                     console.log(data.info_txt);
                     myApp.addNotification({
                     message: 'Your changes have been Saved!',
                     button: {
                            text: 'Ok',
                            color: 'lightgreen'
                     },
                     onClose: function () {     
                        mainView.router.back();        
                        }
                    });

                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito + ' User: ' + usr_id); 
                    }
                }
            });

 });


});


myApp.onPageInit('paymentsBook', function (page) {



      
    var payments = [];
    var rowsCount = 0;
    var total = 0;

    $$.getJSON(endpoint, {getPayments:'1', userId: recordId, token:'api', status_pagamento:'4'}, function (data) {        
     console.log(data);
      $$.each(data.results, function (i, val) {
      rowsCount++;
      total += parseFloat(val.importo);

      payments.push({
            paymentId: val.id ,
            customerName: val.customer_rel,
            rifordine: val.rif_ordine,
            quantity: val.importo,
            currency: val.valuta,
            datePayment: val.data_operazione,
            lastDate: val.scadenza_pagamento,
            paymentStatus: val.status_pagamento,
            paymentMethod: val.metodo_di_pagamento,
            commission: val.commissione,
            promoter: val.proprietario,
            company_rel: 0
           });  

      
       });  
    
        $$('#countRows').html(total+' £ '+' - '+rowsCount +' results' );
   
    // Create virtual list
    var virtualList = myApp.virtualList($$(page.container).find('#payments-list'), {
        // Pass array with items
        items: payments,
        // Custom search function for searchbar
        searchAll: function (query, items) {
            var found = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].title.indexOf(query) >= 0 || query.trim() === '') found.push(items[i]);
            }
            return found; //return array with mathced indexes
        },
        // List item Template7 template
        template: '<li class="swipeout">' +
             '<div class="swipeout-content" >' +
                       '<label class="label-checkbox item-content">' +
                '<div class="item-media"><span class="msg green">{{paymentStatus}} </span></div>' +
                '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title"><strong>{{customerName}}</strong> to {{promoter}}</div>' +
                        '<div class="item-after" style="font-size: smaller;">{{datePayment}}</div>' +
                      '</div>' +
                        '<div class="item-subtitle">{{quantity}} - {{currency}} paid by {{paymentMethod}}</div>' +           
                      '<div class="item-text"></div>' +
                  '</div>' +
                '</div>'+ 
        '<div class="swipeout-actions-right"><a href="editPayment.html" onclick="recordId={{paymentId}}" class="bg-blue edit" >Edit</a></div>' +
                    '<div class="sortable-handler"></div>' +
                    '</li>',

                  
                  
        // Item height
        height: 73,
    });
});



});


myApp.onPageInit('educationCV', function (page) {
 
 
        
     
 
         document.getElementById('truco').onclick = duplicate;


          var i = 0;

          function duplicate() {
              var original = document.getElementById('duplicater' + i);
              var clone = original.cloneNode(true); // "deep" clone
              clone.id = "duplicetor" + ++i; // there can only be one element with an ID
              clone.onclick = duplicate; // event handlers are not cloned
              original.parentNode.appendChild(clone);
          }
        
        $$.getJSON(endpoint, {get_items:'1', item_rel:527,token:'api'}, function (data) {        //LOAD SKILLS (6)
           
          $$.each(data.dati, function (i, val) {
          //console.log(val);   
          option = '<option value="'+val.label+'">'+val.label+'</option>';
          $$('.skills').append(option);
          });       
        });



 

     $$(page.container).find('#id').prop('value',recordId);


  $$(page.container).find('.button').on('click', function () {
   
    var forml = $$(page.container).find('#formEducationCV');
    var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form


     $$.ajax({
                url: endpoint+'?updateEducationCV&token=api',
                method: 'POST',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                     
                     myApp.addNotification({
                     message: 'Now you can insert some education',
                     button: {
                            text: 'Yes,please! (It\'s free)',
                            color: 'lightgreen'
                     },
                     onClose: function () {     
                        recordId = data.esito;             
                        mainView.router.loadPage('educationCV.php')
                        }
                    });
                    //window.location.assign('popover.html');
                    //mainView.router.back(); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})

myApp.onPageInit('bookMeeting', function (page) {


  $$.getJSON(endpoint, {get_items:'1', item_rel:12,token:'api'}, function (data) {//LOAD jobs (12)
    $$.each(data.dati, function (i, val) {
    option = '<option value="'+val.label+'">'+val.label+'</option>';
    $$('.job_sector').append(option);
    });
  });

  $$(page.container).find('#id').prop('value',recordId);

  $$(page.container).find('.button').on('click', function () {
   
    var forml = $$(page.container).find('#formBookMeeting');
    var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form

    if(usr_id == 0){
              
             myApp.addNotification({
              message: "You Are not logged",
              button: {
                 text: 'Close',
                 color: 'lightgreen'
              },
              onClose: function () {                    
              }
              });
    
   } else {

          $$.ajax({
                url: endpoint+'?insertBookMeeting&token=api&marchio=1&operatore='+usr_id+'&proprietario='+usr_id+'&callcenter='+usr_id,
                method: 'POST',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                     
                     myApp.addNotification({
                     message: 'Meeting Booked',
                     button: {
                            text: 'Ok',
                            color: 'lightgreen'
                     },
                     onClose: function () {     
                        recordId = 1; 
                        mainView.router.back();             
                       // mainView.router.loadPage('educationCV.php')
                        }
                    });
                    //window.location.assign('popover.html');
                    //mainView.router.back(); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
          });
       } //Login Check
 });


});


myApp.onPageInit('customerCV', function (page) {
 
 
       
        
        $$.getJSON(endpoint, {get_items:'1', item_rel:6,token:'api'}, function (data) {        //LOAD HOBBIES (6)
           
          $$.each(data.dati, function (i, val) {
          //console.log(val);   
          option = '<option value="'+val.id+'">'+val.label+'</option>';
          $$('.hobbies').append(option);
          });       
        });

    
 
        
        $$.getJSON(endpoint, {get_items:'1', item_rel:527,token:'api'}, function (data) {        //LOAD SKILLS (6)
           
          $$.each(data.dati, function (i, val) {
          //console.log(val);   
          option = '<option value="'+val.label+'">'+val.label+'</option>';
          $$('.skills').append(option);
          });       
        });



      

     $$(page.container).find('#id').prop('value',recordId);


  $$(page.container).find('.button').on('click', function () {
   
    var forml = $$(page.container).find('#formCustomerCV');
    var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form


     $$.ajax({
                url: endpoint+'?updateCustomerCV&token=api',
                method: 'POST',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                     
                     myApp.addNotification({
                     message: 'Now you can insert some education',
                     button: {
                            text: 'Yes,please! (It\'s free)',
                            color: 'lightgreen'
                     },
                     onClose: function () {     
                        recordId = data.esito;             
                        mainView.router.loadPage('educationCV.php')
                        }
                    });
                    //window.location.assign('popover.html');
                    //mainView.router.back(); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})




myApp.onPageInit('customerForm', function (page) {
	

  
	





    $$(page.container).find('#id').prop('value',recordId);
    $$(page.container).find('#account_rel').prop('value',parent_id);

 		

        
    



    $$(page.container).find('.button').on('click', function () {
   
    var name = $$(page.container).find('input[name="name"]').val();
    var email = $$(page.container).find('input[name="email"]').val();
	var forml = $$(page.container).find('#formCustomerForm');
   // form1.append('<input type="hidden" name="id" value="'+$_GET['id']+'" />');

	var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form
  
	console.log(storedData);


    if(name != '' && email != ''){
	
    $$.ajax({
                url: endpoint+'?insertCustomerData&token=api',
                method: 'POST',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
					//for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
				},
				
                error: function (e) {
					          console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

				},

               success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                    mainView.router.loadPage('selectAvailability.html'); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }


            });

	} else { 
	    myApp.alert('Insert at least name and email please');
	}


    });
})


myApp.onPageInit('selectAvailability', function (page) {
 
 


  $$(page.container).find('#id').prop('value',recordId);


  $$(page.container).find('.button').on('click', function (e) {
  var disponibilita_impiego = $$(this).prop('id');


     $$.ajax({
                url: endpoint+'?updateCustomerCV&token=api&id='+recordId+'&disponibilita_impiego='+disponibilita_impiego,
                method: 'GET',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: '',
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                    mainView.router.loadPage('selectPositions.html'); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})



myApp.onPageInit('selectPositions', function (page) {
 
 
  $$.getJSON(endpoint, {get_items:'1', item_rel:5,token:'api'}, function (data) {        
  $$.each(data.dati, function (i, val) {
          console.log(val);   
          option = '<option value="'+val.id+'">'+val.label+'</option>';
          $$('.mansione').append(option);
          });       
     }); 

  $$(page.container).find('#id').prop('value',recordId);


  $$(page.container).find('.button').on('click', function () {
   
    var forml = $$(page.container).find('#selectPositions');
    var storedData = $$.serializeObject(myApp.formToJSON(forml)); // Serialize Form


     $$.ajax({
                url: endpoint+'?updateCustomerCV&token=api',
                method: 'POST',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: storedData,
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                    mainView.router.loadPage('selectExperienceLevel.html'); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})


myApp.onPageInit('selectExperienceLevel', function (page) {
 
 


  $$(page.container).find('.button').on('click', function (e) {
  
  var experience = $$(this).prop('id');


     $$.ajax({
                url: endpoint+'?updateCustomerCV&token=api&id='+recordId+'&experience='+experience,
                method: 'GET',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: '',
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                    mainView.router.loadPage('selectEnglishLevel.html'); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})


myApp.onPageInit('selectEnglishLevel', function (page) {
 
 

  $$(page.container).find('.button').on('click', function (e) {
  var english_level = $$(this).prop('id');


     $$.ajax({
                url: endpoint+'?updateCustomerCV&token=api&id='+recordId+'&english_level='+english_level,
                method: 'GET',
                dataType: 'json',
                //send "query" to server. Useful in case you generate response dynamically
                data: '',
              
                complete: function (e) {
                    //for (var key in e) {  console.log('COMPLETE: '+key+' '+e[key]); }
                },
                
                error: function (e) {
                    console.log(e); 
                    myApp.addNotification({
                     message: "Errors while doing a request. Please check you internet connection.",
                     button: {
                            text: 'Close',
                            color: 'lightgreen'
                     },
                     onClose: function () {                    
                        
                        }
                    });

                },

                success: function (data) {
                    console.log(data); 
                    if(data.esito > 0) {
                     mainView.router.loadPage('index.html'); 
                    } else { 
                    myApp.alert('Issue: Problems while doing the request ' + data.esito); 
                    }
                }
            });

 });

})




$$('.login-screen').find('.signin').on('click', function () {
  var username = $$('.login-screen').find('input[name="username"]').val();
  var password = $$('.login-screen').find('input[name="password"]').val();
	
  if(username != '' && password != ''){
	       
         userLogin(endpoint,username,password,0);


	} else { 
	       myApp.alert('Insert correct user/email or password');
	}
	
});

/* ===== Demo Popover ===== */
$$('.popover a').on('click', function () {
    myApp.closeModal('.popover');
});



/* ===== Change statusbar bg when panel opened/closed ===== */
$$('.panel-left').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-left');
});
$$('.panel-right').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-right');
});
$$('.panel-left, .panel-right').on('close', function () {
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});




/*Login Functions */

/*User Login*/
function userLogin(endpoint,username,password,uid) {
          
console.log(uid);

          $$.ajax({
          url: endpoint,
          method: 'GET',
          dataType: 'json',
          data: {
          usr_login: 2,
          user: username,
          password: password,
          uid: uid,
          token: 'app'
          },
          success: function (data) {
          console.log(data); 
             if(data.esito == 1) {
             
             usr_id = data.usr_id;
             usr_name = data.nome;
             
             localStorage.setItem("usr_id", usr_id);
             localStorage.setItem("usr_name", usr_name);
             
             $$('#welkome').html("Welcome "+ usr_name);
             $$('#main-menu').show();
             myApp.closeModal('.login-screen');  
             } else { 
             myApp.alert('Issue: ' + data.info_txt); 
             }  
          }
  });
}




