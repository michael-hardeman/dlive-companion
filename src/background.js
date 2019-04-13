import FetchQL from './node_modules/fetchql/lib/fetchql.es.js';
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
const FOLLOWING_PAGE_SIZE = 20;

function buildDliveQuery () {
  return new FetchQL ({url: Constants.DLIVE_BACKEND_URL });
}

function extractFollowing (response) {
  let user = JSON.parse (localStorage.getItem (Constants.USER_STORAGE_KEY));
  if (!user) { return Promise.reject (user); }
  let followingInfo = response.data.userByDisplayName;
  if (!followingInfo) { return Promise.reject (followingInfo); }
  user.following.list = user.following.list.concat (followingInfo.list);
  localStorage.setItem (Constants.USER_STORAGE_KEY, JSON.stringify (user));
  return response;
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

function maybeFetchAllFollowing (response) {
  let user = response.data.userByDisplayName;
  if (!user) { return null; }
  if (!user.following.pageInfo.hasNextPage) { return user; }
  return fetchAllFollowing (user.displayname, FOLLOWING_PAGE_SIZE, user.following.pageInfo.endCursor);
}

function onUserRetrieved (response) {
  let user = response.data.userByDisplayName;
  if (!user) { return null; }
  localStorage.setItem (Constants.USER_STORAGE_KEY, JSON.stringify (user));
  return maybeFetchAllFollowing (response); 
}

function buildQueryGetUserByDisplayName (displayname) {
  return buildDliveQuery ().query ({
    operationName: 'LivestreamPage',
    variables: {
      displayname: displayname,
      first: FOLLOWING_PAGE_SIZE,
      after: '0'
    },
    query: DLIVE_GET_USER_QUERY
  });
}

function getUserByDisplayName (displayname) {
  return buildQueryGetUserByDisplayName (displayname).then (onUserRetrieved);
}

function updateUserInfo () {
  return Promise.resolve(localStorage.getItem(Constants.DISPLAYNAME_STORAGE_KEY)).then (getUserByDisplayName);
}

function updateLiveStrems () {
  return Promise.reject ('unimplemented feature');
}

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  switch (message.kind) {
    case Constants.MESSAGE_KIND.UPDATE_USER_INFO: return updateUserInfo().then(reply);
    case Constants.MESSAGE_KIND.UPDATE_LIVE_STREAMS: return updateLiveStrems().then(reply);
    default: new Error ('Unknown Message Kind: ' + message.kind);
  }
});

