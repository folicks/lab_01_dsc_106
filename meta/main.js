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
  console.log(data);
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


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  processCommits();
  console.log(commits);
});

// commits = d3.groups(data, (d) => d.commit);
// console.log(commits);
// // this doesn't work, it returns an empty array

