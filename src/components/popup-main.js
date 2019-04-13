import m from '../node_modules/mithril/mithril.mjs';
import Component from './component.js';
import PopupHeading from './popup-heading.js';
import PopupBody from './popup-body.js';

class PopupMain extends Component {
  view () {
    return m ('popup-main', {class: 'relative container'}, [
      m (new PopupHeading ()),
      m (new PopupBody ())
    ]);
  }
}

export default PopupMain;