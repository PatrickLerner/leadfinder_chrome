(_ => {
  'use strict';

  const htmlDecode = (input) => {
    const e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

  const send = (options) => {
    const { title, url } = options;
    let parts = htmlDecode(title).split(' - ');
    const name = parts[0].trim();
    const position = parts[1].trim();
    const company_name = parts[2].split(' | ')[0].trim();
    const urls = [url];
    const entry = { name, position, company_name, urls };
    const host = 'https://leadfinder.patricklerner.com';

    return fetch(`${host}/api/v1/entries`, {
      'method': 'POST',
      'credentials': 'include',
      'headers': {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({ entry }),
    });
  };

  const submit = (options) => {
    const { win, url, title } = options;

    return new Promise((res, err) => {
      if (title.indexOf('...') === -1) {
        send({ title, url }).then(res, err);
      } else {
        const xingTitle = event => {
          if (event.data.type == 'xingTitle') {
            window.removeEventListener('message', xingTitle, false);
            win.close();
            send({ title: event.data.title, url }).then(res, err);
          }
        };
        window.addEventListener('message', xingTitle, false);
        setTimeout(() => {
          win.postMessage({ type: 'xingTitle' }, 'https://webcache.googleusercontent.com/');
        }, 1000);
      }
    });
  };

  let insertCSS = _ => {
    let sheet = window.document.styleSheets[0];
    sheet.insertRule(`.LeadFinder {
      background-color: #36c4ac;
      color: white;
      padding: 0.7rem 1rem;
      display: inline-block;
      font-size: 14px;
      margin-left: 29px;
      text-decoration: none !important;
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 0;
      transform: translateX(100%);
    }`, sheet.cssRules.length);
    sheet.insertRule(`.LeadFinder:hover {
      background-color: #4acab4;
      text-decoration: none !important;
    }`, sheet.cssRules.length);
  }

  let addButtons = _ => {
    insertCSS();
    document.querySelectorAll('cite').forEach(element => {
      const url = element.innerHTML;

      if (url.match(/^https?:\/\/(www\.)?xing.com\/profile\//)) {
        const container = element.parentElement.parentElement.parentElement.parentElement;

        const link = document.createElement('A');
        link.classList.add('LeadFinder');
        link.addEventListener('click', _ => {
          const title = container.firstChild.firstChild.innerHTML;
          let win = null;
          if (title.indexOf('...') !== -1) {
            const url = container.querySelectorAll('.action-menu-item')[0].children[0].href;
            win = window.open(
              `${url}&vwsrc=1`, '_blank',
              'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,' +
              'left=10000,top=10000, width=10,height=10,visible=none', ''
            );
          }

          submit({ title, win, url }).then(res => res.json()).then(data => {
            if (data.errors) {
              alert('Konnte nicht hinzugefügt werden.');
            } else {
              alert('Erfolgreich hinzugefügt.');
              link.remove();
            }
          }, err => {
            alert('Konnte nicht hinzugefügt werden.');
          });
        });
        link.appendChild(document.createTextNode('Add to Lead Finder'));
        container.appendChild(link);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', addButtons, false);
})();
