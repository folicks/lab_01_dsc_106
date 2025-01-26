// Define pages for navigation
const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' }
  ];

// Check if we're on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');


console.log(pages)
// Create and insert navigation
// function createNavigation() {
// // Create nav element
// let nav = document.createElement('nav');
// nav.classList.add('navbar');
// document.body.prepend(nav);

// // Create links
// for (let p of pages) {
//     let a = document.createElement('a');
    
//     // Adjust URL based on page location
//     let url = p.url;
//     if (!ARE_WE_HOME && !url.startsWith('http')) {
//     url = '../' + url;
//     }

//     a.href = url;
//     a.textContent = p.title;

//     // Highlight current page
//     a.classList.toggle(
//     'current', 
//     a.host === location.host && a.pathname === location.pathname
//     );

//     nav.append(a);
// }
// }

// // Run navigation creation when DOM is fully loaded
// document.addEventListener('DOMContentLoaded', createNavigation);