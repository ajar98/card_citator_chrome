chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.text && (msg.text == "report_back")) {
        sendResponse(computeCitation());
    }
});


function computeCitation() {
    title = document.getElementsByTagName('title')[0].innerHTML;
    var author = null;
    var org = null;
    var date = null;
    metaHTMLCol = document.getElementsByTagName('meta');
    metaArray = Array.prototype.slice.call(metaHTMLCol);
    for (var i=0; i < metaArray.length; i++) {
      meta = metaArray[i];
      if (!author) {
        if (meta.hasAttribute('name')) {
          if (meta.getAttribute('name').toLowerCase().indexOf('author') !== -1) {
            author = meta.getAttribute('content');
          }
        } else if (meta.hasAttribute('property')) {
          if (meta.getAttribute('property').toLowerCase().indexOf('author') !== -1) {
            author = meta.getAttribute('content');
          }
        }
      }
      if (!date) {
        if (meta.hasAttribute('name')) {
          if (meta.getAttribute('name').toLowerCase().indexOf('date') !== -1) {
            date = meta.getAttribute('content');
            console.log(date);
          }
        } else if (meta.hasAttribute('property')) {
          if (meta.getAttribute('property').toLowerCase().indexOf('date') !== -1) {
            date = meta.getAttribute('content');
          }
        } else if (meta.hasAttribute('itemprop')) {
          if (meta.getAttribute('itemprop').toLowerCase().indexOf('date') !== -1) {
            date = meta.getAttribute('content');
          }
        }
        if (!Date.parse(date)) {
          date = null;
        }
      }
      if (!org) {
        if (meta.hasAttribute('property')) {
          if (meta.getAttribute('property') == 'og:site_name') {
            org = meta.getAttribute('content');
          }
        } else if (meta.hasAttribute('name')) {
          if ((meta.getAttribute('name') == 'dc.publisher') || (meta.getAttribute('name') == 'cre')) {
            org = meta.getAttribute('content');
          }
        }
      }
      if (author && date && org) {
        break;
      }
    }
    var selection = '';
    if (window.getSelection) {
      selection = window.getSelection().toString();
      console.log(selection);
    }
    return {
        'author': author,
        'quals': null,
        'title': title,
        'date': date,
        'org': org,
        'selection': selection,
        'link': null
      };
}