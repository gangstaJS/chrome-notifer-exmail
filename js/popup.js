$(function() {
  'use strict';

  var new_count = 0;

  buildPopList();

  update();

  // setInterval(get_new, 5000);

  function get_new() {
  	var deffered = $.ajax({
        url: 'https://mail.ex.ua/j_inbox?p=0',
        type: 'get',
        dataType: 'json',
        success: function(res) {
        	if(res.new_count) {
            chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
            chrome.browserAction.setBadgeText({text: " "+res.new_count+" "});
          } else {
            chrome.browserAction.setBadgeText({text: ""});
          }
        }
    });
  }

  function update() {
    var deferreds = [], data = {};

    new_count = 0;

    _.each(USERS, function(v,k) {
      var url = 'https://mail.ex.ua/j_box_info?note=' + k;
      console.log(url);
      var promise = $.getJSON(url);
      deferreds.push(promise);
    });

    $.when.apply($, deferreds).done(function() {
      var res = $.makeArray(arguments);
  
      console.log('res', res);

      if(Object.keys(USERS).length == 1) {
        if(res[1] === 'success') {
          new_count += res[0].new_count;
          var val = res[0].new_count ? res[0].new_count : '';
          $('#accaunts_list').find('li[data-login="'+res[0].login+'"] b').text(val);
          $('#accaunts_list').find('li[data-login="'+res[0].login+'"] i').text(' ('+res[0].box_info['1'][1]+') ');
        }
      } else {
        _.each(res, function(el,n) {
          if(el[1] === 'success') {
            new_count += el[0].new_count;
            var val = el[0].new_count ? el[0].new_count : '';
            $('#accaunts_list').find('li[data-login="'+el[0].login+'"] b').text(val);
            $('#accaunts_list').find('li[data-login="'+el[0].login+'"] i').text(' ('+el[0].box_info['1'][1]+') ');
          }
        });
      }

      if(new_count) {
        chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
        chrome.browserAction.setBadgeText({text: " "+new_count+" "});
      } else {
        chrome.browserAction.setBadgeText({text: ""});
      }

      setTimeout(update, 3000);
  
    });
  }



  $('#settings').on('click', function() {
    showIndex();
  });

  function showIndex() {
       var index_url = "/background.html";
       chrome.tabs.create({
       url: index_url
    });
 }

});


function buildPopList() {
  var list = $('#accaunts_list');
  list.empty();

  _.each(USERS, function(v,k) {
    list.append('<li data-login="'+k+'">'+k+'@ex.ua <i></i> <b></b></li>')
  });
}

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {

    detail = "requestHeaders";
    headers = details[detail];

    var cur_token = '';

    // console.log(loc.hash);

    if(/\?note=(.+)/i.test(details.url)) {
      cur_token = USERS[details.url.split('=')[1]] || '';
    }

    for (header in headers) {

        if (headers[header].name == "Cookie") {

          var value = _.compact(headers[header].value.split(' ')),
              cookies = {};

          _.each(value, function(el,n) {
            var res = el.split('=');
            cookies[res[0].trim()] = res[1].trim();
          });

          if(cur_token) {
            cookies.token = cur_token+';';
          }

          value = '';

          _.each(cookies, function(v,k) {
            value += k+'='+v+' ';
          });

          details[detail][header].value = value.trim();


        }        
    }

    return {requestHeaders: details.requestHeaders};

},
{
    urls: ["https://mail.ex.ua/*"]
},

['blocking', "requestHeaders"]);

