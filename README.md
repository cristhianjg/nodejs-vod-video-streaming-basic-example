# VOD (Video on-demand) streaming using NodeJS - Basic example

Source: [How To Code A Video Streaming Server in NodeJS (by @AbdisalanCodes)](https://www.youtube.com/watch?v=ZjBLbXUuyWg)

In this basic project we use the HTMLVideoElement interface on the front to request a video to the backend.

```
<video id="videoPlayer" width="650" controls muted="muted">
  <source src="http://localhost:3011/video" type="video/mp4" />
</video>
```

On the backend we create two endpoints:

- / : just for testing purposes, the classic "Hello World";
- /video : used to request a video content;

From the backend side, once received a request we stream the requested video by chunks of bytes. We don't send the complete video at once. This allows us to use our resources in a more efficient and less resource-consuming way.

The key points to develop a solution like this are the following:

- we need our client to send a request containing "range" in its header (req.headers.range). The HTML video api does that by default;

- we need to find the file in our server (in this case there's only one), and get its size to use it for calculations;

```
const videoPath = path.resolve(__dirname, "../videos/buenos_aires.mp4");
const videoSize = fs.statSync(videoPath).size; // size in bytes
```

- we need to calculate the chunks that we will be transmitting. In this case we use 1MB size chunks;

```
const CHUNK_SIZE = 1_000_000; // or 10 ** 6 = 1MB
```

- on subsequent requests, we need to calculate the "range" requested by the client in order to be able to know which "part" of the video the client needs;

```
const start = Number(range.replace(/\D/g, ""));
const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
```

- we need to compose the right headers before sending the content;

```
const headers = {
  "Content-Range": `bytes ${start}-${end}/${videoSize}`,
  "Accept-Ranges": "bytes",
  "Content-Length": contentLength,
  "Content-Type": "video/mp4",
};
```

- we use the built-in "fs" module, specifically 'createReadStream' to create a stream of bytes;

```
const videoStream = fs.createReadStream(videoPath, { start, end });
```

- finally we set the header with a 206 http code, and transmit it through a pipe connection: videoStream.pipe(res);

```
res.writeHead(206, headers);

videoStream.pipe(res);
```

Last step, we just need to open or navigate to our client's index page (client/index.html) to see how the video is loaded, and can be reproduced without much trouble.

Important! If we make a plain GET request to the /video enpoint using the browser or any other API client, we'll get "Error - "range" header required" as we are not sending the right headers.

Enjoy! :)
