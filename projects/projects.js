

/* 
import { fetchJSON, renderProjects } from '../globalStep3.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';



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

// const g = svg.append('g')
//     .attr('transform', `translate(${width / 2}, ${height / 2})`);





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


 */
import { fetchJSON, renderProjects } from '../globalStep3.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Global state
let allProjects = []; // Store all projects
let currentProjects = []; // Store filtered projects
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

const g = svg.append('g')
    .attr('transform', `translate(${width / 2 - 100}, ${height / 2 - 100})`);

// Arc generator
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

// Color scale
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsToShow, maintainOriginal = false) {
    // If maintainOriginal is true and there are no projects to show,
    // use allProjects instead
    const dataToVisualize = (maintainOriginal && projectsToShow.length === 0) 
        ? allProjects 
        : projectsToShow;

    // Calculate data for visualization
    const rolledData = d3.rollups(
        dataToVisualize,
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
        const opacity = (maintainOriginal && projectsToShow.length === 0) ? 0.5 : 1;
        legend.append('li')
            .attr('style', `--color:${colors(idx)}; opacity: ${opacity}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', () => {
                filterProjectsByYear(d.label);
            });
    });
}

function filterProjectsByYear(year) {
    currentProjects = allProjects.filter(project => project.year === year);
    renderProjects(currentProjects, projectsContainer, 'h2');
    renderPieChart(currentProjects);
    updateProjectCount(currentProjects.length);
}

function filterProjectsBySearch(query) {
    if (!query.trim()) {
        // If search is empty, show all projects
        currentProjects = [...allProjects];
        renderProjects(currentProjects, projectsContainer, 'h2');
        renderPieChart(currentProjects);
        updateProjectCount(currentProjects.length);
        return;
    }

    const filteredProjects = allProjects.filter(project => {
        const values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    
    currentProjects = filteredProjects;
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects, true); // Pass true to maintain original chart
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
        allProjects = await fetchJSON('../lib/project.json');
        currentProjects = [...allProjects];
        
        if (allProjects && allProjects.length > 0) {
            renderProjects(allProjects, projectsContainer, 'h2');
            renderPieChart(allProjects);
            updateProjectCount(allProjects.length);
            
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




















