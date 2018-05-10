const minmapCanvas = document.createElement('canvas');
const height = 400;
const width = 400;
const wallWidth = 40;

minmapCanvas.width=width;
minmapCanvas.height=height;

document.getElementById('root').appendChild(minmapCanvas);
const ctx = minmapCanvas.getContext('2d');

const map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const player = {p: { x: 4 * wallWidth - wallWidth/2, y: 8 * wallWidth}, d: { x: 0, y: -1} };

const minimapHeight = 400;

let walls = [];

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
  let resolution = 9;

  const perp = { x: -1 * player.d.y, y: player.d.x };
  
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

  walls = [];

  for(let row = 0;row < map.length;row++) {
    for(let column = 0;column< map[row].length;column++) {
      if (map[row][column] === 1) {
        ctx.fillStyle = 'rgb(120, 120, 120, 0.4)';
        ctx.fillRect(column * wallWidth, row * wallWidth, wallWidth, wallWidth);
        ctx.fillStyle = 'rgb(0, 0, 0)';
      } else {
        //ctx.fillStyle = 'rgb(120, 120, 120';
        ctx.strokeRect(column * wallWidth, row * wallWidth, wallWidth, wallWidth);
      }
    }
  }

  for(let column = 0; column <= resolution; column++) {
    let x = start.x + perp.x * viewPlaneLength / resolution * column;
    let y = start.y + perp.y * viewPlaneLength / resolution * column;
    
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (column === 8) {
      console.log();
    }
    const rayPoint = castRay(normalisedVector(subVector({ x, y }, player.p)), player.p, { x, y });
    
    ctx.fillRect(rayPoint.finalPoint.x, rayPoint.finalPoint.y, 5, 5);
    walls.push(rayPoint);
  }

  ctx.fillRect(player.p.x - playerSize/2, player.p.y - playerSize/2, playerSize, playerSize);
}

function cellHasWall(position, isX) {
  const x = Math.floor(position.x/wallWidth);
  const y = Math.floor(position.y/wallWidth);

  if (isX) {
    if (x > 0) {
      return map[y][x] === 1 || map[y][x - 1] === 1;
    }
  } else {
    if (y > 0) {
      return map[y][x] === 1 || map[y-1][x] === 1;
    }
  }

  return map[x][y] === 1;
}

function castRay(vector, origin, destination) {
  let finalPoint = { x: origin.x, y: origin.y };
  let maxDistance = distance(origin, destination);

  while (distance(origin, finalPoint) < maxDistance) {
    let x = finalPoint.x;
    let y = finalPoint.y;

    let positionInCellX = x - wallWidth*Math.floor(x / wallWidth);

    if (positionInCellX === 0) {
      positionInCellX = wallWidth;
    }
    
    let xDistance = Infinity;
    if (vector.x !== 0) {
      xDistance = Math.abs(positionInCellX / vector.x);
    }
    
    let positionInCellY = y - wallWidth*Math.floor(y / wallWidth);
    
    if (positionInCellY === 0) {
      positionInCellY = wallWidth;
    }
    
    let yDistance = Infinity;
    if (vector.y !== 0) {
      yDistance = Math.abs(positionInCellY / vector.y);
    }

    if (Math.abs(xDistance) < Math.abs(yDistance)) {
      const newX = finalPoint.x + positionInCellX * Math.sign(vector.x);
      const multiplier = xDistance;
      const newY = finalPoint.y + multiplier * vector.y;

      finalPoint = { x: newX, y: newY };

      if (cellHasWall(finalPoint, true)) {
        return { finalPoint, distance: distance(origin, finalPoint) };
      }
    } else {
      const newY = finalPoint.y +  positionInCellY * Math.sign(vector.y);
      const multiplier = yDistance;
      const newX = finalPoint.x + multiplier * vector.x;
      finalPoint = { x: newX, y: newY };

      if (cellHasWall(finalPoint, false)) {
        return { finalPoint, distance: distance(origin, finalPoint) };
      }
    }
  }
  return { finalPoint, distance: Infinity };
}


function distance(v1, v2) {
  return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
}

function subVector(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function normalisedVector(v) {
  const x = v.x, y = v.y;
  const mag = Math.sqrt(x*x + y*y);

  return { x: x/mag, y: y/mag};
}

const gameCanvas = document.createElement('canvas');

gameCanvas.width=width;
gameCanvas.height=height;

document.getElementById('root').appendChild(gameCanvas);
const gtx = gameCanvas.getContext('2d');

function draw3D() {
  for (let i = 0; i < walls.length; i ++) {
    if (walls[i].distance !== Infinity) {
      gtx.fillRect(i*wallWidth, height / 2 + wallWidth/2, wallWidth, 400/walls[i].distance * 40);
    }
  }
}

//  const c = Math.abs(w - h); -> top left to bot right gradient
let t = 0;
window.setInterval(() => {
 drawMinimap();
 draw3D();
}, 1000);

