import m from '../../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';
import PopupLogin from './popup-login.js';
import PopupStreams from './popup-streams.js';
import PopupAbout from './popup-about.js';

const ROUTE_DOM_ID = 'routes';

export default class PopupBody extends Component {
  computeDefaultRoute () {
    if (localStorage.getItem (Constants.DISPLAYNAME_STORAGE_KEY)) {
      return Constants.STREAMS_ROUTE;
    }
    return Constants.LOGIN_ROUTE;
  }

  oncreate (vnode) {
    m.route.mode = 'hash';
    const routes = {};
    routes [Constants.LOGIN_ROUTE] = new PopupLogin ();
    routes [Constants.STREAMS_ROUTE] = new PopupStreams ();
    routes [Constants.ABOUT_ROUTE] = new PopupAbout ();
    m.route (vnode.dom.querySelector ('#' + ROUTE_DOM_ID), this.computeDefaultRoute (), routes);
  }

  view () {
    return m ('popup-body', {class: 'relative'}, [
      m ('div', {id: ROUTE_DOM_ID})
    ]);
  }
}