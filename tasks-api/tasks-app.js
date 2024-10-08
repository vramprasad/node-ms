const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
//const { error } = require('console');
var logging = require('log-timestamp');
var contextPath = '/tasks-api'
var applicationPort = 3003;

const filePath = path.join(__dirname, 'tasks.txt');

const app = express();
app.use(bodyParser.json());


const extractAndVerifyToken = async (headers) => {
  console.log("Inside extractAndVerifyToken function")
  if (!headers.authorization) {
    throw new Error('No token provided.');
  }
  const token = headers.authorization.split(' ')[1]; 
  return token;
  
};

app.get(contextPath+'/healthcheck', (req, res) => {
  console.log("Inside healthcheck")
  const datePart = new Date().toISOString().split("T")[0]
  const timePart = new Date().toLocaleString("en-US", {hour12: false}).split(",")[1]
  const timeStamp = datePart + timePart;
  return res.status(200).json({ status: 'OK', timestamp: timeStamp });

});


// GET Tasks endpoint
app.get(contextPath+'/tasks', async (req, res) => {
  try {
    console.log("Inside getTasks endpoint")
    const extractedToken = await extractAndVerifyToken(req.headers);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: "Error", message: 'Loading the tasks from file failed.' });
      }
      const strData = data.toString();
      const entries = strData.split('TASK_SPLIT');
      entries.pop(); 
      console.log("Entries:............" + entries);
      const tasks = entries.map((json) => JSON.parse(json));
      res.status(200).json({ message: 'Tasks loaded.', tasks: tasks });
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: err.message || 'Failed to load tasks.' });
  }
});

// POST Tasks Endpoint
app.post(contextPath+'/tasks', async (req, res) => {
  try {
    console.log("Inside postTasks endpoint")
    const text = req.body.text;
    const title = req.body.title;
    const task = { title, text };
    const jsonTask = JSON.stringify(task);
    fs.appendFile(filePath, jsonTask + 'TASK_SPLIT', (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: "Error", message: 'Could not ADD new Task' });
      } else {
        res.status(201).json({ message: 'Task added.', createdTask: task });
      }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Could not ADD new task.' });
  }
});

console.log("Tasks API started on port "+ applicationPort)
app.listen(applicationPort);
