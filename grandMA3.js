// Aktuell
var sequenceContainer = {};
var executorContainer = {};
var sync_queue = [[], [], [], []];

function init() {
  script.log("grandMA3 module loaded");

  script.getParent().getParent().parameters.removeParameter("clearValues"); // Remove default clearValues to avoid Controll and StartShow values beeing cleared.
  script.getParent().getParent().parameters.addTrigger("Clear Values", "Clear all Learned Values");
}

function getCompatibility() {
  var p = local.parameters.compatibility;
  if (!p) return "2.5";
  var v = p.get();
  if (v == undefined || v == null || v == "") return "2.5";
  var s = "" + v;
  // Enum.get() may be the option value ("2.2") or the option key ("2.2 - 2.4")
  if (s == "2.2" || s.indexOf("2.2") == 0) return "2.2";
  return "2.5";
}

function getSequenceAddressPrefix() {
  if (getCompatibility() == "2.2") {
    return "14.14.1.6";
  }
  return "14.14.1.7";
}

function getSequenceAddress(sequenceNumber) {
  return "/" + getSequenceAddressPrefix() + "." + sequenceNumber;
}

function isSequenceOscAddress(address) {
  return address.indexOf("/" + getSequenceAddressPrefix() + ".") == 0;
}

function moduleParameterChanged(param) {
  script.log(param.name + " parameter changed");

  if(param.name == "clearValues"){
    if(script.getParent().getParent().values.sequences){
      script.log("func: " + "oscEvent" + "; " + "cleared sequences");
      script.getParent().getParent().values.removeContainer("sequences");

      sequenceContainer = {};
      sync_queue = [[], [], [], []];

      // Clear SequenceTraking
      SequenceStateTracker.runningStates = {};
      SequenceStateTracker.runningParams = {};
      SequenceStateTracker.createdParameters = {};
    }
    if(script.getParent().getParent().values.executors){
      script.log("func: " + "oscEvent" + "; " + "cleared executors");
      script.getParent().getParent().values.removeContainer("executors");
      executorContainer = {};
    }
    if(script.getParent().getParent().values.status){
      script.log("func: " + "oscEvent" + "; " + "cleared status");
      script.getParent().getParent().values.removeContainer("status");
    }
    if(script.getParent().getParent().values.page){
      script.log("func: " + "oscEvent" + "; " + "cleared page");
      script.getParent().getParent().values.removeContainer("page");
    }
  }
}

