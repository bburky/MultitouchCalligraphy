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
        paths: []
      };
      unpaired = stroke;
      currentstrokes[id] = stroke;

      stroke.points[id] = [ [x, y] ];
    } else {
      console.log('paired start: ' + id + ' x:' + x + ' y:' + y);

      stroke = unpaired;
      unpaired = undefined;
      currentstrokes[id] = stroke;

      stroke.points[id] = [ [x, y] ];
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

      // Get other id for this stroke
      var otherId;
      for (otherId in stroke.points) {
        if (stroke.points.hasOwnProperty(otherId)) {
          if (otherId != id) {
            // Note that otherId is a string, JS object keys are absurd and
            // are only strings
            break;
          }
        }
      }

      var pointsA = stroke.points[id];
      var pointA = pointsA[pointsA.length - 1];

      var pointsB = stroke.points[otherId];
      var pointB = pointsB[pointsB.length - 1];

      var path = paper.path(
        [
          'M', pointA[0], pointA[1],
          'L', pointB[0], pointB[1],
          'L', x, y,
          'Z'
        ].join(' ')
      );
      path.attr('fill', stroke.color);
      path.attr('stroke', stroke.color);
      stroke.paths.push(path);

      stroke.points[id].push([ [x, y] ]);
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

var circle = paper.circle(50, 40, 10);
circle.attr('fill', '#f00');

container.addEventListener('touchstart', touchstart, false);
container.addEventListener('touchmove', touchmove, false);
container.addEventListener('touchend', touchend, false);

