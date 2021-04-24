let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let scaleFactor = 1;
let xOffset = 0;
let yOffset = 0;
let unitWidth = 15;

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
    this.arrayOfXCoordinates = [];
    this.arrayOfYCoordinates = [];

    this.centerX = null;
    this.centerY = null;

    this.updatedX = null;
    this.updatedY = null;

    this.industrialization = null;

    this.landUnits = null;
    this.navalUnits = null;
    this.amphibiousUnits = null;
    this.atomBombUnits = null;
    this.bioweaponUnits = null;
    this.radarUnits = null;

    this.land = null;
    this.naval = null;
    this.amphibious = null;
    this.atomBomb = null;
    this.bioweapon = null;
    this.radar = null;

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
        if (this.landUnits > 0)
        {
            this.army = new Army(this.centerX, this.centerY, unitWidth, "#000", this.landUnits);
            this.army.draw();
        }
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
    this.selectionUnits = function()
    {
        if (this.landUnits > 0)
        {
            this.army = new Army(this.centerX, this.centerY, unitWidth, "rgba(" + HEX2RGB(playerColors[gameApp.game.regions.filter(region => region.name == this.name)[0].player]) + ", " + .7 + ")", this.landUnits);
            this.army.draw();
        }
    }
    this.update = function()
    {
        this.landUnits = gameApp.game.regions.filter(region => region.name == this.name)[0].units.land;
        this.navalUnits = gameApp.game.regions.filter(region => region.name == this.name)[0].units.naval;
        this.amphibiousUnits = gameApp.game.regions.filter(region => region.name == this.name)[0].units.amphibious;
        this.atomBombUnits = gameApp.game.regions.filter(region => region.name == this.name)[0].units.atomBombs;
        this.bioweaponUnits = gameApp.game.regions.filter(region => region.name == this.name)[0].units.bioweapons;
        this.radarUnits = gameApp.game.regions.filter(region => region.name == this.name)[0].units.radars;

        this.industrialization = gameApp.game.regions.filter(region => region.name == this.name)[0].industrialization;

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
            if (regionApp.selectedRegion == null)
            {
                regionApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
            }
            else if ((regionApp.selectedRegion.name != this.name) && (regionApp.targetRegion == "waiting"))
            {
                regionApp.targetRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
            }
            else if (regionApp.targetRegion == null)
            {
                regionApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
            }
            else if (regionApp.targetRegion.name != this.name)
            {
                regionApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
            }
        }

        this.draw();

        [this.centerX, this.centerY] = determineCenterOfRegion(this.updatedCoordinates);
    }
}

function Army(x, y, width, fillStyle, landUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.landUnits = landUnits;
    this.coordinates = [
        {
            x: (this.x - this.width / 2),
            y: (this.y - this.width / 2)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y - this.width / 2)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y + this.width / 2)
        },
        {
            x: (this.x - this.width / 2),
            y: (this.y + this.width / 2)
        }
    ];

    this.draw = function()
    {
        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        ctx.moveTo(this.coordinates[0].x, this.coordinates[0].y);
        for (coordinate of this.coordinates)
        {
            ctx.lineTo(coordinate.x, coordinate.y);
        }
        ctx.lineTo(this.coordinates[0].x, this.coordinates[0].y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.font = "10px Arial";
        ctx.fillText(this.landUnits,this.coordinates[0].x + (this.width/4),this.coordinates[0].y + (this.width/1.5));
    }
}

let regionArray = [];
let colorArray = ["#88CEC7","#CE888F","#B2CE88","#A488CE"];
let playerArray = [];
let playerColors = {};

let firstRegion = null;
let secondRegion = null;

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
    canvas.width = 750;
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
    if (regionApp.selectedRegion != null && (gameApp.game.regions.filter(region => region.name == regionApp.selectedRegion.name)[0].player != null))
    {
        for (region of regionArray)
        {
            if (region.name == regionApp.selectedRegion.name)
            {
                region.selectionUnits();
            }
        }
    }
    requestAnimationFrame(main);
}

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

    if (minX == 0)
    {
        averageX = 0 + (averageX / 3);
    }
    if (maxX == canvas.width)
    {
        averageX = canvas.width - (averageX / 8);
    }
    if (minX == 0 && maxX == canvas.width)
    {
        averageX = canvas.width / 2;
    }

    return [averageX, averageY];
}

function HEX2RGB (hex)
{
    "use strict";
    if (hex.charAt(0) === '#') {
        hex = hex.substr(1);
    }
    if ((hex.length < 2) || (hex.length > 6)) {
        return false;
    }
    var values = hex.split(''),
        r,
        g,
        b;

    if (hex.length === 2) {
        r = parseInt(values[0].toString() + values[1].toString(), 16);
        g = r;
        b = r;
    } else if (hex.length === 3) {
        r = parseInt(values[0].toString() + values[0].toString(), 16);
        g = parseInt(values[1].toString() + values[1].toString(), 16);
        b = parseInt(values[2].toString() + values[2].toString(), 16);
    } else if (hex.length === 6) {
        r = parseInt(values[0].toString() + values[1].toString(), 16);
        g = parseInt(values[2].toString() + values[3].toString(), 16);
        b = parseInt(values[4].toString() + values[5].toString(), 16);
    } else {
        return false;
    }
    return "" + r + "," + g + "," + b + "";
}

initialize();