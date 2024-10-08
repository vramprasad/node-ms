const express = require('express');
const bodyParser = require('body-parser');
var randomstring = require("randomstring");
var logging = require("log-timestamp")

var contextPath = '/auth-api'
var applicationPort = 3001;

const app = express();

app.use(bodyParser.json());

app.get(contextPath+'/healthcheck', (req, res) => {
  console.log("Inside healthcheck")
  const datePart = new Date().toISOString().split("T")[0]
  const timePart = new Date().toLocaleString("en-US", {hour12: false}).split(",")[1]
  const timeStamp = datePart + timePart
  return res.status(200).json({ status: 'OK', timestamp: timeStamp });

});

app.get(contextPath +'/generate', (req, res) => {
  console.log("Inside generate")
  const generatedToken = randomstring.generate(16);
  console.log("Token generated successfully")
  return res.status(200).json({ status: 'OK', token: generatedToken });
}); 

app.get(contextPath +'/verify/:token', (req, res) => {
  const token = req.params.token;
  console.log("Inisde verify token");
  if(Buffer.byteLength(token) === 16) {
    console.log("Token is valid");
    return res.status(200).json({ status: 'OK', message: "Token is Valid" });
  } else {
    console.log("Token is Invalid");
    return res.status(400).json({ status: 'Error', message: "Token is Invalid" });
  }

}); 

console.log("Auth API started on port "+ applicationPort)
app.listen(applicationPort);
