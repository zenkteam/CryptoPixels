var fs = require('fs')
var PImage = require('pureimage')

const amount = 1;

var tokens = []

var row = 1
var column = 0

let hexCode = "0123456789ABCDEF";
let Color = '#'
let counter = amount + 1

var fnt = PImage.registerFont('MajorMonoDisplay-Regular.ttf','Major Mono Display');

for(let i = 1; i < counter; ++i){
    createImage(i)
}

function createImage(id){
    // Create pixel-imag
    // https://joshmarinacci.github.io/node-pureimage/
    fnt.load(() => {
        var img = PImage.make(350,350);

        // bg
        let ctx = img.getContext('2d')
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,1000,1000);

        // nr
        ctx.font = "48pt 'Major Mono Display'";
        ctx.fillStyle = '#000000';
        const text = "#"+id
        const textData = ctx.measureText(text)
        const x = parseInt(350/2-(textData.width/2))
        const y = parseInt(350/2)
        ctx.fillText(text, x, y);

        for(let i = 0; i < 20; ++i){
            ctx = addRandomPixelblock(ctx)
        }
        

        // random positioned pixels
        //ctx.fillRect(0,0,350,350);
        //ctx.fillStyle = '#ffffff';
        //ctx.fillRect(x,y, sizeX, sizeY);

        // Write image
        PImage.encodePNGToStream(img, fs.createWriteStream('./created/'+id+'.png')) //../react-app/public/pixels/'+id+'.png' 
    });
   
}

var randomProperty = function (obj) {
    const keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

function addRandomPixelblock(ctx){
    let randPos = Math.random() * 350
    let sides = { 
        left: { // left
            "x": 0,
            "y": randPos
        },
        right : { // right
            "x": 350,
            "y": randPos
        },
        bottom : { // bottom
            "x": randPos,
            "y": 340
        },
        top : { // top
            "x": randPos,
            "y": 0
        }
    }
    
    let r = randomProperty(sides)
   // console.log(r)

    ctx.fillStyle = '#000000';
    ctx.fillRect(randPos = Math.random() * 350,randPos = Math.random() * 350, 10, 10);

    return ctx
}