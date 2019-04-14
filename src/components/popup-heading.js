import m from '../../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';

const USER_MENU_DOM_ID = 'user-menu';

let user;
let shouldShowDropdown;

class PopupHeading extends Component {

  constructor () {
    super ();
    user = JSON.parse (localStorage.getItem (Constants.USER_STORAGE_KEY));
  }

  oncreate (vnode) {
    let dropdown = vnode.dom.querySelector ('#' + USER_MENU_DOM_ID);
    if (!dropdown || !shouldShowDropdown) { return; }
    dropdown.focus ();
  }

  logout () {
    localStorage.clear ();
    if (Constants.LOGIN_ROUTE === m.route.get ()) { return; }
    shouldShowDropdown = false;
    m.route.set (Constants.LOGIN_ROUTE);
  }

  showDropdown () {
    shouldShowDropdown = !shouldShowDropdown;
  }

  userDropdown (user) {
    return m ('div', {class: 'column col-3'}, [
      m ('div', {class: 'dropdown dropdown-right'}, [
        m ('a', {
          id: USER_MENU_DOM_ID,
          class: 'btn btn-link dropdown-toggle',
          tabindex: 0,
          href: '#',
          onclick: this.showDropdown.bind (this)
        }, [
          m ('img', {class: 'avatar', src: user.avatar}),
          m ('i', {class: 'icon icon-caret'})
        ]),
        m ('ul', {class: 'menu'}, [
          m ('li', {
            id: 'logout',
            class: 'menu-item',
            onclick: this.logout.bind (this)
          }, [
            m ('p', chrome.i18n.getMessage ('logout'))
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
    return m ('popup-heading', {class: 'columns'}, [
      m ('div', {class: 'column col-3'}, [
        m ('a', {href: Constants.ABOUT_ROUTE, oncreate: m.route.link, onupdate: m.route.link}, [
          m ('img', {class: 'logo centered', src: '/images/icons/icon-48.png'})
        ])
      ]),
      m ('div', {class: 'column col-mx-auto'}, [
        m ('h4', {class: 'title'}, chrome.i18n.getMessage('name'))
      ]),
      this.maybeUserDropdown (user)
    ]);
  }
}

export default PopupHeading;
