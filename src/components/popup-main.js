import m from '../../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';
import PopupHeading from './popup-heading.js';
import PopupBody from './popup-body.js';
import * as Messages from '../models/messages.js';
import './popup-main.css';

chrome.runtime.onMessage.addListener ((message) => {
  switch (message.kind) {
    case Constants.USER_INFO_UPDATED_MESSAGE: 
      // TODO: figure out how to prevent this from
      // affecting interactable UI components like the user-dropdown
      // or about page accordions.
      if (Constants.STREAMS_ROUTE === m.route.get ()) { m.redraw (); }
      break;
    default:
      m.route.set (Constants.LOGIN_ROUTE);
      throw new Error ('Unknown Message: ' + message.kind);
  }
});

class PopupMain extends Component {
  constructor () {
    super ();
    chrome.runtime.sendMessage (new Messages.UpdateUserInfo ());
  }

  view () {
    return m ('popup-main', {class: 'relative block'}, [
      m (new PopupHeading ()),
      m (new PopupBody ())
    ]);
  }
}

export default PopupMain;
