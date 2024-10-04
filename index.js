import axios from 'axios';

const bodyData = {
  "expand": [
    "names",
    "schema",
    "operations"
  ],
  "fields": [
    "summary",
    "status",
    "assignee"
  ],
  "jql": "project = EVNKCLAB",
  "maxResults": 1,
  "startAt": 0
};

const token = "sampelToken";
axios.post('https://vts.vatech.com/rest/api/2/search', bodyData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log(`Response: ${response.status} ${response.statusText}`);
    const data = response.data;

    console.log(data.issues[0])

  })
  .catch(err => console.error(err));
