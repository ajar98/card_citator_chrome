defaultFormat = '[a, q, o, "t," d, l]';
defaultDateFormat = 'MM/dd/yy';
defaultCopyToClipboard = true;
defaultDateAccessed = false;
defaultAddInitials = false;
defaultSaveCitation = true;
defaultInitials = "";

saveFilenameDateFormat = 'MM-dd-yy';

function save_options() {
  var custom = document.getElementById('custom').checked;
  myFormat = defaultFormat;
  if (custom) {
    myFormat = document.getElementById('input custom').value;
  }
  var customDate = document.getElementById('custom date').checked;
  myDateFormat = defaultDateFormat;
  var inputDateFormat = document.getElementById('input custom date');
  if (customDate) {
    myDateFormat = inputDateFormat.value;
  }
  myCopyToClipboard = document.getElementById('copyToClipboard').checked;
  myDateAccessed = document.getElementById('dateAccessed').checked;
  myAddInitials = document.getElementById('initials').checked;
  if (myAddInitials) {
    myInitials = document.getElementById('input initials').value;
  } else {
    myInitials = '';
  }

  mySaveCitation = document.getElementById('saveCitation').checked;

  if ((customDate) && !(checkDateFormat(myDateFormat))) {
    console.log("Wrong date format.");
    inputDateFormat.setAttribute('style', 'background-color: #f2dede; color: #BD3737;');
  } else {
    inputDateFormat.setAttribute('style', '');
    chrome.storage.sync.set({
      format: myFormat,
      dateFormat: myDateFormat,
      copyToClipboard: myCopyToClipboard,
      dateAccessed: myDateAccessed,
      addInitials: myAddInitials,
      initials: myInitials,
      saveCitation: mySaveCitation
    }, function() {
      // Update status to let user know options were saved.
      var saveButton = document.getElementById('save');
      saveButton.setAttribute('disabled', 'disabled');
      setTimeout(function() {
        saveButton.removeAttribute('disabled');
      }, 750);
    });
  }
}

function checkDateFormat(dateFormat) {
  df = dateFormat.replace(/\s+/g, '-').replace(/[^a-zA-Z-]/g, '');
  month = (dateFormat.match(/M/g) || []).length;
  day = (dateFormat.match(/d/g) || []).length;
  year = (dateFormat.match(/y/g) || []).length;
  df = df.replace(/M/g, '').replace(/d/g, '').replace(/y/g, '');
  if (df !== '') {
    return false;
  }
  if (((month <= 4) && (day <= 4) && (year <= 4) && ((year % 2) === 0))) {
    return true;
  }
  return false;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function clear_save() {
  chrome.storage.sync.set({
    citations: []
  });
  chrome.storage.sync.get({
    citations: []
  }, function (items) {
    console.log(items.citations);
  });
}

function retrieve_save() {
  chrome.storage.sync.get({
    citations: []
  }, function (items) {
    download('CC-Saves-' + Date.today().toString(saveFilenameDateFormat), items.citations.join('\n\n'));
  });
}

function restore_options() {
  $("#slideshow > div:gt(0)").hide();
  setInterval(function() {
    $('#slideshow > div:first')
      .fadeOut(1000)
      .next()
      .fadeIn(1000)
      .end()
      .appendTo('#slideshow');
    },  3000);
  chrome.storage.sync.get({
    format: defaultFormat,
    dateFormat: defaultDateFormat,
    copyToClipboard: defaultCopyToClipboard,
    dateAccessed: defaultDateAccessed,
    addInitials: defaultAddInitials,
    initials: defaultInitials,
    saveCitation: defaultSaveCitation
  }, function(items) {
    console.log(items);
    if (items.format != defaultFormat) {
      document.getElementById('custom').checked = true;
      document.getElementById('input custom').value = items.format;
    } else {
      document.getElementById('standard').checked = true;
    }
    if (items.dateFormat != defaultDateFormat) {
      document.getElementById('custom date').checked = true;
      document.getElementById('input custom date').value = items.dateFormat;
    } else {
      document.getElementById('standard date').checked = true;
    }
    if (items.copyToClipboard) {
      document.getElementById('copyToClipboard').checked = true;
    } else {
      document.getElementById('copyToClipboard').checked = false;
    }
    if (items.dateAccessed) {
      document.getElementById('dateAccessed').checked = true;
    } else {
      document.getElementById('dateAccessed').checked = false;
    }
    if (items.addInitials) {
      document.getElementById('initials').checked = true;
      document.getElementById('input initials').value = items.initials;
    } else {
      document.getElementById('initials').checked = false;
    }
    if (items.saveCitation) {
      document.getElementById('saveCitation').checked = true;
    } else {
      document.getElementById('saveCitation').checked = false;
    }
  });
  document.getElementById('save').addEventListener('click',
    save_options);
  document.getElementById('clearSave').addEventListener('click',
    clear_save);
  document.getElementById('retrieveSave').addEventListener('click',
    retrieve_save);
}
document.addEventListener('DOMContentLoaded', restore_options);