(_ => {
  'use strict';

  const send = (title) => {
    let parts = title.split(' - ');
    const first_name = parts[0].split(' ')[0].trim();
    const last_name = parts[0].split(' ').splice(1).join(' ').trim();
    const company_name = parts[2].split(' | ')[0].trim();
    const entry = { first_name, last_name, company_name };
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

  const submit = (title, win) => {
    return new Promise((res, err) => {
      if (title.indexOf('...') === -1) {
        send(title).then(res, err);
      } else {
        const xingTitle = event => {
          if (event.data.type == 'xingTitle') {
            window.removeEventListener('message', xingTitle, false);
            win.close();
            send(event.data.title).then(res, err);
          }
        };
        window.addEventListener('message', xingTitle, false);
        setTimeout(() => {
          win.postMessage({ type: 'xingTitle' }, 'https://webcache.googleusercontent.com/');
        }, 1000);
      }
    });
  };

  let sheet = window.document.styleSheets[0];
  sheet.insertRule(`.LeadFinder {
    background-color: #3bbf91;
    color: white;
    padding: .2rem .5rem;
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
    background-color: #4fc59c;
    text-decoration: none !important;
  }`, sheet.cssRules.length);


  let addButtons = _ => {
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

          submit(title, win).then(_ => {
            alert('Erfolgreich hinzugefügt.');
            link.remove();
          }, err => {
            alert('Konnte nicht hinzugefügt werden.');
          });
        });
        link.appendChild(document.createTextNode('Add to Lead Finder'));
        container.appendChild(link);
      }
    });
  };

  setTimeout(addButtons, 5000);
})();
