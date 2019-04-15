import m from '../../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';

let user;

class PopupHeading extends Component {

  constructor () {
    super ();
    user = JSON.parse (localStorage.getItem (Constants.USER_STORAGE_KEY));
  }

  logout () {
    localStorage.clear ();
    if (Constants.LOGIN_ROUTE === m.route.get ()) { return; }
  }

  computeCorrectHomeRoute () {
    if (localStorage.getItem (Constants.DISPLAYNAME_STORAGE_KEY)) {
      return Constants.STREAMS_ROUTE;
    }
    return Constants.LOGIN_ROUTE;
  }

  home () {
    m.route.set (this.computeCorrectHomeRoute ());
  }

  userDropdown (user) {
    return m ('user-dropdown', {class: 'self-center flex-none'}, [
      m ('div', {class: 'dropdown dropdown-right'}, [
        m ('a', {
          class: 'btn btn-link dropdown-toggle no-pad',
          tabindex: 0
        }, [
          m ('img', {class: 'avatar', src: user.avatar}),
          m ('i', {class: 'icon icon-caret'})
        ]),
        m ('ul', {class: 'menu'}, [
          m ('li', {class: 'displayname menu-item'}, user.displayname),
          m ('li', {
            class: 'menu-item',
          }, [
            m ('a', {
              class: 'relative block',
              href: Constants.ABOUT_ROUTE, 
              oncreate: m.route.link, 
              onupdate: m.route.link
            }, 
            chrome.i18n.getMessage ('about'))
          ]),
          m ('li', {
            class: 'menu-item',
            onclick: this.logout.bind (this)
          }, [
            m ('a', {
              class: 'relative block',
              href: Constants.LOGIN_ROUTE, 
              oncreate: m.route.link,
              onupdate: m.route.link
            }, 
            chrome.i18n.getMessage ('logout'))
          ])
        ])
      ])
    ]);
  }

  maybeUserDropdown (user) {
    if (!user) { return null; }
    return this.userDropdown (user);
  }

  view () {
    return m ('popup-heading', {class: 'relative flex space-between no-wrap'}, [
      m ('div', {class: 'self-center flex-none'}, [
        m ('img', {class: 'logo', src: '/images/icons/icon-48.png', onclick: this.home.bind (this)})
      ]),
      m ('div', {class: 'flex justify-center'}, [
        m ('h4', {class: 'title self-center'}, chrome.i18n.getMessage('name'))
      ]),
      this.maybeUserDropdown (user)
    ]);
  }
}

export default PopupHeading;
