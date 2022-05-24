var sequenceContainer = {};

function init() {
  script.log("grandMA3 module loaded");
}

function moduleParameterChanged(param) {
  script.log(param.name + " parameter changed, new value: " + param.get());
}

function moduleValueChanged(value) {
  if(value.name == "preview") {
    if(value.get()) {
      local.send("/cmd", "preview on");
    }
    else {
      local.send("/cmd", "preview off");
    }
  }
  else if(value.name == "blind") {
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

function moveExecutorFader(page, executor, offset, value) {
  var range = local.parameters.faderRange.get();
  executor = executor + offset;
  local.send("/Page" + page + "/Fader" + executor + "/", value*range);
}

function pushExecutorButton(page, executor, offset, value) {
  if(value) value = 1;
  executor = executor + offset;
  local.send("/Page" + page + "/Key" + executor + "/", value);
}

function moveSequenceFader(sequenceNumber, fader, offset, value) {
  var range = local.parameters.faderRange.get();
  sequenceNumber = sequenceNumber + offset;
  local.send("/13.13.1.5." + sequenceNumber, fader, 1, value*range);
}

function pushSequenceButton(sequenceNumber, button, value) {
  sequenceNumber = sequenceNumber + offset;
  if(value) value = 1;
  local.send("/13.13.1.5." + sequenceNumber, button, value);
}

function sendCommand(command) {
  local.send("/cmd", command);
}

function setPreview(onStatus) {
  local.values.preview.set(onStatus);
  if(onStatus) {
    local.send("/cmd", "preview on");
  }
  else {
    local.send("/cmd", "preview off");
  }
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