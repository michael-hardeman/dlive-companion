import m from '../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';

class PopupStreams extends Component {
  clearLocalStorage () {
    localStorage.clear ();
    m.route.set (Constants.LOGIN_ROUTE);
  }

  view () {
    return m ('popup-streams', {class: 'relative'}, [
      m ('h4', 'Streams')
    ]);
  }
}

export default PopupStreams;