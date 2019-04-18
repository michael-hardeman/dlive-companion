import FetchQL from '../node_modules/fetchql/lib/fetchql.es.js';
import * as Constants from './constants.js';

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
          title
          thumbnailUrl
          watchingCount
          category {
            title
          }
        }
        followers {
          totalCount
        }
      }
    }
  }
}`;

const DLIVE_GET_USER_FOLLOWING_NEXT_PAGE = `
query LivestreamPage($displayname: String!, $first: Int, $after: String) {
  userByDisplayName (displayname: $displayname) {
    displayname
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
          title
          thumbnailUrl
          watchingCount
          category {
            title
          }
        }
        followers {
          totalCount
        }
      }
    }
  }
}`;
const FOLLOWING_PAGE_SIZE = 40;

function buildDliveQuery () {
  return new FetchQL ({url: Constants.DLIVE_BACKEND_URL });
}

function extractFollowing (response) {
  let user = JSON.parse (localStorage.getItem (Constants.USER_STORAGE_KEY));
  if (!user) { return Promise.reject (user); }
  let followingInfo = response.data.userByDisplayName.following;
  if (!followingInfo) { return Promise.reject ('Following info invalid'); }
  user.following.list = user.following.list.concat (followingInfo.list);
  localStorage.setItem (Constants.USER_STORAGE_KEY, JSON.stringify (user));
  return Promise.resolve (response);
}

function fetchAllFollowing (displayname, first, after) {
  return buildDliveQuery ().query ({
    operationName: 'LivestreamPage',
    variables: {
      displayname: displayname,
      first: first,
      after: after
    },
    query: DLIVE_GET_USER_FOLLOWING_NEXT_PAGE
  }).then (extractFollowing).then (maybeFetchAllFollowing);
}

// recursively traverse the following results until the end is reached
function maybeFetchAllFollowing (response) {
  let user = response.data.userByDisplayName;
  if (!user) { return Promise.reject ('Response invalid'); }
  // end of recursion reached
  if (!user.following.pageInfo.hasNextPage) { return Promise.resolve(); } 
  return fetchAllFollowing (user.displayname, FOLLOWING_PAGE_SIZE, user.following.pageInfo.endCursor);
}

function updateUserInfo (respond) {
  let displayname = localStorage.getItem(Constants.DISPLAYNAME_STORAGE_KEY);
  if (!displayname) { respond ('No displayname in storage.'); return; }
  
  return new Promise ((resolve, reject) => {
    buildDliveQuery ().query ({
      operationName: 'LivestreamPage',
      variables: {
        displayname: displayname,
        first: FOLLOWING_PAGE_SIZE
      },
      query: DLIVE_GET_USER_QUERY
    }).then((response) => {
      let user = response.data.userByDisplayName;
      if (!user) { return reject ('User could not be fetched'); }
      localStorage.setItem (Constants.USER_STORAGE_KEY, JSON.stringify (user));
      maybeFetchAllFollowing (response).finally (() => {
        resolve (localStorage.getItem (Constants.USER_STORAGE_KEY));
      });
    });
  }).finally (respond);
}

// https://developer.chrome.com/extensions/messaging#simple
// return true allows you to use asynchronicity to respond to the message;
chrome.runtime.onMessage.addListener(function(message, sender, respond) {
  switch (message.kind) {
    case Constants.UPDATE_USER_INFO_MESSAGE: updateUserInfo(respond); break;
    default: return false;
  }

  return true;
});

