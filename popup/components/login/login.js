import m from '../../node_modules/mithril/mithril.mjs';
import FetchQL from '../../node_modules/fetchql/lib/fetchql.es.js';
import Component from '../component.js';
import UserSearchResults from '../user-search-results/user-search-results.js';

const DLIVE_URL_ENDPOINT = 'https://graphigo.prd.dlive.tv/';
const DLIVE_QUERY = `
query SearchPage($text: String!, $first: Int, $after: String) {
  search(text: $text) {
    users(first: $first, after: $after) {
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
let first = 5;
let after = '';
let searchData = null;

class Login extends Component {

  buildDliveQuery () {
    return new FetchQL ({url: DLIVE_URL_ENDPOINT });
  }

  onUsersSearched (response) {
    searchData = response;
    m.redraw ();
  }

  searchUsers (displayname) {
    if (!displayname) { return; }
    return this.buildDliveQuery ().query ({
      operationName: 'SearchPage',
      variables: {
        text: displayname,
        first: first,
        after: after
      },
      query: DLIVE_QUERY
    });
  }
  
  search (vnode) {
    if (!vnode) { return; }
    let input = vnode.dom.querySelector ('#display-name');
    displayname = input.value;
    this.searchUsers (displayname).then (this.onUsersSearched);
  }

  computeSearchbarIconClass (searchData, displayName) {
    if (displayName && !searchData) { return 'form-icon loading'; }
    return 'form-icon icon icon-search';
  }

  maybeDisplayResults (searchData) {
    if (!searchData) { return null; }
    return m (new UserSearchResults (searchData));
  }

  view (vnode) {
    return m ('popup-login', {class: 'relative form-group'}, [
      m ('label', {class: 'form-label', for:'display-name'}),
      m ('div', {class: 'has-icon-right'}, [
        m ('input', {
          id: 'display-name',
          class: 'form-input',
          type: 'text',
          placeholder: 'Display Name',
          value: this.displayname,
          autofocus: true
        }),
        m ('i', {
          class: this.computeSearchbarIconClass (searchData, displayname),
          onclick: this.search.bind (this, vnode)
        })
      ]),
      this.maybeDisplayResults (searchData)
    ]);
  }
}

export default Login;