import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';
import Login from '../login/login.js';
import Followed from '../followed/followed.js';

class Body extends Component {
  computeDefaultRoute () {
    if (localStorage.getItem ('displayname')) {
      return '/followed';
    }
    return '/login';
  }

  oncreate (vnode) {
    m.route.mode = 'hash';
    m.route (vnode.dom.querySelector ('#routes'), this.computeDefaultRoute (), {
      '/login': new Login (),
      '/followed': new Followed ()
    });
  }

  view () {
    return m ('popup-body', {class: 'relative'}, [
      m ('div', {id: 'routes'})
    ]);
  }
}

export default Body;