import { fetchJSON, renderProjects } from '../globalStep3.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Global state management for projects and selection
let allProjects = [];
let selectedIndex = -1;
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

// Visualization dimensions setup
const width = 150;
const height = 150;
const radius = Math.min(width, height) / 2;

// Initialize SVG container with proper positioning
const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

const g = svg.append('g')
    .attr('transform', `translate(${width / 2 - 100}, ${height / 2 - 100})`);

// Configure arc generator for pie segments
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

// Color scale for pie segments
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsToShow) {
    // Prepare data for pie chart
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

    // Clear existing elements
    g.selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();

    // Create pie segments with interaction handlers
    const paths = g.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => i === selectedIndex ? 'magenta' : colors(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer') // Indicate clickable
        .attr('class', (d, i) => i === selectedIndex ? 'selected' : '')
        .style('transition', '300ms') // Smooth transitions
        .on('click', (event, d, i) => handleSegmentClick(d, i));

    // Create and update legend
    const legend = d3.select('.legend');
    pieData.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${idx === selectedIndex ? 'magenta' : colors(idx)}`)
            .attr('class', idx === selectedIndex ? 'selected' : '')
            .attr('cursor', 'pointer')
            .html(`<span class="swatch" style="background-color: ${idx === selectedIndex ? 'magenta' : colors(idx)}"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', () => handleSegmentClick(d, idx));
    });
}

function handleSegmentClick(d, index) {
    // Toggle selection state
    if (selectedIndex === index) {
        // Deselect current segment
        selectedIndex = -1;
        filterAndUpdateProjects(allProjects);
    } else {
        // Select new segment
        selectedIndex = index;
        const selectedYear = d.data.label;
        const filteredProjects = allProjects.filter(project => 
            project.year === selectedYear
        );
        filterAndUpdateProjects(filteredProjects);
    }

    // Update visual states
    updateSelectionState();
}

function updateSelectionState() {
    // Update pie segments
    g.selectAll('path')
        .attr('class', (d, i) => i === selectedIndex ? 'selected' : '')
        .attr('fill', (d, i) => i === selectedIndex ? 'magenta' : colors(i))
        .style('opacity', (d, i) => 
            selectedIndex === -1 || i === selectedIndex ? 1 : 0.5
        );

    // Update legend items
    d3.select('.legend')
        .selectAll('li')
        .attr('class', (d, i) => i === selectedIndex ? 'selected' : '')
        .attr('style', (d, i) => `--color:${i === selectedIndex ? 'magenta' : colors(i)}`)
        .style('opacity', (d, i) => 
            selectedIndex === -1 || i === selectedIndex ? 1 : 0.5
        );
}

function filterAndUpdateProjects(projectsToShow) {
    renderProjects(projectsToShow, projectsContainer, 'h2');
    updateProjectCount(projectsToShow.length);
}

function updateProjectCount(count) {
    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.textContent = `Projects (${count})`;
    }
}

// Initialize application
async function init() {
    try {
        // Load initial data
        allProjects = await fetchJSON('../lib/project.json');
        
        if (allProjects && allProjects.length > 0) {
            // Initial render
            filterAndUpdateProjects(allProjects);
            renderPieChart(allProjects);
            
            // Setup search functionality
            searchInput.addEventListener('input', (event) => {
                const query = event.target.value.toLowerCase();
                const filteredProjects = allProjects.filter(project => {
                    const values = Object.values(project).join('\n').toLowerCase();
                    return values.includes(query);
                });
                
                // Reset selection when searching
                selectedIndex = -1;
                if (filteredProjects.length === 0) {
                    // If no matches found, show all projects and default pie chart
                    projectsContainer.innerHTML = '<p>No matching projects found.</p>';
                    filterAndUpdateProjects(allProjects);
                    renderPieChart(allProjects);
                } else {
                    // Show filtered projects and update pie chart
                    filterAndUpdateProjects(filteredProjects);
                    renderPieChart(filteredProjects);
                }
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










