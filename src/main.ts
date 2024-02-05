import { Part } from './part';
import './reset.css'
import './styles.css'

const playButton = document.querySelector('#play-button') as HTMLButtonElement;
const mainVolumeSlider = document.querySelector('#main-volume-slider') as HTMLInputElement;
const mainSeekSlider = document.querySelector('#main-seek-slider') as HTMLInputElement;

// Parent element of all Part.markup elements
const partsMarkup = document.querySelector('#parts') as HTMLElement;

const audioContext = new AudioContext()

// Make Part instances for each vocal part
const parts: Part[] = [
  new Part('Tenor', '#tenor-audio', audioContext),
  new Part('Lead', '#lead-audio', audioContext),
  new Part('Baritone', '#baritone-audio', audioContext),
  new Part('Bass', '#bass-audio', audioContext),
];

// When we want to do timeupdate and ended events, we only need to talk about one Part.
// (And apply that value to the others.)
// We'll select the first one and call it mainAudioElement.
const mainAudioElement = parts[0].audioElement;

// We still have a single GainNode for global volume
const gainNode = audioContext.createGain()
gainNode.gain.value = parseFloat(mainVolumeSlider.value)

let duration = -1;

// Connect each Part to the audioContext.destination (speakers)
// AND append its HTML markup to the DOM
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
