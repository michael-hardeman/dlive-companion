import * as Constants from '../constants.js';

export class Message {
  constructor (kind) {
    this.kind = kind;
  }
}

export class UpdateUserInfo extends Message {
  constructor () {
    super (Constants.MESSAGE_KIND.UPDATE_USER_INFO);
  }
}

export class UpdateLiveStreams extends Message {
  constructor () {
    super (Constants.MESSAGE_KIND.UPDATE_LIVE_STREAMS);
  }
}
