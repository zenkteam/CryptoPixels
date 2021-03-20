var fs = require('fs')
var PImage = require('pureimage')
const amount = 5;

var tokens = []

var row = 1
var column = 0

let hexCode = "0123456789ABCDEF";
let Color = '#'
let counter = amount + 1

for(let i = 1; i < counter; ++i){

    // Create color
    for (let i = 0; i < 6; i++)
         Color += hexCode[Math.floor(Math.random() * 16)];

    // Increase column
    column += 1

    let x = (column-1)*10
    let y = (row-1)*10
    value = 100

    let special = checkForSpecialPiece(column, row, x, y)
    if(special === false){
        createImage(i, x, y, 10, 10)
    }else{
        value = special.value
    }

    // Create token
    let token = {
        "name": "CryptoPixel#" + i,
        "description": "This CryptoPixel lives " + x + "px to the right and " + y + "px down south.",
        "external_url": "https://cryptopixels.org/#CryptoPixel" + i,
        "image": "https://cryptopixels.org/pixels/" + i + ".jpg",
        "attributes": [
            {
                "trait_type": "serial",
                "value": i
            },
            {
                "trait_type": "column",
                "value": column
            },
            {
                "trait_type": "row",
                "value": row
            },
            {
                "trait_type": "color",
                "value": Color
            },
            {
                "trait_type": "size",
                "value": value
            }
        ]
    }

    if(column === 100){
        column = 0
        row += 1
    }

    tokens.push(token)
    console.log(token)
    Color = '#'
}

function checkForSpecialPiece(column, row, x, y){
    var specialBoundaries = [
        { name: 'centerpiece', x: { from: 400, to: 600 }, y: { from: 400, to: 600 }, value: 10000 },
        { name: 'upperLeftGuard', x: { from: 200, to: 400 }, y: { from: 200, to: 400 }, value: 10000 },
        { name: 'upperRightGuard', x: { from: 600, to: 800 }, y: { from: 200, to: 400 }, value: 10000 },
        { name: 'lowerLeftGuard', x: { from: 200, to: 400 }, y: { from: 600, to: 800 }, value: 10000 },
        { name: 'lowerRightGuard', x: { from: 600, to: 800 }, y: { from: 600, to: 800 }, value: 10000 },
    ]

    for (var boundary of specialBoundaries) {
        if (x >= boundary.x.from && x < boundary.x.to && y >= boundary.y.from && y < boundary.y.to) {
          return boundary.name;
        }
    }

    return false
}

function createImage(name, x, y, sizeX, sizeY){
    sizeX = sizeX || 10
    sizeY = sizeY || 10
    // Create pixel-imag
    // https://joshmarinacci.github.io/node-pureimage/
    var img = PImage.make(1000,1000);
    let ctx = img.getContext('2d')
    ctx.fillStyle = Color;
    ctx.fillRect(0,0,1000,1000);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x,y, sizeX, sizeY);
    PImage.encodePNGToStream(img, fs.createWriteStream('../react-app/public/pixels/'+name+'.png'))
}


fs.writeFileSync('pixels.json', JSON.stringify(tokens));