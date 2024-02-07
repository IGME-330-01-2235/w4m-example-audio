import { Dragger } from "./Dragger";

export interface Coordinates {
  x: number,
  y: number,
  z: number,
}

export class Part {
  audioContext: AudioContext;
  audioElement: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode;

  gainNode: GainNode;
  pannerNode: PannerNode;
  analyzer: AnalyserNode;
  analyzerData: Uint8Array;

  markup: HTMLDivElement;
  vocalRange: string;

  dragger: Dragger; // a reference to the dragger placeholder

  constructor(vocalRange: string, audioElementId: string, audioContext: AudioContext, dragger: Dragger) {
    this.audioContext = audioContext;
    this.audioElement = document.querySelector(audioElementId) as HTMLAudioElement;

    this.sourceNode = audioContext.createMediaElementSource(this.audioElement)

    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = 1

    // similar to audio-04b
    this.analyzer = audioContext.createAnalyser()
    this.analyzer.fftSize = 32 // smaller number of total samples, because we only really need one
    this.analyzerData = new Uint8Array(this.analyzer.frequencyBinCount)

    this.dragger = dragger;
    this.dragger.updateLabel(vocalRange)

    this.pannerNode = new PannerNode(audioContext, {
      panningModel: 'HRTF',
      distanceModel: 'linear',

      positionX: dragger.coordinates.x,
      positionY: dragger.coordinates.y,
      positionZ: dragger.coordinates.z,

      orientationX: 0,
      orientationY: 1,
      orientationZ: 0,

      refDistance: 1,
      maxDistance: 10000,
      rolloffFactor: 1,

      coneInnerAngle: 120,
      coneOuterAngle: 180,
      coneOuterGain: 0.6,
    })

    this.dragger.registerUpdate(this.onNewCoordinates)

    this.vocalRange = vocalRange;
    this.markup = document.createElement('div');

    this.expandMarkup();

    // setup our animation
    window.requestAnimationFrame(this.measureAudio)
  }

  onNewCoordinates = (coordinates: Coordinates): void => {
    this.pannerNode.positionX.value = coordinates.x;
    this.pannerNode.positionY.value = coordinates.y;
    this.pannerNode.positionZ.value = coordinates.z;
  }

  expandMarkup(): void {
    this.markup.className = 'control part';

    const h2 = document.createElement('h2')
    h2.innerText = this.vocalRange;

    // add some more HTML to control it
    const div = document.createElement('div')
    const label = document.createElement('label')
    label.innerText = 'Volume'
    div.appendChild(label)

    const input = document.createElement('input')
    input.type = 'range'
    input.min = '0'
    input.max = '4'
    input.step = '0.01'
    input.value = '1'
    div.appendChild(input)

    // with a dedicated 'input' listener
    input.addEventListener('input', () => {
      this.gainNode.gain.value = parseFloat(input.value);
    })

    this.markup.appendChild(h2)
    this.markup.appendChild(div)
  }
  
  measureAudio = (): void => {
    // get the data for this frame
    this.analyzer.getByteFrequencyData(this.analyzerData)
    // send it to the dragger (I chose sample [8] because it made interesting animations)
    this.dragger.sing(this.analyzerData[8]/255)
    // ask for the next frame to keep going
    window.requestAnimationFrame(this.measureAudio)
  }

  patch(): AudioNode {
    // It's just another effect on the chain.
    return this.sourceNode.connect(this.gainNode).connect(this.analyzer).connect(this.pannerNode);
  }
  
  play(): void {
    this.audioElement.play()
  }
  
  pause(): void {
    this.audioElement.pause()
  }

  timeTo(timeInSeconds: number): void {
    this.audioElement.currentTime = timeInSeconds;
  }
}
