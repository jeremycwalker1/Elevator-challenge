var _floors, 
    _buttons,
    _display, 
    _queue = [],
    _goingUp = true,
    _currentFloor = 1,
    _targetFloor = 1;

function setDirectionSignal(){
  if(_currentFloor === _targetFloor && !_queue.length){
    _display.className = "";
  }else if(_currentFloor < _targetFloor){
    _display.className = "up";
  }else if(_currentFloor > _targetFloor){
    _display.className = "down";
  }
}

function setDirection(val){
  if(_currentFloor === _targetFloor){
    if(val < _targetFloor){
      _goingUp = false;
    }else{
      _goingUp = true;
    }
  }
}

function setTargetFloor(val){
  if (!_queue.length || (val > _targetFloor && _goingUp) || (val < _targetFloor && !_goingUp)){
    _targetFloor = val;
    setDirection(val);
  }
}

function addFloorToQueue(val){
  setDirection(val);
  setTargetFloor(val);
  if(!isFloorInQueue(_queue, val)){
    _queue.push(val);
    _queue.sort(function(a, b) {
      return a - b;
    });
    setTargetFloor(val);
  }
}

function removeFloorFromQueue(val){
  if(_queue.indexOf(val) != -1){
    var target = _queue.indexOf(val);
    _queue.splice(target, 1);
  }
}

function selectNextFloor(){
  if(_queue.length !== 0){
    if(_targetFloor > _currentFloor){
      goToNextFloor(_currentFloor + 1);
    }else if(_targetFloor < _currentFloor){
      goToNextFloor(_currentFloor - 1);
    }else{
      goToNextFloor(_currentFloor);
      if(_goingUp){
        _targetFloor = _queue[0];
      }else{
        _targetFloor = _queue[_queue.length];
      }
      _goingUp = !_goingUp;
    }
  }
}

function goToNextFloor(next){
  removeFloorFromQueue(_currentFloor);
  setDirectionSignal();
  _currentFloor = next;
  var position = (_buttons.length - _currentFloor) * -210;
  _floors.style.transform = 'translate3d(0px, ' + position + 'px, 0px)';
}

function loop(){
  selectNextFloor();
  setButtonStates(_queue);
  setTimeout(loop, 1000);
}

function isFloorInQueue(queue, val){
  return queue.indexOf(val) !== -1;
}

function getAttributeAsInt(target){
  var data = target.getAttribute('data-floor');
  var number = parseInt(data, 10);
  return number;
}

function buttonClickEvent(e){
  var currentButton = e.currentTarget;
  var floor = getAttributeAsInt(currentButton);
  var inQueue = isFloorInQueue(_queue, floor);
  if(!inQueue){ 
    currentButton.className = 'active';
    addFloorToQueue(floor);
  }
}

function setButtonStates(queue){
  for(var i = 0; i < _buttons.length; i++){
    var floor = getAttributeAsInt(_buttons[i]);
    var inQueue = isFloorInQueue(queue, floor);
    if(!inQueue){
      _buttons[i].className = '';
    }else{
      _buttons[i].className = 'active';
    }
  }
}

function init(){
  _floors   = document.getElementById('floors');
  _display  = document.getElementById('display');
  _buttons  = document.querySelectorAll('#buttons li');
  
  for(var i = 0; i < _buttons.length; i++){
    _buttons[i].addEventListener('click', buttonClickEvent, false);
  }

  loop();
}

init();
