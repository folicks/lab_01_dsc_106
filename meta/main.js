import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let data = [];
let commits = [];
let xScale, yScale, rScale;
let selectedCommits = [];

// Scrollytelling variables
let NUM_ITEMS = 100; // Will be set to commits.length
let ITEM_HEIGHT = 150; // Updated to match our CSS height for items
let VISIBLE_COUNT = 10;
let totalHeight;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
const itemsContainer = d3.select('#items-container');

// let lines = filteredCommits.flatMap((d) => d.lines);
// let files = [];
// files = d3
//   .groups(lines, (d) => d.file)
//   .map(([name, lines]) => {
//     return { name, lines };
//   });
// d3.select('.files').selectAll('div').remove(); // don't forget to clear everything first so we can re-render
// let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');

// filesContainer.append('dt').append('code').text(d => ...); // TODO
// filesContainer.append('dd').text(d => ...); // TODO


function updateFileDetails(filteredData) {
    // Create color scale for file types
    const fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
    
    // First group by file to get the mapping of files to their types
    const filePathGroups = d3.group(filteredData, d => d.file);
    
    // Create a map of file paths and their types/lines
    let fileStats = Array.from(filePathGroups, ([filePath, lines]) => {
        // Get the type from the file extension
        const type = filePath.split('.').pop();
        return {
            name: filePath,  // Full file path
            type: type,      // File type (js, css, html)
            lineChanges: lines.length,
            lines: Array(lines.length).fill({ type }) // Create array of line objects with type info
        };
    });

    // Sort files by line count in descending order
    fileStats = d3.sort(fileStats, d => -d.lineChanges);

    // Group by type for totals
    const filesByType = d3.group(fileStats, d => d.type);
    const typeStats = Array.from(filesByType, ([type, files]) => {
        return {
            type: type,
            // Sort files within each type by line count
            files: d3.sort(files, d => -d.lineChanges),
            totalLines: d3.sum(files, f => f.lineChanges)
        };
    });

    // Calculate grand total
    const totalLines = d3.sum(fileStats, d => d.lineChanges);

    // Sort types by total lines descending
    typeStats.sort((a, b) => b.totalLines - a.totalLines);

    // Update the DOM
    const fileContainer = d3.select('.files');
    fileContainer.selectAll('div').remove();

    // Create a group for each type
    const typeGroups = fileContainer.selectAll('div.type-group')
        .data(typeStats)
        .enter()
        .append('div')
        .attr('class', 'type-group');

    // Add type header with total
    typeGroups.append('dt')
        .append('code')
        .text(d => `${d.type} (${d.totalLines} lines, ${(d.totalLines / totalLines * 100).toFixed(1)}% of total)`);

    // Add individual files under each type
    const fileDivs = typeGroups.selectAll('div.file')
        .data(d => d.files)
        .enter()
        .append('div')
        .attr('class', 'file')
        .style('margin-left', '20px');

    fileDivs.append('dt')
        .append('code')
        .text(d => d.name);

    // Create unit visualization with colored dots
    const ddElements = fileDivs.append('dd');
    
    ddElements.selectAll('div.line')
        .data(d => d.lines)
        .enter()
        .append('div')
        .attr('class', 'line')
        .style('background', d => fileTypeColors(d.type));
}

