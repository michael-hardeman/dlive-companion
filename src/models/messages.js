import * as Constants from '../constants.js';

export class Message {
  constructor (kind) {
    this.kind = kind;
  }
}

export class UpdateUserInfo extends Message {
  constructor () {
    super (Constants.UPDATE_USER_INFO_MESSAGE);
  }
}

export class UserInfoUpdated extends Message {
  constructor () {
    super (Constants.USER_INFO_UPDATED_MESSAGE);
  }
}
