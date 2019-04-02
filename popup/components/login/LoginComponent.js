import m from '../../node_modules/mithril/mithril.mjs';
import Component from '../Component.js';
import LoginController from './LoginController.js';

const controller = new LoginController();

class LoginComponent extends Component {

  usersList (users, displayname) {
    if (!users.length && displayname) {
      return m('div', {class: 'empty'}, [
        m('div', {class: 'empty-icon'}, [
          m('i', {class: 'icon icon-people'})
        ]),
        m('p', {class: 'empty-title h5'}, 'No Results'),
        m('p', {class: 'empty-subtitle'}, 'Try a different search')
      ]);
    }

    return users.map ((user) => {
      return m('div', {
        class: 'tile tile-centered', 
        key: user.id, 
        onclick: controller.selectUser.bind(controller, user.displayname)
      }, [
        m('div', {class: 'tile-icon'}, [
          m('img', {class: 'icon centered', src: user.avatar}, [])
        ]),
        m('div', {class: 'tile-content'}, [
          m('div', {class: 'tile-title'}, user.displayname),
          m('div', {class: 'tile-subtitle'}, [
            m('i', {class: 'icon icon-people'}),
            m('small', {class: 'text-grey'}, user.followers.totalCount)
          ])
        ])
      ]);
    });
  }

  view (vnode) {
    return m('popup-login', {class: 'relative form-group'}, [
      m('label', {class: 'form-label', for:'display-name'}),
      m('div', {class: 'has-icon-right'}, [
        m('input', {
          id: 'display-name',
          class: 'form-input',
          type: 'text',
          placeholder: 'Display Name',
          value: controller.displayname,
          autofocus: true
        }),
        m('i', {class: 'form-icon icon icon-search', onclick: controller.search.bind(controller, vnode) })
      ]),
      m('users-list', this.usersList(controller.users, controller.displayname))
    ]);
  }
}

export default LoginComponent;