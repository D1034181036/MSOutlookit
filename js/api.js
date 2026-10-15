(function($) {
  var originalGet = $.get;
  var redditUrl = /^https?:\/\/[^\/]*reddit\.com(\/[^?]*)\??(.*)$/;
  var useBackend = true;

  function toApiUrl(match) {
    var path = match[1].replace(/\/{2,}/g, '/');
    var query = match[2].replace(/(^|&)jsonp=[^&]*/, '').replace(/^&/, '');
    return 'api/?path=' + encodeURIComponent(path) + (query ? '&' + query : '');
  }

  function backendMissing(xhr, status) {
    return xhr.status === 404 || xhr.status === 0 || status === 'parsererror';
  }

  $.get = function(url, data, callback, type) {
    var args = arguments;
    if ($.isFunction(data)) {
      type = type || callback;
      callback = data;
    }
    var match = useBackend && type === 'jsonp' && redditUrl.exec(url);
    if (!match) {
      return originalGet.apply(this, args);
    }

    return originalGet.call(this, toApiUrl(match), callback, 'json').fail(function(xhr, status) {
      if (backendMissing(xhr, status)) {
        useBackend = false;
        originalGet.apply($, args);
        return;
      }
      $('img[src="images/loading.gif"]').remove();
      makePopup('Reddit API error: ' + xhr.status);
    });
  };
})(jQuery);
