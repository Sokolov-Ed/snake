let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width, height, blockSize, widthInBlocks, heightInBlocks, fontSizeScore, mainFontSize;
let score = 0;
let animationTime = 100;
let timeoutID;

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
	$(".controlField").css({display: "grid"});
	$(".description").css({display: "none"});
	$("canvas").attr({
		width: "800",
		height: "800"
	});
	$(".gameName img").css({height: "175px"});
	$(".gameName span").css({fontSize: "125px"});
	fontSizeScore = 50;
	mainFontSize = 115;
	blockSize = 25;
	width = canvas.width;
	height = canvas.height;
	widthInBlocks = width / blockSize;
	heightInBlocks = height / blockSize;
}
else {
	fontSizeScore = 10;
	mainFontSize = 60;
	blockSize = 10;
	width = 500;
	height = 500;
	widthInBlocks = width / blockSize;
	heightInBlocks = height / blockSize;
}

let drawBorder = function(){
	ctx.fillStyle = "#77E588";
	ctx.fillRect(0, 0, width, blockSize);
	ctx.fillRect(0, height - blockSize, width, blockSize);
	ctx.fillRect(0, 0, blockSize, height);
	ctx.fillRect(width - blockSize, 0, blockSize, height);
}
let drawScore = function(){
	ctx.font = `${fontSizeScore}px Courier`;
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + score, blockSize, blockSize);
}
let gameOver = function(){
	clearTimeout(timeoutID);
	ctx.font = `${mainFontSize}px Courier`;
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Game over", width / 2, height / 2);
	$("body").keydown(function (event) {
		let itIsGameOver = event.keyCode;
		if (itIsGameOver){
			clearTimeout(timeoutID);
			location.reload();
		}
	});
	$(".controlField").mousedown(function(event) {
		if(event.target.closest('button')) {
			clearTimeout(timeoutID);
			location.reload();
		}
	});
}
let pause = function(){
	ctx.font = `${mainFontSize}px Courier`;
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Pause", width / 2, height / 2);
}
let circle = function(x, y, radius, fillCircle){
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	if(fillCircle)
		ctx.fill()
	else
		ctx.stroke();
}
let Block = function(col, row){
	this.col = col;
	this.row = row;
}
Block.prototype.drawSquare = function(color){
	let x = this.col * blockSize;
	let y = this.row * blockSize;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize);
}
Block.prototype.drawCircle = function(color){
	let centerX = this.col * blockSize + blockSize / 2;
	let centerY = this.row * blockSize + blockSize / 2;
	ctx.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true);
}
Block.prototype.equal = function(otherBlock){
	return this.col === otherBlock.col && this.row === otherBlock.row;
}
let Snake = function(){
	this.segments = [
	new Block(7, 5),
	new Block(6, 5),
	new Block(5, 5)
	];
	this.direction = "right";
	this.nextDirection = "right";
}
Snake.prototype.draw = function(){
	for(let i = 0; i < this.segments.length; i++){
		if(i < 10)
			this.segments[i].drawSquare("darkviolet");
		else if(i < 20)
			this.segments[i].drawSquare("blue");
		else if(i < 30)
			this.segments[i].drawSquare("green");
		else if(i < 40)
			this.segments[i].drawSquare("yellow");
		else if(i < 50)
			this.segments[i].drawSquare("orange");
		else
			this.segments[i].drawSquare("red");
	}
}
Snake.prototype.move = function(){
	if(this.nextDirection === "space")
		return pause();
	let head = this.segments[0];
	let newHead;
	this.direction = this.nextDirection;
	if(this.direction === "right")
		newHead = new Block(head.col + 1, head.row)
	else if(this.direction === "down")
		newHead = new Block(head.col, head.row + 1)
	else if(this.direction === "left")
		newHead = new Block(head.col - 1, head.row)
	else if(this.direction === "up")
		newHead = new Block(head.col, head.row - 1)
	if(this.checkCollision(newHead)){
		gameOver();
		return;
	}
	this.segments.unshift(newHead);
	if(newHead.equal(apple.position)){
		score++;
		animationTime--;
		apple.move(this.segments);
	}
	else
		this.segments.pop()
}
Snake.prototype.checkCollision = function(head){
	let leftCollision = (head.col === 0);
	let topCollision = (head.row === 0);
	let rightCollision = (head.col === widthInBlocks - 1);
	let bottomCollision = (head.row === heightInBlocks - 1);
	let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
	let selfCollision = false;
	for(let i = 0; i < this.segments.length; i++){
		if(head.equal(this.segments[i]))
			selfCollision = true;
	}
	return wallCollision || selfCollision;
}
Snake.prototype.setDirection = function(newDirection){
	if(this.direction === "up" && newDirection === "down")
		return;
	else if(this.direction === "right" && newDirection === "left")
		return;
	else if(this.direction === "down" && newDirection === "up")
		return;
	else if(this.direction === "left" && newDirection === "right")
		return;
	else if(this.direction === "space" && newDirection === "space"){
		return;
	}
	this.nextDirection = newDirection;
}
let Apple = function(){
	this.position = new Block(10, 10);
}
Apple.prototype.draw = function(){
	this.position.drawCircle("red");
}
Apple.prototype.move = function(occupiedBlocks){
	let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
	let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
	this.position = new Block(randomCol, randomRow);
	let index = occupiedBlocks.length - 1;
	while (index >= 0){
		if(this.position.equal(occupiedBlocks[index])){
			this.move(occupiedBlocks);
			return;
		}
		index--;
	}
}
let snake = new Snake();
let apple = new Apple();
let gameLoop = function(){
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();
	timeoutID = setTimeout(gameLoop, animationTime);
}
gameLoop();
let directions = {
	37: "left",
	38: "up",
	39: "right",
	40: "down",
	32: "space"
};

$("body").keydown(function (event) {
	let newDirection = directions[event.keyCode];
	if (newDirection !== undefined){
		snake.setDirection(newDirection);
	}
});
$(".controlField").mousedown(function(event) {
	if(event.target.closest('button')) {
		snake.setDirection(`${event.target.id}`);
	}
});