import { Coordinates } from "./Part"

export class Dragger {
  // Display elements
  element: HTMLElement
  labelElement: HTMLParagraphElement;
  // more display elements
  lower: HTMLDivElement;
  upper: HTMLDivElement;
  lbrow: HTMLDivElement;
  rbrow: HTMLDivElement;

  coordinates: Coordinates

  dragging: boolean = false
  offset: {x: number, y: number} = {x: 0, y: 0}

  positionCallback: ((x: Coordinates) => void) | null = null

  constructor(element: HTMLElement, coordinates: Coordinates) {
    this.element = element
    this.labelElement = document.createElement('p')

    // add a whole bunch of HTML nodes to make the character
    // see here and in styles.css
    this.lower = document.createElement('div')
    this.lower.className = 'lower'
    this.upper = document.createElement('div')
    this.upper.className = 'upper'
    this.element.appendChild(this.labelElement)
    this.element.appendChild(this.lower)
    this.element.appendChild(this.upper)
    const eyes = document.createElement('div')
    eyes.className = 'eyes'
    this.lbrow = document.createElement('div')
    this.lbrow.className = 'lbrow'
    this.rbrow = document.createElement('div')
    this.rbrow.className = 'rbrow'
    this.upper.appendChild(eyes)
    this.upper.appendChild(this.lbrow)
    this.upper.appendChild(this.rbrow)

    this.coordinates = coordinates;
    this.applyCoordinates(coordinates.x, coordinates.y)

    element.addEventListener('mousedown', (event) => {
      this.dragging = true
      this.offset.x = event.offsetX
      this.offset.y = event.offsetY
    })

    window.addEventListener('mousemove', (event) => {
      if(this.dragging){
        this.applyCoordinates(event.clientX - this.offset.x, event.clientY - this.offset.y)
      }
    })

    element.addEventListener('mouseup', (event) => {
      this.applyCoordinates(event.clientX - this.offset.x, event.clientY - this.offset.y)
      this.dragging = false
    })
  }

  updateLabel(label: string) {
    this.labelElement.innerText = label
  }

  // ordinarily I don't condone scattering class fields throughout the file
  // but these are only used in sing(), so ... meh
  rotation = 0
  lastPercent = 0
  sing(percent: number) : void {
    if (Math.abs(percent - this.lastPercent) > 0.05) {
      // when the percent changes by a lot in one frame, pick a random rotation
      this.rotation = Math.random()*30 - 15;
    }
    if (this.lastPercent === 0 && percent > 0) {
      // when starting to sing from zero, pick a random rotation
      this.rotation = Math.random()*30 - 15;
    }
    if (percent === 0) {
      // if it's silent, set the rotation to 0
      this.rotation = 0
    }
    // change the eyebrow position when the rotation changes
    const brow = Math.abs(this.rotation/15)
    this.lbrow.style.translate = `0 ${brow*5}px`
    this.rbrow.style.translate = `0 ${brow*3}px`

    // rotate and translate the singer's head
    this.upper.style.transform = `rotate(${this.rotation}deg) translateY(${-15 - percent*20}px)`;
    
    // keep track of the last value for next frame
    this.lastPercent = percent
  }

  registerUpdate(callback: (x: Coordinates) => void): void {
    this.positionCallback = callback
    this.positionCallback(this.coordinates)
  }

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