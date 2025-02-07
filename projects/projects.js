


import { fetchJSON, renderProjects } from '../globalStep3.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';



let data = [1, 2];
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arcData = [];
let total = 0;
let angle = 0;

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


let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
});

d3.select('svg').append('path').attr('d', arc).attr('fill', 'blue');


for (let d of data) {
    total += d;
}



for (let d of data) {
    let endAngle = angle + (d / total) * 2 * Math.PI;
    arcData.push({ startAngle: angle, endAngle });
    angle = endAngle;
}

let arcs = arcData.map((d) => arcGenerator(d));

// arcs.forEach(arc => {
//     g.append("path")
//       .attr('d', arc)
//       .attr('fill',"blue");

// })


// let colors = ['gold', 'purple'];

// arcs.forEach((arc, idx) => {
//     d3.select('svg g')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors[idx]);
// });
