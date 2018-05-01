function update(pendSettings) {
  mu = 1 + pendSettings.m1 / pendSettings.m2;

  //Derivative of theta 1
  pendSettings.d2Theta1 = (g * (Math.sin(pendSettings.Theta2) * Math.cos(pendSettings.Theta1 -
    pendSettings.Theta2) - mu * Math.sin(pendSettings.Theta1)) - (pendSettings.l2 * pendSettings.dTheta2 *
    pendSettings.dTheta2 + pendSettings.l1 * pendSettings.dTheta1 * pendSettings.dTheta1 * Math.cos(
      pendSettings.Theta1 -
      pendSettings.Theta2)) * Math.sin(pendSettings.Theta1 - pendSettings.Theta2)) / (pendSettings.l1 * (mu -
    Math.cos(
      pendSettings.Theta1 - pendSettings.Theta2) * Math.cos(pendSettings.Theta1 - pendSettings.Theta2)
  ));

  //Derivative of theta 2
  pendSettings.d2Theta2 = (mu * g * (Math.sin(pendSettings.Theta1) * Math.cos(pendSettings.Theta1 -
      pendSettings.Theta2) - Math.sin(pendSettings.Theta2)) + (mu * pendSettings.l1 * pendSettings.dTheta1 *
      pendSettings.dTheta1 + pendSettings.l2 * pendSettings.dTheta2 * pendSettings.dTheta2 *
      Math.cos(pendSettings.Theta1 - pendSettings.Theta2)) * Math.sin(pendSettings.Theta1 - pendSettings.Theta2)) /
    (pendSettings.l2 * (mu - Math.cos(pendSettings.Theta1 - pendSettings.Theta2) * Math.cos(pendSettings.Theta1 - pendSettings.Theta2)));

  //Progress all angles through time
  pendSettings.dTheta1 += pendSettings.d2Theta1 * time;
  pendSettings.dTheta2 += pendSettings.d2Theta2 * time;
  pendSettings.Theta1 += pendSettings.dTheta1 * time;
  pendSettings.Theta2 += pendSettings.dTheta2 * time;

  //Update the circle object locations to match the angles
  myCircle1.x = origin.x + pendSettings.l1 * Math.sin(pendSettings.Theta1);
  myCircle1.y = origin.y + pendSettings.l1 * Math.cos(pendSettings.Theta1);
  myCircle2.x = origin.x + pendSettings.l1 * Math.sin(pendSettings.Theta1) + pendSettings.l2 * Math.sin(pendSettings.Theta2);
  myCircle2.y = origin.y + pendSettings.l1 * Math.cos(pendSettings.Theta1) + pendSettings.l2 * Math.cos(pendSettings.Theta2);

  //Update the line object locations to match the circles
  myLine1.x = myCircle1.x;
  myLine1.y = myCircle1.y;
  myLine2.x0 = myCircle1.x;
  myLine2.y0 = myCircle1.y;
  myLine2.x = myCircle2.x;
  myLine2.y = myCircle2.y;

  //Tick, and decide if we draw a path marker on this update
  ticker++;
  if (ticker === 3) {
    previous_locs.push({
      "x": myLine2.x,
      "y": myLine2.y,
      "color": pendSettings.color
    })
    ticker = 0;
  }

  //Shift the first loc if there are more than 1500 points to reduce CPU stress
  if (previous_locs.length > 1500) {
    previous_locs.shift();
  }

  //Redraw the screen with the new updates
  drawScreen();
  return pendSettings;
}

//Origin coordinates
var origin = {
  'x': 350,
  'y': 300
};
//Acceleration due to gravity
var g = 9.8;

//Time interval
var time = 1 / 20;

//Path ticker init
var ticker = 0;
var previous_locs = [];

//Is the simulation running?
var running = false;

var canvas = document.getElementById('simulation');
var context = canvas.getContext('2d');
var interval = 0;

function run() {
  clearInterval(interval);
}

