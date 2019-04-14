import m from '../../node_modules/mithril/mithril.mjs';
import FetchQL from '../../node_modules/fetchql/lib/fetchql.es.js';
import * as Constants from '../constants.js';
import Component from './component.js';
import UserSearchResults from './popup-search-results.js';

const DISPLAYNAME_DOM_ID = 'display-name';
const DLIVE_SEARCH_QUERY = `
query SearchPage($text: String!, $first: Int, $after: String) {
  search(text: $text) {
    users(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      list {
        displayname
        avatar
        id
        username
        displayname
        followers {
          totalCount
        }
      }
    }
  }
}`;

let displayname = '';
let first = 10;
let after = '';
let searchData = null;

class PopupLogin extends Component {

  buildDliveQuery () {
    return new FetchQL ({url: Constants.DLIVE_BACKEND_URL });
  }

  onUsersSearched (response) {
    searchData = response;
    m.redraw ();
  }

  buildQuerySearchUsers (displayname) {
    if (!displayname) { return; }
    return this.buildDliveQuery ().query ({
      operationName: 'SearchPage',
      variables: {
        text: displayname,
        first: first,
        after: after
      },
      query: DLIVE_SEARCH_QUERY
    });
  }
  
  search (vnode) {
    if (!vnode) { return; }
    let input = vnode.dom.querySelector ('#' + DISPLAYNAME_DOM_ID);
    displayname = input.value;
    if (!displayname) { return; }
    this.buildQuerySearchUsers (displayname).then (this.onUsersSearched);
  }

  computeSearchIconClass (searchData, displayName) {
    if (displayName && !searchData) { return 'form-icon loading'; }
    return 'form-icon icon icon-search';
  }

  maybeDisplaySearchResults (searchData) {
    if (!searchData) { return null; }
    return m (new UserSearchResults (searchData));
  }

  view (vnode) {
    return m ('popup-login', {class: 'relative form-group'}, [
      m ('div', {class: 'has-icon-right'}, [
        m ('input', {
          id: DISPLAYNAME_DOM_ID,
          class: 'form-input',
          type: 'text',
          placeholder: chrome.i18n.getMessage('login_placeholder'),
          value: this.displayname,
          autofocus: true
        }),
        m ('i', {
          class: this.computeSearchIconClass (searchData, displayname),
          onclick: this.search.bind (this, vnode)
        })
      ]),
      this.maybeDisplaySearchResults (searchData)
    ]);
  }
}

export default PopupLogin;