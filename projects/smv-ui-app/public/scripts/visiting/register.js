// visiting/register.js
'use strict';

(function() {
  // 
  $('#register').on('click', ()=>{
    // check fields
    var checked = Array.prototype.some.call($('input'), function(field){
      return !$(field).val();
    });
    if (checked) {
      alert('입력되지 않은 정보가 있습니다.');
      return false;
    }

    // visitor info
    var datetime = $('#datetime').val();
    var name = $('#name').val();
    var title = $('#title').val();
    var contact = $('#contact').val();
    var email = $('#email').val();
    var company = $('#company').val();

    // employee info
    var euserid = $('#euserid').val();
    var ename = $('#ename').val();
    var eemail = $('#eemail').val();
    var emobile = $('#emobile').val();
    var edept = $('#edept').val();

    console.log(`${datetime}, ${name}, ${title}, ${contact}, ${company}`);
    console.log(`${euserid}, ${ename}, ${eemail}, ${emobile}, ${edept}`);
    
    var visitObject = {
      'date': new Date(datetime).toString(),
      'visitor': {
        'name': name,
        'title': title,
        'contact': contact,
        'email': email,
        'company': company
      },
      'escort': {
        'id': euserid,
        'name': ename,
        'email': eemail,
        'dept': edept,
        'mobile': emobile
      },
      'agreement': undefined,
      'badge': undefined
    };

    var headersObject = getAuthTokenHeader();

    $.ajax({
      type: 'POST',
      url: getSmvVisitBase('/api/smv/v1/visit'),
      xhrFields: {
        withCredentials: true
      },
      headers: headersObject,
      data: visitObject,
      success: function (data) {
        console.log(data);
        alert('등록 성공');
        window.location.href = '/visiting/list';
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