//Default simulation settings, should get overwritten by html update
defaultSimSett = {
  'm1': 10,
  'm2': 10,
  'l1': 150,
  'l2': 150,
  'Theta1': 0 * (Math.PI) / 2,
  'Theta2': 1 * (Math.PI) / 2,
  'd2Theta1': 0,
  'd2Theta2': 0,
  'dTheta1': 0,
  'dTheta2': 0,
  'color': '#000000'
};

currSimSett = $.extend({}, defaultSimSett);

// Add event listerners on page load
$(function() {
  $('#set_variables_form').on('input', updateSettings);
  $('#start-button').click(uiInput);
  $('#reset-button').click(resetSim);
  updateSettings();
});


function uiInput() { // When the start/stop/pause simulation button is pressed
  if (!running) { // We are not currently running so start running
    $('#start-button').val("Pause");
    $('#reset-button').prop('disabled', true);
    running = true;
    interval = setInterval(function() {
      currSimSett = update(currSimSett);
    }, 5);
  } else { // We are running so pause running
    $('#start-button').val("Start");
    $('#reset-button').prop('disabled', false);
    running = false;
    clearInterval(interval);
  }
}

//Reset the simulation
function resetSim() {
  currSimSett = $.extend({}, defaultSimSett);
  previous_locs = []
  updateSettings();

}

//Slider change, update the simulation, but keep previous path tracking
function updateSettings() {
  currSimSett.l1 = $('#length1').val();
  currSimSett.l2 = $('#length2').val();
  currSimSett.m1 = $('#mass1').val();
  currSimSett.m2 = $('#mass2').val();
  currSimSett.Theta1 = $('#Theta1').val() / 180 * (Math.PI);
  currSimSett.Theta2 = $('#Theta2').val() / 180 * (Math.PI);


  myCircle1 = {
    x: origin.x + currSimSett.l1 * Math.sin(currSimSett.Theta1),
    y: origin.y + currSimSett.l1 * Math.cos(currSimSett.Theta1),
    mass: currSimSett.m1
  };

  myCircle2 = {
    x: origin.x + currSimSett.l1 * Math.sin(currSimSett.Theta1) + currSimSett.l2 * Math.sin(currSimSett.Theta2),
    y: origin.y + currSimSett.l1 * Math.cos(currSimSett.Theta1) + currSimSett.l2 * Math.cos(currSimSett.Theta2),
    mass: currSimSett.m2
  };

  myLine1 = {
    x0: origin.x,
    y0: origin.y,
    x: myCircle1.x,
    y: myCircle1.y
  };
  myLine2 = {
    x0: myCircle1.x,
    y0: myCircle1.y,
    x: myCircle2.x,
    y: myCircle2.y
  };

  //Update the drawing on the screen
  drawScreen();

  //Stop the simulation so that weird overlap errors don't occur
  $('#start-button').val("Start");
  $('#reset-button').prop('disabled', false);
  running = false;
  clearInterval(interval);

  //Reset all the current dTheta values so that the next simulation begins with no velocity
  currSimSett.dTheta1 = 0;
  currSimSett.dTheta2 = 0;
  currSimSett.d2Theta1 = 0;
  currSimSett.d2Theta2 = 0;
  //Change the path color to differentiate between sims
  currSimSett.color = getRandomColor();
}


// Display update functions
function drawScreen() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < previous_locs.length; i++) {
    drawPath(previous_locs[i].x, previous_locs[i].y, previous_locs[i].color, context)
  }

  drawLine(myLine1, context);
  drawLine(myLine2, context);
  drawCircle(myCircle1, context);
  drawCircle(myCircle2, context);
}

function drawCircle(circle, context) {
  context.beginPath();
  context.arc(circle.x, circle.y, circle.mass, 0, 2 * Math.PI, false);
  context.fillStyle = 'rgba(0,0,0,1)';
  context.fill();
}

function drawPath(x, y, color, context) {
  context.beginPath();
  context.arc(x, y, 3, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
}

function drawLine(line, context) {
  context.beginPath();
  context.moveTo(line.x0, line.y0);
  context.lineTo(line.x, line.y);
  context.strokeStyle = 'black';
  context.lineWidth = 5;
  context.stroke();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}