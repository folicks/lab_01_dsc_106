// place the return array of html in the json
//  and corresponding "links" ? here ex : ( ../lib/projects.json )
// try in the console the url of the projects directory 
export {fetchGitHubData,renderProjects,fetchJSON};

document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector('.color-scheme-select');
    const root = document.documentElement;

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
  
        if (a.host !== location.host) {
            a.target = '_blank';
        }

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

    /*
    // Function to set the color scheme
    function setColorScheme(colorScheme) {
    // Set the `color-scheme` CSS property on the root element
        root.style.setProperty('color-scheme', colorScheme);

        // If dark mode, add data-theme="dark" for additional styles
        if (colorScheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        } else {
        root.removeAttribute('data-theme');
        }
    }

    // Read saved preference from localStorage on page load
    const savedColorScheme = localStorage.getItem('colorScheme');
    if (savedColorScheme) {
        setColorScheme(savedColorScheme);
        select.value = savedColorScheme; // Sync the <select> element
    }

    // Add event listener for the <select> element
    select.addEventListener('input', (event) => {
        const selectedScheme = event.target.value;
        setColorScheme(selectedScheme);
        localStorage.setItem('colorScheme', selectedScheme); // Save preference
    });
    */


  

    /* start of particular type of development process */

    async function fetchJSON(url) {
      try {
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`Failed to fetch projects: ${response.statusText}`);
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching or parsing JSON data:', error);
      }
  }
  


  function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!containerElement) {
        console.error("Invalid container element");
        return;
    }

    containerElement.innerHTML = ''; // Clear existing content

    projects.forEach(project => {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
        `;
        containerElement.appendChild(article);
    });
  }


  async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  }


  

  /* end of particular type of development process */

    // setColorScheme();
    createNavigation();
    createColorSchemeSwitcher();
});
  
  
