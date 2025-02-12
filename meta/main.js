import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';



let data = [];
let commits = [];

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
  // console.log(data);
  // this works btw and actually reads
}



function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];

      // We can use object destructuring to get these properties
      let { author, date, time, timezone, datetime } = first;

      return {
        id: commit,
        author,
        date,
        time,
        timezone,
        datetime,
        // What other properties might be useful?
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
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
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


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  processCommits();
  console.log(commits);
});

