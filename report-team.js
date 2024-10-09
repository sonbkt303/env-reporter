import axios from 'axios';
import moment from 'moment';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


const BASE_URL = 'https://vts.vatech.com/browse/';
const token = process.env.JIRA_API_TOKEN;
const vlabVersion = process.env.VLAB_VERSION;
const fixIssueVersion = process.env.FIX_ISSUE_VERSION;

console.log("vlabVersion", vlabVersion)

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
  "jql": `((project in (EVNKCLAB) AND issuetype in (Bug, Improvement, Task) AND status = Resolved AND fixVersion = ${fixIssueVersion}) OR (project = VLAB AND issuetype  in (Sub-task) AND status = Resolved AND fixVersion = ${vlabVersion} )) AND assignee in (membersOf(EVN)) AND updatedDate >= startOfWeek()  AND updatedDate  <= endOfWeek()`,
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

axios.post('https://vts.vatech.com/rest/api/2/search', bodyData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    const issues = response.data.issues;

    const filteredIssues = issues.filter(issue =>
      !issue.fields.summary.includes('Code review') &&
      !issue.fields.summary.includes('Code Quality') &&
      !issue.fields.summary.includes('Code Review')
    );

    const formattedIssues = filteredIssues.map(issue => {
      return ` Issue: ${issue.key} | Status: ${issue.fields.status.name} | Summary: ${issue.fields.summary} | Link: (${BASE_URL + issue.key}) | Assignee: ${issue.fields?.assignee?.displayName}`;
    });

    const fileName = 'report-team.txt';
    const reportContent = [
      `Start of the fix version: ${fixIssueVersion}`,
      ...formattedIssues,
      "------------------------------------"
    ].join('\n');

    appendToFile(fileName, reportContent);
  })
  .catch(err => console.error(err));
