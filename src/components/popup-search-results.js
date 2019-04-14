import m from '../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';
import * as Messages from '../models/messages.js';

let users = [];

class PopupSearchResults extends Component {

  constructor (response) {
    super ();
    if (!response || !response.data) { users = []; return; } 
    users = response.data.search.users.list;
  }

  emptyState () {
    return [
      m ('div', {class: 'relative empty'}, [
        m ('div', {class: 'empty-icon'}, [
          m ('i', {class: 'icon icon-people'})
        ]),
        m ('p', {class: 'empty-title h5'}, 'No Results'),
        m ('p', {class: 'empty-subtitle'}, 'Try a different search')
      ])
    ];
  }

  selectUser(user) {
    localStorage.setItem (Constants.DISPLAYNAME_STORAGE_KEY, user.displayname);
    chrome.runtime.sendMessage(new Messages.UpdateUserInfo(), (response) => {
      m.route.set (Constants.STREAMS_ROUTE);
      m.redraw ();
    });
  }

  userList (users) {
    return users.map ((user) => {
      return m ('user', {
        class: 'tile tile-centered', 
        key: user.id,
        onclick: this.selectUser.bind (this, user)
      }, [
        m ('div', {class: 'tile-icon'}, [
          m ('img', {class: 'avatar centered', src: user.avatar}, [])
        ]),
        m ('div', {class: 'tile-content'}, [
          m ('div', {class: 'tile-title'}, user.displayname),
          m ('div', {class: 'tile-subtitle text-grey'}, [
            m ('i', {class: 'icon icon-people'}),
            m ('small', user.followers.totalCount)
          ])
        ])
      ]);
    });
  }

  maybeShowUserList (users) {
    if (!users.length) { return this.emptyState (); }
    return this.userList (users);
  }

  maybeShowPagination () {
    return null;
  }

  view () {
    return m ('popup-search-results', [
      this.maybeShowUserList(users),
      this.maybeShowPagination()
    ]);
  }
}

export default PopupSearchResults;