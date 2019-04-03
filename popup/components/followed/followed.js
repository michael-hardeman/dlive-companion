import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';

class Followed extends Component {
  clearLocalStorage () {
    localStorage.clear ();
    m.route.set ('/login');
  }

  view () {
    return m ('popup-followed', {class: 'relative'}, [
      m ('button', {class: 'btn btn-primary', onclick: this.clearLocalStorage.bind (this) }, [
        m ('i', {class: 'icon icon-cross'}, [])
      ])
    ]);
  }
}

export default Followed;