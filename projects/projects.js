import { fetchJSON, renderProjects } from '../globalStep3.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';


/*
// let data = [1, 2, 3, 4, 5, 5];
let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
];
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let sliceGenerator = d3.pie();
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));



let svg = d3.select('svg');
let g = svg.append('g')
    .attr('transform', 'translate(0, 0)');


let colors = d3.scaleOrdinal(d3.schemeTableau10);
// RQ :  why does it need to be an () vs a []

arcs.forEach((arc, idx) => {
    d3.select('svg g')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})
// TODO fix the css on the left border to make more proportional



let projects = await fetchJSON('../lib/project.json');

// let projects = d3.select("article.projects");
// console.log(projects.length);
// let projectData = projects.nodes();



let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);


console.log(rolledData)
*/














/* start of particular type of development*/

//
//

//
/*
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



let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {  // 'input' for real-time updates
    query = event.target.value.toLowerCase();

    // Filter projects (using the SAME projects array fetched earlier)
    let filteredProjects = projects.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(query);
        const descriptionMatch = project.description?.toLowerCase().includes(query) || false;
        return titleMatch || descriptionMatch;
    });

    renderProjects(filteredProjects, projectsContainer, 'h2'); // Re-render with filtered data
});


let filteredProjects = projects.filter((project) => project.title.toLowerCase().includes(query));

let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
});

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
});


renderPieChart(projects);

searchInput.addEventListener('change', (event) => {
  let filteredProjects = setQuery(event.target.value);
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});



function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let newData = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));

    let svg = d3.select('svg');
    let g = svg.select('g');

    // Clear previous chart
    g.selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    newArcs.forEach((arc, idx) => {
        g.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx));
    });

    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

*/
/* Remember to reset/clean-up your <svg> and legend as you filter your projects and render new pie chart and legends. Here’s one way you can do this:

let newSVG = d3.select('svg'); 
newSVG.selectAll('path').remove();
Then you are free to reactively attach new paths to newSVG! */



// Pie Chart Rendering
// function renderPieChart(projectsGiven) {
//     let rolledData = d3.rollups(
//         projectsGiven,
//         (v) => v.length,
//         (d) => d.year
//     );

//     let newData = rolledData.map(([year, count]) => ({
//         value: count,
//         label: year
//     }));

//     let newSliceGenerator = d3.pie().value((d) => d.value);
//     let newArcData = newSliceGenerator(newData);
//     let svg = d3.select('svg');
//     let g = svg.select('g');

//     // Clear previous chart
//     g.selectAll('path').remove();
//     d3.select('.legend').selectAll('li').remove();

//     let colors = d3.scaleOrdinal(d3.schemeTableau10);
//     newArcData.forEach((d, idx) => {
//         g.append('path')
//             .attr('d', arcGenerator(d))
//             .attr('fill', colors(idx));
//     });

//     let legend = d3.select('.legend');
//     newData.forEach((d, idx) => {
//         legend.append('li')
//             .attr('style', `--color:${colors(idx)}`)
//             .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
//     });
// }

//  let data = [1, 2, 3, 4, 5, 5];



// Global state
let projects = [];
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

// Initialize visualization dimensions
const width = 150;
const height = 150;
const radius = Math.min(width, height) / 2;

// Set up the SVG
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

/* const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);


 */


const g = svg.append('g')
    .attr('transform', `translate(${width / 2 - 100}, ${height / 2 - 100})`);
// Arc generator
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

// Color scale
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsToShow) {
    // Calculate data for visualization
    const rolledData = d3.rollups(
        projectsToShow,
        v => v.length,
        d => d.year
    );

    const pieData = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    // Generate pie layout
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arcData = pie(pieData);

    // Clear previous chart
    g.selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();

    // Add new paths
    g.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => colors(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .on('click', (event, d) => {
            filterProjectsByYear(d.data.label);
        });

    // Update legend
    const legend = d3.select('.legend');
    pieData.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', () => {
                filterProjectsByYear(d.label);
            });
    });
}

function filterProjectsByYear(year) {
    const filteredProjects = projects.filter(project => project.year === year);
    renderProjects(filteredProjects, projectsContainer, 'h2');
    updateProjectCount(filteredProjects.length);
}

function filterProjectsBySearch(query) {
    const filteredProjects = projects.filter(project => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
    updateProjectCount(filteredProjects.length);
}

function updateProjectCount(count) {
    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.textContent = `Projects (${count})`;
    }
}

// Initialize the application
async function init() {
    try {
        projects = await fetchJSON('../lib/project.json');
        
        if (projects && projects.length > 0) {
            renderProjects(projects, projectsContainer, 'h2');
            renderPieChart(projects);
            updateProjectCount(projects.length);
            
            // Set up search handler after data is loaded
            searchInput.addEventListener('input', (event) => {
                filterProjectsBySearch(event.target.value);
            });
        } else {
            projectsContainer.innerHTML = '<p>No projects found.</p>';
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }
}

// Start the application
init();





























/*

(async function () {
    projects = await fetchJSON('../lib/project.json'); // Assign to global variable
    const projectsContainer = document.querySelector('.projects');

    if (projects && projects.length > 0) {
        renderProjects(projects, projectsContainer, 'h2');
        
        const projectsTitle = document.querySelector('.projects-title');
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }
    } else {
        projectsContainer.innerHTML = '<p>No projects found.</p>';
    }
})();

// Search Functionality
function filterAndRenderProjects(query) {
    const filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    renderPieChart(filteredProjects);
}

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    filterAndRenderProjects(event.target.value);
});
let projects = [];
let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
];
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let sliceGenerator = d3.pie();
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));



let svg = d3.select('svg');
let g = svg.append('g')
    .attr('transform', 'translate(0, 0)');


let colors = d3.scaleOrdinal(d3.schemeTableau10);
// RQ :  why does it need to be an () vs a []

arcs.forEach((arc, idx) => {
    d3.select('svg g')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})
// TODO fix the css on the left border to make more proportional



// let projects = await fetchJSON('../lib/project.json');

// let projects = d3.select("article.projects");
// console.log(projects.length);
// let projectData = projects.nodes();



let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);
*/