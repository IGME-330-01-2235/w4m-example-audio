export class Part {
  audioContext: AudioContext;
  audioElement: HTMLAudioElement; // a reference to the <audio> element in index.html
  sourceNode: MediaElementAudioSourceNode;

  markup: HTMLDivElement; // the parent HTML element, gets appended to section#parts in index.html
  vocalRange: string;

  constructor(vocalRange: string, audioElementId: string, audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.audioElement = document.querySelector(audioElementId) as HTMLAudioElement;

    this.sourceNode = audioContext.createMediaElementSource(this.audioElement)

    this.vocalRange = vocalRange;
    this.markup = document.createElement('div');

    this.expandMarkup();
  }

  // creates and appends all children of the Part
  expandMarkup(): void {
    this.markup.className = 'control';

    const h2 = document.createElement('h2')
    h2.innerText = this.vocalRange;

    this.markup.appendChild(h2)
  }

  // will be used by main.ts to route this Part's output to the audioContext.destination
  // (first, passing it through any global effect nodes)
  patch(): MediaElementAudioSourceNode {
    return this.sourceNode;
  }
  
  play(): void {
    this.audioElement.play()
  }
  
  pause(): void {
    this.audioElement.pause()
  }

  // skips to a particular playback position (in seconds)
  timeTo(timeInSeconds: number): void {
    this.audioElement.currentTime = timeInSeconds;
  }
}
