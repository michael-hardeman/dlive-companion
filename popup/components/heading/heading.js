import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';

let user;
let shouldShowDropdown;

class Heading extends Component {

  constructor () {
    super ();
    user = JSON.parse (localStorage.getItem ('user'));
  }

  oncreate (vnode) {
    let dropdown = vnode.dom.querySelector ('#user-menu');
    if (!shouldShowDropdown) { return; }
    if (!dropdown) { return; }
    dropdown.focus ();
  }

  logout () {
    localStorage.clear ();
    if ('/login' === m.route.get()) { return; }
    m.route.set ('/login');
  }

  showDropdown () {
    shouldShowDropdown = !shouldShowDropdown;
  }

  userDropdown (user) {
    return m ('div', {class: 'column col-3'}, [
      m ('div', {class: 'dropdown dropdown-right'}, [
        m ('a', {
          id: 'user-menu',
          class: 'btn btn-link dropdown-toggle',
          tabindex: 0,
          href: '#',
          onclick: this.showDropdown.bind(this)
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
            m ('p', 'Logout')
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
        m ('img', {class: 'logo centered', src: '/images/icons/icon-48.png'})
      ]),
      m ('div', {class: 'column col-mx-auto'}, [
        m ('h4', {class: 'title'}, 'DLive Guide')
      ]),
      this.maybeUserDropdown (user)
    ]);
  }
}

export default Heading;
