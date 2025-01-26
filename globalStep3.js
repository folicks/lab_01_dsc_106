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

const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' }
  ];

// Check if we're on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');


// console.log(pages.title)
   


/* a suggestion that these assignments as is are typeof undefined */


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