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
  pannerNode: PannerNode; // oh look, a new type of Node

  markup: HTMLDivElement;
  vocalRange: string;

  dragger: Dragger; // a reference to the dragger placeholder

  constructor(vocalRange: string, audioElementId: string, audioContext: AudioContext, dragger: Dragger) {
    this.audioContext = audioContext;
    this.audioElement = document.querySelector(audioElementId) as HTMLAudioElement;

    this.sourceNode = audioContext.createMediaElementSource(this.audioElement)

    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = 1

    this.dragger = dragger; // connect the dragger
    this.dragger.updateLabel(vocalRange) // tell it which part it's associated with

    // So much configuration in the Panner...
    this.pannerNode = new PannerNode(audioContext, {
      panningModel: 'HRTF', // "Head-Related Transfer Function" - mathematical model of audio influence of the human head
      distanceModel: 'linear', // fall-off / fade-out function

      positionX: dragger.coordinates.x, // Where is the source at?
      positionY: dragger.coordinates.y, // this will be updated as we drag things around
      positionZ: dragger.coordinates.z, // we're going to mostly ignore z

      orientationX: 0, // What direction is the source pointing?
      orientationY: 1, // (as a unit vector)
      orientationZ: 0, // directionality is important

      refDistance: 1, // scales the world units if necessary
      maxDistance: 10000, // sets the furthest distance away something is still audible
      rolloffFactor: 1, // how quickly does the volume reduce as moving away

      coneInnerAngle: 120, // See this diagram : https://www.w3.org/TR/webaudio/#Spatialization-sound-cones
      coneOuterAngle: 180 ,
      coneOuterGain: 0.2,
    })

    // Give the dragger a callback to update the panner position on drags
    this.dragger.registerUpdate(this.onNewCoordinates)

    this.vocalRange = vocalRange;
    this.markup = document.createElement('div');

    this.expandMarkup();
  }

  onNewCoordinates = (coordinates: Coordinates): void => {
    // update the pannerNode position with the coordinates of the dragger
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

  patch(): AudioNode {
    // It's just another effect on the chain.
    return this.sourceNode.connect(this.gainNode).connect(this.pannerNode);
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
