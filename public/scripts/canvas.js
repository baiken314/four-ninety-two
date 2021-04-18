let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let scaleFactor = 1;
let xOffset = 0;
let yOffset = 0;

let mouse =
{
	x: undefined,
	y: undefined
};

canvas.addEventListener('mousedown', e =>
{
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
});

function Region(regionObject)
{
    this.name = regionObject.name;
    this.type = regionObject.type;
    this.adjacentRegionNames = regionObject.adjacentRegionNames;

    this.coordinates = regionObject.coordinates;
    this.numberOfCoordinates = this.coordinates.length;
    this.industrialization = regionObject.industrialization;

    this.arrayOfXCoordinates = [];
    this.arrayOfYCoordinates = [];

    this.updatedCoordinated = null;

    this.centerX = null;
    this.centerY = null;

    this.updatedX = null;
    this.updatedY = null;

    this.draw = function()
    {
        if (gameApp.game.regions.filter(region => region.name == this.name)[0].player != null)
        {
            ctx.fillStyle = playerColors[gameApp.game.regions.filter(region => region.name == this.name)[0].player];
        }
        else if (this.type == 'land')
        {
            ctx.fillStyle = '#0c6d13';
        }
        else
        {
            ctx.fillStyle = '#0c3468';
        }
        this.arrayOfXCoordinates = [];
        this.arrayOfYCoordinates = [];
        this.updatedCoordinates = [];
        ctx.beginPath();
        ctx.moveTo(this.coordinates[0].x * scaleFactor + xOffset, this.coordinates[0].y * scaleFactor + yOffset);
        for (coordinate of this.coordinates)
        {
            this.updatedX = coordinate.x * scaleFactor + xOffset;
            this.updatedY = coordinate.y * scaleFactor + yOffset;
            ctx.lineTo(this.updatedX, this.updatedY);
            this.arrayOfXCoordinates.push(this.updatedX);
            this.arrayOfYCoordinates.push(this.updatedY);
            this.updatedCoordinates.push({x: this.updatedX, y: this.updatedY});
        }

        ctx.lineTo(this.coordinates[0].x * scaleFactor + xOffset, this.coordinates[0].y * scaleFactor + yOffset);
        ctx.strokeStyle = "#06111B";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
    }
    this.overlay = function()
    {
        [this.centerX, this.centerY] = determineCenterOfRegion(this.updatedCoordinates);
        ctx.fillStyle = "#000";
        ctx.font = "15px Arial";
        //console.log(this.centerX,this.centerY);
        ctx.fillText("X",this.centerX - 10,this.centerY);
    }
    this.selectionBorders = function()
    {
        for (adjacentRegionName of this.adjacentRegionNames)
        {
            for (region of regionArray)
            {
                if (adjacentRegionName == region.name)
                {
                    ctx.beginPath();
                    ctx.moveTo(region.updatedCoordinates[0].x, region.updatedCoordinates[0].y);
                    for (coordinate of region.updatedCoordinates)
                    {
                        ctx.lineTo(coordinate.x, coordinate.y);
                    }
            
                    ctx.lineTo(region.updatedCoordinates[0].x, region.updatedCoordinates[0].y);
                    let r_a = 0.3; 
                    ctx.fillStyle = "rgba(0, 0, 0, " + r_a + ")"; 
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
        ctx.beginPath();
        ctx.moveTo(this.updatedCoordinates[0].x, this.updatedCoordinates[0].y);
        for (coordinate of this.updatedCoordinates)
        {
            ctx.lineTo(coordinate.x, coordinate.y);
        }

        ctx.lineTo(this.updatedCoordinates[0].x, this.updatedCoordinates[0].y);
        let r_a = 0.3; 
        ctx.fillStyle = "rgba(255, 255, 255, " + r_a + ")"; 
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#FFF";
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
    this.update = function()
    {
        var i, j, inRegion = false;
        for( i = 0, j = this.numberOfCoordinates-1; i < this.numberOfCoordinates; j = i++ )
        {
            if( ( ( this.arrayOfYCoordinates[i] > mouse.y ) != ( this.arrayOfYCoordinates[j] > mouse.y ) ) && ( mouse.x < ( this.arrayOfXCoordinates[j] - this.arrayOfXCoordinates[i] ) * ( mouse.y - this.arrayOfYCoordinates[i] ) / ( this.arrayOfYCoordinates[j] - this.arrayOfYCoordinates[i] ) + this.arrayOfXCoordinates[i] ) )
            {
                inRegion = !inRegion;
            }
        }
        if(inRegion)
        {
            regionApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
        }
        this.draw();
    }
}

let regionArray = [];
let colorArray = ["#88CEC7","#CE888F","#B2CE88","#A488CE"];
let playerArray = [];
let playerColors = {};

function initialize()
{
    if (gameApp.game != null)
    {
        for (region of gameApp.game.map.regions)
        {
            regionArray.push(new Region(region));
        }
        playerArray = gameApp.game.players;
        let count = 0;
        for (player of playerArray)
        {
            playerColors[player._id] = colorArray[count];
            count++;
        }

        main();
    }
    else
    {
        requestAnimationFrame(initialize);
    }
}

function main()
{
    //if (gameApp.leftoverX != null)
    //{
        //scaleFactor = gameApp.leftoverX / 1600;
        //canvas.width = gameApp.leftoverX - 300;
        //xOffset = (gameApp.leftoverX - canvas.width);
    //}
    //else
    //{
    //    canvas.width = 875;
    //}
    canvas.width = 800;
    canvas.height = canvas.width;
    scaleFactor = canvas.width * .001;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (region of regionArray)
    {
        region.update();
    }
    if (regionApp.selectedRegion != null)
    {
        for (region of regionArray)
        {
            if (region.name == regionApp.selectedRegion.name)
            {
                region.selectionBorders();
            }
        }
    }
    for (region of regionArray)
    {
        region.overlay();
    }
    requestAnimationFrame(main);
}

// function makeRegionTheLastDrawn(arr, old_index, new_index)
// {
//     if (new_index >= arr.length)
//     {
//         var k = new_index - arr.length + 1;
//         while (k--)
//         {
//             arr.push(undefined);
//         }
//     }
//     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
// }

function determineCenterOfRegion(coordinates)
{
    let minX = 1000000;
    let maxX = -1000000;
    let minY = 1000000;
    let maxY = -1000000;

    for (coordinate of coordinates)
    {
        if (coordinate.x < minX)
        {
            minX = coordinate.x;
        }
        if (coordinate.x > maxX)
        {
            maxX = coordinate.x;
        }
        if (coordinate.y < minY)
        {
            minY = coordinate.y;
        }
        if (coordinate.y > maxY)
        {
            maxY = coordinate.y;
        }
    }
    let averageX = (minX + maxX) / 2;
    let averageY = (minY + maxY) / 2;
    return [averageX, averageY];
}

initialize();