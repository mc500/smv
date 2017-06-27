// visiting/detail.js
'use strict';

(function() {
  //
  $('#update').on('click', ()=>{
    // check fields
    var checked = Array.prototype.some.call($('input.visitor'), function(field){
      return !$(field).val();
    });
    if (checked) {
      alert('입력되지 않은 정보가 있습니다.');
      return false;
    }

    // 
    var visitingid = $('#visitingid').val();
    var datetime = $('#datetime').val();

    // visitor info
    var name = $('#name').val();
    var title = $('#title').val();
    var contact = $('#contact').val();
    var email = $('#email').val();
    var company = $('#company').val();

    console.log(`${datetime}, ${name}, ${title}, ${contact}, ${company}`);

    var visitObject = {
      'date': new Date(datetime).toString(),
      'visitor': {
        'name': name,
        'title': title,
        'contact': contact,
        'email': email,
        'company': company
      },
      //'agreement': undefined,
      //'badge': undefined
    };

    $.ajax({
      type: 'PUT',
      url: getSmvVisitBase(`/api/smv/v1/visit/${visitingid}`),
      xhrFields: {
        withCredentials: true
      },
      data: visitObject,
      success: function (data) {
        console.log(data);
        alert('변경 성공');
        //window.location.href = '/visiting/list';
      },
      error: function (err) {
        console.log(err);
        if (err.status == 401) {
          // redirect to login
          window.location.href = '/login?error='+err.responseText;
        } else {
          alert('error:'+err.responseText);
        }
      }
    });

    return false;
  });

  $('#delete').on('click', ()=>{

    var visitingid = $('#visitingid').val();
    
    $.ajax({
      type: 'DELETE',
      url: getSmvVisitBase(`/api/smv/v1/visit/${visitingid}`),
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        console.log(data);
        alert('삭제 성공');
        //window.location.href = '/visiting/list';
        history.back(1);
      },
      error: function (err) {
        console.log(err);
        if (err.status == 401) {
          // redirect to login
          window.location.href = '/login?error='+err.responseText;
        } else {
          alert('error:'+err.responseText);
        }
      }
    });

    return false;
  });

})();