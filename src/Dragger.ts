import { Coordinates } from "./Part"

export class Dragger {
  // Display elements
  element: HTMLElement
  labelElement: HTMLParagraphElement;

  // Tracking the position
  coordinates: Coordinates

  // Bookkeeping values used during dragging
  dragging: boolean = false
  offset: {x: number, y: number} = {x: 0, y: 0}

  // Stores the callback for position updates
  positionCallback: ((x: Coordinates) => void) | null = null

  constructor(element: HTMLElement, coordinates: Coordinates) {
    this.element = element
    this.labelElement = document.createElement('p')
    this.element.appendChild(this.labelElement)

    // accept and apply the coordinates
    this.coordinates = coordinates;
    this.applyCoordinates(coordinates.x, coordinates.y)

    // when pressing down on a Dragger
    element.addEventListener('mousedown', (event) => {
      this.dragging = true
      // the offset accounts for clicking on different parts of the Dragger
      this.offset.x = event.offsetX
      this.offset.y = event.offsetY
    })

    // when the mouse moves in the window
    window.addEventListener('mousemove', (event) => {
      // and this Dragger is dragging
      if(this.dragging){
        // update its coordinates
        this.applyCoordinates(event.clientX - this.offset.x, event.clientY - this.offset.y)
      }
    })

    // when releasing the mouse
    element.addEventListener('mouseup', (event) => {
      // apply the coordinates
      this.applyCoordinates(event.clientX - this.offset.x, event.clientY - this.offset.y)
      // and stop dragging
      this.dragging = false
    })
  }

  // A label so we know which dot is which
  updateLabel(label: string) {
    this.labelElement.innerText = label
  }

  // Provides a callback to be called whenever the coordinates update
  registerUpdate(callback: (x: Coordinates) => void): void {
    this.positionCallback = callback
    this.positionCallback(this.coordinates)
  }

  // Writes x and y into coordinates, the DOM node, and calls the update callback
  applyCoordinates(x: number, y: number): void {
    this.coordinates.x = x;
    this.coordinates.y = y;
    this.element.style.left = `${x}px`
    this.element.style.top = `${y}px`

    if (this.positionCallback) {
      this.positionCallback(this.coordinates)
    }
  }
}