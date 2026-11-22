// The menu, in the order of the Weebly site.
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Rationale', href: '/rationale/' },
  { label: 'Award', href: '/award/' },
  { label: 'Quotes', href: '/quotes/' },
  {
    label: 'More info', href: '/more-info/',
    children: [
      { label: 'Presentations & Workshops', href: '/presentations/' },
      { label: 'Publications', href: '/publications/' },
      { label: 'Good practices', href: '/good-practices/' },
      { label: 'Modes of use', href: '/modes-of-use/' },
      { label: 'Projects & Plans', href: '/projects-plans/' },
      { label: 'MPM & Dalcroze', href: '/mpm-dalcroze/' },
      { label: 'Poster', href: '/poster/' },
      { label: 'PhD Project Synopsis', href: '/phd-synopsis/' },
      { label: 'Music Performance & Movement', href: '/music-performance-movement/' },
    ],
  },
  { label: 'Pictures', href: '/pictures/' },
  {
    label: 'Development', href: '/development/',
    children: [
      { label: 'Mat', href: '/mat/' },
      { label: 'Motion sensors', href: '/motion-sensors/' },
      { label: 'Interface', href: '/interface/' },
    ],
  },
  { label: 'Contact', href: '/contact/' },
];

// Pages that live under a menu item without being in its dropdown.
export const parentOf = {
  '/english-summary': '/more-info',
  '/nederlandse-samenvatting': '/more-info',
};

// Messages from the site's forms open the visitor's email program, addressed here.
export const MAIL_TO = 'luc.nijs@uni.lu';
