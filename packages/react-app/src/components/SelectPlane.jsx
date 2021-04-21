import React, { useEffect, useState, useRef } from "react";
import DragSelect from "dragselect";

export default function SelectPlane(props) {
  const headerHeight = 120;
  const initialSize = 1000; // Overall pixel-matrix dimension
  let container = useRef();
  let menu = useRef();
  let currentZoom;
  let controlPressed;
  let ds;

  function initializeSelection() {  
    ds = new DragSelect({
      customStyles: true,
      draggability: false,
      immediateDrag: false,
      area: container.current,
    });

    ds.subscribe('dragstart', () => {
      // hide menu
      menu.current.classList.add('hovering');
    });

    ds.subscribe('callback', () => {
        // reset menu  
        menu.current.classList.remove('hovering');
        
        let start = ds.getInitialCursorPositionArea()
        let end = ds.getCurrentCursorPositionArea()

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

        // Calculate all ids
        let amountRows = to.row - from.row + 1
        let amountColumns = to.column - from.column + 1
        let ids = [];
        let count = 0;
        for (let i = 0; i < amountRows; ++i){
            for (let j = 0; j < amountColumns; ++j){
                const id = from.id + (i*100) + j
                if (props.isReserved(id) === false){
                    ids[count] = id
                    ++count
                }
            }
        }

        // Set selected pixels
        selectElements(ids)

        // Remove existing overlay
        removeSelectedArea()

        // Create new overlay
        const width = (amountColumns) * 10
        const height = (amountRows) * 10
        const marginLeft = (from.column - 1) * 10
        const marginTop = (from.row - 1) * 10
        let overlay = document.createElement('div')
        overlay.style.width = width + 'px';
        overlay.style.height = height + 'px';
        overlay.style.marginLeft = marginLeft + 'px';
        overlay.style.marginTop = marginTop + 'px';
        overlay.setAttribute('id', 'selectedArea')
        overlay.appendChild(document.createElement('div'));
        container.current.appendChild(overlay);
    })

    function selectElements(ids){
      if (typeof props.onSelected === 'function') {
        props.onSelected(ids);
      }
      setSelected(ids)
    }

    function removeSelectedArea(){
      let selectedArea = document.getElementById('selectedArea')
        if(selectedArea){
            selectedArea.remove()
        }
    }

    /**
     * Unselect pixels except clicks within the "ok"-areas: header, connect, menu, pixel area, centerpiece
     */
    // document.addEventListener('click', (evt) => {
    //   console.log(evt);
    //   const ok1 = document.getElementById('boxes');
    //   const ok2 = document.getElementById('menu');
    //   const ok3 = document.getElementById('WEB3_CONNECT_MODAL_ID');
    //   const ok4 = document.getElementById('headerConnect');
    //   const ok5 = document.getElementById('c');
    //   let targetElement = evt.target; 
    //   do {
    //       if (targetElement === ok1 || 
    //           targetElement === ok2 ||
    //           targetElement === ok3 ||
    //           targetElement === ok4 ||
    //           targetElement === ok5
    //         ) {return;}
    //       targetElement = targetElement.parentNode;
    //   } while (targetElement);
    //   // This is a click outside.
    //   selectElements([])
    //   console.log('remove');
    //   removeSelectedArea()
    // });

  }

  function zoom(zoom) {
    if (typeof props.onZoomUpdate === "function") {
      props.onZoomUpdate(zoom);
    }

    window.requestAnimationFrame(() => {
      container.current.style.transform = `scale(${zoom})`;
      currentZoom = zoom;
      ds.Area._zoom = zoom;
      calculatePostion(zoom);
    });
  }

  function position(x, y) {
    window.requestAnimationFrame(() => {
      container.current.style.marginLeft = `${x}px`;
      container.current.style.marginTop = `${y}px`;
    });
  }

  function calculatePostion(zoom) {
    // Todo: when positions would be less than 0, try to scroll view
    let calculatedLeft = Math.max(0, (window.innerWidth - initialSize * zoom) / 2);
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

  const [selected, setSelected] = useState([])
  const [changeEffects, setChangeEffects] = useState(0)
  const [amountAnimatedPixels, setAmountAnimatedPixels] = useState(0)
  const effectsOn = false
  
  useEffect(() => {
    if(!effectsOn){
      return
    }
    
    if(changeEffects === 0){
      container.current = document.getElementById('boxes');
      // Effects
      function getRandomColor() {
        return '#'+('0123456789ABCDEF'.split('').sort(function(){return 0.5-Math.random()}).join('')).substring(0,6);
      }

      let effects = [
        'animate__pulse', 'animate__bounce', 'animate__tada', 'animate__shakeX', 'animate__shakeY', 
        'animate__backInDown', 'animate__backInLeft', 'animate__backInRight', 'animate__backInUp',
        'animate__fadeIn', 'animate__fadeInDown', 'animate__fadeInUp', 'animate__fadeInTopLeft', 'animate__fadeInTopRight', 'animate__fadeInBottomLeft', 'animate__fadeInBottomRight',
        'animate__flip', 'animate__flipInX', 'animate__flipInY',
        'animate__rotateIn', 'animate__rotateInDownLeft', 'animate__rotateInDownRight','animate__rotateInUpLeft','animate__rotateInUpRight',
        'animate__zoomIn', 'animate__zoomInDown', 'animate__zoomInUp', 'animate__zoomInLeft', 'animate__zoomInRight'
      ]
      let speeds = ['animate__slow', 'animate__fast', 'animate__faster']
      let amount = 30

      // Slow down / Clean up
      // Clean up
      if(amountAnimatedPixels > 120){
        let el = document.getElementsByClassName('animate__animated')
        while(el.length > 0){
          el[0].remove() 
        }

        setAmountAnimatedPixels(0)
      // Slow down
      } else if(amountAnimatedPixels > 100){
        amount = 3
      } else if(amountAnimatedPixels > 70){
        amount = 5
      } else if(amountAnimatedPixels > 50){
        amount = 10
      } else if (amount > 30){
        amount = 15
      }

      // Generate random
      for(let i = 0; i < amount; ++i){
        const r = ~~(Math.random() * 10000) + 1
        // Make sure it's not reserved, sold or selected already
        if(!props.isReserved(r) && props.soldPixels.indexOf(r) === -1 && selected.indexOf(r) === -1){
          const el = props.createPixel(r)
          el.classList.add('animate__animated', effects[~~(Math.random() * effects.length)], speeds[~~(Math.random() * speeds.length)], 'animate__repeat-'+(~~(Math.random() * 3)+1))
          const color = getRandomColor()
          el.style.setProperty('background-color', color)
          el.style.setProperty('border-color', color)
          container.current.appendChild(el);
        }
      }
      setAmountAnimatedPixels(amountAnimatedPixels+amount)
      
      // Change effects
      setChangeEffects(1)
      setTimeout(()=> { setChangeEffects(0) }, 4000);
    }
  }, [changeEffects])

  useEffect(() => {
    container.current = document.getElementById('boxes');
    menu.current = document.getElementById('menu')

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
    <div className="">
        <section id="boxes"><div id="c"></div></section>
    </div>
  );
}