function renderItems(startIndex) {
    // Clear previous items
    itemsContainer.selectAll('div').remove();
    
    // Calculate the end index for slicing
    const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
    const visibleCommits = commits.slice(startIndex, endIndex);
    
    // Update the scatterplot to show only the visible commits
    updateScatterPlot(visibleCommits);
    
    // Ensure container has proper height to fit all commits
    const containerHeight = commits.length * ITEM_HEIGHT;
    itemsContainer.style('height', `${containerHeight}px`);
    
    // Re-bind the commit data to the container and represent each using a div
    const items = itemsContainer.selectAll('div')
        .data(commits)
        .enter()
        .append('div')
        .attr('class', 'item')
        .style('position', 'absolute')
        .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
        .style('width', '95%')
        .classed('visible', (d, i) => i >= startIndex && i < endIndex);
    
    // Add narrative text to each item
    items.each(function(d, i) {
        const item = d3.select(this);
        const fileCount = d3.rollups(d.lines, D => D.length, d => d.file).length;
        
        // Format date nicely
        const dateStr = d.datetime.toLocaleString("en", {
            dateStyle: "full", 
            timeStyle: "short"
        });
        
        // Create narrative text - first commit gets special text
        // Now that we've sorted chronologically, the first commit (index 0) is actually the oldest
        const isFirstCommit = i === 0;
        const commitText = isFirstCommit 
            ? 'my first commit, and it was glorious' 
            : 'another glorious commit';
        
        // Add paragraph with commit info
        item.append('p')
            .html(`On ${dateStr}, I made <a href="${d.url || '#'}" target="_blank">${commitText}</a>. 
                   I edited ${d.totalLines} lines across ${fileCount} files. 
                   Then I looked over all I had made, and I saw that it was very good.`);
                   
        // Add special styling for first commit
        if (isFirstCommit) {
            item.classed('first-commit', true);
        }
                   
        // Make item clickable to highlight corresponding point in chart
        item.on('mouseover', function() {
            // Only highlight in chart if this commit is currently visible in the plot
            if (visibleCommits.some(c => c.id === d.id)) {
                d3.select('#chart').selectAll('circle')
                    .filter(c => c.id === d.id)
                    .classed('selected', true)
                    .attr('fill', '#ff6b6b') // Change color on hover
                    .each(c => updateTooltipContent(c));
                    
                // Show tooltip
                const tooltip = d3.select('#commit-tooltip')
                    .style('opacity', 1)
                    .style('visibility', 'visible')
                    .style('display', 'block');
            }
        })
        .on('mouseout', function() {
            d3.select('#chart').selectAll('circle')
                .filter(c => c.id === d.id)
                .classed('selected', false)
                .attr('fill', '#4285f4'); // Reset color
                
            // Hide tooltip after delay
            setTimeout(() => {
                d3.select('#commit-tooltip')
                    .style('opacity', 0)
                    .style('visibility', 'hidden');
            }, 200);
        });
    });
    
    // Update the files display based on visible commits
    displayCommitFiles(visibleCommits);
    
    // Log visible commits for debugging
    console.log(`Displaying commits ${startIndex} to ${endIndex-1} of ${commits.length}`);
}

function displayCommitFiles(filteredCommits) {
    const lines = filteredCommits.flatMap(d => d.lines);
    const fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
    const files = d3.groups(lines, d => d.file).map(([name, lines]) => {
        return { name, lines };
    });
    const sortedFiles = d3.sort(files, d => -d.lines.length);
    
    d3.select('.files').selectAll('div').remove();
    const filesContainer = d3.select('.files').selectAll('div')
        .data(sortedFiles)
        .enter()
        .append('div');
    
    filesContainer.append('dt')
        .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
    
    filesContainer.append('dd')
        .selectAll('div')
        .data(d => d.lines)
        .enter()
        .append('div')
        .attr('class', 'line')
        .style('background', d => fileTypeColors(d.type));
}

async function loadData() {
    try {
        // Load CSV data
        data = await d3.csv('./loc.csv', (row) => ({
            ...row,
            line: Number(row.line),
            depth: Number(row.depth),
            commit: row.commit,
            length: Number(row.length),
            date: new Date(row.date + 'T00:00' + row.timezone),
            datetime: new Date(row.date + 'T' + row.time + row.timezone),
            hourFrac: new Date(`1970-01-01T${row.time}Z`).getHours() +
                      new Date(`1970-01-01T${row.time}Z`).getMinutes() / 60,
        }));

        // Process commit data
        processCommits();
        
        // Display initial stats for all data
        displayStats();
        
        // Update global variables for scrollytelling
        NUM_ITEMS = commits.length;
        totalHeight = NUM_ITEMS * ITEM_HEIGHT;
        
        // Set the height of spacer element to allow scrolling
        spacer.style('height', `${totalHeight}px`);
        
        // Initial render of items
        renderItems(0);
        
        // Initialize scrollytelling
        setupScrollytelling();
        
        console.log(`Loaded ${commits.length} commits`);
    } catch (e) {
        console.error('Error loading or processing data:', e);
    }
}

function processCommits() {
    // Group data by commit ID
    const commitGroups = d3.group(data, d => d.commit);
    
    // Convert to array of commits with their lines
    commits = Array.from(commitGroups, ([id, lines]) => {
        // Use the first line's date as the commit date (they should all be the same)
        const firstLine = lines[0];
        return {
            id,
            author: firstLine.author,
            date: firstLine.date,
            datetime: firstLine.datetime,
            time: firstLine.time,
            timezone: firstLine.timezone,
            hourFrac: firstLine.hourFrac,
            lines,
            totalLines: lines.length
        };
    });
    
    // Sort commits chronologically by date (oldest first)
    commits.sort((a, b) => a.datetime - b.datetime);
    
    console.log(`Processed ${commits.length} commits`);
}

function getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
        return 'Morning';
    } else if (hour >= 12 && hour < 17) {
        return 'Afternoon';
    } else if (hour >= 17 && hour < 21) {
        return 'Evening';
    } else {
        return 'Night';
    }
}

function getDayOfWeek(date) {
    return date.toLocaleString('en-US', { weekday: 'long' });
}

function updateStats(filteredCommits) {
    const statsContainer = d3.select('#stats');
    statsContainer.html(''); 

    // Get all lines from filtered commits
    const filteredData = filteredCommits.flatMap(commit => 
        commit.lines.map(line => ({
            ...line,
            datetime: commit.datetime
        }))
    );

    const dl = statsContainer.append('dl').attr('class', 'stats');

    // Total LOC (matching original calculation)
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(filteredData.length);

    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(filteredCommits.length);

    // Number of files (matching original calculation)
    const numberOfFiles = d3.group(filteredData, d => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numberOfFiles);

    // Maximum file length (matching original calculation)
    const fileLengths = d3.rollups(
        filteredData,
        v => v.length,
        d => d.file
    );
    const maxFileLength = d3.max(fileLengths, d => d[1]);
    dl.append('dt').text('Maximum file length');
    dl.append('dd').text(`${maxFileLength} lines`);

    // Average file length (matching original calculation)
    const averageFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(`${averageFileLength.toFixed(0)} lines`);

    // Day of week stats (matching original calculation)
    const workByDayOfWeek = d3.rollups(
        filteredData,
        v => v.length,
        d => getDayOfWeek(d.datetime)
    );
    const maxDayOfWeek = d3.greatest(workByDayOfWeek, d => d[1]);
    dl.append('dt').text('Day with most work');
    dl.append('dd').text(`${maxDayOfWeek[0]} (${maxDayOfWeek[1]} lines)`);

    // Max depth (matching original calculation)
    const maxDepth = d3.max(filteredData, d => d.line);
    dl.append('dt').text('Max Depth');
    dl.append('dd').text(maxDepth);

    // Time of day stats (matching original calculation)
    const timeOfDayCounts = d3.rollup(
        filteredData,
        v => v.length,
        d => getTimeOfDay(d.datetime)
    );
    const mostFrequentTimeOfDay = d3.max(Array.from(timeOfDayCounts), d => d[1]);
    const timeOfDay = Array.from(timeOfDayCounts).find(
        d => d[1] === mostFrequentTimeOfDay
    );
    dl.append('dt').text('Most Frequent Time of Day');
    dl.append('dd').text(`${timeOfDay[0]} (${timeOfDay[1]} lines)`);
}

function displayStats() {
    // Display stats for all data
    const statsContainer = d3.select('#stats');
    statsContainer.html('');
    
    const dl = statsContainer.append('dl').attr('class', 'stats');

    // Total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Total commits
    const commitCount = d3.group(data, d => d.commit).size;
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commitCount);

    // Number of files
    const numberOfFiles = d3.group(data, d => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numberOfFiles);

    // Maximum file length
    const fileLengths = d3.rollups(
        data,
        v => v.length,
        d => d.file
    );
    const maxFileLength = d3.max(fileLengths, d => d[1]);
    dl.append('dt').text('Maximum file length');
    dl.append('dd').text(`${maxFileLength} lines`);

    // Average file length
    const averageFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Average file length');
    dl.append('dd').text(`${averageFileLength.toFixed(0)} lines`);

    // Day of the week that most work is done
    const workByDayOfWeek = d3.rollups(
        data,
        v => v.length,
        d => getDayOfWeek(d.datetime)
    );
    const maxDayOfWeek = d3.greatest(workByDayOfWeek, d => d[1]);
    dl.append('dt').text('Day with most work');
    dl.append('dd').text(`${maxDayOfWeek[0]} (${maxDayOfWeek[1]} lines)`);

    // Max depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max Depth');
    dl.append('dd').text(maxDepth);

    // Most frequent time of day
    const timeOfDayCounts = d3.rollup(
        data,
        v => v.length,
        d => getTimeOfDay(d.datetime)
    );
    const mostFrequentTimeOfDay = d3.max(Array.from(timeOfDayCounts), d => d[1]);
    const timeOfDay = Array.from(timeOfDayCounts).find(
        d => d[1] === mostFrequentTimeOfDay
    );
    dl.append('dt').text('Most Frequent Time of Day');
    dl.append('dd').text(`${timeOfDay[0]} (${timeOfDay[1]} lines)`);
}

