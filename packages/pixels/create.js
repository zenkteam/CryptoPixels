const fs = require('fs')
const QRCode = require('easyqrcodejs-nodejs')
const { createCanvas, registerFont } = require('canvas')
registerFont('PressStart2P-Regular.ttf', { family: 'PressStart2P-Regular' })
const amount = 10000;

for(let i = 1; i <= amount; ++i){
    createImage(i)
}

 function createImage(id){
    const bg = [
        {
            name: 'Cryptopixels_1',
            color: '#C5C5C5'
        },
        {
            name: 'Cryptopixels_2',
            color: '#F5F5F5'
        },
        {
            name: 'Cryptopixels_3',
            color: '#F3DCC8'
        },
        {
            name: 'Cryptopixels_4',
            color: '#F3DCC8'
        }
    ]
    const chosenBg = ~~(Math.random() * 3 + 1)
    const chosenBgColor = bg[chosenBg].color
    const chosenBgName = bg[chosenBg].name

    // img
    const w = 200, h = 42, fontSize = 32
    const canvas = createCanvas(w,h)
    const ctx = canvas.getContext('2d', {alpha: true})
    ctx.font = fontSize+"px 'PressStart2P-Regular'";

    // Border
    ctx.fillStyle='#111111';
    ctx.fillRect(0, 0, w , h);

    // BG
    ctx.fillStyle=chosenBgColor;
    ctx.fillRect(2, 2, w-4 , h-4);

    // nr
    const text = "#"+id
    const textData = ctx.measureText(text)
    const x = parseInt(w/2 - textData.width/2)
    const y = h-3
    ctx.fillStyle = '#111111'
    ctx.fillText(text, x, y);

    const logo = './created/nrs/'+id+'.png'
    const out = fs.createWriteStream(logo)
    const stream = canvas.createPNGStream()
    stream.pipe(out)

    const s = 354
    out.on('finish', () => {
        const colors = shuffle(['#f58420', '#455a4e', '#343434', '#393939', '#141414'])

        const options_object = {
            text: "https://cryptopixels.org/#CryptoPixel-" + id,
            width: s,
            height: s,
            colorDark : "#141414",
            colorLight : "#f2f2f2",
            autoColor: true,
            correctLevel : QRCode.CorrectLevel.H, // L, M, Q, H

            dotScale: randomNumber(5),
            dotScaleTiming: randomNumber(5),
            dotScaleA: randomNumber(5),
            dotScaleTiming_H: randomNumber(5),
            dotScaleTiming_V:randomNumber(5),
            dotScaleAO:randomNumber(5),
            dotScaleAI:randomNumber(5),

            PO_TL: colors[~~(Math.random() * colors.length)],
            PI_TL: colors[~~(Math.random() * colors.length)],
            PO_TR: colors[~~(Math.random() * colors.length)],
            PI_TR: colors[~~(Math.random() * colors.length)],
            PO_BL: colors[~~(Math.random() * colors.length)],
            PI_BL: colors[~~(Math.random() * colors.length)],

            timing: colors[~~(Math.random() * colors.length)],
            timing_H: colors[~~(Math.random() * colors.length)],
            timing_V: colors[~~(Math.random() * colors.length)],

           
            PO: colors[1],
            PI: colors[2],
            AO: colors[3],
            AI: colors[4],
            
            // EXTRA
            quietZone: 30,
            quietZoneColor: chosenBgColor,
            logo: logo,
            logoWidth:w,
            logoHeight:h,
            compressionLevel: 1,
            //logoBackgroundColor: chosenBgColor,
            logoBackgroundTransparent: false,

            backgroundImage: './'+chosenBgName+'.png',
            backgroundImageAlpha: 0.4
        }

        // Create QR Code
        const qrcode = new QRCode(options_object);
        qrcode.saveImage({
            path: './created/'+id+'.png' // save path
        });

        // Delete number image
        fs.unlink(logo, (er)=> {})
    })
   
}

function randomNumber(min, max) {
    max = max || 10
    return ~~(Math.random() * (max - min) + min) / 10
}

function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = ~~(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}