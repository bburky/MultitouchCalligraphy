var container = document.getElementById('canvas-container');
var size = Math.min(window.innerWidth, window.innerHeight);
var paper = Raphael(container, size, size);

var unpaired;
var currentstrokes = {};
var panning;

var xOffset = 0;
var yOffset = 0;

function touchstart (event) {
  event.preventDefault();
  var touches = event.changedTouches;

  for (var i=0; i<touches.length; i++) {
    var id = touches[i].identifier;
    var x = xOffset + touches[i].pageX;
    var y = yOffset + touches[i].pageY;

    if (currentstrokes[id] !== undefined) {
      console.warn('start: id already in use:' + id);
    } else if (unpaired === undefined) {
      console.log('unpaired start: ' + id + ' x:' + x + ' y:' + y);

      stroke = {
        color: '#' + Math.floor(Math.random() * 0xffffff).toString(16),
        points: {},
        path: paper.path(['M', x, y].join(' '))
      };
      unpaired = stroke;
      currentstrokes[id] = stroke;

      stroke.points[id] = [ [x, y] ];
      stroke.path.attr('fill', stroke.color);
    } else {
      console.log('paired start: ' + id + ' x:' + x + ' y:' + y);

      stroke = unpaired;
      unpaired = undefined;
      currentstrokes[id] = stroke;

      stroke.points[id] = [ [x, y] ];
      stroke.path.attr('path', generatePathData(stroke));
    }
  }
}

function touchmove (event) {
  event.preventDefault();
  var touches = event.changedTouches;

  for (var i=0; i<touches.length; i++) {
    var id = touches[i].identifier;
    var x = xOffset + touches[i].pageX;
    var y = yOffset + touches[i].pageY;

     if (panning !== undefined && panning.id === id) {
      console.log('panning move: ' + id + ' x:' + x + ' y:' + y);

      xOffset += panning.x - x;
      yOffset += panning.y - y;
      paper.setViewBox(xOffset, yOffset, size, size, false);

      panning.x = x;
      panning.y = y;
    } else if (currentstrokes[id] === undefined) {
      console.warn('move: id already ended:' + id);
      console.log(panning);
    } else if (currentstrokes[id] === unpaired && panning === undefined) {
      console.log('panning start: ' + id + ' x:' + x + ' y:' + y);

      // Kill the unpaired stroke, remove from currentstrokes
      stroke = currentstrokes[id];
      unpaired = undefined;
      delete currentstrokes[id];

      xOffset += stroke.points[id][0][0] - x;
      yOffset += stroke.points[id][0][1] - y;
      paper.setViewBox(xOffset, yOffset, size, size, false);

      panning = {
        id: id,
        x: x,
        y: y
      };
    } else if(currentstrokes[id] === unpaired) {
      console.log('unpaired move: ' + id + ' x:' + x + ' y:' + y);

      // Kill the unpaired stroke, remove from currentstrokes
      stroke = currentstrokes[id];
      unpaired = undefined;
      delete currentstrokes[id];
    } else {
      console.log('current move: ' + id + ' x:' + x + ' y:' + y);

      stroke = currentstrokes[id];

      stroke.points[id].push([ [x, y] ]);
      stroke.path.attr('path', generatePathData(stroke));
    }
  }
}

function touchend (argument) {
  event.preventDefault();
  var touches = event.changedTouches;

  for (var i=0; i<touches.length; i++) {
    var id = touches[i].identifier;
    var x = xOffset + touches[i].pageX;
    var y = yOffset + touches[i].pageY;

    if (panning !== undefined && panning.id === id) {
      console.log('panning end: ' + id + ' x:' + x + ' y:' + y);
      panning = undefined;
    } else if (currentstrokes[id] === undefined) {
      console.warn('end: id already ended:' + id);
    } else if (currentstrokes[id] === unpaired) {
      console.log('unpaired end: ' + id + ' x:' + x + ' y:' + y);

      // Kill the unpaired stroke and remove from currentstrokes
      unpaired = undefined;
      delete currentstrokes[id];
    } else {
      console.log('current end: ' + id + ' x:' + x + ' y:' + y);

      // Delete the currentstroke for the id. Note that the stroke may remain
      // in currentstrokes if the other touch has not yet ended
      delete currentstrokes[id];
    }
  }
}

function generatePathData (stroke) {
  var pathData = [];
  var first = true;
  var i;

  // Loop over both arrays of points
  for (var id in stroke.points) {
    if (stroke.points.hasOwnProperty(id)) {
      var points = stroke.points[id];

      if (first) {
        // Loop over the first list of points, first starting the path, then
        // adding each point
        first = false;
        pathData.push('M', points[0][0], points[0][1]);
        for (i = 2; i < points.length; i++) {
          pathData.push('L', points[i][0], points[i][1]);
        }
      } else {
        // Loop over the second list of points in reverse order, adding each
        // and then closing the path
        for (i = points.length - 1; i >= 0; i--) {
          pathData.push('L', points[i][0], points[i][1]);
        }
        pathData.push('Z');
      }
    }
  }

  return pathData.join(' ');
}

var circle = paper.circle(50, 40, 10);
circle.attr('fill', '#f00');

container.addEventListener('touchstart', touchstart, false);
container.addEventListener('touchmove', touchmove, false);
container.addEventListener('touchend', touchend, false);

