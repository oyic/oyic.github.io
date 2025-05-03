import './style.css';
import Aos from 'aos';
import 'aos/dist/aos.css';
import {scrollnav} from 'scrollnav';

Aos.init();

const nav = scrollnav({
  nav: '#menu',
  sections: '.overlay-container',
  offset: 100,
});
