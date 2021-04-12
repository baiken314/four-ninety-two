var canvas = document.querySelector('canvas');
// canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 32;

var c = canvas.getContext('2d');

var mouse =
{
	x: undefined,
	y: undefined
}

window.addEventListener('mousemove',
	function(event)
	{
		mouse.x = event.x;
		mouse.y = event.y;
	}

)





// function Circle(x, y, radius, velocityX, velocityY)
// {
// 	this.x = x;
// 	this.y = y;
// 	this.radius = radius;
// 	this.velocityX = velocityX;
// 	this.velocityY = velocityY;

// 	this.draw = function()
// 	{
// 		c.beginPath();
// 		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
// 		c.strokeStyle = "red";
// 		c.stroke();
// 	}
// 	this.update = function()
// 	{
// 		if ((this.x + this.radius > innerWidth) || (this.x - this.radius < 0))
// 		{
// 			this.velocityX = -this.velocityX;
// 		}
// 		if ((this.y + this.radius > innerHeight) || (this.y - this.radius < 0))
// 		{
// 			this.velocityY = -this.velocityY;
// 		}

// 		this.x += this.velocityX;
// 		this.y += this.velocityY;

// 		if (((mouse.x - this.x < 50) && (mouse.x - this.x > -50)) && ((mouse.y - this.y < 50) && (mouse.y - this.y > -50)))
// 		{
// 			if (this.radius < 100)
// 			{
// 				if (this.x + this.radius > innerWidth)
// 				{
// 					this.x -= 1;
// 				}
// 				if (this.x - this.radius < 0)
// 				{
// 					this.x += 1;
// 				}
// 				if (this.y + this.radius > innerHeight)
// 				{
// 					this.y -= 1;
// 				}
// 				if (this.y - this.radius < 0)
// 				{
// 					this.y += 1;
// 				}
// 				this.radius += 1;
// 			}
// 		}
// 		else
// 		{
// 			if (this.radius > 5)
// 			{
// 				this.radius -= 1;
// 			}
// 		}

// 		this.draw()
// 	}
// }

// var circleArray = [];

// for (var i = 0; i < 2000; i++)
// {
// 	var radius = 5;
// 	var x = Math.random() * (window.innerWidth - radius * 2) + radius;
// 	var y = Math.random() * (window.innerHeight - radius * 2) + radius;
// 	var velocityX = (Math.random() - .5) * 10;
// 	var velocityY = (Math.random() - .5) * 10;
// 	circleArray.push(new Circle(x, y, radius, velocityX, velocityY));
// }

// function animate()
// {
// 	requestAnimationFrame(animate);
// 	c.clearRect(0,0,innerWidth,innerHeight);
// 	for (var i = 0; i < circleArray.length; i++)
// 	{
// 		circleArray[i].update()
// 	}
// }
// animate();

//Rectangle
// c.fillStyle = 'green';
// c.fillRect(100, 100, 15, 20);

//Line
// c.beginPath();
// c.moveTo(30, 150);
// c.lineTo(0, 200);
// c.strokeStyle = "cyan";
// c.stroke();

//Circle (Arcs)
// c.beginPath();
// c.arc(150, 150, 60, 0, Math.PI * 2, false);
// c.strokeStyle = "red";
// c.stroke();