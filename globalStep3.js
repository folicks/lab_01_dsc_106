


document.addEventListener('DOMContentLoaded', () => {
    // Determine the base path
    const currentPath = window.location.pathname;
  
    // Define the root folder for the project
    const baseUrl = '/lab_01_dsc_106/';
  
    // Define pages
    const pages = [
      { url: `${baseUrl}index.html`, title: 'Home' },
      { url: `${baseUrl}projects/index.html`, title: 'Projects' },
      { url: `${baseUrl}contact/index.html`, title: 'Contact' },
      { url: `${baseUrl}resume/index.html`, title: 'Resume' },
    ];
  
    // Check if we are on the home page
    const ARE_WE_HOME = currentPath === baseUrl || currentPath === `${baseUrl}index.html`;
  
    // Create navigation
    function createNavigation() {
      const nav = document.createElement('nav');
      nav.classList.add('navbar');
      document.body.prepend(nav);
  
      for (const page of pages) {
        const a = document.createElement('a');
  
        // Adjust URL for subpages
        let url = page.url;
        if (!ARE_WE_HOME && !url.startsWith('http')) {
          const relativeUrl = url.replace(baseUrl, '');
          url = `../${relativeUrl}`;
        }
  
        a.href = url;
        a.textContent = page.title;
  
        // Highlight the current page
        a.classList.toggle(
          'current',
          new URL(a.href, window.location.origin).pathname === currentPath
        );
  
        nav.append(a);
      }
    }
  
    createNavigation();
  });
  
  