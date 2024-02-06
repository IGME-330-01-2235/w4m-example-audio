# Positional Audio

Now we'll add spatial audio. There's a new draggable element for each vocal part, and the listener.

One might have been tempted to define the dragging behavior as part of the `Part` class, but then it would be tightly coupled to the `Part`. Making `Dragger` its own class lets us re-use it for the Listener / Ears positioning.

`Part` does get a new `PannerNode` to configure how the sound behaves in the scene.

`main.ts` sets up the AudioContext to have a listener "Ears" of the application.
