import m from '../../node_modules/mithril/mithril.mjs';
import * as Constants from '../constants.js';
import Component from './component.js';
import DonationAddress from '../models/donation-address.js';

const DONATION_ADDRESSES = [
  new DonationAddress (
    chrome.i18n.getMessage('eth'),
    '0x7D2749fE22B21667Ae0f90B070Bcd82C7f5b6bcc',
    '/images/about/eth.png'),
  new DonationAddress (
    chrome.i18n.getMessage('bch'),
    '14J9Wp3MWetHZLCjcHTL7v8Vcqc4KANi3C',
    '/images/about/bch.png'),
  new DonationAddress (
    chrome.i18n.getMessage('dash'),
    'XfFa5Mxr21KTRJuyhzxVwrhjPyLCeDfQ3d',
    '/images/about/dash.png'),
  new DonationAddress (
    chrome.i18n.getMessage('zec'),
    't1e9P7x62cZ4TTt9pBVJcaQ5HBbnuCg5iwH',
    '/images/about/zec.png')
];

class PopupAbout extends Component {
  computeCorrectBackRoute () {
    if (localStorage.getItem (Constants.DISPLAYNAME_STORAGE_KEY)) {
      return Constants.STREAMS_ROUTE;
    }
    return Constants.LOGIN_ROUTE;
  }

  back () {
    m.route.set (this.computeCorrectBackRoute ());
  }

  donationAddressList (addresses) {
    return addresses.map ((item, index) => {
      return m ('div', {class: 'accordion'}, [
        m ('input', {type: 'checkbox', id: 'accordion-' + index, name: 'accordion-checkbox', hidden: true}),
        m ('label', {class: 'accordion-header', for: 'accordion-' + index}, [
          m ('i', {class: 'icon icon-arrow-right mr-1'}),
          m ('span', item.name)
        ]),
        m ('div', {class: 'accordion-body'}, [
          m ('p', item.address),
          m ('img', {class: 'donation-image', src: item.image})
        ])
      ]);
    });
  }

  view () {
    return m ('popup-about', {class: 'relative'}, [
      m ('button', {class: 'btn btn-link', onclick: this.back.bind (this)}, chrome.i18n.getMessage('back')),
      m ('div', {class: 'about'}, [
        m ('p', chrome.i18n.getMessage('about_description'))
      ]),
      this.donationAddressList (DONATION_ADDRESSES)
    ]);
  }
}

export default PopupAbout;