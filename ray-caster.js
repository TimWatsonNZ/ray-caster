const canvas = document.createElement('canvas');
const size = 400;

canvas.width=size;
canvas.height=size;

document.getElementById('root').appendChild(canvas);
const ctx = canvas.getContext('2d');

const map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const focalLength = 10;

const player = {p: { x: 5, y: 6}, d: { x: 0, y: -1} };

function draw() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'black';

  let focalLength = 100;
  let viewPlaneLength = 200;
  let negativeVP = viewPlaneLength / 2 * -1;
  let VP = viewPlaneLength/2;
  let playerX = player.p.x * 40;
  let playerY = player.p.y * 40;

  const perp = { x: player.d.y, y: -1 * player.d.x };
  let start = { 
      x: playerX + player.d.x * focalLength + perp.x * negativeVP,
      y: playerY + player.d.y * focalLength + perp.y * negativeVP 
    };
  
    let end = {
    x: playerX + player.d.x * focalLength + perp.x * VP,
    y: playerY + player.d.y * focalLength + perp.y * VP
  };

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  for(let column = 0; column < 10; column ++) {

    let x = start.x + perp.x * viewPlaneLength / 10 * column;
    let y = start.y + perp.y * viewPlaneLength / 10 * column;
    
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, column * size / 10);
    ctx.lineTo(size, column * size / 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(column * size / 10, 0);
    ctx.lineTo( column * size / 10, size);
    ctx.stroke();
  }

  ctx.fillRect(player.p.x * size/10 - 5, player.p.y * size/10 - 5, 10, 10);
}

function castRay(vector, origin) {
  let x = origin.x;
  let y = origin.y;

  let nextX = (1 + x) / vector.x;
}

//  const c = Math.abs(w - h); -> top left to bot right gradient
let t = 0;
window.setInterval(() => {
 draw();
}, 1000);

