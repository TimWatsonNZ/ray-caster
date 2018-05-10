const canvas = document.createElement('canvas');
const height = 800;
const width = 400;
const wallWidth = 40;

canvas.width=width;
canvas.height=height;

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

const player = {p: { x: 4 * wallWidth - wallWidth/2, y: 8 * wallWidth}, d: { x: 0, y: -1} };

const minimapHeight = 400;

function drawMinimap() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, minimapHeight);
  ctx.fillStyle = 'black';

  let focalLength = 100;
  let viewPlaneLength = 200;
  let negativeVP = viewPlaneLength / 2 * -1;
  let VP = viewPlaneLength/2;
  let playerX = player.p.x;
  let playerY = player.p.y;
  let playerSize = 10;
  let resolution = 10;

  const perp = { x: player.d.y, y: -1 * player.d.x };
  
  let start = {
    x: playerX + player.d.x * focalLength + perp.x * VP,
    y: playerY + player.d.y * focalLength + perp.y * VP
  };
  let end = { 
      x: playerX + player.d.x * focalLength + perp.x * negativeVP,
      y: playerY + player.d.y * focalLength + perp.y * negativeVP 
    };

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  for(let column = 0; column < resolution; column++) {
    let x = start.x + perp.x * viewPlaneLength / resolution * column;
    let y = start.y + perp.y * viewPlaneLength / resolution * column;
    
    if (column === 0) {
      ctx.beginPath();
      ctx.moveTo(playerX, playerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const newRayPoint = (castRay(normalisedVector(subVector({ x, y }, player.p)), player.p));
      
      ctx.fillRect(newRayPoint.x, newRayPoint.y, 5, 5);
    }
 
    ctx.beginPath();
    ctx.moveTo(0, column/resolution * minimapHeight);
    ctx.lineTo(width, column/resolution * minimapHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(column/resolution * width, 0);
    ctx.lineTo(column/resolution * width, minimapHeight);
    ctx.stroke();
  }

  for(let row = 0;row<map.length;row++) {
    for(let column = 0;column< map[row].length;column++) {
      if (map[row][column] === 1) {
        ctx.fillRect(column * wallWidth, row * wallWidth, wallWidth, wallWidth);
      }
    }
  }

  ctx.fillRect(player.p.x - playerSize/2, player.p.y - playerSize/2, playerSize, playerSize);
}

function castRay(vector, origin) {
  let x = origin.x;
  let y = origin.y;

  let positionInCellX = x - wallWidth*Math.floor(x / wallWidth);

  if (positionInCellX === 0) {
    positionInCellX = 40;
  }
  
  let xDistance = Infinity;
  if (vector.x !== 0) {
    xDistance = Math.abs(positionInCellX / vector.x);
  }
  
  let positionInCellY = y - wallWidth*Math.floor(y / wallWidth);
  
  if (positionInCellY === 0) {
    positionInCellY = 40;
  }
  
  let yDistance = Infinity;
  if (vector.y !== 0) {
    yDistance = Math.abs(positionInCellY / vector.y);
  }

  if (Math.abs(xDistance) < Math.abs(yDistance)) {
    const newX = origin.x + positionInCellX * Math.sign(vector.x);
    const multiplier = xDistance;
    const newY = origin.y + multiplier * vector.y;

    return { x: newX, y: newY };
  } else {
    const newY = origin.y +  positionInCellY * Math.sign(vector.y);
    const multiplier = yDistance;
    const newX = origin.x + multiplier * vector.x;
    return { x: newX, y: newY };
  }
}

function draw3D() {
  
}

function subVector(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function normalisedVector(v) {
  const x = v.x, y = v.y;
  const mag = Math.sqrt(x*x + y*y);

  return { x: x/mag, y: y/mag};
}

//  const c = Math.abs(w - h); -> top left to bot right gradient
let t = 0;
window.setInterval(() => {
 drawMinimap();
 draw3D();
}, 1000);

