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

function moveExecutorFader(page, executor, value) {
  var range = local.parameters.faderRange.get();
  local.send("/Page" + page + "/Fader" + executor + "/", value*range);
}

function pushExecutorButton(page, executor, value) {
  if(value) value = 1;
  local.send("/Page" + page + "/Key" + executor + "/", value);
}

function moveSequenceFader(sequenceNumber, fader, value) {
  var range = local.parameters.faderRange.get();
  local.send("/13.13.1.5." + sequenceNumber, fader, 1, value*range);
}

function pushSequenceButton(sequenceNumber, button, value) {
  if(value) value = 1;
  local.send("/13.13.1.5." + sequenceNumber, button, value);
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