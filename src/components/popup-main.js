import m from '../../node_modules/mithril/mithril.mjs';
import Component from './component.js';
import PopupHeading from './popup-heading.js';
import PopupBody from './popup-body.js';
import * as Messages from '../models/messages.js';

class PopupMain extends Component {
  constructor () {
    super ();
    chrome.runtime.sendMessage(new Messages.UpdateUserInfo(), (response) => {
      console.log(response);
    });
  }

  view () {
    return m ('popup-main', {class: 'relative container'}, [
      m (new PopupHeading ()),
      m (new PopupBody ())
    ]);
  }
}

export default PopupMain;
