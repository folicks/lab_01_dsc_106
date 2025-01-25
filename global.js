console.log('IT\'S ALIVE!');

// Utility function to get an array of matching elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Define the list of pages for automatic navigation
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'about/', title: 'About' },
  { url: 'contact/', title: 'Contact' }
  // Add or modify pages as needed
];

// Detect if we're on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create and add navigation menu automatically
function createNavigation() {
  let nav = document.createElement('nav');
  document.body.prepend(nav);

  for (let p of pages) {
    let url = p.url;
    
    // Adjust URL for non-home pages
    if (!ARE_WE_HOME && !url.startsWith('http')) {
      url = '../' + url;
    }

    // Create link element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = p.title;

    // Add current class and external link handling
    a.classList.toggle(
      'current', 
      a.host === location.host && a.pathname === location.pathname
    );

    // Open external links in new tab
    if (a.host !== location.host) {
      a.target = '_blank';
    }

    nav.append(a);
  }
}

// Create color scheme switcher
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

// Setup form handling for contact page
function setupContactForm() {
  const form = document.querySelector('form');
  
  form?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const data = new FormData(form);
    const baseUrl = form.action;
    const params = [];

    for (let [name, value] of data) {
      params.push(`${name}=${encodeURIComponent(value)}`);
    }

    const url = `${baseUrl}?${params.join('&')}`;
    location.href = url;
  });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
  createNavigation();
  createColorSchemeSwitcher();
  setupContactForm();
});