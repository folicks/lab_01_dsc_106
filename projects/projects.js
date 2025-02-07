import { fetchJSON, renderProjects } from '../globalStep3.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

(async function () {
    const projects = await fetchJSON('../lib/project.json');
    const projectsContainer = document.querySelector('.projects');

    if (projects && projects.length > 0) {
        renderProjects(projects, projectsContainer, 'h2');
        
        // Count and update project title
        const projectsTitle = document.querySelector('.projects-title');
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }
    } else {
        projectsContainer.innerHTML = '<p>No projects found.</p>';
    }
})();

let data = [1, 2];
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));



let svg = d3.select('svg');
let g = svg.append('g')
    .attr('transform', 'translate(0, 0)');


let colors = ['gold', 'purple'];

arcs.forEach((arc, idx) => {
    d3.select('svg g')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors[idx]);
});








