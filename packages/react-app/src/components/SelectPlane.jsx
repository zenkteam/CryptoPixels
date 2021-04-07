import "./SelectPlane.css";
import React, { useEffect, useState } from "react";
import SelectionArea from "@simonwep/selection-js";
import { ConsoleSqlOutlined } from "@ant-design/icons";

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
    window.plane = new SelectionArea({

      // All elements in this container can be selected
      selectables: ['#boxes > div'],
      overlap: 'keep',

      // The container is also the boundary in this case
      boundaries: ['#boxes']
    }).on('start', ({ store, event }) => {

      // Remove class if the user isn't pressing the control key or ⌘ key
      // if (!event.ctrlKey && !event.metaKey) {

      //     // Unselect all elements
      //     for (const el of store.stored) {
      //         el.classList.remove('selected');
      //     }

      //     // Clear previous selection
      //     selection.clearSelection();
      // }

      for (const el of store.stored) {
        el.classList.remove('selected');
      }
  
      window.plane.clearSelection();    

    }).on('move', ({ store: { changed: { added, removed } } }) => {

      // Add a custom class to the elements that where selected.
      for (let i = 0; i < added.length; ++i) {
        added[i].className += 'selected'; // Faster than classList manipulation
      }

      // Remove the class from elements that where removed
      // since the last selection (toggle pixel)
      for (let i = 0; i < removed.length; ++i) {
        removed[i].classList.remove('selected'); // Here we use classList for safe removal
        //removed[i].className = removed[i].className.replace('selected', '');
      }

    }).on('stop', () => {
      window.plane.keepSelection();
      if (typeof props.onSelected === "function") {
        props.onSelected(selectedIds());
      }

    }); 
  }

  function selectedIds() {
    const selected = window.plane.getSelection();
    //console.log(selected)
    const ids = new Array(selected.length);
    for (let i = 0; i < selected.length; ++i) {
      ids[i] = selected[i].id;
    }
    return ids;
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
  
  const [items, setItems] = useState([]);

  useEffect(() => {
    // run
    container = document.getElementById('boxes');
    // window.selectIds = selectIds;
    // console.info('Tired of manually selecting pixels? Use the `selectIds([])` function in your console to programatically select what you want.');
    if (!props.zoom || props.zoom === 'auto') {
      calculateZoom();
    } else {
      zoom(props.zoom);
    }

    initializeSelection();
    
    window.addEventListener('wheel', onWheel);

    let items = new Array(props.pixels.length);
    for (let i = 0; i < props.pixels.length; ++i) {
      items.push(<div key={props.pixels[i].p} id={props.pixels[i].p} className={props.pixels[i].s}></div>);
    }
    setItems(items);
    

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.plane.destroy();
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

 
  
// {items}
  return (
    <div className="scroller zoom">
      <section id="boxes">
        {items}
      </section>
    </div>
  );
}
