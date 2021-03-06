import React, { useEffect, useState, useRef } from "react";
import DragSelect from "dragselect";
import { TableOutlined } from '@ant-design/icons';

export default function SelectPlane(props) {
  const headerHeight = 120;
  const initialSize = 1000; // Overall pixel-matrix dimension
  const assetsUri = process.env.REACT_APP_UPLOADED_URI || 'http://localhost:8888/uploads/'

  let container = useRef();
  let overlays = useRef();
  let controlPressed;
  let ds = useRef();

  const [selected, setSelected] = useState([])
  // const [selectedCryptoPixel, setSelectedCryptoPixel] = useState(null)
  const [changeEffects, setChangeEffects] = useState(true)
  const [newArea, setNewArea] = useState();
  const [effectsOn, setEffectsOn] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const initialAmountAnimations = 30
  const [amountAnimations, setAmountAnimations] = useState(initialAmountAnimations);

  function selectElements(ids){
    if (typeof props.onSelected === 'function') {
      props.onSelected(ids);

      // Turn off animations && create focus-layer
      document.getElementById('Content').classList.remove('contentGlitch')
      setAmountAnimations(initialAmountAnimations/2)
    }
    setSelected(ids)
  }

  useEffect(()=>{
    if(selected.length === 0){
      document.getElementById('Content').classList.add('contentGlitch')
      setAmountAnimations(initialAmountAnimations)
    }
  }, [selected])

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
        const ownIds = [];
        const soldIds = [];
        for (let i = 0; i < amountRows; ++i){
            for (let j = 0; j < amountColumns; ++j){
                const id = from.id + (i*100) + j
                if (isManipulatable(id)){
                    ids.push(id);
                } else if (props.ownPixels.indexOf(id) !== -1) {
                    ownIds.push(id);
                } else if (props.soldPixels.indexOf(id) !== -1) {
                    soldIds.push(id);
                }
            }
        }

        // Check if it's just one id => display information
        // if (ids.length === 1 && ownIds.length === 0 && soldIds.length === 0) {
        //   const pixel = generatePixelData(ids[0])
        //   setSelectedCryptoPixel(pixel);
        // } else if (ids.length === 0 && ownIds.length === 1 && soldIds.length === 0) {
        //   const pixel = generatePixelData(ownIds[0])
        //   setSelectedCryptoPixel(pixel);
        // } else if (ids.length === 0 && ownIds.length === 0 && soldIds.length === 1) {
        //   const pixel = generatePixelData(soldIds[0])
        //   setSelectedCryptoPixel(pixel);
        // } else {
        //   setSelectedCryptoPixel(null);
        // }

        // Set selected pixels
        selectElements(ids)

        // Remove existing overlay
        props.removeSelectedArea()

        // Reset selected Block
        setSelectedBlock(null)

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

    // Generate random amount of effects
    let amount = amountAnimations
    const wrap = document.createElement('div')
    wrap.id = 'animate_wrap';
    while (amount > 0) {
      const r = ~~(Math.random() * 10000) + 1
      // Make sure it's not reserved, sold or selected already
      if (isManipulatable(r) && selected.indexOf(r) === -1) {
        const el = createPixel(r)
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
        
        wrap.appendChild(el);
        amount--;
      }
    }

    // replace
    const oldWrap = document.getElementById('animate_wrap')
    if (oldWrap) oldWrap.remove()
    container.current.appendChild(wrap);

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

  const [linkedPixel, setLinkedPixel] = useState();
  const hash = window.location.hash;
  if (hash.startsWith('#CryptoPixel-')) {
      const num = parseInt(hash.substr(13));
      if (!isReserved(num) && (!linkedPixel || linkedPixel.id !== num)) {
        const pixel = generatePixelData(num)
        setLinkedPixel(pixel);
      }
  }

  useEffect(() => {
    if (selected.length && linkedPixel) {
      window.location.hash = '';
      setLinkedPixel(null);
    }
  }, [selected])

  useEffect(() => {
      drawSoldAndOwnedAreas('sold', props.soldButNotMineCryptoPixels)
      drawSoldAndOwnedAreas('own', props.ownCryptoPixels)
  }, [props.soldButNotMineCryptoPixels, props.ownCryptoPixels])


  window.clickPixel = function(id) {
    props.soldButNotMineCryptoPixels.forEach((pixel) => {
      if (pixel.pixel_id === id) {
        setSelectedBlock(pixel)
      }
    })
    props.ownCryptoPixels.forEach((pixel) => {
      if (pixel.pixel_id === id) {
        setSelectedBlock(pixel)
      }
    })
  }

  useEffect(() => {
    // disable
    let els = document.getElementsByClassName('blockSelected');
    for (const el of els) {
      el.classList.remove('blockSelected')
    }

    if (selectedBlock) {
      // enable
      let el = document.getElementById('a' + selectedBlock.pixel_id);
      el.classList.add('blockSelected');
    }
  }, [selectedBlock])

  // Draw sold and own pixels on the map
  function drawSoldAndOwnedAreas(classType, cryptoPixels){
      const boxes = document.getElementById('boxes')
      if (!boxes) {
          return;
      }

      for (const pixel of cryptoPixels) {
          // get or create element
          let el = document.getElementById('a' + pixel.pixel_id);
          const exists = !!el;
          if (!exists) {
              el = createPixel(pixel.pixel_id)
          }

          el.classList.add(classType)
          el.style.setProperty('width', pixel.width_px + 'px')
          el.style.setProperty('height', pixel.height_px + 'px')
          el.setAttribute('id', 'a' + pixel.pixel_id)
          if (pixel.image) {
              el.style.setProperty('background-image', `url(${assetsUri}${pixel.image})`) 
          }
          if (pixel.owner) {
              el.setAttribute('data-owner', pixel.owner)
          }
          if (pixel.link) {
              el.setAttribute('data-link', pixel.link)
          }
          el.setAttribute('onClick', `window.clickPixel(${pixel.pixel_id})`)

          // add to dom, if not done already
          if (!exists) {
              boxes.appendChild(el);
          }
      }

      
  }

  function createPixel(id){
      const pixel = generatePixelData(id)
      let p = document.createElement('div')
      p.className = 'p'
      p.style.setProperty('left', pixel.x + 'px')
      p.style.setProperty('top', pixel.y + 'px')
      p.setAttribute('id', id)
      return p
    }

  function generatePixelData(id){
    const column = id % 100 === 0 ? 100 : id % 100
    const row = ~~((id - 1) / 100) + 1

    return {
        id: id,
        column: column,
        x: (column-1) * 10,
        row: row,
        y: (row-1) * 10,
    };
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

        { linkedPixel &&
          <div id="linked" style={{top: linkedPixel.y, left: linkedPixel.x}}>
            <div className="linked1"></div>
            <div className="linked2"></div>
            <div className="linked3"></div>
            <div className="linked4"></div>
            <div className="linked5"></div>
          </div>
        }

      </section>

      { selectedBlock &&
          <div className="pixelDetails" style={selectedBlock.pixel_id > 5000 ? {top: 180} : { bottom: 180}}>
            <div className='pixelRange' key={selectedBlock.pixel_id}><b className="rangeFrom">{selectedBlock.pixel_id}</b> <TableOutlined/> <b className="rangeTo">{selectedBlock.pixel_to_id}</b></div>
            
            <table className="details">
              <tbody>
                <tr>
                  <td>owner:</td>
                  <td>
                    { selectedBlock.owner &&
                      <a traget="_blank" rel="noopener roreferrer" href={'https://etherscan.io/address/' + selectedBlock.owner}>{selectedBlock.owner}</a>
                    }
                    { !selectedBlock.owner &&
                      <>??</>
                    }
                  </td>
                </tr>
                <tr>
                  <td>link:</td>
                  <td>
                    { selectedBlock.link &&
                      <a target="_blank" rel="noopener noreferrer" href={selectedBlock.link}>{prettyUrl(selectedBlock.link)}</a>
                    }
                    { !selectedBlock.link &&
                      <>-</>
                    }
                  </td>
                </tr>

              </tbody>
            </table>
  
          </div>
        }
    </div>
  );
}

function prettyUrl(url){
  const getLocation = function(href) {
    const l = document.createElement('a');
    l.href = href;
    return l;
  };
  const l = getLocation(url);
  return l.hostname.replace('www.','') + l.pathname
}
