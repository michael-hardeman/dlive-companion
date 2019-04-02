import m from '../../node_modules/mithril/mithril.mjs';
import Controller from '../Controller.js';
import FetchQL from '../../node_modules/fetchql/lib/fetchql.es.js';

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
let users = [];
let first = 5;
let after = '';

class LoginController extends Controller {

  get displayname () { return displayname; }
  get users() { return users; }

  selectUser (displayname) {
    localStorage.setItem('displayname', displayname);
    m.route.set('/followed');
  }

  buildDliveQuery () {
    return new FetchQL ({url: DLIVE_URL_ENDPOINT });
  }

  onUsersSearched (response) {
    users = response.data.search.users.list;
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
}

export default LoginController;