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
  if(page == 0)
  {
    local.send("/Fader" + executor + "/", value*range);
  }
  else
  {
    local.send("/Page" + page + "/Fader" + executor + "/", value*range);
  }
}

function pushExecutorButton(page, executor, offset, value) {
  if(value) value = 1;
  executor = executor + offset;
  if(page == 0)
  {
    local.send("/Key" + executor + "/", value);
  }
  else
  {
    local.send("/Page" + page + "/Key" + executor + "/", value);
  }
}

function turnExecutorEncoder(page, executor, offset, multiplicator) {
  executor = executor + offset;
  if(page == 0)
  {
    local.send("/Encoder" + executor + "/", multiplicator);
  }
  else
  {
    local.send("/Page" + page + "/Encoder" + executor + "/", multiplicator);
  }
}

function moveSequenceFader(sequenceNumber, offset, fader, value) {
  var range = local.parameters.faderRange.get();
  sequenceNumber = sequenceNumber + offset;
  local.send("/13.13.1.6." + sequenceNumber, fader, 1, value*range);
}

function pushSequenceButton(sequenceNumber, offset, button, value) {
  sequenceNumber = sequenceNumber + offset;
  if(value) value = 1;
  local.send("/13.13.1.6." + sequenceNumber, button, value);
}

function moveGrandMasterFader(grandMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/13.12.2." + grandMaster, "FaderMaster", 1, value*range);
}

function moveGrandMasterBpmFader(grandMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/13.12.2." + grandMaster, "FaderMaster", 1, Math.sqrt(value/240)*range);
}

function moveSpeedMasterFader(speedMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/13.12.3." + speedMaster, "FaderMaster", 1, value*range);
}

function moveSpeedMasterBpmFader(speedMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/13.12.3." + speedMaster, "FaderMaster", 1, Math.sqrt(value/240)*range);
}

function turnEncoder(encoder, multiplicator, value) {
  script.log("Attribute " + encoder + " at + " + value*multiplicator);
  local.send("/cmd", "Attribute " + encoder + " at + " + value*multiplicator);
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
