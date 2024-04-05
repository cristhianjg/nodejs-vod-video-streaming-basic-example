const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const port = 3011;

app.get("/", (req, res) => {
  res.status(200).send("Hello Video Streaming!");
});

// It needs the "range" value to know what piece of video chunk has to send
app.get("/video", (req, res) => {
  const range = req.headers.range;

  console.log("Range: ", req.headers.range);

  if (!range) {
    res.status(400).send(`Error - "range" header required`);
  }

  const videoPath = path.resolve(__dirname, "../videos/buenos_aires.mp4");
  const videoSize = fs.statSync(videoPath).size; // size in bytes

  // Example range: "bytes=32344-" or "bytes=32555-33980"
  const CHUNK_SIZE = 1_000_000; // or 10 ** 6 = 1MB

  // gets the starting part from "range", that is the "starting byte"
  const start = Number(range.replace(/\D/g, ""));

  // gets the "ending byte" of the chunk
  // if start + CHUNK_SIZE is greater than video size, it returns videoSize - 1, that is the "ending byte"
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // create response
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // we use http code 206 because we're returning partial content
  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  // we transmit the stream content using a pipe
  videoStream.pipe(res);
});

app.listen(port, () => {
  console.log("Server listening on port ", port);
});
