import m from '../node_modules/mithril/mithril.mjs';
import PopupMain from './components/popup-main.js';
import '../node_modules/spectre.css/dist/spectre.min.css';
import '../node_modules/spectre.css/dist/spectre-exp.min.css';
import '../node_modules/spectre.css/dist/spectre-icons.min.css';
import './popup.css';

m.mount (document.body, new PopupMain ());