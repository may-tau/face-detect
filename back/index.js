import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import http from "http";
import jwt from "jsonwebtoken";
// import "@tensorflow/tfjs-node";
import * as canvas from "canvas";
import * as faceapi from "face-api.js";

const app = express();
const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
const faceDerectionOptions = new faceapi.SsdMobilenetv1Options({
  minConfidence: 0.5,
});
const port = process.env.PORT || 3333;
const server = http.createServer(app);
const tasks = {};

const TOKEN_KEY = "VALHELLO";

faceDetectionNet.loadFromDisk("./fd-weights");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.post("/getIn", (req, res) => {
  const { uname } = req.body;
  if (!uname) {
    res.status(400).send("No name - no fun");
  }
  const token = jwt.sign({ uname }, TOKEN_KEY, {
    expiresIn: "0.5h",
  });
  res.status(200).send(token);
});

app.post("/verify", (req, res) => {
  try {
    jwt.verify(req.body.jwt, TOKEN_KEY);
    res.status(200).send("u good");
  } catch (e) {
    return res.status(401).send("Oopsie");
  }
});

app.post("/upload", (req, res) => {
  if (!jwt.verify(req.body.jwt, TOKEN_KEY)) {
    return res.status(401).send("Oopsie");
  }
  const uname = jwt.decode(req.body.jwt).uname;
  if (!tasks[uname]) {
    tasks[uname] = [];
  }
  const taskInfo = { name: req.body.fname, status: "enqueued" };
  tasks[uname].push(taskInfo);
  setTimeout(() => taskInfo.status = "processing", 2000);
  setTimeout(() => {
    canvas
      .loadImage(req.files.file.data)
      .then((img) => faceapi.detectAllFaces(img, faceDerectionOptions))
      .then(
        (detections) =>
          (taskInfo.status = detections.length)
      );
  }, 5000);
  return res.status(200).send("OK");
});

app.post("/listTasks", (req, res) => {
  if (!jwt.verify(req.body.jwt, TOKEN_KEY)) {
    return res.status(401).send("Oopsie");
  }
  const uname = jwt.decode(req.body.jwt).uname;
  return res.status(200).json(tasks[uname] || []);
});

app.post("/listUsers", (req, res) => {
  if (!jwt.verify(req.body.jwt, TOKEN_KEY)) {
    return res.status(401).send("Oopsie");
  }
  const uname = jwt.decode(req.body.jwt).uname;
  if (uname !== 'admin') {
    return res.status(401).send("Hold your horses cowboy, you're not admin");
  }
  return res.status(200).json(tasks);
});

// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
