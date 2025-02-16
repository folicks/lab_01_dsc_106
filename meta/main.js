import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let data = [];
let commits = [];
let xScale, yScale;


async function loadData() {
  data = await d3.csv('./loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  displayStats();
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
        // Store the lines array with each commit so we can access language info later
        lines: lines.map(line => ({
          type: line.type,  // The language type
          line: line.line   // Number of lines changed
        }))
      };
    });
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

function displayStats() {
  processCommits();

  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  const maxDepth = d3.max(data, (d) => d.depth);
  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);

  const timeOfDayCounts = d3.rollup(
    data,
    (v) => v.length,
    (d) => getTimeOfDay(d.datetime)
  );

  const mostFrequentTimeOfDay = d3.max(Array.from(timeOfDayCounts), (d) => d[1]);
  const timeOfDay = Array.from(timeOfDayCounts).find(
    (d) => d[1] === mostFrequentTimeOfDay
  );

  dl.append('dt').text('Most Frequent Time of Day');
  dl.append('dd').text(`${timeOfDay[0]} (${timeOfDay[1]} lines)`);
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

function createScatterPlot() {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime().domain(d3.extent(commits, (d) => d.datetime)).range([0, width]).nice();
  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // Calculate the range of edited lines across all commits
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  // Create a linear scale for the radius
  const rScale = d3.scaleLinear().domain([minLines, maxLines]).range([2, 30]);

  // Sort the commits by the number of edited lines in descending order
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const dots = svg.append('g').attr('class', 'dots');
  const tooltip = d3.select('#commit-tooltip').style('opacity', 1);
  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', function (event, commit) {
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', function () {
      updateTooltipContent({});
      updateTooltipVisibility(false);
      d3.select(this).style('fill-opacity', 0.7); // Restore transparency
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

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
}

let brushSelection = null;
function brushed(event) {
  // The selection is an array like [[x0, y0], [x1, y1]] 
  // or null if the user clears the brush
  brushSelection = event.selection;

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
  if (!brushSelection) return false; // If no selection, nothing is selected

  const [[x0, y0], [x1, y1]] = brushSelection;

  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  // Check if the commit's x/y is within the brushed box
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
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
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
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




document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  processCommits();
  createScatterPlot();
  brushSelector();
  console.log(commits);
});

