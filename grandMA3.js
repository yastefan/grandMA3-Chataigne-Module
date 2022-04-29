function init() {
  script.log("grandMA3 module loaded");
}

function moduleParameterChanged(param) {
  script.log(param.name + " parameter changed, new value: " + param.get());
}

function moduleValueChanged(value) {
  if(value.name == "blind") {
    if(value.get()) {
      local.send("/cmd", "blind on");
    }
    else {
      local.send("/cmd", "blind off");
    }
  }
  else if(value.name == "freeze") {
    if(value.get()) {
      local.send("/cmd", "freeze on");
    }
    else {
      local.send("/cmd", "freeze off");
    }
  }
}

function changeSequenceFader(sequenceNumber, fader, value) {
  var range = local.parameters.faderRange.get();
  script.log(fader, value);
  local.send("/13.13.1.5." + sequenceNumber, fader, 1, value*range);
}

function moveFader(page, executor, value) {
  var range = local.parameters.faderRange.get();
  local.send("/Page" + page + "/Fader" + executor + "/", value*range);
}

function pushButton(page, executor, value) {
  var range = local.parameters.faderRange.get();
  local.send("/Page" + page + "/Key" + executor + "/", value*range);
}

function sendCommand(command) {
  local.send("/cmd", command);
}

function setBlind(onStatus) {
  local.values.blind.set(onStatus);
  if(onStatus) {
    local.send("/cmd", "blind on");
  }
  else {
    local.send("/cmd", "blind off");
  }
}

function setFreeze(onStatus) {
  local.values.freeze.set(onStatus);
  if(onStatus) {
    local.send("/cmd", "freeze on");
  }
  else {
    local.send("/cmd", "freeze off");
  }
}