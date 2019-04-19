import m from '../../node_modules/mithril/mithril.mjs';
import Component from './component.js';
import DonationAddress from '../models/donation-address.js';
import './popup-about.css';

const DONATION_ADDRESSES = [
  new DonationAddress (
    chrome.i18n.getMessage ('eth'),
    '0x7D2749fE22B21667Ae0f90B070Bcd82C7f5b6bcc',
    '/images/about/eth.png'),
  new DonationAddress (
    chrome.i18n.getMessage ('bch'),
    '14J9Wp3MWetHZLCjcHTL7v8Vcqc4KANi3C',
    '/images/about/bch.png'),
  new DonationAddress (
    chrome.i18n.getMessage ('dash'),
    'XfFa5Mxr21KTRJuyhzxVwrhjPyLCeDfQ3d',
    '/images/about/dash.png'),
  new DonationAddress (
    chrome.i18n.getMessage ('zec'),
    't1e9P7x62cZ4TTt9pBVJcaQ5HBbnuCg5iwH',
    '/images/about/zec.png')
];

export default class PopupAbout extends Component {
  
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
      m ('a', {
        class: 'relative block flex row',
        href: 'https://github.com/MichaelAllenHardeman/dlive-companion',
        target:'_blank', 
        rel:'noopener noreferrer'
      }, [
        m ('img', {src: '/images/about/GitHub-Mark-Light-32px.png', class: 'github-logo'}),
        m ('span', {class: 'self-center flex-auto'}, 'DLive Companion')
      ]),
      m ('div', {class: 'about'}, [
        m ('span', chrome.i18n.getMessage ('about_description'))
      ]),
      this.donationAddressList (DONATION_ADDRESSES)
    ]);
  }
}