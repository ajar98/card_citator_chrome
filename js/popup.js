blankCitation = {
  'author': null,
  'quals': null,
  'title': null,
  'date': null,
  'org': null,
  'selection': null,
  'link': null
};

myCitation = blankCitation;

defaultFormat = '[a, q, o, "t," d, l]';
defaultDateFormat = 'MM/dd/yy';
defaultCopyToClipboard = true;
defaultDateAccessed = false;
defaultAddInitials = false;
defaultInitials = "";
defaultSaveCitation = true;

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];

    callback(tab);
  });

}

function errorResponse() {
  var table = document.getElementById('citation');
  tr = document.createElement('tr');
  td = document.createElement('td');
  td.setAttribute('class', 'danger');
  tr.appendChild(td);
  i = document.createElement('i');
  i.setAttribute('class', 'fa fa-exclamation-triangle fa-fw');
  td.appendChild(i);
  td.innerHTML += ' Please refresh the page!';
  table.innerHTML = tr.outerHTML;
  var div = document.getElementById('container-2');
  div.innerHTML = table.outerHTML;
}

function formatCitation(resp, url, dateFormat) {
  if (!resp) {
    errorResponse();
  } else {
    var citation = resp;
    citation.link = url;
    if (resp.date) {
      var date = Date.parse(resp.date);
      if (date) {
        citation.date = date.toString(dateFormat);
      } else {
        citation.date = null;
      }
    }
    console.log(citation);
    for (var key in citation) {
      myCitation[key] = citation[key];
      var tr = document.getElementById(key);
      var label = document.createElement('label');
      label.setAttribute('id', 'key');
      label.setAttribute('style', 'width: 100%;');
      var strong = document.createElement('strong');
      strong.innerHTML = formalize(key);
      label.appendChild(strong);
      var tdValue = document.createElement('td');
      tdValue.setAttribute('id', 'value');
      tdValue.appendChild(label);
      var input;
      if ((key == 'quals') || (key == 'selection')) {
        input = document.createElement('textarea');
        input.setAttribute('cols', 4);
      } else {
        input = document.createElement('input');
        input.setAttribute('style', 'background-color: transparent;border: 0px;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;cursor:default;');
      }
      if (!citation[key]) {
        if (key != 'selection') {
          tr.setAttribute('class', 'danger');
        }
        input.setAttribute('style', 'background-color: transparent;border: 0px;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;cursor:default;');
        input.setAttribute('placeholder', formalize(key));
      } else {
        input.setAttribute('style', 'background-color: transparent;border: 0px;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;cursor:default;');
        if ((key == 'quals') || (key == 'selection')) {
          input.innerHTML = citation[key];
        } else {
          input.setAttribute('value', citation[key]);
        }
      }
      input.setAttribute('type', 'text');
      input.setAttribute('id', 'input ' + key);
      input.setAttribute('class', 'form-control input-sm');
      tdValue.appendChild(input);
      if (tr) {
        tr.appendChild(tdValue);
      }
    }
  }
  
}

function completeCitation(dateFormat) {
  var $eles = $(":input[id^='input ']");
  var DOMeles = $eles.get();
  inputs = Array.prototype.slice.call(DOMeles);
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var key = input.id.split(" ")[1];
    var value;
    if (key == 'date') {
      var date = Date.parse(input.value);
      if (date) {
        value = date.toString(dateFormat);
      } else {
        value = input.value;
      }
    } else {
      value = input.value;
    }
    myCitation[key] = value;
  }
}

