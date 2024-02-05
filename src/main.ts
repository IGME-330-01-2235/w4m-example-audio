import './reset.css'
import './styles.css'

// Inputs:
const playButton = document.querySelector('#play-button') as HTMLButtonElement;
const mainVolumeSlider = document.querySelector('#main-volume-slider') as HTMLInputElement;
const mainSeekSlider = document.querySelector('#main-seek-slider') as HTMLInputElement;

// Audio Source Elements:
const tenorAudio = document.querySelector('#tenor-audio') as HTMLAudioElement;
const leadAudio = document.querySelector('#lead-audio') as HTMLAudioElement;
const baritoneAudio = document.querySelector('#baritone-audio') as HTMLAudioElement;
const bassAudio = document.querySelector('#bass-audio') as HTMLAudioElement;

// Create an AudioContext to hook up our flow.
const audioContext = new AudioContext()

// GainNode changes the volume
const gainNode = audioContext.createGain()
// (which we grab from our slider)
gainNode.gain.value = parseFloat(mainVolumeSlider.value)

// We don't know what the duration is yet - not until we are playing!
// mainSeekSlider.max = tenorAudio.duration.toString()
// So we'll set a known bad value, and update it later!
let duration = -1;

// These Sources are attached to the audioContext from the HTML
const tenorSource = audioContext.createMediaElementSource(tenorAudio)
const leadSource = audioContext.createMediaElementSource(leadAudio)
const baritoneSource = audioContext.createMediaElementSource(baritoneAudio)
const bassSource = audioContext.createMediaElementSource(bassAudio)

// From the slides...
// Audio Context (audioContext)
//   has
// Sources (each of the voice sources)
//   which pass through zero or many
// Effects (the gainNode to control volume)
//   on the way to
// Outputs (audioContext.destination ... the computer speakers)
tenorSource.connect(gainNode).connect(audioContext.destination)
leadSource.connect(gainNode).connect(audioContext.destination)
baritoneSource.connect(gainNode).connect(audioContext.destination)
bassSource.connect(gainNode).connect(audioContext.destination)

// Helper function to play multiple sources (and update button state).
const play = () => {
  tenorAudio.play();
  leadAudio.play();
  baritoneAudio.play();
  bassAudio.play();
  playButton.dataset.playing = 'true';
  playButton.innerText = 'Pause'
}

// Helper function to pause multiple sources (and update button state).
const pause = () => {
  tenorAudio.pause();
  leadAudio.pause();
  baritoneAudio.pause();
  bassAudio.pause();
  playButton.dataset.playing = 'false';
  playButton.innerText = 'Play';
}

playButton.addEventListener('click', () => {
  // Check if context is in suspended state (autoplay policy)
  // We can only cause audio to play as a direct result of user input!
  // (meaning, from inside an interaction event handler like 'click')
  if (audioContext!.state === 'suspended') {
    audioContext!.resume();
  }

  // MDN : https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
  // element.dataset describes and manages data-* attributes
  // useful for managing state on elements
  if (playButton.dataset.playing === 'false') {
    play();
  } else if (playButton.dataset.playing === 'true') {
    pause();
  }
})

// MDN : https://developer.mozilla.org/en-US/docs/Web/API/GainNode
// Setting gainNode.gain.value changes the volume of an AudioContext
mainVolumeSlider.addEventListener('input', () => {
  gainNode!.gain.value = parseFloat(mainVolumeSlider.value);
})

// MDN : https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event
// Fires when target's value changes ::as a direct result of user input::
mainSeekSlider.addEventListener('input', () => {
  const targetTime = parseFloat(mainSeekSlider.value);
  tenorAudio.currentTime = targetTime
  leadAudio.currentTime = targetTime
  baritoneAudio.currentTime = targetTime
  bassAudio.currentTime = targetTime
})

// NOTICE - the interaction between input and timeupdate!
// We can change mainSeekSlider.value (in response to timeupdate)
// WITHOUT causing the mainSeekSlider to fire an input event
// BECAUSE input only fires as a direct result of user input.
// (otherwise, we'd be in danger of an infinite loop of updates)

// MDN : https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event
// Fires when target media's currentTime has been updated.
tenorAudio.addEventListener('timeupdate', () => {
  mainSeekSlider.value = tenorAudio.currentTime.toString()

  // we also check if the audio knows its duration
  // and update the seekSlider to match
  const knownDuration = tenorAudio.duration;
  if (knownDuration !== duration) {
    duration = knownDuration;
    mainSeekSlider.max = knownDuration.toString()
  }
})

// MDN : https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event
// Fires when target media playback has completed.
tenorAudio.addEventListener('ended', () => {
  pause();
})
