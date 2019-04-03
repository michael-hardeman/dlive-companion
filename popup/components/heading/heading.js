import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../component.js';

class Heading extends Component {
  view () {
    return m ('popup-heading', {class: 'columns'}, [
      m ('div', {class: 'column col-3'}, [
        m ('img', {class: 'logo centered', src: '/images/icons/icon-48.png'})
      ]),
      m ('div', {class: 'column col-mx-auto'}, [
        m ('h4', {class: 'title flex-centered'}, 'DLive Guide')
      ])
    ]);
  }
}

export default Heading;
