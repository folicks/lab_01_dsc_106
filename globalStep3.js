


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

    function createColorSchemeSwitcher() {
        document.body.insertAdjacentHTML(
          'afterbegin',
          `
          <label class="color-scheme">
            Theme:
            <select>
              <option value="light dark">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>`
        );
      
        const select = document.querySelector('.color-scheme select');
        
        // Set initial color scheme from localStorage
        if ('colorScheme' in localStorage) {
          const savedScheme = localStorage.colorScheme;
          document.documentElement.style.setProperty('color-scheme', savedScheme);
          select.value = savedScheme;
        }
      
        // Event listener for color scheme changes
        select.addEventListener('input', function(event) {
          const colorScheme = event.target.value;
          document.documentElement.style.setProperty('color-scheme', colorScheme);
          localStorage.colorScheme = colorScheme;
        });
    }
  
    // createNavigation();
    createNavigation();
    createColorSchemeSwitcher();
});
  
  
