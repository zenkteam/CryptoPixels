const fs = require('fs')
const QRCode = require('easyqrcodejs-nodejs')
const { createCanvas, registerFont } = require('canvas')
registerFont('PressStart2P-Regular.ttf', { family: 'PressStart2P-Regular' })
const amount = 10;

for(let i = 1; i <= amount; ++i){
    createImage(i)
}




 function createImage(id){
    let bg = [
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
    let chosenBg = ~~(Math.random() * 3 + 1)
    let chosenBgColor = bg[chosenBg].color
    let chosenBgName = bg[chosenBg].name

    // img
    let w = 200, h = 42, fontSize = 32
    let canvas = createCanvas(w,h)
    let ctx = canvas.getContext('2d', {alpha: true})
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

    let logo = './created/nrs/'+id+'.png'
    const out = fs.createWriteStream(logo)
    const stream = canvas.createPNGStream()
    stream.pipe(out)

    out.on('finish', () => {
        let colors = shuffle(['#f58420', '#455a4e', '#343434', '#393939', '#141414'])

        let options_object = {
            text: "https://cryptopixels.org/api/pixel/" + id,
            width: 350,
            height: 350,
            colorDark : "#141414",
            colorLight : "#f2f2f2",
            autoColor: true,
            correctLevel : QRCode.CorrectLevel.H, // L, M, Q, H

            dotScale: randomNumber(3),
            dotScaleTiming: randomNumber(3),
            dotScaleA: randomNumber(3),
            dotScaleTiming_H: randomNumber(3),
            dotScaleTiming_V:randomNumber(3),
            dotScaleAO:randomNumber(3),
            dotScaleAI:randomNumber(3),

            PO_TL: colors[~~(Math.random() * colors.length)],
            PI_TL: colors[~~(Math.random() * colors.length)],
            PO_TR: colors[~~(Math.random() * colors.length)],
            PI_TR: colors[~~(Math.random() * colors.length)],
            PO_BL: colors[~~(Math.random() * colors.length)],
            PI_BL: colors[~~(Math.random() * colors.length)],

            timing: colors[~~(Math.random() * colors.length)],
            timing_H: colors[~~(Math.random() * colors.length)],
            timing_V: colors[~~(Math.random() * colors.length)],

            quietZone: 40,
            quietZoneColor: '#f2f2f2',
            PO: colors[1],
            PI: colors[2],
            AO: colors[3],
            AI: colors[4],
            
            // EXTRA
            logo: logo,
            logoWidth:w,
            logoHeight:h,
            compressionLevel: 1,
            //logoBackgroundColor: chosenBgColor,
            logoBackgroundTransparent: false,

            backgroundImage: './'+chosenBgName+'.png',
            backgroundImageAlpha: 0.2
        }

        let qrcode = new QRCode(options_object);
        qrcode.saveImage({
            path: './created/'+id+'.png' // save path
        });
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