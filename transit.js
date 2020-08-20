var file_input = document.getElementById('file-input')

const dialog = new mdc.dialog.MDCDialog(document.querySelector('.mdc-dialog'));

/* Add an event listener to execute when a file has been selected. */
file_input.addEventListener('input', readFile);

function readFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      displayContents(contents);
    };
    reader.readAsText(file);
}

var midtransit
var midtransit_err
var depth
var depth_err
var duration
var duration_err

function displayContents(contents) {
    var lines = contents.split(/\r\n|\r|\n/)
    /* This relies to heavily on the number of whitespaces. */
    s_midtransit = lines[1].split(" ")[1]
    s_midtransit_err = lines[1].split(" ")[3]
    s_depth = lines[2].split(" ")[1]
    s_depth_err = lines[2].split(" ")[3]
    // For some reason there are two whitespaces after duration:
    s_duration = lines[3].split(" ")[2]
    s_duration_err = lines[3].split(" ")[4]

    midtransit = parseFloat(s_midtransit)
    midtransit_err = parseFloat(s_midtransit_err)
    depth = parseFloat(s_depth)
    depth_err = parseFloat(s_depth_err)
    duration = parseFloat(s_duration)
    duration_err = parseFloat(s_duration_err)

    if (isNaN(midtransit) || isNaN(midtransit_err) || isNaN(depth) || isNaN(depth_err) ||
        isNaN(duration) || isNaN(duration_err)) {
          showError("Error parsing file!");
          return;
        }

    document.getElementById("midtransit").value = s_midtransit + " +/- " + s_midtransit_err;
    document.getElementById("depth").value = s_depth + " +/- " + s_depth_err;
    document.getElementById("duration").value = s_duration + " +/- " + s_duration_err;
  }

function computeResults() {
    var p = Array(8);
    var p_err = Array(8);

    p[0] = depth;
    p_err[0] = depth_err;
    p[1] = midtransit;
    p_err[1] = midtransit_err;
    p[2] = duration;
    p_err[2] = duration_err;

    p[3] = parseFloat(document.getElementById("input-mass").value) // M_star
    p_err[3] = parseFloat(document.getElementById("input-mass-error").value)
    p[4] = parseFloat(document.getElementById("input-radius").value) // R_star
    p_err[4] = parseFloat(document.getElementById("input-radius-error").value)
    p[5] = parseFloat(document.getElementById("input-period").value) // P
    p_err[5] = parseFloat(document.getElementById("input-period-error").value)
    p[6] = parseFloat(document.getElementById("input-K").value) // K
    p_err[6] = parseFloat(document.getElementById("input-K-error").value)
    p[7] = parseFloat(document.getElementById("input-eccentricity").value) // e
    p_err[7] = parseFloat(document.getElementById("input-eccentricity-error").value)

    for (var i = 0; i < p.length; i++) {
      if (isNaN(p[i]) || isNaN(p_err[i])) {
        showError("Missing or incorrect value!");
        return;
      }
    }
    
    var s_err = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    s = computeAll(p);
    
    for (var i = 0; i < p.length; i++) {
      var p_up = [...p];
      var p_lo = [...p];
      p_up[i] += p_err[i];
      p_lo[i] -= p_err[i];
      var s_up = computeAll(p_up);
      var s_lo = computeAll(p_lo);
      var j;
      for (j = 0; j < s_err.length; j++) {
        s_err[j] += Math.pow((s_up[j] - s_lo[j]) / 2.0, 2.0);
      }
    }

    for (j = 0; j < s_err.length; j++) {
      s_err[j] = Math.sqrt(s_err[j]);
    }
    
    document.getElementById("output-r-aspect").value = formatFloat(s[1]) + " +/- " + formatFloat(s_err[1])
    document.getElementById("output-b").value = formatFloat(s[6]) + " +/- " + formatFloat(s_err[6])
    document.getElementById("output-a").value = formatFloat(s[2]) + " +/- " + formatFloat(s_err[2])
    document.getElementById("output-i").value = formatFloat(s[4]) + " +/- " + formatFloat(s_err[4])
    document.getElementById("output-r").value = formatFloat(s[3]) + " +/- " + formatFloat(s_err[3])
    document.getElementById("output-m").value = formatFloat(s[5]) + " +/- " + formatFloat(s_err[5])
    document.getElementById("output-roche-rigid").value = formatFloat(s[7]) + " +/- " + formatFloat(s_err[7]);
    document.getElementById("output-roche-fluid").value = formatFloat(s[8]) + " +/- " + formatFloat(s_err[8]);

    return;
}