function renderCitation(format, copyToClipboard, dateAccessed, dateFormat, addInitials, initials) {
  var p = document.getElementById('final citation');
  var today = ", Date Accessed: " + Date.today().toString(dateFormat);
  var citation = "";
  for (var i = 0; i < format.length; i++) {
    ch = format.substring(i, i + 1);
    if (ch.match("[a-zA-Z]+")) {
      for (var key in myCitation) {
        if (key.substring(0, 1) == ch) {
          citation += myCitation[key];
          break;
        }
      }
    } else {
      citation += ch;
    }
  }
  if (dateAccessed) {
    citation = citation.substring(0, citation.length - 1) + today + format.slice(-1);
  }
  if (addInitials) {
    citation = citation + " // " + initials;
  }
  p.innerHTML = '<hr>' + citation;
  chrome.storage.sync.get({
    saveCitation: defaultSaveCitation
  }, function(items) {
    if (items.saveCitation) {
      chrome.storage.sync.get({
        citations: [citation],
      }, function(items) {
        if (items.citations.length > 15) {
          chrome.storage.sync.set({
            citations: items.citations.concat([citation]).slice(items.citations.length - 15),
          }, function() {
            console.log('Citation saved.');
            console.log(items.citations);
          });
        } else {
          chrome.storage.sync.set({
            citations: items.citations.concat([citation]),
          }, function() {
            console.log('Citation saved.');
            console.log(items.citations);
          });
        }
      });
    }
  });
  
  if (myCitation.selection) {
    p.innerHTML += '<br><br>' + myCitation.selection;
  }
  if (copyToClipboard) {
    var range = document.createRange();
    range.selectNode(p);
    window.getSelection().addRange(range);
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copy citation command was ' + msg);
      document.getElementById('clipboard').innerHTML = 'Copied to your clipboard!<hr>';
    } catch(err) {
      console.log('Oops, unable to copy');
    }
    window.getSelection().removeAllRanges();
  }
  var $anchor = $(this);
  $('html, body').stop().animate({
      scrollTop: $(p).offset().top
  }, 1500, 'easeInOutExpo');
  setTimeout(function() {
        $('html, body').stop().animate({
      scrollTop: 0
  }, 1500, 'easeInOutExpo');
      }, 3000);
  
}

function citationLength(format, citation) {
  sum = 0;
  for (var key in citation) {
    sum += citation[key].length;
  }
  sum += format.length;
  return sum;
}

function formalize(trait) {
  if (trait == 'quals') {
    return 'Author(s) Qualifications';
  } else if (trait == 'org') {
    return 'Organization';
  } else if (trait == 'author') {
    return 'Author(s)';
  } else {
    return capitalize(trait);
  }
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

  function getCitation(tab) {
    if ((tab) && ((!tab.url.startsWith('http')) || (tab.url.endsWith('.pdf')))) {
      chrome.storage.sync.get({
        dateFormat: defaultDateFormat
      }, function(items) {
        formatCitation(blankCitation, tab.url, items.dateFormat);
      });
    } else {
      chrome.storage.sync.get({
        dateFormat: defaultDateFormat
      }, function(items) {
        chrome.tabs.sendMessage(tab.id, { text: "report_back" },
        function(citation) {
          formatCitation(citation, tab.url, items.dateFormat);
        });
      });
    }
  }

  function help() {
    document.getElementsByClassName('container')[0].setAttribute('style', 'opacity: 0.2;');
    p = document.createElement('p');
    p.setAttribute('id', 'inst');
    p.innerHTML = '<h3>Instructions</h3><ol><li>Navigate to the web article you are cutting</li><li>Highlight the selection from the page that you are cutting</li><li>Press the <button style="padding:1px;padding-top: 0px; " class="btn"><img id="icon-16" src="img/icon16.png"></img></button> in the upper right hand corner. A popup will appear with the attributes in a citation compiled from the webpage.</li><li>Fill out the missing attributes (if any) with information from the webpage.</li><li>Press "Complete Citation" and your citation and selection will be copied to your clipboard.</li><li>Go to your debate file and paste your citation!</li></ol><p>Note: this extension will probably not work well on non-HTTP pages or PDFs.';
    p.innerHTML += '<button class="btn btn-default" id="instructions" style="width: 100%; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; padding-top: 15px; padding-bottom: 15px;"><i class="fa fa-check fa-fw"></i> Ok, got it!</button>';
    p.setAttribute('style', 'position: absolute; bottom: 20%; padding: 20px;');
    document.getElementsByTagName('body')[0].appendChild(p);
    document.getElementById('instructions').addEventListener('click', function() {
      document.getElementsByTagName('body')[0].removeChild(document.getElementById('inst'));
      document.getElementsByClassName('container')[0].setAttribute('style', 'opacity: 1.0;');
    });
  }

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(getCitation);
  document.getElementById('complete').addEventListener('click', function() {
    chrome.storage.sync.get({
      format: defaultFormat,
      dateFormat: defaultDateFormat,
      copyToClipboard: defaultCopyToClipboard,
      dateAccessed: defaultDateAccessed,
      addInitials: defaultAddInitials,
      initials: defaultInitials
    }, function(items) {
      completeCitation(items.dateFormat);
      var format;
      if (items.format.slice(-1).match("[a-zA-Z]+")) {
        format = items.format + ' ';
      } else {
        format = items.format;
      }
      renderCitation(format, items.copyToClipboard, items.dateAccessed, items.dateFormat, items.addInitials, items.initials);
    });
  });
  document.getElementById('options').addEventListener('click', function() {
    chrome.tabs.create({'url': "/options.html" });
  });
  document.getElementById('help').addEventListener('click', function() {
    help();
  });
});
