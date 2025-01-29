import { fetchJSON, renderProjects } from '../globalStep3.js';
//  TODO check the wateva is the most recent file used for lab03

const projects = await fetchJSON('../lib/projects.json');
const latestProjects = projects.slice(0, 3);
// TODO make your projects into JSON (direct import of ipynb?)

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');
// TODO do i need to make this call for actual output end product or check?



const githubData = await fetchGitHubData('folicks');

const profileStats = document.querySelector('#profile-stats');


// https://api.github.com/users/folicks