function formatFloat(a) {
  if (Math.log10(a) > 2 || Math.log10(a) < -2) {
    return a.toExponential(5);
  } else {
    return a.toFixed(5);
  }
}

function openFile() {
    file_input.click();
}

function showError(msg) {
  document.getElementById('my-dialog-content').innerHTML = msg;
  dialog.open();
}

function computeMSin(p, s) {
  var M_star = p[3];
  var P = p[5];
  var K = p[6];
  var e = p[7];
  s[0] = Math.sqrt(1-e*e)*K*Math.pow(Math.pow(M_star*1.99E+30, 2.0) * P * 24*3600/(2*Math.PI*0.0000000000667), 1.0/3.0) / 1.9E+27;
  return s;
}

function computeRAspect(p, s) {
  var depth = p[0];
  s[1] = Math.sqrt(1.0 - Math.pow(10.0, -depth / 2.5));
  return s;
}

function computeA(p, s) {
  var M_star = p[3];
  var P = p[5];
  s[2] = Math.pow(M_star * 1.99 * Math.pow(10.0, 30.0) * 6.672 * Math.pow(10.0, -11.0) * Math.pow(P * 24.0 * 3600.0, 2.0) / (4.0 * Math.PI * Math.PI), 1.0/3.0) / (1.5 * Math.pow(10.0, 11.0));
  return s;
}

function computeR(p, s) {
  var R_star = p[4];
  var R_aspect = s[1];
  s[3] =  R_aspect * R_star * 10.0;
  return s;
}

function computeI(p, s) {
  var duration = p[2];
  var R_star = p[4];
  var P = p[5];
  var R_aspect = s[1];
  var a = s[2];
  s[4] = Math.acos(Math.sqrt((Math.pow(R_star*700000000.0, 2.0) * Math.pow(1.0 + R_aspect, 2.0) - Math.pow(Math.PI*a*1.5*1.0E11*duration/P, 2.0))/Math.pow(a*1.5*1.0E11, 2.0)))*180.0/Math.PI;
  return s;
}


function computeM(p, s) {
  var msin = s[0];
  var i = s[4];
  s[5] = msin / Math.sin(i * Math.PI / 180.0);
  return s;
}


function computeB(p, s) {
  var a = s[2];
  var i = s[4];
  var R_star = p[4];
  s[6] = a * 1.5 * Math.pow(10.0, 11.0) * Math.cos(i * Math.PI / 180.0) / (R_star * 700000000.0);
  return s;
}

function computeRocheRigid(p, s) {
  s[7] = s[3] * Math.pow(2.0 * p[3] * 1.99E+30 / (s[5] * 1.9E+27), 1.0/3.0) *70000000/150000000000;
  return s;
}

function computeRocheFluid(p, s) {
  s[8] = 2.4554 * 0.7937 * s[7];
  return s;
}

function computeAll(p) {
  var s = Array(9);
  s = computeMSin(p, s);
  s = computeRAspect(p, s);
  s = computeA(p, s);
  s = computeR(p, s);
  s = computeI(p, s);
  s = computeM(p, s);
  s = computeB(p, s);
  s = computeRocheRigid(p, s);
  s = computeRocheFluid(p, s);
  return s;
}
