let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let scaleFactor = 1;
let xOffset = 0;
let yOffset = 0;
let unitWidth = 20;
let unitHeight = 10;
let unitHorizontalSpacing = unitWidth * 1.2;
let unitVerticalSpacing = unitHeight * 1.2;

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
        else if (gameApp.game.regions.filter(region => region.name == this.name)[0].traverseCountdown > 0)
        {
            ctx.fillStyle = '#000';
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
        unitColor = "#000";
        if (gameApp.selectedRegion != null && this.name == gameApp.selectedRegion.name)
        {
            unitColor = "rgba(" + HEX2RGB(playerColors[gameApp.game.regions.filter(region => region.name == this.name)[0].player], 50) + ", " + 1 + ")";
        }

        regionMilitaryUnitTypeCount = 0;
        regionSpecialUnitTypeCount = 0;
        if (this.landUnits > 0)
        {
            regionMilitaryUnitTypeCount++;
        }
        if (this.navalUnits > 0)
        {
            regionMilitaryUnitTypeCount++;
        }
        if (this.amphibiousUnits > 0)
        {
            regionMilitaryUnitTypeCount++;
        }
        if (gameApp.game.regions.filter(region => region.name == this.name)[0].player == gameApp.player._id)
        {
            if (this.atomBombUnits > 0)
            {
                regionSpecialUnitTypeCount++;
            }
            if (this.bioweaponUnits > 0)
            {
                regionSpecialUnitTypeCount++;
            }
            if (this.radarUnits > 0)
            {
                regionSpecialUnitTypeCount++;
            }
        }
        
        militaryUnitCenterX = this.centerX - (((unitWidth / 2) + ((regionMilitaryUnitTypeCount - 1) * (unitHorizontalSpacing))) / 2);
        specialUnitCenterX = this.centerX - (((unitWidth / 2) + ((regionSpecialUnitTypeCount - 1) * (unitHorizontalSpacing))) / 2);
        militaryUnitCenterY = this.centerY;
        specialUnitCenterY = this.centerY;
        if (regionSpecialUnitTypeCount > 0 && regionMilitaryUnitTypeCount > 0)
        {
            militaryUnitCenterY = militaryUnitCenterY - unitVerticalSpacing;
            specialUnitCenterY = militaryUnitCenterY + unitVerticalSpacing;
        }

        if (this.landUnits > 0)
        {
            this.land = new Land(militaryUnitCenterX, militaryUnitCenterY, unitWidth, unitHeight, unitColor, this.landUnits);
            this.land.draw();
            militaryUnitCenterX += unitHorizontalSpacing;
        }
        if (this.navalUnits > 0)
        {
            this.naval = new Naval(militaryUnitCenterX, militaryUnitCenterY, unitWidth, unitHeight, unitColor, this.navalUnits);
            this.naval.draw();
            militaryUnitCenterX += unitHorizontalSpacing;
        }
        if (this.amphibiousUnits > 0)
        {
            this.amphibious = new Amphibious(militaryUnitCenterX, militaryUnitCenterY, unitWidth, unitHeight, unitColor, this.amphibiousUnits);
            this.amphibious.draw();
            militaryUnitCenterX += unitHorizontalSpacing;
        }
        if (gameApp.game.regions.filter(region => region.name == this.name)[0].player == gameApp.player._id)
        {
            if (this.atomBombUnits > 0)
            {
                this.atomBomb = new AtomBomb(specialUnitCenterX, specialUnitCenterY, unitWidth, unitHeight, unitColor, this.atomBombUnits);
                this.atomBomb.draw();
                specialUnitCenterX += unitHorizontalSpacing;
            }
            if (this.bioweaponUnits > 0)
            {
                this.bioweapon = new Bioweapon(specialUnitCenterX, specialUnitCenterY, unitWidth, unitHeight, unitColor, this.bioweaponUnits);
                this.bioweapon.draw();
                specialUnitCenterX += unitHorizontalSpacing;
            }
            if (this.radarUnits > 0)
            {
                this.radar = new Radar(specialUnitCenterX, specialUnitCenterY, unitWidth, unitHeight, unitColor, this.radarUnits);
                this.radar.draw();
                specialUnitCenterX += unitHorizontalSpacing;
            }
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
            if (gameApp.selectedRegion == null && gameApp.showActions == true)
            {
                gameApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
                gameApp.adjacentRegionIsOwnedByPlayer = false;
                gameApp.checkIfAdjacentRegionIsOwnedByPlayer();
            }
            else if ((gameApp.selectedRegion.name != this.name) && (gameApp.targetRegion == "waiting"))
            {
                gameApp.targetRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
            }
            else if (gameApp.targetRegion == null && gameApp.showActions == true)
            {
                gameApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
                gameApp.adjacentRegionIsOwnedByPlayer = false;
                gameApp.checkIfAdjacentRegionIsOwnedByPlayer();
            }
            else if (gameApp.targetRegion != null && gameApp.targetRegion.name != this.name && gameApp.showActions == true)
            {
                gameApp.selectedRegion = gameApp.game.regions.filter(region => region.name == this.name)[0];
                gameApp.adjacentRegionIsOwnedByPlayer = false;
                gameApp.checkIfAdjacentRegionIsOwnedByPlayer();
            }
        }

        this.draw();

        [this.centerX, this.centerY] = determineCenterOfRegion(this.updatedCoordinates);
    }
}

