import React, { useEffect, useState, useRef } from "react";
import DragSelect from "dragselect";
import { Popover } from "antd";

export default function SelectPlane(props) {
  const headerHeight = 120;
  const initialSize = 1000; // Overall pixel-matrix dimension

  let container = useRef();
  let overlays = useRef();
  let controlPressed;
  let ds = useRef();

  const [selected, setSelected] = useState([])
  const [selectedCryptoPixel, setSelectedCryptoPixel] = useState()
  const [selectedCryptoPixelTitle, setSelectedCryptoPixelTitle] = useState()
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

  function isReserved(id) {
    if(id < 4040 || id > 5961) return false;
    if(id === 40000) return true;
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
        const ids = [];
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

        // Check if it's just one id, that has already been sold but is not mine
        // Display info-popup
        // https://ant.design/components/popover/
        if(ids.length === 1 && props.soldPixels.indexOf(ids[0]) !== -1){

          // If not mine
          if(props.ownPixels.indexOf(ids[0]) === -1) {
            console.log("THIS IS NOT MY PIXEL", ids[0])
            const content = (
              <div>
                <p>Content</p>
                <p>Content</p>
              </div>
            )
          } else {
          // If it's mine
            console.log("THIS IS MY PIXEL", ids[0])
            const content = (
              <div>
                <p>Content</p>
                <p>Content</p>
              </div>
            )
          }

          setSelectedCryptoPixel()
        }

        // Set selected pixels
        selectElements(ids)

        // Remove existing overlay
        props.removeSelectedArea()

        // Create new overlay
        const overlay = document.createElement('div')
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
    ds.current = new DragSelect({
      customStyles: true,
      draggability: false,
      immediateDrag: false,
      area: container.current,
    });

    ds.current.subscribe('dragstart', () => {
      // hide menu
      overlays.current.classList.add('hovering');
    });

    ds.current.subscribe('callback', async () => {
        // reset menu  
        overlays.current.classList.remove('hovering');
        
        const start = ds.current.getInitialCursorPositionArea()
        const end = ds.current.getCurrentCursorPositionArea()

        // transform position based on zoom
        start.x = start.x / ds.current.Area._zoom;
        start.y = start.y / ds.current.Area._zoom;
        end.x = end.x / ds.current.Area._zoom;
        end.y = end.y / ds.current.Area._zoom;

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
      ds.current.Area._zoom = zoom;
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
      const currentZoom = ds.current.Area._zoom;
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
  const aniColors = ["#652D09","#ED95C4","#5D794E","#8C40FE","#0124C5","#381A06","#0E58FC","#23AB8E","#05127B","#21074C","#327FE5","#6F75B8","#3E08C6","#5B6879","#37A259","#26A931","#4F327B","#801C3D","#E0F17D","#F40CA8","#37592B","#125BAC","#D7419E","#324A1E","#2D1537","#789014","#80B162","#4F018E","#470F12","#D5C387","#2A3D41","#5A4FB0","#964710","#6D7329","#3D0A18","#47A8D0","#F362E1","#0F19BA","#018A64","#50361F","#5F0978","#A17E49","#0F598E","#9DA501","#79241A","#2C185A","#5F019C","#A2419F","#B3258A","#0751DF","#DEC508","#01CAF6","#AB3069","#B90185","#E64BA8","#215830","#743CEF","#A032C1","#7F1809","#97012A","#4F05D6"]
  const amountColors = aniColors.length;
  useEffect(() => {
    if (!effectsOn || !changeEffects) {
      return
    }
 
    if (!container.current) {
      container.current = document.getElementById('boxes')
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

  // Listen to zoom changes
  useEffect(() => {
    if (!props.zoom || props.zoom === 'auto') {
      calculateZoom();
    } else {
      zoom(props.zoom);
    }
  }, [props.zoom]);

  // toggle Center on mobile
  const [isCenterToggled, setIsCenterToggled] = useState(false);
  function toggleCenter() {
    setIsCenterToggled(!isCenterToggled);
  }

  return (
    <div>
      <section id="boxes">
        
        <div id="center" onTouchStart={toggleCenter}>
          <div className={ isCenterToggled ? 'flip-box isToggled' : 'flip-box' }>
            <div className="flip-box-inner">
              <div className="flip-box-front"></div>
              <div className="flip-box-back">
                <span>This one and only centerpiece will be auctioned when all remaining blocks have been sold.</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      { selectedCryptoPixel && 
        <Popover 
          content={selectedCryptoPixel} 
          title={selectedCryptoPixelTitle}>
        </Popover>
      }
    </div>
  );
}
