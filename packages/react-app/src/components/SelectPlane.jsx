import React, { useEffect, useState, useRef } from "react";
import DragSelect from "dragselect";

export default function SelectPlane(props) {
  const headerHeight = 120;
  const initialSize = 1000; // Overall pixel-matrix dimension

  let container = useRef();
  let overlays = useRef();
  let currentZoom;
  let controlPressed;
  let ds;

  const [selected, setSelected] = useState([])
  const [changeEffects, setChangeEffects] = useState(true)
  const [newArea, setNewArea] = useState();
  const effectsOn = true


  function selectElements(ids){
    if (typeof props.onSelected === 'function') {
      props.onSelected(ids);
    }
    setSelected(ids)
  }

  function isManipulatable(id){
    // not reserved and not sold
    return isReserved(id) === false && props.soldPixels.indexOf(id) === -1
  }

  function isReserved(id, topLeft, bottomRight) {
    if(id < 4040 || id > 5961) return false;
    let t = id % 1000;
    if(t > 100) t = t % 100;
    return t > 40 && t < 61;
  }

  useEffect(() => {

    if (newArea) {
        const {to, from} = newArea;
        setNewArea(undefined) // reset area to avoid triggering effect multiple times

        // Calculate all ids
        const amountRows = to.row - from.row + 1
        const amountColumns = to.column - from.column + 1
        let ids = [];
        let count = 0;
        for (let i = 0; i < amountRows; ++i){
            for (let j = 0; j < amountColumns; ++j){
                const id = from.id + (i*100) + j
                if (isManipulatable(id)){
                    ids[count] = id
                    ++count
                }
            }
        }

        // Set selected pixels
        selectElements(ids)

        // Remove existing overlay
        props.removeSelectedArea()

        // Create new overlay
        let overlay = document.createElement('div')
        overlay.style.setProperty('width', (amountColumns) * 10 + 'px');
        overlay.style.setProperty('height', (amountRows) * 10 + 'px');
        overlay.style.setProperty('margin-left', (from.column - 1) * 10 + 'px');
        overlay.style.setProperty('margin-top', (from.row - 1) * 10 + 'px');
        overlay.setAttribute('id', 'selectedArea')
        overlay.appendChild(document.createElement('div'));
        container.current.appendChild(overlay);
      }
  }, [newArea]) // we only execute this when a newArea is selected, it then automatically accesses the current props

  function initializeSelection() {  
    ds = new DragSelect({
      customStyles: true,
      draggability: false,
      immediateDrag: false,
      area: container.current,
    });

    ds.subscribe('dragstart', () => {
      // hide menu
      overlays.current.classList.add('hovering');
    });

    ds.subscribe('callback',async () => {
        // reset menu  
        overlays.current.classList.remove('hovering');
        
        const start = ds.getInitialCursorPositionArea()
        const end = ds.getCurrentCursorPositionArea()

        // transform position based on zoom
        start.x = start.x / currentZoom;
        start.y = start.y / currentZoom;
        end.x = end.x / currentZoom;
        end.y = end.y / currentZoom;

        // ensure position are in the area
        start.x = Math.max(0, Math.min(999, start.x));
        start.y = Math.max(0, Math.min(999, start.y));
        end.x = Math.max(0, Math.min(999, end.x));
        end.y = Math.max(0, Math.min(999, end.y));
        
        // find rows and cols
        start.column = parseInt(start.x / 10) + 1
        start.row = parseInt(start.y / 10) + 1
        end.column = parseInt(end.x / 10) + 1
        end.row = parseInt(end.y / 10) + 1

        // find top left and bottom right corner
        const from = {
          column: Math.min(start.column, end.column),
          row: Math.min(start.row, end.row),
        }
        const to = {
          column: Math.max(start.column, end.column),
          row: Math.max(start.row, end.row),
        }

        // find pixel ids
        from.id = from.column + ((from.row - 1) * 100)
        to.id = to.column + ((to.row - 1) * 100)

        setNewArea({from, to});
    })
  }

  function zoom(zoom) {
    if (typeof props.onZoomUpdate === "function") {
      props.onZoomUpdate(zoom);
    }

    window.requestAnimationFrame(() => {
      container.current.style.setProperty('transform', `scale(${zoom})`);
      currentZoom = zoom;
      ds.Area._zoom = zoom;
      calculatePostion(zoom);
    });
  }

  function position(x, y) {
    window.requestAnimationFrame(() => {
      container.current.style.setProperty('margin-left', `${x}px`);
      container.current.style.setProperty('margin-top', `${y}px`);
    });
  }

  function calculatePostion(zoom) {
    // Todo: when positions would be less than 0, try to scroll view
    let calculatedLeft = Math.max(0, (window.innerWidth - initialSize * zoom) / 2);
    if (window.innerWidth > 900 && window.innerWidth <= 1500) {
      calculatedLeft += 50;
    }
    let calculatedTop = Math.max(0, (window.innerHeight - headerHeight - initialSize * zoom) / 2);
    position(calculatedLeft,calculatedTop)
  }

  function calculateZoom() {
    let calculatedZoom = Math.min((window.innerHeight - headerHeight) / initialSize, window.innerWidth / initialSize);
    zoom(calculatedZoom);
  }

  function onWheel(e) {
    if (controlPressed) {
      const currentZoom = parseFloat(container.current.style.transform.replace('scale(', ''))
      const scale = currentZoom - e.deltaY * 0.01;
      if (scale > 0.5 && scale < 5) {
        zoom(scale);
      }

      e.preventDefault();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Control') {
      controlPressed = true;
    }
  }

  function onKeyUp(e) {
    if (e.key === 'Control') {
      controlPressed = false;
    }
  }
  
  // Execute change effects
  const [aniColors, setAniColors] = useState([])
  useEffect(() => {
    if (!effectsOn) {
      return
    }
    
    if (!changeEffects) {
      return
    }
     
    container.current = document.getElementById('boxes');

    const amountColors = 100
    if(aniColors.length === 0){
      let colors = new Array(amountColors)
      for(let i = 0; i < amountColors; ++i){
        colors[i] = '#'+('0123456789ABCDEF'.split('').sort(()=>0.5-Math.random()).join('')).substring(0,6);
      }
      setAniColors(colors)
    }
  
    // Effects
    const effects = [
      'animate__pulse', 'animate__bounce', 'animate__tada', 'animate__shakeX', 'animate__shakeY', 
      'animate__backInDown', 'animate__backInLeft', 'animate__backInRight', 'animate__backInUp',
      'animate__fadeIn', 'animate__fadeInDown', 'animate__fadeInUp', 'animate__fadeInTopLeft', 'animate__fadeInTopRight', 'animate__fadeInBottomLeft', 'animate__fadeInBottomRight',
      'animate__flip', 'animate__flipInX', 'animate__flipInY',
      'animate__rotateIn', 'animate__rotateInDownLeft', 'animate__rotateInDownRight','animate__rotateInUpLeft','animate__rotateInUpRight',
      'animate__zoomIn', 'animate__zoomInDown', 'animate__zoomInUp', 'animate__zoomInLeft', 'animate__zoomInRight'
    ]
    const speeds = ['animate__slow', 'animate__fast', 'animate__faster']

    const el = document.getElementsByClassName('animate__animated')
    for (let i = el.length - 1; i >= 0; i--) {
      el[i].remove();
    }

    // Generate random amount of effects
    let amount = 30
    while (amount > 0) {
      const r = ~~(Math.random() * 10000) + 1
      // Make sure it's not reserved, sold or selected already
      if (isManipulatable(r) && selected.indexOf(r) === -1) {
        const el = props.createPixel(r)
        const x = Math.random()
        el.classList.add(
          'animate__animated',
          effects[~~(x * effects.length)],
          speeds[~~(x * 3)],
          'animate__repeat-'+(~~(x * 3)+1)
        )
        const color = aniColors[~~(x * amountColors)]
        el.style.setProperty('background-color', color)
        el.style.setProperty('border-color', color)
        container.current.appendChild(el);
        amount--;
      }
    }
    setChangeEffects(false)
  }, [changeEffects])

  // Trigger change effects
  useEffect(() => {
    const interval = setInterval(() => {
      setChangeEffects(true) 
    }, 4000);

    // ensure iterval is canceled when component is destroyed
    return () => clearInterval(interval);
  }, [])

  // Initialize plane
  useEffect(() => {
    container.current = document.getElementById('boxes');
    overlays.current = document.getElementById('Overlays')

    if (!props.zoom || props.zoom === 'auto') {
      calculateZoom();
    } else {
      zoom(props.zoom);
    }

    initializeSelection();
    
    window.addEventListener('wheel', onWheel, {passive: false});
    window.addEventListener('resize', calculateZoom);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', calculateZoom);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div>
        <section id="boxes"><div id="c"></div></section>
    </div>
  );
}
