import "./SelectPlane.css";
import React, { useEffect, useState } from "react";
import DragSelect from "dragselect";

// provides plane which allows to select pixels

/*
  ~ What it does? ~

  Displays a plane with background image which allows the user to select an area.

  ~ How can I use? ~

  <SelectPlane
    pixels={pixels}
    selection={selection}
    zoom={zoom}
    onSelected={value => {
      onSelected(value);
    }}
    onZoomUpdate={value => {
      onZoomUpdate(value);
    }}
  />

  ~ Features ~

  - Provide pixels={pixels} as list of objects with ids to identify the areas.
  - Provide selection={selection} as a list of pixels which are currently selected
  - Provide zoom={zoom} to define the initial zoom level (ToDo: continues updates)
  - Get notifiyed of changes by onSelected={value => { useSelection(value);}}
  - Get notifiyed of changes by onZoomUpdate={value => { storeZoom(value);}}
*/

export default function SelectPlane(props) {
  const headerHeight = 120;
  const initialSize = 1000; // Overall pixel-matrix dimension

  let container = null;

  function initializeSelection() {
    
    const ds = new DragSelect({
      area: document.getElementById('boxes'),
    });

    ds.subscribe('callback', ({ items, event }) => {
        let start = ds.getInitialCursorPositionArea()
        let end = ds.getCurrentCursorPositionArea()

        end.x = end.x < 0 ? 0 : end.x
        end.y = end.y < 0 ? 0 : end.y

        start.column = parseInt(start.x / 10) + 1
        start.row = parseInt(start.y / 10) + 1

        end.column = parseInt(end.x / 10) + 1
        end.row = parseInt(end.y / 10) + 1

        start.id = start.column + ((start.row - 1) * 100)
        end.id = end.column + ((end.row - 1) * 100)

        // Make sure to do the math in the right direction
        let from = start
        let to = end
        if(from.id > to.id){
            from = end
            to = start
        }

        // Calculate all ids
        let amountRows = to.row - from.row
        let amountColumns = to.column - from.column
        let ids = [];
        if(amountRows > 0 || amountColumns > 0){
            let count = 0;
            for(let i = 0; i <= amountRows; ++i){
                for(let j = 0; j <= amountColumns; ++j){
                    const id = from.id + (i*100) + j
                    if(props.isReserved(id) === false){
                        ids[count] = id
                    }
                    ++count
                }
            }
        } else {
            if(props.isReserved(from.id) === false){
                ids[0] = from.id
            }
        }

        // Set selected pixels
        if (typeof props.onSelected === "function") {
          props.onSelected(ids);
        }
        setSelected(ids)

        // Remove existing overlay
        let selectedArea = document.getElementById('selectedArea')
        if(selectedArea){
            selectedArea.remove()
        }

        // Create new overlay
        const width = (amountColumns + 1) * 10
        const height = (amountRows + 1) * 10
        const marginLeft = (from.column - 1) * 10
        const marginTop = (from.row - 1) * 10
        let overlay = document.createElement('div')
        overlay.style.cssText = 'width:' + width + 'px;height:' + height + 'px;margin-left:' + marginLeft + 'px;margin-top:' + marginTop + 'px'
        overlay.setAttribute('id', 'selectedArea')
        document.getElementById('boxes').appendChild(overlay);

    })

  }

  function zoom(zoom) {
    if (typeof props.onZoomUpdate === "function") {
      props.onZoomUpdate(zoom);
    }

    window.requestAnimationFrame(() => {
      container.style.transform = `scale(${zoom})`;
      calculatePostion(zoom);
    });
  }

  function position(x, y) {
    window.requestAnimationFrame(() => {
      container.style.marginLeft = `${x}px`;
      container.style.marginTop = `${y}px`;
    });
  }

  function calculatePostion(zoom) {
    // Todo: when positions would be less than 0, try to scroll view
    let calculatedLeft = Math.max(0, (window.innerWidth - initialSize * zoom) / 2);
    let calculatedTop = Math.max(0, (window.innerHeight - headerHeight - initialSize * zoom) / 2);
    position(calculatedLeft, calculatedTop);
  }

  function calculateZoom() {
    let calculatedZoom = Math.min((window.innerHeight - headerHeight) / initialSize, window.innerWidth / initialSize);
    zoom(calculatedZoom);
  }

  function onWheel(e) {
    // Todo: integrate gestures https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
    if (e.ctrlKey) {
      const currentZoom = parseFloat(container.style.transform.replace('scale(', ''))
      const scale = currentZoom - e.deltaY * 0.01;
      if (scale > 0.5 && scale < 5) {
        zoom(scale);
      }
    }
  }

  const [selected, setSelected] = useState([])
  const [changeEffects, setChangeEffects] = useState(0)
  const [amountAnimatedPixels, setAmountAnimatedPixels] = useState(0)
  const effectsOn = true
  
  useEffect(() => {
    if(!effectsOn){
      return
    }

    if(changeEffects === 0){

      // Effects
      function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[~~(Math.random() * 16)];
        }
        return color;
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
          // First reset colors
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

      function createPixel(id){
        const pixel = props.generatePixelData(id)
        let p = document.createElement('div')
        p.style.cssText = 'position:absolute;z-index:2;width:10px;height:10px;margin-left:' + pixel.x + 'px;margin-top:' + pixel.y + 'px'
        p.setAttribute('id', id)
        p.setAttribute('class', 'p')
        return p
      }

      // Generate random
      for(let i = 0; i < amount; ++i){
        const r = ~~(Math.random() * 10000) + 1
        // Make sure it's not reserved, sold or selected already
        if(!props.isReserved(r) && props.soldPixels.indexOf(r) === -1 && selected.indexOf(r) === -1){
          const el = createPixel(r)
          el.classList.add('animate__animated', effects[~~(Math.random() * effects.length)], speeds[~~(Math.random() * speeds.length)], 'animate__repeat-'+(~~(Math.random() * 3)+1))
          const color = getRandomColor()
          el.style.setProperty('background-color', color)
          el.style.setProperty('border-color', color)
          document.getElementById('boxes').appendChild(el);
        }
      }
      setAmountAnimatedPixels(amountAnimatedPixels+amount)
      
      // Change effects
      setChangeEffects(1)
      setTimeout(()=> { setChangeEffects(0) }, 4000);
    }
  }, [changeEffects])

  useEffect(() => {
    // run
    container = document.getElementById('boxes');
    //window.selectIds = selectIds;
    // console.info('Tired of manually selecting pixels? Use the `selectIds([])` function in your console to programatically select what you want.');
    /*if (!props.zoom || props.zoom === 'auto') {
      calculateZoom();
    } else {
      zoom(props.zoom);
    }*/

    initializeSelection();
    
    //window.addEventListener('wheel', onWheel);

    // Specify how to clean up after this effect:
    return function cleanup() {
      //window.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className="">
        <section id="boxes"><div id="c"></div></section>
    </div>
  );
}