function Land(x, y, width, height, fillStyle, landUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.landUnits = landUnits;
    this.coordinates = [
        {
            x: (this.x - this.width / 3),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y + this.height / 2)
        },
        {
            x: (this.x - this.width / 2),
            y: (this.y + this.height / 2)
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
        ctx.fillText(this.landUnits,this.coordinates[0].x + (this.width/5),this.coordinates[0].y + (this.height/1.3));
    }
}

function Naval(x, y, width, height, fillStyle, navalUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.navalUnits = navalUnits;
    this.coordinates = [
        {
            x: (this.x - this.width / 2),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y + this.height / 2)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y + this.height / 2)
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
        ctx.fillText(this.navalUnits,this.coordinates[3].x + (this.width/5),this.coordinates[0].y + (this.height/1.3));
    }
}

function Amphibious(x, y, width, height, fillStyle, amphibiousUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.amphibiousUnits = amphibiousUnits;
    this.coordinates = [
        {
            x: (this.x - this.width / 2),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y + this.height / 2)
        },
        {
            x: (this.x - this.width / 2),
            y: (this.y + this.height / 2)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y)
        },
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
        ctx.fillText(this.amphibiousUnits,this.coordinates[5].x + (this.width/5),this.coordinates[0].y + (this.height/1.3));
    }
}

function AtomBomb(x, y, width, height, fillStyle, atomBombUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.atomBombUnits = atomBombUnits;
    this.coordinates = [
        {
            x: (this.x),
            y: (this.y + this.height / 2)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y)
        },
        {
            x: (this.x + this.width / 5),
            y: (this.y - this.height / 3)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x - this.width / 5),
            y: (this.y - this.height / 3)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y)
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
        ctx.fillText(this.atomBombUnits,this.coordinates[6].x + (this.width/5),this.coordinates[0].y - (this.height/4));
    }
}

function Bioweapon(x, y, width, height, fillStyle, bioweaponUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bioweaponUnits = bioweaponUnits;
    this.coordinates = [
        {
            x: (this.x),
            y: (this.y - this.height / 4)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y - this.height / 2.5)
        },
        {
            x: (this.x + this.width / 2.5),
            y: (this.y - this.height / 3)
        },
        {
            x: (this.x + this.width / 4),
            y: (this.y)
        },
        {
            x: (this.x + this.width / 2.5),
            y: (this.y + this.height / 3)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y + this.height / 2.5)
        },
        {
            x: (this.x),
            y: (this.y + this.height / 4)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y + this.height / 2.5)
        },
        {
            x: (this.x - this.width / 2.5),
            y: (this.y + this.height / 3)
        },
        {
            x: (this.x - this.width / 4),
            y: (this.y)
        },
        {
            x: (this.x - this.width / 2.5),
            y: (this.y - this.height / 3)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y - this.height / 2.5)
        },
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
        ctx.fillText(this.bioweaponUnits,this.coordinates[0].x - (this.width/6),this.coordinates[0].y + (this.height/2));
    }
}

function Radar(x, y, width, height, fillStyle, radarUnits)
{
    this.fillStyle = fillStyle;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.radarUnits = radarUnits;
    this.coordinates = [
        {
            x: (this.x - this.width / 2),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x - this.width / 4),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x - this.width / 5),
            y: (this.y + this.height / 5)
        },
        {
            x: (this.x + this.width / 5),
            y: (this.y + this.height / 5)
        },
        {
            x: (this.x + this.width / 4),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 2),
            y: (this.y - this.height / 2)
        },
        {
            x: (this.x + this.width / 3),
            y: (this.y + this.height / 2)
        },
        {
            x: (this.x - this.width / 3),
            y: (this.y + this.height / 2)
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
        ctx.fillText(this.radarUnits,this.coordinates[2].x,this.coordinates[0].y + (this.height/1.3));
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
    if (gameApp.selectedRegion != null)
    {
        for (region of regionArray)
        {
            if (region.name == gameApp.selectedRegion.name)
            {
                region.selectionBorders();
            }
        }
    }
    for (regionIndex of regionArray)
    {
        if (gameApp.game.regions.filter(region => region.name == regionIndex.name)[0].player != null)
        {
            regionIndex.overlay();
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

function HEX2RGB (hex, darkerBy)
{
    this.darkerBy = darkerBy;
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
    return "" + (r * ((100 - darkerBy) / 100)) + "," + (g * ((100 - darkerBy) / 100)) + "," + (b * ((100 - darkerBy) / 100)) + "";
}

initialize();