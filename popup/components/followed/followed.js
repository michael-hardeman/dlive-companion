import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';

class Followed extends Component {
  clearLocalStorage () {
    localStorage.clear ();
    m.route.set ('/login');
  }

  view () {
    return m ('popup-followed', {class: 'relative'}, [
      m ('h4', 'FOLLOWED')
    ]);
  }
}

export default Followed;