function moduleValueChanged(value) {
  if (value.getParent().getParent().name == "sequences") {
    if (value.name.indexOf("fader") == 0) {
      moveSequenceFader(parseInt(value.getParent().name, 10), 0, value.name, value.get());
    }
    else {
      pushSequenceButton(parseInt(value.getParent().name, 10), 0, value.name, value.get());
    }
  }
  else if (value.getParent().name == "control") {
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

  if(fx_group == "dimmer") { offset = 5454; }
  else if(fx_group == "position") { offset = 5472; }
  else if(fx_group == "color") { offset = 5490; }

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
    var command_string = "";

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
  local.send(getSequenceAddress(sequenceNumber), fader, 1, value*range);
}

function pushSequenceButton(sequenceNumber, offset, button, value) {
  sequenceNumber = sequenceNumber + offset;
  if(value) value = 1;
  local.send(getSequenceAddress(sequenceNumber), button, value);
}

function moveGrandMasterFader(grandMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/14.13.2." + grandMaster, "FaderMaster", 1, value*range);
}

function moveGrandMasterBpmFader(grandMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/14.13.2." + grandMaster, "FaderMaster", 1, Math.pow(value, 0.5243838)/0.17118);
}

function moveSpeedMasterFader(speedMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/14.13.3." + speedMaster, "FaderMaster", 1, value*range);
}

function moveSpeedMasterBpmFader(speedMaster, value) {
  var range = local.parameters.faderRange.get();
  local.send("/14.13.3." + speedMaster, "FaderMaster", 1, Math.pow(value, 0.5243838)/0.17118);
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

function selectPage(page) {
  local.send("/cmd", "Select Page " + page);
}

function oscEvent(address, args) {
  var address_list = address.split(".");

  if (isSequenceOscAddress(address)) {
    processSequence(address_list[address_list.length - 1], args);
  }

  // PamOSC-Plugin-gma3: /Page1/Fader204 : 76
  if (address.indexOf("Page") == 1) {
    processExec(address_list[address_list.length - 1], args);
  }

  // PamOSC-Plugin-gma3: /updatePage/current : 1
  if (address.indexOf("updatePage") == 1) {
    processUpdatePage(address_list[address_list.length - 1], args);
  }

  // PamOSC-Plugin-gma3: /status/deskLocked : 0
  if (address.indexOf("status") == 1) {
    processStatus(address_list[address_list.length - 1], args);
  }
}

// Helper function to parse and scale fader values
function parseAndScaleFaderValue(valueString, range) {
  var value = parseFloat(valueString);
  return (value === value) ? value / range : valueString; // Check if not NaN
}

// Helper function to update sequence name with description
function updateSequenceName(sequenceContainer, sequence, description) {
  if (description) {
    var label = description;
    var semi = label.indexOf(";");
    if (semi >= 0) {
      label = label.substring(0, semi) + " " + label.substring(semi + 1, label.length);
    }
    sequenceContainer.setName(sequence + " | " + label, sequence);
  }
}

// Global tracker for sequence running-states
var SequenceStateTracker = {
  runningStates: {},
  runningParams: {},
  // Storage for created parameters to avoid timing issues
  createdParameters: {},

  getRunningState: function(sequence) {
    return this.runningStates[sequence];
  },

  setRunningState: function(sequence, state) {
    this.runningStates[sequence] = state;
  },

  getRunningParam: function(sequence) {
    return this.runningParams[sequence];
  },

  setRunningParam: function(sequence, param) {
    this.runningParams[sequence] = param;
  },

  getCreatedParameter: function(sequence, command) {
    var paramKey = sequence + "_" + command;
    return this.createdParameters[paramKey];
  },

  setCreatedParameter: function(sequence, command, param) {
    var paramKey = sequence + "_" + command;
    this.createdParameters[paramKey] = param;
  }
};

// Command mappings that result in a running-state transition
var PERMANENT_COMMANDS = {
  "go+": { requiresValueOne: true, setsTo: true },
  "on": { requiresPositive: true, setsTo: true },
  "fadermaster": { usesArgs2: true, setsToValue: true },
  "fadertemp": { usesArgs2: true, setsToValue: true },
  ">>>": { requiresValueOne: true, setsTo: true },
  "<<<": { requiresValueOne: true, setsTo: true },
  "goto": { requiresPositive: true, setsTo: true },
  "off": { requiresPositive: true, setsTo: false }
};

// Commands that return to the original running state
var TEMP_MODIFIERS = {
  "temp": "positive",
  "flash": "positive",
  "black": "negative",
  "swap": "negative" // MA3 actually spells it this way
};

var FADER_COMMANDS = {
  "fadermaster": true,
  "fadertemp": true
};

// Helper function to create sequence container
function createSequenceContainer(sequence) {
  var parent_container = script.getParent().getParent().values.addContainer("Sequences");
  return parent_container.addContainer(sequence);
}

// Helper function to get sequence container
function getSequenceContainer(sequence) {
  var sequence_container = script.getParent().getParent().getChild("values").getChild("values")[sequence]; // Using getChild() to get an fresh Object tree from the C++ MainApplication to avoid errors on external tree changes. (ie. after clearValues Parameter) 
  return sequence_container;
}

// Helper function to initialize sequence state
function initializeSequenceState(sequence) {
  var existingState = SequenceStateTracker.getRunningState(sequence);
  if (!existingState) {
    var newState = {
      permanent: false,
      tempPositive: false,
      tempNegative: false
    };
    SequenceStateTracker.setRunningState(sequence, newState);
    return newState;
  }
  return existingState;
}

// Helper function to get or create Running parameter
function getRunningParameter(sequence, sequence_container) {
  var existingParam = SequenceStateTracker.getRunningParam(sequence);
  if (existingParam === undefined) {
    var runningParamCreated = sequence_container.addBoolParameter("Running", "Running", false);
    SequenceStateTracker.setRunningParam(sequence, runningParamCreated);
    return runningParamCreated;
  }
  return existingParam;
}

// Helper function to parse command value
function parseCommandValue(commandLower, args) {
  var valueIndex = FADER_COMMANDS[commandLower] ? 2 : 1;
  return parseFloat(args[valueIndex]);
}

// Helper function to process permanent state changes
function processPermanentStateChange(commandLower, value, sequenceState) {
  var commandConfig = PERMANENT_COMMANDS[commandLower];
  if (!commandConfig) return false;

  var newValue = commandConfig.setsTo;

  // Check if we should update based on command requirements
  if (commandConfig.requiresValueOne && value == 1) {
    sequenceState.permanent = newValue;
    return true;
  }

  if (commandConfig.requiresPositive && value > 0) {
    sequenceState.permanent = newValue;
    return true;
  }

  if (commandConfig.setsToValue !== undefined) {
    sequenceState.permanent = value > 0;
    return true;
  }

  return false;
}

// Helper function to process temporary modifiers
function processTemporaryModifier(commandLower, value, sequenceState) {
  var modifierType = TEMP_MODIFIERS[commandLower];
  if (!modifierType) return false;

  var isPositive = value > 0;
  if (modifierType === "positive") {
    sequenceState.tempPositive = isPositive;
  } else if (modifierType === "negative") {
    sequenceState.tempNegative = isPositive;
  }
  return true;
}

// Helper function to calculate final running state
function calculateFinalRunningState(sequenceState) {
  // Temporary modifiers take precedence over permanent state
  if (sequenceState.tempPositive) return true;
  if (sequenceState.tempNegative) return false;
  return sequenceState.permanent;
}

// Helper function to learn new parameters
function learnNewParameter(sequence_container, sequence, command, args, isFader) {
  var param;
  if (isFader) {
    param = sequence_container.addFloatParameter(command, command, 0, 0, 1);
  } else {
    param = sequence_container.addBoolParameter(command, command, 0);
  }

  // Store the parameter globally to deal with timing issues in local.values
  SequenceStateTracker.setCreatedParameter(sequence, command, param);

  return sequence_container;
}

// Helper function to process existing parameters
function processExistingParameters(sequence_container, command, args, isFader, range, sequence) {
  // Try to get parameter from container first, then from our stored parameters
  var param = sequence_container[command];

  if (!param) {
    // Try to get from our stored parameters
    param = SequenceStateTracker.getCreatedParameter(sequence, command);
    if (!param) return;
  }

  if (args.length == 2) {
    // Simple on/off commands: Off 1, Flash 1
    param.set(args[1]);
  } else if (args.length == 3) {
    if (isFader) {
      // Fader commands: FaderMaster 1 99.5, FaderSpeed 1 50.0, etc.
      // For fader commands, the actual value is in args[2]
      var faderValue = parseAndScaleFaderValue(args[2], range);
      param.set(faderValue);
    } else {
      // Button commands with descriptions: Go+ 1 "s1 1 Cue", On 1 "s1 1 Cue"
      updateSequenceName(sequence_container, sequence, args[2]);
      param.set(args[1]);
    }
  } else if (args.length >= 4) {
    // 4+ arg messages (if any exist)
    updateSequenceName(sequence_container, sequence, args[3]);
    param.set(parseAndScaleFaderValue(args[2], range));
  }
}

function processSequence(sequence, args) {
  var sequence_container = getSequenceContainer(sequence);
  var range = local.parameters.faderRange.get();
  var command = args[0];
  var commandLower = command.toLowerCase();
  var isFader = commandLower.indexOf("fader") == 0;
  var learnEnabled = local.parameters.learnFromOscInput.get();

  // Create container if it doesn't exist and learning is enabled
  if (!sequence_container && learnEnabled) {
    sequence_container = createSequenceContainer(sequence);
  }

  // Exit if no container exists
  if (!sequence_container) {
    return;
  }

  // Learn new parameters if enabled
  if(!sequence_container[command] && learnEnabled) {
    learnNewParameter(sequence_container, sequence, command, args, isFader);
  }

  // Initialize sequence state and get Running parameter
  var sequenceState = initializeSequenceState(sequence);
  var runningParam = getRunningParameter(sequence, sequence_container);

  // Process running state based on command
  var value = parseCommandValue(commandLower, args);

  // Handle permanent state changes
  processPermanentStateChange(commandLower, value, sequenceState);

  // Handle temporary modifiers
  processTemporaryModifier(commandLower, value, sequenceState);

  // Calculate and update final running state
  var finalRunningState = calculateFinalRunningState(sequenceState);
  if (runningParam && typeof runningParam.set === 'function') {
    runningParam.set(finalRunningState);
  }

  // Process existing parameters
  processExistingParameters(sequence_container, command, args, isFader, range, sequence);
}

// PamOSC-Plugin-gma3: /updatePage/current : 1
function processUpdatePage(page, args){
  var param = splitAlphaNumeric(page); // expects: "/updatePage/current" -> returns: [updatePage, current]
  var statusName = param[1]; 
  var statusLable = firstLetterToUppercase(statusName); 
  var statusValue = args[0]; // args[] = [3] -> args[0]=3 => pageNumber

  var valueContainers = script.getParent().getParent().getChild("Values");
  if(local.parameters.learnFromOscInput.get()){

    var state_container = valueContainers.getChild("Page");
    if(state_container == null){
      state_container = valueContainers.addContainer("Page");
    }
    if(state_container != null){
      if(statusName == "current"){
        state_container.addIntParameter(statusLable, statusName, 0, 0, 9999);
      }
    }
  }

  var state_container = valueContainers.getChild("Page");
  if(state_container != null){
    var statusName_param = state_container.getChild(statusName);
    if(statusName_param != null){
      statusName_param.set(statusValue); // Expects interger value
    }
  }
}

// PamOSC-Plugin-gma3: /status/deskLocked : 0
function processStatus(status, args){
  var param = splitAlphaNumeric(status); // expects: "/status/deskLocked" -> returns: [status, deskLooked]
  var statusName = param[1]; 
  var statusLable = firstLetterToUppercase(statusName); 
  var statusValue = args[0]; // args[] = [true] -> args[0]=true => lockedStatus, true=locked or false=unlocked

  var valueContainers = script.getParent().getParent().getChild("Values");
  if(local.parameters.learnFromOscInput.get()){
    var state_container = valueContainers.getChild("Status");
    if(state_container == null){
      state_container = valueContainers.addContainer("Status");
    }
    if(state_container != null){
      if(statusName == "deskLocked"){
        state_container.addBoolParameter(statusLable, statusName, 0);
      }
    }
  }

  var state_container = valueContainers.getChild("Status");
  if(state_container != null){
    var statusName_param = state_container.getChild(statusName);
    if(statusName_param != null){
      statusName_param.set(statusValue); // Expects boolean value
    }
  }
}


// PamOSC-Plugin-gma3: /Page1/Fader204 : 76
// PamOSC-Plugin-gma3: /Page1/Name204 : "Sequence 21"
// PamOSC-Plugin-gma3: /Page1/Button204 : true
// PamOSC-Plugin-gma3: /Page1/Color204 : "r;g;b;α" (ie.: "255;255;0;255" for full Orange)
function processExec(executor, args) {  
  var param = splitAlphaNumeric(executor); // expects: "/Page1/Fader204" -> returns: ["Page", "1", "Fader", "204"]
  var execLabel = param[2] + " " + param[3]; // expected result: "Fader 201" 
  var execName = param[2] + param[3]; 
  execName = firstLetterToLowercase(execName); // expected result: "fader201" 
  var execPage = param[1];
  var execType = param[2];
  var execId = param[3];
  var execValue = args[0]; // args[] = [76] -> args[0]=76 => or a String for the Name, Color or a boolean for the Button...
    
  var valueContainers = script.getParent().getParent().getChild("Values");
  
  /*
  value_cont -> executors_cont  -> execId_cont -> execName_param
  --------------------------------------------------
  values     ->   Executors     ->     201     -> fader201
                                               -> button201
                                               -> name201
  
                              ->    301        -> button301
                                               -> name301
  */
 
 if(local.parameters.learnFromOscInput.get()){
   var executors_container = valueContainers.getChild("Executors");
   if(executors_container == null){
     executors_container = valueContainers.addContainer("Executors");
    }
    if(executors_container != null){
      var executorId_container = executors_container.getChild(execId);
      
      if(executorId_container == null){
        executorId_container = executors_container.addContainer(execId);  
      }
      if(executorId_container != null){
        var execName_param = executorId_container.getChild(execName);
        
        if(execName_param == null){
          if(execType == "Button"){
            executorId_container.addBoolParameter(execLabel, execName, 0);
          }
          if(execType == "Fader"){
            executorId_container.addFloatParameter(execLabel, execName, 0, 0, 1);
          }
          if(execType == "Name"){
            execValue = execValue.split(";");

            var execCueName = "currentCue" + execId;
            var execCueLable = "Current Cue " + execId;

            executorId_container.addStringParameter(execLabel, execName, execValue[0]);
            executorId_container.addStringParameter(execCueLable, execCueName, execValue[1]);
          }
          if(execType == "Color"){
            var execRgbaArray = execValue.split(";");
            execRgbaArray = arrayMap(execRgbaArray, stringToFloat);
            execRgbaArray = arrayMap(execRgbaArray, normalizeFloat);
            
            executorId_container.addColorParameter(execLabel, execName, 0);
          }
        }
        if(execName_param != null){

        }
      }
    }
  }
  
  var executors_container = valueContainers.getChild("Executors");
  if(executors_container != null){

    var executorId_container = executors_container.getChild(execId);
    if(executorId_container != null){

      var execName_param = executorId_container.getChild(execName);
      if(execName_param != null){

        if(execType == "Button"){
          var state = execValue == "On";
          execName_param.set(state);
        }
        if(execType == "Fader"){
          var range = local.parameters.faderRange.get();
          execName_param.set(parseFloat(execValue/range));
        }
        if(execType == "Name"){
          var execValType = typeof execValue;
          execValType == "object" ? nill : execValue = execValue.split(";");

          var execCueName = "currentCue" + execId;
          var execCueName_param = executorId_container.getChild(execCueName);

          execName_param.set(execValue[0]);
          execCueName_param.set(execValue[1]);
        }
        if(execType == "Color"){
          var execRgbaArray = execValue.split(";");
          execRgbaArray = arrayMap(execRgbaArray, stringToFloat);
          execRgbaArray = arrayMap(execRgbaArray, normalizeFloat);
          
          execName_param.set(execRgbaArray);
        }
      }
    }
  }
  
}

/**
 * Parses an integer from a value.
 * @param {string|number} item The value to parse.
 * @returns {number} The parsed integer, or NaN if it cannot be parsed.
 */
function stringToFloat(item){
    item = parseInt(item);
    return item;
  };

  /**
   * Scales a value from the 0–255 range to the 0–1 range.
   * Values outside the input range are not clamped.
   * @param {number} value The value to normalize.
   * @returns {number} The value divided by 255.
   */
  function normalizeFloat(value){
    // normalized_value = range_min + ((value - original_min) * (range_max - range_min)) / (original_max - original_min)
    return 0 + ((value - 0) * (1 - 0)) / (255 - 0); 
  };

  /**
   * Rotates an array one position to the right, moving its last item to the front.
   * @param {Array} arr The array to rotate.
   * @returns {Array} A new array containing the rotated items.
   */
  function shiftArrayElements(arr){
    // for (var i = 0; i < arr.length; i++) out.push(fn(arr[i], i));
    var arrOld = arr;
    var arrLength = arr.length;
    var arrNew = [];
    for(var i = 1; i <= arrLength; i++){
      arrNew[(i%arrLength)] = arrOld[i-1];
    }
    return arrNew;
  }

/**
 * Splits a string into letter and digit runs without using regular expressions.
 * Non-ASCII-alphanumeric characters act as delimiters, and changes between
 * letters and digits start a new part.
 *
 * @param {string} value The input string to split.
 * @returns {string[]} The alphanumeric parts in their original order.
 */
function splitAlphaNumeric(value) {
  var parts = [];
  var part = "";
  var previousIsDigit = false;

  for (var i = 0; i < value.length; i++) {
    var character = value.charAt(i);
    var isDigit = character >= "0" && character <= "9";
    var isLetter = (character >= "A" && character <= "Z") ||
      (character >= "a" && character <= "z");

    if (!isDigit && !isLetter) {
      if (part.length > 0) {
        parts.push(part);
        part = "";
      }
      continue;
    }

    if (part.length > 0 && isDigit != previousIsDigit) {
      parts.push(part);
      part = "";
    }

    part += character;
    previousIsDigit = isDigit;
  }

  if (part.length > 0) {
    parts.push(part);
  }

  return parts;
}

/**
 * Converts the first character of a string to lowercase.
 * @param {string} string The input string.
 * @returns {string} The string with its first character lowercased.
 */
function firstLetterToLowercase(string){
  return string.charAt(0).toLowerCase() + string.substring(1, string.length);
}

/**
 * Converts the first character of a string to uppercase.
 * @param {string} string The input string.
 * @returns {string} The string with its first character uppercased.
 */
function firstLetterToUppercase(string){
  return string.charAt(0).toUpperCase() + string.substring(1, string.length);
}

/**
 * Maps each array item through a callback, passing the item and its index.
 * @param {Array} arr The input array.
 * @param {function(*, number): *} fn Callback invoked with each item and index.
 * @returns {Array} A new array containing the callback results.
 */
function arrayMap(arr, fn)
{
    var out = [];
    for (var i = 0; i < arr.length; i++) out.push(fn(arr[i], i));
    return out;
}