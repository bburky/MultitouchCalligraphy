var container = document.getElementById('canvas-container');
var size = Math.max(window.innerWidth, window.innerHeight);
var paper = Raphael(container, size, size);

var unpaired;
var currentpaths = {};
var currentrenderedpaths = [];
var paths;

function touchstart (event) {
  event.preventDefault();
  var touches = event.changedTouches;

  console.log('start');

    for (var i=0; i<touches.length; i++) {
      var id = touches[i].identifier;
      currentpaths[id] = {
        'color': '#' + Math.floor(Math.random() * 0xffffff).toString(16),
        'points': [
          [touches[i].pageX, touches[i].pageY]
        ],
        'path': paper.path(['M', touches[i].pageX, touches[i].pageY].join(' '))
      };

      console.log('start: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      var circle = paper.circle(touches[i].pageX, touches[i].pageY, 10);
      circle.attr('fill', currentpaths[id].color);
  }
}

function touchmove (event) {
  event.preventDefault();
  var touches = event.changedTouches;

  console.log('start');

    for (var i=0; i<touches.length; i++) {
      var id = touches[i].identifier;
      console.log('move: ' + id + ' x:' + touches[i].pageX + ' y:' + touches[i].pageY);

      currentpaths[id].points.push([touches[i].pageX, touches[i].pageY]);
      currentpaths[id].path.attr('path',
        currentpaths[id].path.attr('path') + ['L', touches[i].pageX, touches[i].pageY].join(' ')
      );
  }
}


var circle = paper.circle(50, 40, 10);
circle.attr('fill', '#f00');

container.addEventListener('touchstart', touchstart, false);
container.addEventListener('touchmove', touchmove, false);
