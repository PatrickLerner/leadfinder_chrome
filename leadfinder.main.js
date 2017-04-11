(_ => {
  'use strict';

  let notyf = null;

  const htmlDecode = (input) => {
    const e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

  const send = (entry, url) => {
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

  const sendXing = (options) => {
    const { title, url } = options;
    let parts = htmlDecode(title).split(' - ');
    const name = parts[0].trim();
    const position = parts[1].trim();
    const company_name = parts[2].split(' | ')[0].trim();
    const urls = [url];
    const entry = { name, position, company_name, urls };

    return send(entry, url);
  };

  const submitLinkedIn = (options) => {
    return new Promise((res, err) => {
      const { title, subText, url } = options;
      const name = htmlDecode(title).split('|')[0].trim();
      const parts = htmlDecode(subText).split(' - ');
      if (parts.length != 3) { return err(); }
      let position = parts[1].trim();
      let company_name = parts[2].trim();
      const urls = [url];
      const entry = { name, position, company_name, urls };

      return send(entry, url).then(res, err);
    });
  };

  const submitXing = (options) => {
    const { win, url, title } = options;

    return new Promise((res, err) => {
      if (title.indexOf('...') === -1) {
        sendXing({ title, url }).then(res, err);
      } else {
        const xingTitle = event => {
          if (event.data.type == 'xingTitle') {
            window.removeEventListener('message', xingTitle, false);
            win.close();
            sendXing({ title: event.data.title, url }).then(res, err);
          }
        };
        window.addEventListener('message', xingTitle, false);
        setTimeout(() => {
          win.postMessage({ type: 'xingTitle' }, 'https://webcache.googleusercontent.com/');
        }, 1000);
      }
    });
  };

  const insertCSS = _ => {
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

  const addLink = container => {
    const link = document.createElement('A');
    link.classList.add('LeadFinder');
    link.appendChild(document.createTextNode('Add to Lead Finder'));
    container.appendChild(link);
    return link;
  }

  const addButtons = _ => {
    notyf = new Notyf();

    insertCSS();
    document.querySelectorAll('cite').forEach(element => {
      const url = element.innerHTML;
      const container = element.parentElement.parentElement.parentElement.parentElement;

      if (url.match(/^https?:\/\/([^\.]*\.)?linkedin.com\/in\//)) {
        const hasSubText = container.querySelectorAll('.slp').length > 0;
        if (!hasSubText) { return; }
        const subText = container.querySelectorAll('.slp')[0].innerHTML;
        if (subText.split(' - ').length !== 3) { return; }
        const link = addLink(container);
        link.addEventListener('click', () => {
          const title = container.firstChild.firstChild.innerHTML;

          submitLinkedIn({ title, subText, url }).then(res => res.json()).then(data => {
            if (data.errors) {
              notyf.alert('Could not save lead.');
            } else {
              notyf.confirm('Successfully added lead.');
              link.remove();
            }
          }, err => {
            notyf.alert('Could not save lead.');
          });
        });
      } else if (url.match(/^https?:\/\/(www\.)?xing.com\/profile\//)) {
        const link = addLink(container);
        link.addEventListener('click', () => {
          const title = container.firstChild.firstChild.innerHTML;
          let win = null;
          if (title.indexOf('...') !== -1) {
            const winUrl = container.querySelectorAll('.action-menu-item')[0].children[0].href;
            win = window.open(
              `${winUrl}&vwsrc=1`, '_blank',
              'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,' +
              'left=10000,top=10000, width=10,height=10,visible=none', ''
            );
          }

          submitXing({ title, win, url }).then(res => res.json()).then(data => {
            if (data.errors) {
              notyf.alert('Could not save lead.');
            } else {
              notyf.confirm('Successfully added lead.');
              link.remove();
            }
          }, err => {
            alert('Konnte nicht hinzugefügt werden.');
          });
        });
      }
    });
  };

  document.addEventListener('DOMContentLoaded', addButtons, false);
})();
