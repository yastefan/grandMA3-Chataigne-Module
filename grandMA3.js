const sequenceContainer = {};

function init() {
  script.log('grandMA3 module loaded');
}

function moduleParameterChanged({ get, name }) {
  script.log(`${name} parameter changed, new value: ${get()}`);
}

function sendCommand(command) {
  local.send('/cmd', command);
}

function getRange() {
  return local.parameters.faderRange.get();
}

function moduleValueChanged({ get, name }) {
  sendCommand(`${name} ${get() ? 'on' : 'off'}`);
}

function sendControlMessage(type, page, executor, offset, value) {
  executor += offset;
  const prefix = page === 0 ? '' : `/Page${page}`;

  if (type == 'Key') value &&= 1;
  if (type == 'Fader') value *= getRange();
  
  local.send(`${prefix}/${type}${executor}/`, value);
}

function moveExecutorFader(...args) {
  sendControlMessage('Fader', ...args);
}

function pushExecutorButton(...args) {
  sendControlMessage('Key', ...args);
}

function turnExecutorEncoder(...args) {
  sendControlMessage('Encoder', ...args);
}

function moveSequenceFader(sequenceNumber, offset, fader, value) {
  sequenceNumber += offset;
  local.send(`/13.13.1.6.${sequenceNumber}`, fader, 1, value * getRange());
}

function pushSequenceButton(sequenceNumber, offset, button, value) {
  sequenceNumber += offset;
  value &&= 1;
  local.send(`/13.13.1.6.${sequenceNumber}`, button, value);
}

function moveGrandMasterFader(grandMaster, value) {
  local.send(`/13.12.2.${grandMaster}`, "FaderMaster", 1, value * getRange());
}

function moveGrandMasterBpmFader(grandMaster, value) {
  local.send(`/13.12.2.${grandMaster}`, "FaderMaster", 1, Math.sqrt(value / 240) * getRange());
}

function moveSpeedMasterFader(speedMaster, value) {
  local.send(`/13.12.3.${grandMaster}`, "FaderMaster", 1, value * getRange());
}

function moveSpeedMasterBpmFader(speedMaster, value) {
  local.send(`/13.12.3.${grandMaster}`, "FaderMaster", 1, Math.sqrt(value / 240) * getRange());
}

function turnEncoder(encoder, multiplicator, value) {
  const at = value * multiplicator;
  script.log(`Attribute ${encoder} at ${at}`);
  sendCommand(`Attribute ${encoder} at ${at}`);
}

function set(name, status) {
  local.values[name].set(status);
  sendCommand(`${name} ${status ? 'on' : 'off'}`);
}

function setPreview(status) {
  set('preview', status);
}

function setBlind(status) {
  set('blind', status);
}

function setFreeze(status) {
  set('freeze', status);
}
