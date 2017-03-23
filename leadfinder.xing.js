(_ => {
 'use strict';

 const decodeHtml = html => {
   let txt = document.createElement("textarea");
   txt.innerHTML = html;
   return txt.value;
 };

 const getTitle = html => {
   let el = document.createElement('html');
   el.innerHTML = html;
   return el.querySelectorAll('title')[0].innerHTML;
 };

  window.addEventListener('message', event => {
    if (event.data.type != 'xingTitle') { return; }
    event.source.postMessage({
      type: 'xingTitle',
      title: getTitle(decodeHtml(document.querySelectorAll('pre')[0].innerHTML))
    }, event.origin);
  }, false);
})();
