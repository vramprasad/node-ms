const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
var logging = require("log-timestamp")

var contextPath = '/users-api'
var applicationPort = 3002;
const RC_SUCCESS = 200;
const RC_ERROR = 400;

const authgenerateURL = 'http://localhost:3001/auth-api/generate';
const authverifyURL = 'http://localhost:3001/auth-api/verify/'
const tasksListURL = 'http://localhost:3003/tasks-api/tasks'

const app = express();

app.use(bodyParser.json());

app.get(contextPath+'/healthcheck', (req, res) => {
  console.log("Inside healthcheck")
  const datePart = new Date().toISOString().split("T")[0]
  const timePart = new Date().toLocaleString("en-US", {hour12: false}).split(",")[1]
  const timeStamp = datePart + timePart
  return res.status(RC_SUCCESS).json({ status: 'OK', timestamp: timeStamp });
});

app.get(contextPath+'/loginandlist', async (req, res) => {
  console.log("Inside loginandlist");
  const tokengenResp = await axios.get(authgenerateURL);
  if (tokengenResp.status === RC_SUCCESS) { 
    console.log('Auth token generated successfully');
    const generatedToken = tokengenResp.data.token;
    const verifytokenResp = await axios.get(authverifyURL+generatedToken);
    if (verifytokenResp.status === RC_SUCCESS ) {
      console.log('Auth token verified successfully');
      const tasksResp = await axios.get(tasksListURL, {
        headers: {
          Authorization: "Bearer "+ generatedToken,
        }
      })
      if (tasksResp.status === RC_SUCCESS) {
        console.log('Retrieving Tasks list');
        console.log(tasksResp.data.tasks);
        const tasks1 = tasksResp.data.tasks;
        return res.status(RC_SUCCESS).json({ status: 'OK', message: 'Tasks list retreved', tasks: tasks1});
      } else {
        console.log('Could not retrieve Tasks list');
        return res.status(RC_ERROR).json({ status: 'TASKS_LIST_ERROR', message: 'Could not retrieve Tasks list'});
      }
      
    } else {
      console.log('Could not verify Auth token');
      return res.status(RC_ERROR).json({ status: 'TOKEN_VERIFY_ERROR', message: 'Could not verify Auth token'});
    }
  } else  {
    console.log('Could not generate Auth token');
    return res.status(RC_ERROR).json({ status: 'TOKEN_GEN_ERROR', message: 'Could not generate Auth token'});
  }

  
});

console.log("User API started on port "+ applicationPort)
app.listen(applicationPort);
