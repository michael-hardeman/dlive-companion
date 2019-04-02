import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../Component.js';
import LoginComponent from '../login/LoginComponent.js';
import FollowedComponent from '../followed/FollowedComponent.js';

class BodyComponent extends Component {
  computeDefaultRoute () {
    if (localStorage.getItem('displayname')) {
      return '/followed';
    }
    return '/login';
  }

  oncreate (vnode) {
    m.route.mode = 'hash';
    m.route(vnode.dom.querySelector('#routes'), this.computeDefaultRoute(), {
      '/login': new LoginComponent(),
      '/followed': new FollowedComponent()
    });
  }

  view () {
    return m('popup-body', {class: 'relative'}, [
      m('div', {id: 'routes'})
    ]);
  }
}

export default BodyComponent;