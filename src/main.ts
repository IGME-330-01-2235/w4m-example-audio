import { Dragger } from './Dragger';
import { Coordinates, Part } from './Part';
import './reset.css'
import './styles.css'

const playButton = document.querySelector('#play-button') as HTMLButtonElement;
const mainVolumeSlider = document.querySelector('#main-volume-slider') as HTMLInputElement;
const mainSeekSlider = document.querySelector('#main-seek-slider') as HTMLInputElement;

const partsMarkup = document.querySelector('#parts') as HTMLElement;

const draggers: Dragger[] = [];

// pre-position the Draggers
const startingCoords: Coordinates[] = [
  {x: 320, y: 150, z: 0},
  {x: 400, y: 100, z: 0},
  {x: 500, y: 100, z: 0},
  {x: 580, y: 150, z: 0},
  {x: 450, y: 200, z: 0},
]

// TypeScript - Generics notation, let's us specify what type of thing querySelectorAll can expect to return.
document.querySelectorAll<HTMLDivElement>('.drags').forEach((dragger, index) => {
  draggers.push(new Dragger(dragger, startingCoords[index]))
})

const audioContext = new AudioContext()

const parts: Part[] = [
  new Part('Tenor', '#tenor-audio', audioContext, draggers[0]),
  new Part('Lead', '#lead-audio', audioContext, draggers[1]),
  new Part('Bari', '#baritone-audio', audioContext, draggers[2]),
  new Part('Bass', '#bass-audio', audioContext, draggers[3]),
];

const mainAudioElement = parts[0].audioElement;

// We still have a single GainNode for global volume
const gainNode = audioContext.createGain()
gainNode.gain.value = parseFloat(mainVolumeSlider.value)

// Set up the listener "Ears" for the audioContext
const listener = audioContext.listener;
listener.positionX.value = 0
listener.positionY.value = 0
listener.positionZ.value = 0
listener.forwardX.value = 0;
listener.forwardY.value = -1;
listener.forwardZ.value = 0;
listener.upX.value = 0;
listener.upY.value = 0;
listener.upZ.value = -1;

draggers[4].updateLabel('Ears')
draggers[4].registerUpdate((coordinates) => {
  listener.positionX.value = coordinates.x
  listener.positionY.value = coordinates.y
  listener.positionZ.value = coordinates.z
})

let duration = -1;


parts.forEach((part) => {
  part.patch().connect(gainNode).connect(audioContext.destination)
  partsMarkup.appendChild(part.markup)
})


const play = () => {
  // tell each part to play
  parts.forEach((part) => {
    part.play();
  })
  playButton.dataset.playing = 'true';
  playButton.innerText = 'Pause'
}

const pause = () => {
  // tell each part to pause
  parts.forEach((part) => {
    part.pause();
  })
  playButton.dataset.playing = 'false';
  playButton.innerText = 'Play';
}

playButton.addEventListener('click', () => {
  if (audioContext!.state === 'suspended') {
    audioContext!.resume();
  }

  if (playButton.dataset.playing === 'false') {
    play();
  } else if (playButton.dataset.playing === 'true') {
    pause();
  }
})

mainVolumeSlider.addEventListener('input', () => {
  gainNode!.gain.value = parseFloat(mainVolumeSlider.value);
})

mainSeekSlider.addEventListener('input', () => {
  const targetTime = parseFloat(mainSeekSlider.value);
  parts.forEach((part) => {
    part.timeTo(targetTime);
  })
})

mainAudioElement.addEventListener('timeupdate', () => {
  mainSeekSlider.value = mainAudioElement.currentTime.toString()

  const knownDuration = mainAudioElement.duration;
  if (knownDuration !== duration) {
    duration = knownDuration;
    mainSeekSlider.max = knownDuration.toString()
  }
})

mainAudioElement.addEventListener('ended', () => {
  pause();
})
