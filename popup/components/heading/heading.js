import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';

class Heading extends Component {
  view () {
    return m ('popup-heading', {class: 'relative container'}, [
      m ('div', {class: 'columns col-oneline'}, [
        m ('img', {src: '/images/icons/icon-32.png'}),
        m ('h4', {class: 'col-auto title'}, 'DLive Guide')
      ])
    ]);
  }
}

export default Heading;
