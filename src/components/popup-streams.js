import m from '../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';

class PopupStreams extends Component {
  emptyState () {
    return [
      m ('div', {class: 'relative empty'}, [
        m ('div', {class: 'empty-icon'}, [
          m ('i', {class: 'icon icon-bookmark'})
        ]),
        m ('p', {class: 'empty-title h5'}, 'No Live Streams'),
        m ('p', {class: 'empty-subtitle'}, 'Maybe try again later?')
      ])
    ];
  }

  computeStreamLink (user) {
    return Constants.DLIVE_FRONTEND_URL + user.displayname;
  }

  followingList (following) {
    return following.map ((user) => {
      return m ('a', {
        href: this.computeStreamLink(user), 
        target:'_blank', 
        rel:'noopener noreferrer'
      }, [
        m ('stream', {class: 'tile tile-centered'}, [
          m ('div', {class: 'tile-icon'}, [
            m ('img', {class: 'thumbnail centered', src: user.livestream.thumbnailUrl}, [])
          ]),
          m ('div', {class: 'tile-content'}, [
            m ('div', {class: 'tile-title'}, user.displayname),
            m ('div', {class: 'tile-subtitle text-grey'}, [
              m ('i', {class: 'icon icon-people'}),
              m ('small', user.livestream.watchingCount)
            ])
          ])
        ])
      ]);
    });
  }

  maybeShowFollowingList (following) {
    if (!following || !following.length) { return this.emptyState (); }
    return this.followingList (following);
  }

  getFollowingWithLivestreams () {
    let user = localStorage.getItem(Constants.USER_STORAGE_KEY);
    if (!user) { return []; }
    user = JSON.parse (user);
    return user.following.list.filter ((following) => {
      return following.livestream !== null;
    }).map((following) => {
      return following;
    });
  }

  view () {
    return m ('popup-streams', {class: 'relative'}, [
      this.maybeShowFollowingList (this.getFollowingWithLivestreams ())
    ]);
  }
}

export default PopupStreams;