// visiting/list.js
'use strict';

(function() {
  //
  $('#search').on('click', ()=>{
    //
    var date = $('#date').val();
    var type = $('#type').val();
    var keyword = $('#keyword').val();
    var query = [];
    var url = '/visiting/list';
    if (date) query.push(`date=${date}`);
    if (type) query.push(`type=${type}`);
    if (keyword) query.push(`keyword=${keyword}`);
    if (query.length > 0) {
      url += '?'+query.join('&');
    }

    window.location.href = url;
    return false;
  });

  $('table tr.visiting').on('click', (evt)=>{
    var $visiting = $(evt.currentTarget);
    //var $target = $(evt.target);

    //alert('click! '+$visiting.attr('data-id'));
    window.location.href = '/visiting/detail/'+$visiting.attr('data-id');

    return false;
  });

})();