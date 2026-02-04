const video = document.getElementById("video");
const emotionText = document.getElementById("emotion");

// WebSocket
const socket = new WebSocket(
  location.protocol === "https:"
    ? `wss://${location.host}`
    : `ws://${location.host}`
);


// Load models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera API not supported");
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        console.log("✅ Camera stream started");
      };
    })
    .catch(err => {
      console.error("❌ Camera error:", err);
      alert("Camera permission denied or camera busy");
    });
}



video.addEventListener("playing", () => {
  console.log("▶ Video is playing");

  const detect = async () => {
    if (video.paused || video.ended) {
      requestAnimationFrame(detect);
      return;
    }

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detection) {
      const expressions = detection.expressions;
      const emotion = Object.keys(expressions)
        .reduce((a, b) => expressions[a] > expressions[b] ? a : b);

      emotionText.innerText = emotion.toUpperCase();
    } else {
      emotionText.innerText = "NO FACE";
    }

    requestAnimationFrame(detect);
  };

  detect();
});



// receive emotion logs
socket.onmessage = (event) => {
  console.log("Emotion data:", event.data);
};
