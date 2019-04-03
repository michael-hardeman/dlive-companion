import { m } from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';
import Heading from '../heading/heading.js';
import Body from '../body/body.js';

class Popup extends Component {
  view () {
    return m ('popup', {class: 'relative container'}, [
      m (new Heading ()),
      m (new Body ())
    ]);
  }
}

export default Popup;