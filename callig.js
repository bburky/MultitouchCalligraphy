var container = document.getElementById('canvas-container');
var size = Math.max(window.innerWidth, window.innerHeight);
var paper = Raphael(container, size, size);

var unpaired;
var currentstrokes = {};

function touchstart (event) {
  event.preventDefault();
  var touches = event.changedTouches;

  for (var i=0; i<touches.length; i++) {
    var id = touches[i].identifier;

    if (currentstrokes[id] !== undefined) {
      console.warn('start: id already in use:' + id);
    } else if (unpaired === undefined) {
      console.log('unpaired start: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      stroke = {
        color: '#' + Math.floor(Math.random() * 0xffffff).toString(16),
        points: {},
        path: paper.path(['M', touches[i].pageX, touches[i].pageY].join(' '))
      };
      unpaired = stroke;
      currentstrokes[id] = stroke;

      stroke.points[id] = [ [touches[i].pageX, touches[i].pageY] ];
      stroke.path.attr('fill', stroke.color);
    } else {
      console.log('paired start: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      stroke = unpaired;
      unpaired = undefined;
      currentstrokes[id] = stroke;

      stroke.points[id] = [ [touches[i].pageX, touches[i].pageY] ];
      stroke.path.attr('path', generatePathData(stroke));
    }
  }
}

function touchmove (event) {
  event.preventDefault();
  var touches = event.changedTouches;

  for (var i=0; i<touches.length; i++) {
    var id = touches[i].identifier;

    if (currentstrokes[id] === undefined) {
      console.warn('move: id already ended:' + id);
    } else if (currentstrokes[id] === unpaired) {
      console.log('unpaired move: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      // Kill the unpaired stroke if it is moving
      unpaired = undefined;
      delete currentstrokes[id];

      // TODO: pan the canvas when this happens
    } else {
      console.log('current move: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      stroke = currentstrokes[id];

      stroke.points[id].push([ [touches[i].pageX, touches[i].pageY] ]);
      stroke.path.attr('path', generatePathData(stroke));
    }
  }
}

function touchend (argument) {
  event.preventDefault();
  var touches = event.changedTouches;

  for (var i=0; i<touches.length; i++) {
    var id = touches[i].identifier;

    if (currentstrokes[id] === undefined) {
      console.warn('end: id already ended:' + id);
    } else if (currentstrokes[id] === unpaired) {
      console.log('unpaired end: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      // Kill the unpaired stroke if it ends
      unpaired = undefined;
      delete currentstrokes[id];
    } else {
      console.log('current end: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      // Delete the current stroke for the id. Note that the stroke may remain
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

