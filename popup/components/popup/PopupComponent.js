import { m } from '../../node_modules/mithril/mithril.mjs';
import Component from '../Component.js';
import HeadingComponent from '../heading/HeadingComponent.js';
import BodyComponent from '../body/BodyComponent.js';

class PopupComponent extends Component {
  view () {
    return m('popup', {class: 'relative'}, [
      m(new HeadingComponent()),
      m(new BodyComponent())
    ]);
  }
}

export default PopupComponent;