function updateTooltipContent(commit) {
    if (!commit) return;
    
    const tooltip = document.getElementById('commit-tooltip');
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    // Update tooltip content
    link.href = commit.url || '#';
    link.textContent = commit.id || 'Unknown';
    
    // Format date nicely
    date.textContent = commit.datetime ? commit.datetime.toLocaleString('en', {
        dateStyle: 'full'
    }) : 'Unknown date';
    
    // Format time nicely
    time.textContent = commit.datetime ? commit.datetime.toLocaleString('en', {
        timeStyle: 'medium'
    }) : 'Unknown time';
    
    author.textContent = commit.author || 'Unknown author';
    
    // Show total lines and file count
    if (commit.lines && Array.isArray(commit.lines)) {
        const fileCount = d3.rollups(commit.lines, D => D.length, d => d.file).length;
        lines.textContent = `${commit.totalLines} lines across ${fileCount} files`;
    } else {
        lines.textContent = `${commit.totalLines || 0} lines`;
    }
    
    // Ensure tooltip is styled properly
    tooltip.style.display = 'block';
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = 1;
}

function updateScatterPlot(plotData) {
    // If no plot data is provided, use an empty array
    plotData = plotData || [];
    
    d3.select('#chart').selectAll('*').remove(); // Clear previous plot

    const width = 1200;
    const height = 700;

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('width', '100%')
        .style('height', 'auto')
        .style('min-height', '500px')
        .style('overflow', 'visible');

    // Get extent of visible commit dates for x-axis scaling
    // Only use the currently visible commits for the scale
    const dateExtent = plotData.length > 0 
        ? d3.extent(plotData, d => d.datetime) 
        : d3.extent(commits, d => d.datetime);
    
    // Add padding to the date extent (5% on each side)
    const dateRange = dateExtent[1] - dateExtent[0];
    const datePadding = dateRange * 0.05;
    const paddedDateExtent = [
        new Date(dateExtent[0] - datePadding),
        new Date(dateExtent[1] + datePadding)
    ];
    
    // Set up scales
    xScale = d3.scaleTime().domain(paddedDateExtent).range([0, width]).nice();
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    // Calculate the range of edited lines for visible commits
    const [minLines, maxLines] = plotData.length > 0
        ? d3.extent(plotData, d => d.totalLines)
        : d3.extent(commits, d => d.totalLines);

    // Create a set of visible commit IDs for fast lookup
    const visibleCommitIds = new Set(plotData.map(d => d.id));

    // Circle size scale
    const sizeScale = d3
        .scaleSqrt()
        .domain([minLines || 1, maxLines || 100])
        .range([5, 30]);

    // Add gridlines
    svg.append('g')
        .attr('class', 'gridlines')
        .selectAll('line')
        .data(d3.range(0, 25, 6)) // Hours: 0, 6, 12, 18, 24
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', '#ddd')
        .attr('stroke-dasharray', '2,2');

    // Add x axis (date)
    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    // Add y axis (hour of day)
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(12))
        .append('text')
        .attr('y', -20)
        .attr('x', -10)
        .attr('fill', '#000')
        .text('Hour of Day');

    // Create a tooltip
    const tooltip = d3.select('#commit-tooltip');

    // Plot only the visible commits
    svg.selectAll('circle')
        .data(plotData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => sizeScale(d.totalLines))
        .attr('fill', '#4285f4')
        .attr('opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .classed('visible-commit', true)
        .on('mouseover', function(event, d) {
            // Highlight the current circle
            d3.select(this)
                .attr('fill', '#ff6b6b') // Change to red on hover
                .attr('stroke', '#000')
                .attr('stroke-width', 2)
                .attr('opacity', 1)
                .raise();
                
            // Highlight corresponding item in scroll list
            d3.selectAll('.item').filter(item => item.id === d.id)
                .classed('selected', true)
                .raise();
                
            // Update and show tooltip
            updateTooltipContent(d);
            tooltip
                .style('opacity', 1)
                .style('visibility', 'visible')
                .style('display', 'block')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', function(event, d) {
            // Reset current circle
            d3.select(this)
                .attr('fill', '#4285f4')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .attr('opacity', 0.8);
                
            // Remove highlight from scroll items
            d3.selectAll('.item')
                .filter(item => item.id === d.id)
                .classed('selected', false);
                
            // Hide tooltip after delay
            setTimeout(() => {
                tooltip
                    .style('opacity', 0)
                    .style('visibility', 'hidden');
            }, 200);
        })
        .on('mousemove', function(event) {
            // Move tooltip with cursor
            tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`);
        });
        
    // Add title to the chart
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Commits by Time of Day');
}

let brushSelection = null;
function brushed(event) {
    // The selection is an array like [[x0, y0], [x1, y1]]
    // or null if the user clears the brush
    brushSelection = event.selection;
    selectedCommits = !brushSelection ? [] : commits.filter((commit => {

        const [[x0, y0], [x1, y1]] = brushSelection;

        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);

        // Check if the commit's x/y is within the brushed box
        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    }));

    // Update visuals
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function brushSelector() {
    const svg = document.querySelector('svg');

    // Attach brush with event handlers
    const brush = d3.brush().on('start brush end', brushed);

    // Call the brush
    d3.select(svg).call(brush);

    // Raise the dots so that they remain clickable
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}
function isCommitSelected(commit) {
    //  if (!brushSelection) return false; // If no selection, nothing is selected
    //  const [[x0, y0], [x1, y1]] = brushSelection;
    //  const x = xScale(commit.datetime);
    //  const y = yScale(commit.hourFrac);
    //  // Check if the commit's x/y is within the brushed box
    //  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    return selectedCommits.includes(commit);
}

function updateSelection() {
    d3.selectAll('circle')
        .classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
        selectedCommits.length || 'No'
    } commits selected`;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById('language-breakdown');

    // If no commits are selected, clear the breakdown
    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Flatten out all lines from all selected commits
    const lines = selectedCommits.flatMap((d) => d.lines);

    // Roll up by language
    const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);

    container.innerHTML = '';
    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);
        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }
}

