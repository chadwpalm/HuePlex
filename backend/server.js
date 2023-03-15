var express = require("express");
const { STATUS_CODES } = require("http");
var router = express.Router();
var os = require("os");
var PlexAPI = require("plex-api");
var axios = require("axios").default;

router.post("/", async function (req, res, next) {
  var groups = {};
  var lights = [];

  var url = `http://${req.body.bridge.ip}/api/${req.body.bridge.user}/groups`;

  await axios
    .get(url, { timeout: 5000, headers: { "Content-Type": "application/json;charset=UTF-8" } })

    .then(function (response) {
      console.info("Retrieving Groups");
      groups = response.data;
    })
    .catch(function (error) {
      if (error.request) {
        res.status(403).send("Could not connect to the Plex server");
      }
    });

  url = `http://${req.body.bridge.ip}/api/${req.body.bridge.user}/lights`;

  await axios.get(url, { headers: { "Content-Type": "application/json;charset=UTF-8" } }).then(function (response) {
    console.info("Retrieving Lights");
    var data = {};
    data = response.data;
    for (const [key1, value1] of Object.entries(data)) {
      var group;
      for (const [key2, value2] of Object.entries(groups)) {
        if (value2.lights.includes(key1) && value2.type === "Room") {
          group = key2;
        }
      }
      try {
        let array = `{ "Id":"${key1}", "Name":"${value1.name}", "Room":"${groups[group].name}"}`;
        lights.push(JSON.parse(array));
      } catch (error) {
        console.error("Lights: ", error);
      }
    }
    lights.sort((a, b) => (a.Name > b.Name ? 1 : b.Name > a.Name ? -1 : 0));
    lights.sort((a, b) => (a.Room > b.Room ? 1 : b.Room > a.Room ? -1 : 0));
  });

  res.send(JSON.stringify(lights));
});

module.exports = router;
