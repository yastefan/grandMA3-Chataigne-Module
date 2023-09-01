var sequenceContainer = {};
var sync_queue = [[], [], [], []];

function init() {
  script.log("grandMA3 module loaded");
}

function moduleParameterChanged(param) {
  script.log(param.name + " parameter changed, new value: " + param.get());
}

function moduleValueChanged(value) {
  if (value.getParent().name == "control") {
    setControl(value.name, value.get());
  }
  else if (value.getParent().getParent().name == "startshow") {
    setFX(value.getParent().name, value.name, value.get());
  }
}

function setControl(command, value) {
  if(value) {
    local.send("/cmd", command + " on");
  }
  else {
    local.send("/cmd", command + " off");
  }
}

function setFX(fx_group, fx_name, value) {
  var sequence_number = parseInt(fx_name.substring(fx_name.length - 1, fx_name.length), 10);
  var offset = 0;

  if(fx_group == "dimmer") { offset = 5283; }
  else if(fx_group == "position") { offset = 5289; }
  else if(fx_group == "color") { offset = 5295; }

  if(value) {
    pushSequenceButton(sequence_number, offset, "On", 1);
  }
  else {
    pushSequenceButton(sequence_number, offset, "Off", 1);
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

function changeExecutorSpeedscale(page, executor, offset, scale) {
  executor = executor + offset;
  var command = "";

  if(page == 0)
  {
    command = "set exec " + executor;
  }
  else
  {
    command = "set page " + page + "." + executor;
  }
  local.send("/cmd", command + " Property Speedscale " + scale);
}

function addExecutorToSyncList(page, executor, offset, list) {
  executor = executor + offset;
  var command = "";

  if(page == 0)
  {
    command = "exec " + executor;
  }
  else
  {
    command = "page " + page + "." + executor;
  }
  if (sync_queue[list-1].indexOf(command) == -1) {
    sync_queue[list-1].push(command);
  }
}

function syncExecutors(list) {
  if (sync_queue[list-1].length) {
    command_string = "";

    for (var i = 0; i < sync_queue[list-1].length; i++) {
      command_string = command_string + "goto " + sync_queue[list-1][i] + " cue /NC;";
    }
    local.send("/cmd", command_string);
    sync_queue[list-1] = [];
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

function setProgrammerColor(color, layer) {
  var r =  "Attribute ColorRGB_R At " + layer + " Decimal16 " + Math.round(color[0] * 65535) + "; ";
  var g =  "Attribute ColorRGB_G At " + layer + " Decimal16 " + Math.round(color[1] * 65535) + "; ";
  var b =  "Attribute ColorRGB_B At " + layer + " Decimal16 " + Math.round(color[2] * 65535) + "; ";

  local.send("/cmd", r+g+b);
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

function showGuiElements(visible) {
  var m =  "Set Root 2.3.1.1 Property showMainMenu " + visible + "; ";
  var c =  "Set Root 2.3.1.1 Property showCmdLine " + visible + "; ";
  var e =  "Set Root 2.3.1.1 Property showEncoderBar " + visible;

  local.send("/cmd", m+c+e);
}

function switchView(view) {
  local.send("/cmd", "call ViewButton 1." + view);
}