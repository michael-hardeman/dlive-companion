import m from '../../node_modules/mithril/mithril.mjs';
import FetchQL from '../../node_modules/fetchql/lib/fetchql.es.js';
import Component from '../component.js';
import Heading from '../heading/heading.js';
import Body from '../body/body.js';

const DLIVE_URL_ENDPOINT = 'https://graphigo.prd.dlive.tv/';
const DLIVE_GET_USER_QUERY = `
query LivestreamPage($displayname: String!, $first: Int, $after: String) {
  userByDisplayName (displayname: $displayname) {
    displayname
    avatar
    id
    username
    livestream {
      id
      permlink
    }
    
    following (
      sortedBy: AZ 
      first: $first,
      after: $after
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      list {
        avatar
        displayname
        partnerStatus
        id
        username
        displayname
        livestream {
          id
          permlink
        }
        followers {
          totalCount
        }
      }
    }
  }
}`;

let displayname;
let refreshUserListener;

class Popup extends Component {
  oncreate () {
    this.maybeRefreshUserData ();
    refreshUserListener = this.maybeRefreshUserData.bind(this);
    document.addEventListener ('refresh-user', refreshUserListener);
  }

  onbeforeremove () {
    document.removeEventListener ('refresh-user', refreshUserListener);
  }

  buildDliveQuery () {
    return new FetchQL ({url: DLIVE_URL_ENDPOINT });
  }

  onUserRetrieved (response) {
    localStorage.setItem ('user', JSON.stringify (response.data.userByDisplayName));
    m.redraw ();
  }

  buildQueryGetUserByDisplayName (displayname) {
    if (!displayname) { return; }
    return this.buildDliveQuery ().query ({
      operationName: 'LivestreamPage',
      variables: {
        displayname: displayname
      },
      query: DLIVE_GET_USER_QUERY
    });
  }

  getUserByDisplayName () {
    this.buildQueryGetUserByDisplayName (displayname).then (this.onUserRetrieved);
  }

  maybeRefreshUserData () {
    displayname = JSON.parse (localStorage.getItem ('displayname'));
    if (displayname) { this.getUserByDisplayName (displayname);}
  }

  view () {
    return m ('popup', {class: 'relative container'}, [
      m (new Heading ()),
      m (new Body ())
    ]);
  }
}

export default Popup;