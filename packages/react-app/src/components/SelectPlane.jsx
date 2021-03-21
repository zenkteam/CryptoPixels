import "./SelectPlane.css";
import React, { useEffect, useState } from "react";
import SelectionArea from "@simonwep/selection-js";

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
  const initialSize = 1000;

  let container = null;

  const items = [];
  for (const [index, pixel] of props.pixels.entries()) {
    items.push(<div key={pixel.p} data-id={pixel.p} className={pixel.s}></div>)
  }

  compareSelection();

  function initializeSelection() {
    window.plane = new SelectionArea({

      // All elements in this container can be selected
      selectables: ['.boxes > div'],
      overlap: 'keep',

      // The container is also the boundary in this case
      boundaries: ['.boxes']
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

    }).on('move', ({ store: { changed: { added, removed } } }) => {

      // Add a custom class to the elements that where selected.
      for (const el of added) {
        el.classList.add('selected');
      }

      // Remove the class from elements that where removed
      // since the last selection (toggle pixel)
      for (const el of removed) {
        el.classList.remove('selected');
      }

    }).on('stop', () => {
      window.plane.keepSelection();
      if (typeof props.onSelected === "function") {
        props.onSelected(selectedIds());
      }
    }); 
  }

  function selectId(id) {
    window.plane.select(`[data-id="${id}"]`);
    window.plane.keepSelection();
  }

  function selectIds(ids) {
    for (const id of ids) {
      selectId(id);
    }
  }

  function deselectId(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      window.plane.deselect(el);
      el.classList.remove('selected');
    }
  }

  function deselectIds(ids) {
    for (const id of ids) {
      deselectId(id);
    }
  }

  function compareSelection() {
    if (!window.plane || !props.selection) {
      return;
    }

    const propIds = props.selection.map(pixel => pixel.p);
    const localIds = selectedIds();

    const toAdd = [];
    const toRemove = [];

    for (let propId of propIds) {
      if (localIds.indexOf(propId) === -1) {
        toAdd.push(propId);
      }
    }

    for (let localId of localIds) {
      if (propIds.indexOf(localId) === -1) {
        toRemove.push(localId);
      }
    }

    selectIds(toAdd);
    deselectIds(toRemove);
  }

  function selectedIds() {
    const ids = [];
    const selected = window.plane.getSelection();
    for (const el of selected) {
      ids.push(parseInt(el.dataset.id));
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

  useEffect(() => {
    // run
    container = document.querySelector('.boxes');
    // window.selectIds = selectIds;
    // console.info('Tired of manually selecting pixels? Use the `selectIds([])` function in your console to programatically select what you want.');
    if (!props.zoom || props.zoom === 'auto') {
      calculateZoom();
    } else {
      zoom(props.zoom);
    }
    initializeSelection();
    window.addEventListener('wheel', onWheel);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.plane.destroy();
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className="scroller zoom">
      <section className="boxes">
        {items}
      </section>
    </div>
  );
}
