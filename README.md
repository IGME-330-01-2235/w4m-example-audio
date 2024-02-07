# Audio Visualizer

In `Part.ts` we add an `AnalyserNode`, `bars` (an array of span elements), and the `visualizerMarkup` (parent of the spans).

Each frame, we ask the Analyser for audio data, and update each of the bars.

Try changing L27 `this.analyserNode.fftSize = 2048` to a different power of 2 and see what happens.

Try using the toggle comment on L89 (make it read //* or /* to see different code active) - this switches between FrequencyData and TimeDomainData displays.
