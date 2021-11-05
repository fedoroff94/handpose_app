//variables
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const rectangle = document.getElementsByClassName('inner-box')[0];
const fpsCounter = document.getElementById('fps-counter');

const rectanglePosition = {
  top: window.pageYOffset + rectangle.getBoundingClientRect().top,
  left: window.pageXOffset + rectangle.getBoundingClientRect().left,
  right: window.pageXOffset + rectangle.getBoundingClientRect().right,
  bottom: window.pageYOffset + rectangle.getBoundingClientRect().bottom
}

//work with canvas
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
        { color: 'red', lineWidth: 2 });
      drawLandmarks(canvasCtx, landmarks, { color: 'yellow', lineWidth: 1 });

      let getFingerCoordinates = () => {

        let fingerX = 1280 * landmarks[8].x;
        let fingerY = 720 * landmarks[8].y;

        let fingerCoordinates = {
          top: window.pageYOffset + fingerY,
          left: 1280 - (window.pageXOffset + fingerX),
          right: 1280 - (window.pageXOffset + fingerX),
          bottom: window.pageYOffset + fingerY
        }

        if (landmarks[8]) {
          if (fingerCoordinates.bottom > rectanglePosition.top &&
            fingerCoordinates.top < rectanglePosition.bottom &&
            fingerCoordinates.right > rectanglePosition.left &&
            fingerCoordinates.left < rectanglePosition.right) {

            rectangle.classList.add('color')
          } else {
            rectangle.classList.remove('color')
          }
        }

      }

      getFingerCoordinates();

    }

  }
  canvasCtx.restore();
}

//something from mediapipe
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

//work with camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});

camera.start();


//FPS counter
let frameCount = function _fc(timeStart){
        
  let now = performance.now();
  let duration = now - timeStart;
  
  if(duration < 100){
      
      _fc.counter++;
      
  } else {
                
      _fc.fps = _fc.counter * 10;
      _fc.counter = 0;
      timeStart = now; 
      fpsCounter.innerHTML = `${_fc.fps + ' fps'}`;

  }
  requestAnimationFrame(() => frameCount(timeStart)); 
}

frameCount.counter = 0;
frameCount.fps = 0;

frameCount(performance.now())




