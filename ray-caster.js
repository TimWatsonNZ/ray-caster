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
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const player = {p: { x: 4 * wallWidth - wallWidth/2, y: 8 * wallWidth}, d: { x: 0, y: -1} };

const minimapHeight = 400;

const focalLength = 150;
const viewPlaneLength = 200;
const resolution = 50;
let walls = [];

document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'ArrowLeft') {
    player.d.x -= 0.1;
  }
  if (keyName === 'ArrowRight') {
    player.d.x += 0.1;
  }
  if (keyName === 'ArrowUp') {
    player.p = addVector(player.p, multVector(player.d, 0.5));
  }
  if (keyName === 'ArrowDown') {
    player.p = addVector(player.p, multVector(player.d, -0.5));
  }
});

function drawMinimap() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, minimapHeight);
  ctx.fillStyle = 'black';

  let negativeVP = viewPlaneLength / 2 * -1;
  let VP = viewPlaneLength/2;
  let playerX = player.p.x;
  let playerY = player.p.y;
  let playerSize = 5;

  const perp = { x: -1 * player.d.y, y: player.d.x };
  const playerViewVector = addVector(multVector(player.d, focalLength), player.p);
  
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

    if (column === 4) {
      console.log();
    }
    const rayPoint = castRay(normalisedVector(subVector({ x, y }, player.p)), player.p, { x, y }, playerViewVector);
    
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

function castRay(vector, origin, destination, playerViewVector, debugCtx) {
  let finalPoint = { x: origin.x, y: origin.y };
  let maxDistance = distance(origin, destination);
  const halfWallWidth = wallWidth/2;
  while (distance(origin, finalPoint) < maxDistance) {
    let x = finalPoint.x;
    let y = finalPoint.y;
    
    if (x < 0 || x > width || y < 0 || y > width) {
      return { finalPoint, distance: Infinity };
    }

    let positionInCellX = 0;
    if (vector.x > 0) {
      positionInCellX = wallWidth - (x % wallWidth);
    } else {
      positionInCellX = x % wallWidth;
    }

    if (positionInCellX === 0) {
      positionInCellX = wallWidth;
    }
    
    let xDistance = Infinity;
    if (vector.x !== 0) {
      xDistance = Math.abs(positionInCellX / vector.x);
    }
    
    let positionInCellY = (y % wallWidth);
    
    if (positionInCellY === 0) {
      positionInCellY = wallWidth;
    }
    
    let yDistance = Infinity;
    if (vector.y !== 0) {
      yDistance = Math.abs(positionInCellY / vector.y);
    }

    if (Math.abs(xDistance) < Math.abs(yDistance)) {
      let newX = 0;
      if (vector.x < 0) {
        newX = finalPoint.x - positionInCellX;
      } else {
        newX = finalPoint.x + positionInCellX;
      }
      
      const multiplier = xDistance;
      const newY = finalPoint.y + multiplier * vector.y;

      finalPoint = { x: newX, y: newY };

      if (cellHasWall(finalPoint, true)) {
        return { finalPoint, distance: viewDistance(origin, finalPoint, playerViewVector) };
      }
    } else {
      const newY = finalPoint.y + positionInCellY * Math.sign(vector.y);
      const multiplier = yDistance;
      const newX = finalPoint.x + multiplier * vector.x;
      finalPoint = { x: newX, y: newY };

      if (cellHasWall(finalPoint, false)) {
        return { finalPoint, distance: viewDistance(origin, finalPoint, playerViewVector) };
      }
    }
    if(debugCtx) {
      debugCtx.strokeRect(finalPoint.x, finalPoint.y, 4, 4);
    }
  }
  return { finalPoint, distance: Infinity };
}

function viewDistance(origin, finalPoint, viewVector) {
  const distanceFromOrigin = distance(origin, finalPoint);
  const distanceFocalPlane = distance(finalPoint, viewVector);

  return Math.sqrt(distanceFromOrigin*distanceFromOrigin - distanceFocalPlane*distanceFocalPlane);
}

function distance(v1, v2) {
  return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
}

function subVector(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function addVector(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function multVector(v, m) {
  return { x: v.x*m, y: v.y*m };
}

function normalisedVector(v) {
  const x = v.x, y = v.y;
  const mag = Math.sqrt(x*x + y*y);

  return { x: x/mag, y: y/mag};
}

const gameCanvas = document.createElement('canvas');

gameCanvas.width=width;
gameCanvas.height=height;
gameCanvas.setAttribute('style', 'margin: 8px;border: black 1px solid;');

document.getElementById('root').appendChild(gameCanvas);
const gtx = gameCanvas.getContext('2d');

function draw3D() {
  const drawWidth = width/resolution;
  gtx.fillStyle = 'rgb(255,255,255)';
  
  gtx.fillRect(0, 0, width, height);
  gtx.fillStyle = 'rgb(0,0,0)';
  for (let i = 0; i < walls.length; i ++) {
    if (walls[i].distance !== Infinity) {
      gtx.fillRect(i*drawWidth, height / 2.5 - wallWidth/2, drawWidth, 400/walls[i].distance * 40);
    }
  }
}

//  const c = Math.abs(w - h); -> top left to bot right gradient
let t = 0;
window.setInterval(() => {
 drawMinimap();
 draw3D();
}, 250);

