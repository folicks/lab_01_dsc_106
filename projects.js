// import { fetchJSON, renderProjects } from '../global.js';

// (async function () {
//     const projects = await fetchJSON('../lib/projects.json');
//     const projectsContainer = document.querySelector('.projects');

//     if (projects && projects.length > 0) {
//         renderProjects(projects, projectsContainer, 'h2');
        
//         // Count and update project title
//         const projectsTitle = document.querySelector('.projects-title');
//         if (projectsTitle) {
//             projectsTitle.textContent = `Projects (${projects.length})`;
//         }
//     } else {
//         projectsContainer.innerHTML = '<p>No projects found.</p>';
//     }
// })();
