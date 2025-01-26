/* 
const currentPath = window.location.pathname;

let baseUrl = '';
if (currentPath === '/') {
  baseUrl = '';
} else {
  baseUrl = '../';
}


// Define pages for navigation
// const pages = [
//     { url: '/lab_01_dsc_106/index.html', title: 'Home' },
//     { url: '/lab_01_dsc_106/projects/', title: 'Projects' },
//     { url: '/lab_01_dsc_106/contact/', title: 'Contact' },
//     { url: '/lab_01_dsc_106/resume/', title: 'Resume' }
//   ];

let pages = [
    { url: 'lab_01_dsc_106/', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' }
  ];

// Check if we're on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');


// console.log(pages.title)
   


// a suggestion that these assignments as is are typeof undefined 


// Create and insert navigation
function createNavigation() {
    // Create nav element
    let nav = document.createElement('nav');
    nav.classList.add('navbar');
    document.body.prepend(nav);
    
        // Create links
        for (let p of pages) {
            let a = document.createElement('a');
            
            // Adjust URL based on page location
            let url = p.url;
            if (!ARE_WE_HOME && !url.startsWith('http')) {
            url = '../' + url;
            }
    
            // a.href = url;
            a.href = `${baseUrl}${p.url}`;
            a.textContent = p.title;
    
            // Highlight current page
            a.classList.toggle(
            'current', 
            a.host === location.host && a.pathname === location.pathname
            );
    
            nav.append(a);
        }
    }
    
    // Run navigation creation when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', createNavigation);

*/

/* 
const currentPath = window.location.pathname;
let baseUrl = '';
if (currentPath.startsWith('/lab_01_dsc_106/')) {
  baseUrl = 'lab_01_dsc_106/';
}

let pages = [
  { url: `${baseUrl}index.html`, title: 'Home' },
  { url: `${baseUrl}projects/index.html`, title: 'Projects' },
  { url: `${baseUrl}contact/index.html`, title: 'Contact' },
  { url: `${baseUrl}resume/index.html`, title: 'Resume' }
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

function createNavigation() {
  let nav = document.createElement('nav');
  nav.classList.add('navbar');
  document.body.prepend(nav);

  for (let p of pages) {
    let a = document.createElement('a');
    a.href = p.url;
    a.textContent = p.title;

    a.classList.toggle(
      'current',
      a.href === `${window.location.origin}/${p.url}`
    );

    nav.append(a);
  }
}

document.addEventListener('DOMContentLoaded', createNavigation);
*/

const currentPath = window.location.pathname;
let baseUrl = '';
if (currentPath !== '/') {
  baseUrl = '../';
}

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'resume/index.html', title: 'Resume' }
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

function createNavigation() {
  let nav = document.createElement('nav');
  nav.classList.add('navbar');
  document.body.prepend(nav);

  for (let p of pages) {
    let a = document.createElement('a');
    a.href = `${baseUrl}${p.url}`;
    a.textContent = p.title;

    a.classList.toggle(
      'current',
      a.href === `${window.location.origin}/${p.url}`
    );

    nav.append(a);
  }
}

document.addEventListener('DOMContentLoaded', createNavigation);