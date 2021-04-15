let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

let scaleFactor = .85;
let xOffset = 350;
let yOffset = 20;

function main()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameApp.game != null)
    {
        for (region of gameApp.game.map.regions)
        {
            if (region.type == 'land')
            {
                ctx.fillStyle = '#0c6d13';
            }
            else
            {
                ctx.fillStyle = '#0c3468';
            }
            ctx.beginPath();
            ctx.moveTo(region.coordinates[0].x * scaleFactor + xOffset, region.coordinates[0].y * scaleFactor + yOffset);
            for (coordinate of region.coordinates)
            {
                ctx.lineTo(coordinate.x * scaleFactor + xOffset, coordinate.y * scaleFactor + yOffset);
            }
            ctx.lineTo(region.coordinates[0].x * scaleFactor + xOffset, region.coordinates[0].y * scaleFactor + yOffset);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();
        }
    }
    requestAnimationFrame(main);
}

main();