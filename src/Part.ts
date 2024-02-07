export class Part {
  audioContext: AudioContext;
  audioElement: HTMLAudioElement;
  sourceNode: MediaElementAudioSourceNode;

  gainNode: GainNode;

  analyserNode: AnalyserNode; // our sampler node for analyzing the audio data
  fftDataArray: Uint8Array; // MDN : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
  bars: HTMLSpanElement[] = []; // an array of spans that will become our bar graph bars
  visualizerMarkup: HTMLDivElement; // the parent of the bar graph

  markup: HTMLDivElement;
  vocalRange: string;

  constructor(vocalRange: string, audioElementId: string, audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.audioElement = document.querySelector(audioElementId) as HTMLAudioElement;

    this.sourceNode = audioContext.createMediaElementSource(this.audioElement)

    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = 1

    // setup the analyser node
    this.analyserNode = audioContext.createAnalyser()
    this.analyserNode.fftSize = 2048 // how many samples? power of 2 (2048 fft results in 1024 samples)

    // fftDataArray will hold each frame's data
    this.fftDataArray = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.visualizerMarkup = document.createElement('div');
    this.visualizerMarkup.style.height = '100px';

    this.vocalRange = vocalRange;
    this.markup = document.createElement('div');

    this.expandMarkup();
    this.expandVisualizerMarkup();
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

  expandVisualizerMarkup(): void {
    // for every element in our fftDataArray
    this.fftDataArray.forEach(() => {
      // make a <span>
      const bar = document.createElement('span')
      // give it the .bar class (see styles.css)
      bar.className = 'bar'
      // add it to the bars array for later access
      this.bars.push(bar)
      // add it as a child of the visualizerMarkup div
      this.visualizerMarkup.appendChild(bar)
    })
    
    // start rendering the graph
    window.requestAnimationFrame(this.renderGraph)
  }

  // using an arrow function here so it is automatically "bound" to "this"
  renderGraph = () => {
    //*
    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
    // this results in a frequency readout graph
    this.analyserNode.getByteFrequencyData(this.fftDataArray)
    /*/
    // https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData
    // this results in a waveform graph
    this.analyserNode.getByteTimeDomainData(this.fftDataArray)
    //*/
    for (let i = 0; i < this.fftDataArray.length; i++) {
      // fftDataArray values are 0-255, convert to 0-100
      const amplitude = this.fftDataArray[i] / 255 * 100;
      // transform: scaleY is a compositing-only step
      this.bars[i].style.transform = `scaleY(${amplitude}%)`
    }

    // keep rendering the graph
    window.requestAnimationFrame(this.renderGraph)
  }

  patch(): AudioNode {
    // and connect it as part of the patch chain!
    return this.sourceNode.connect(this.gainNode).connect(this.analyserNode);
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
