import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let data = [];
let commits = [];
let xScale, yScale, rScale, timeScale;
let selectedCommits = [];
let commitProgress = 100;
let commitMaxTime;
let filteredCommits = []; // Add filteredCommits as a global variable
let filteredData = []; // Add filteredData to store filtered lines of code

async function loadData() {
    data = await d3.csv('./loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
    processCommits();
    updateTimeScale();
    updateCommitMaxTime();
    updateFilteredCommits(); // Initialize filteredCommits
    updateFilteredData(); // Initialize filteredData
    displayStats(filteredData); // Pass filteredData initially
    createScatterPlot(filteredCommits); // Use filteredCommits initially
    setupTimeSlider();
}

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            let hourFrac = datetime.getHours() + datetime.getMinutes() / 60 + datetime.getSeconds() / 3600;

            return {
                id: commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac,
                totalLines: lines.reduce((sum, d) => sum + d.line, 0),
                lines: lines.map(line => ({
                    type: line.type,
                    line: line.line,
                    file: line.file, // Make sure file is included
                    datetime: line.datetime // Include datetime for filtering
                }))
            };
        });
}

function updateTimeScale() {
    timeScale = d3.scaleTime()
        .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
        .range([0, 100]);
}

function updateCommitMaxTime() {
    commitMaxTime = timeScale.invert(commitProgress);
}

// Add this function to filter commits based on commitMaxTime
function updateFilteredCommits() {
    filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
}

// New function to filter the original data based on commitMaxTime
function updateFilteredData() {
    filteredData = data.filter(d => d.datetime <= commitMaxTime);
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
    const dayIndex = date.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

function displayStats(dataSet) {
    // Clear previous stats
    d3.select('#stats').html('');
    
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(dataSet.length);

    // Get unique commits in the filtered data
    const uniqueCommits = new Set(dataSet.map(d => d.commit)).size;
    dl.append('dt').text('Total commits');
    dl.append('dd').text(uniqueCommits);

    const numberOfFiles = d3.group(dataSet, d => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numberOfFiles);

    const fileLengths = d3.rollups(
        dataSet,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file
    );
    
    if (fileLengths.length > 0) {
        const maxFileLength = d3.max(fileLengths, (d) => d[1]);
        dl.append('dt').text('Maximum file length');
        dl.append('dd').text(`${maxFileLength} lines`);

        const averageFileLength = d3.mean(fileLengths, (d) => d[1]);
        dl.append('dt').text('Average file length');
        dl.append('dd').text(`${averageFileLength.toFixed(0)} lines`);
    } else {
        dl.append('dt').text('Maximum file length');
        dl.append('dd').text('0 lines');
        
        dl.append('dt').text('Average file length');
        dl.append('dd').text('0 lines');
    }

    const workByDayOfWeek = d3.rollups(
        dataSet,
        (v) => v.length,
        (d) => getDayOfWeek(d.datetime)
    );
    
    if (workByDayOfWeek.length > 0) {
        const maxDayOfWeek = d3.greatest(workByDayOfWeek, (d) => d[1]);
        dl.append('dt').text('Day with most work');
        dl.append('dd').text(`${maxDayOfWeek[0]} (${maxDayOfWeek[1]} lines)`);
    } else {
        dl.append('dt').text('Day with most work');
        dl.append('dd').text('None');
    }

    const maxDepth = dataSet.length > 0 ? d3.max(dataSet, (d) => d.depth) : 0;
    dl.append('dt').text('Max Depth');
    dl.append('dd').text(maxDepth);

    const timeOfDayCounts = d3.rollup(
        dataSet,
        (v) => v.length,
        (d) => getTimeOfDay(d.datetime)
    );

    if (timeOfDayCounts.size > 0) {
        const mostFrequentTimeOfDay = d3.max(Array.from(timeOfDayCounts), (d) => d[1]);
        const timeOfDay = Array.from(timeOfDayCounts).find(
            (d) => d[1] === mostFrequentTimeOfDay
        );

        dl.append('dt').text('Most Frequent Time of Day');
        dl.append('dd').text(`${timeOfDay[0]} (${timeOfDay[1]} lines)`);
    } else {
        dl.append('dt').text('Most Frequent Time of Day');
        dl.append('dd').text('None');
    }
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    if (!commit || Object.keys(commit).length === 0) {
        link.href = '';
        link.textContent = '';
        date.textContent = '';
        time.textContent = '';
        author.textContent = '';
        lines.textContent = '';
        return;
    }

    link.href = commit.url || '#';
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

function createScatterPlot(plotData) {
    d3.select('#chart').selectAll('*').remove();

    const width = 1000;
    const height = 600;

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    xScale = d3.scaleTime()
        .domain(d3.extent(plotData, (d) => d.datetime)) // Use plotData
        .range([0, width])
        .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const [minLines, maxLines] = d3.extent(plotData, (d) => d.totalLines); // Use plotData

    rScale = d3.scaleLinear().domain([minLines, maxLines]).range([2, 30]);

    const sortedCommits = d3.sort(plotData, (d) => -d.totalLines); // Use plotData

    const dots = svg.append('g').attr('class', 'dots');
    const tooltip = d3.select('#commit-tooltip');

    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)
        .on('mouseenter', function (event, commit) {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
            d3.select(this).classed('selected', true);
            d3.select(this).style('fill-opacity', 1);
        })
        .on('mousemove', (event) => {
            updateTooltipPosition(event);
        })
        .on('mouseleave', function () {
            updateTooltipContent({});
            updateTooltipVisibility(false);
            d3.select(this).classed('selected', false);
            d3.select(this).style('fill-opacity', 0.7);
        });

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);
        
    // Reapply brush after creating new scatter plot
    brushSelector();
}

let brushSelection = null;

function brushed(event) {
    brushSelection = event.selection;

    selectedCommits = !brushSelection ? [] : filteredCommits.filter(commit => { // Filter based on filteredCommits
        const [[x0, y0], [x1, y1]] = brushSelection;
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);
        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    });

    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

function brushSelector() {
    const svg = document.querySelector('svg');
    const brush = d3.brush().on('start brush end', brushed);
    d3.select(svg).call(brush);
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

function isCommitSelected(commit) {
    return selectedCommits.includes(commit);
}

function updateSelection() {
    d3.selectAll('circle')
        .classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const count = selectedCommits.length;
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${count || 'No'} commits selected`;
}

function updateLanguageBreakdown() {
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }

    const lines = selectedCommits.flatMap((d) => d.lines);
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

function updateDisplayTime(time) {
    const timeElement = document.getElementById('selected-time');
    timeElement.textContent = time.toLocaleString('en', { dateStyle: "long", timeStyle: "short" });
}

function setupTimeSlider() {
    const slider = document.getElementById('time-filter');

    slider.addEventListener('input', function () {
        commitProgress = +this.value;
        updateCommitMaxTime();
        updateFilteredCommits(); // Update filteredCommits
        updateFilteredData(); // Update filteredData
        displayStats(filteredData); // Update stats with filtered data
        createScatterPlot(filteredCommits); // Re-render with filteredCommits
        updateDisplayTime(commitMaxTime);
        
        // Reset selection when filter changes
        selectedCommits = [];
        updateSelectionCount();
        updateLanguageBreakdown();
    });
    updateDisplayTime(commitMaxTime);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    // brushSelector is now called inside createScatterPlot
    console.log(commits);
});