// Set up scrollytelling event handling
function setupScrollytelling() {
    // Set up scroll event listener
    scrollContainer.on('scroll', function() {
        const scrollTop = this.scrollTop;
        const scrollHeight = this.scrollHeight;
        const containerHeight = this.offsetHeight;
        
        // Calculate the visible range of commits
        const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
        const endIndex = Math.min(startIndex + visibleCount, commits.length);
        
        // Get the currently visible commits
        const visibleCommits = commits.slice(startIndex, endIndex);
        
        // Update the item visibility classes
        d3.selectAll('.item')
            .classed('visible', (d, i) => i >= startIndex && i < endIndex);
        
        // Update scatterplot to show only visible commits with appropriate scaling
        updateScatterPlot(visibleCommits);
        
        // Update files display with visible commits
        displayCommitFiles(visibleCommits);
        
        // Log scroll info for debugging
        console.log(`Scroll position: ${scrollTop}, Visible commits: ${startIndex}-${endIndex-1} of ${commits.length}`);
    });
    
    // Set initial container dimensions
    itemsContainer.style('height', `${commits.length * ITEM_HEIGHT}px`);
    
    // Trigger initial scroll event to set up initial view
    setTimeout(() => {
        const scrollEvent = new Event('scroll');
        scrollContainer.node().dispatchEvent(scrollEvent);
    }, 100);
}

// Initial setup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Load data
    await loadData();
    
    // Set up tooltip positioning
    document.addEventListener('mousemove', function(event) {
        const tooltip = document.getElementById('commit-tooltip');
        if (tooltip.style.opacity === '1') {
            // Position tooltip near cursor but avoid edge of screen
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            let leftPos = event.pageX + 15;
            let topPos = event.pageY + 15;
            
            // Adjust if too close to right edge
            if (leftPos + tooltipWidth > windowWidth - 20) {
                leftPos = Math.max(20, event.pageX - tooltipWidth - 15);
            }
            
            // Adjust if too close to bottom edge
            if (topPos + tooltipHeight > windowHeight - 20) {
                topPos = Math.max(20, event.pageY - tooltipHeight - 15);
            }
            
            tooltip.style.left = leftPos + 'px';
            tooltip.style.top = topPos + 'px';
        }
    });
    
    // Set global event to hide tooltip when clicking anywhere else
    document.addEventListener('click', function(event) {
        const tooltip = document.getElementById('commit-tooltip');
        const chart = document.getElementById('chart');
        
        // Hide tooltip when clicking outside chart or tooltip
        if (!event.target.closest('#chart') && !event.target.closest('#commit-tooltip')) {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            
            // Reset any selected circles
            d3.selectAll('circle').classed('selected', false);
            d3.selectAll('.item').classed('selected', false);
        }
    });
});