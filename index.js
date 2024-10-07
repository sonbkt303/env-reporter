import axios from 'axios';
import moment from 'moment';
import fs from 'fs';

const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');

const bodyData = {
  "expand": [
    "names",
    "schema",
    "operations"
  ],
  "fields": [
    // "*all"
    "summary",
    "status",
    "assignee",
    "link"
  ],
  "jql": `project IN (EVNKCLAB, "VT_Clever Lab Dev_PJT") AND issuetype in (Bug, Improvement) AND status in (Open, "In Progress", Reopened, Resolved, Closed) AND assignee in (currentUser()) AND updatedDate >=startOfWeek() AND updatedDate <= endOfWeek()`,
  "maxResults": 100,
  "startAt": 0,
};


// Function to append data to a file
const appendToFile = (filePath, data) => {
  fs.appendFile(filePath, data + '\n', (err) => {
    if (err) {
      console.error(`Error appending to file ${filePath}:`, err);
    } else {
      console.log(`Data successfully appended to ${filePath}`);
    }
  });
};

const BASE_URL = 'https://vts.vatech.com/browse/';
const token = "";

axios.post('https://vts.vatech.com/rest/api/2/search', bodyData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log(`Response: ${response.status} ${response.statusText}`);
    const issues = response.data.issues;

    const formattedIssues = issues.map(issue => {
      return `Issue: ${issue.key} | Status: ${issue.fields.status.name} | Summary: ${issue.fields.summary} | Link: (${BASE_URL + issue.key})`;
    });

    const fileName = 'report.txt';
    const reportContent = [
      `Start of the week: ${startOfWeek}`,
      ...formattedIssues,
      "------------------------------------"
    ].join('\n');

    appendToFile(fileName, reportContent);
  })
  .catch(err => console.error(err));
