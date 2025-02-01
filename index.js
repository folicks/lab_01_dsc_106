
import { fetchJSON, renderProjects } from './globalStep3.js';
//  TODO check the wateva is the most recent file used for lab03

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
// TODO make your projects into JSON (direct import of ipynb?)

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');
// TODO do i need to make this call for actual output end product or check?



const githubData = await fetchGitHubData('folicks');

const profileStats = document.querySelector('#profile-stats');


// https://api.github.com/users/folicks

/* beginning of particular development process */

(async function () {
    const projects = await fetchJSON('./lib/projects.json');
    if (!projects || projects.length === 0) {
        console.warn("No projects found in JSON file.");
        return;
    }

    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');

    if (projectsContainer) {
        renderProjects(latestProjects, projectsContainer, 'h2');
    } else {
        console.error("Projects container not found.");
    }
})();

import { fetchGitHubData } from './globalStep3.js';

(async function () {
    const githubData = await fetchGitHubData('folicks'); 
    const profileStats = document.querySelector('#profile-stats');

    if (profileStats) {
        profileStats.innerHTML = `
            <h2>GitHub Stats</h2>
            <dl class="profile-grid">
                <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                <dt>Followers:</dt><dd>${githubData.followers}</dd>
                <dt>Following:</dt><dd>${githubData.following}</dd>
            </dl>
        `;
    } else {
        console.error("Profile stats container not found.");
    }
})();

