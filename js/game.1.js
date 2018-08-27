(function() {

  // used elements
  var containerElement = document.getElementById('memorygame');
  var inputFileElement = document.getElementById('files');
  var imageListElement = document.getElementById('imagelist');
  var resetDelayElement = document.getElementById('resetdelay');
  var levelElement = document.getElementById('level');
  var startElement = document.getElementById('tab-game');
  var resultElement = document.getElementById('result');
  var attemptsElement = document.getElementById('attempts');
  var timeTakenElement = document.getElementById('timetaken');

  // data
  var _cards = [];
  var _totalFiles  = 0;
  var _processedCount = 0;
  var _game = null;

  // event listeners  
  inputFileElement.addEventListener('change', handleSelectFiles, false);
  startElement.addEventListener('click', createGame , false);
    
  // creates a new game
  function createGame(e) {
    // create on checked
    if(!e.target.checked)
      return;
    // reset game assets
    if(_game !== null) {
      _game.end();
      _cards = [];
      // todo: do we need to unsubscribe from "mge:over" - will existing handler just be overwritten?
      _game = null;
      attemptsElement.innerHTML = '';
      timeTakenElement.innerHTML = '';
      resultElement.style.display = 'none';
    }
    // if no images has been added then create numbered cards
    if(imageListElement.childNodes.length === 0) {
      for(var i = 0; i < 6; i++) {
        var div = document.createElement('div');
        div.innerText = i;        
        _cards.push(div);
      }
    } else {
      // add images
      for(var i = 0; i < imageListElement.childNodes.length; i++) {
        var clone = imageListElement.childNodes[i].cloneNode();
        _cards.push(clone);
      }
    }
    // create game
    _game = new MemoryGameEngine(containerElement, _cards, +resetDelayElement.value, +levelElement.value);
    // subscribe (note: options are created, started, over)
    _game.container.addEventListener('mge:over', (e) => {
      // set results
      resultElement.style.display = 'block';
      timeTakenElement.innerText = e.detail.displayTime;
      attemptsElement.innerText = e.detail.attempts;
    }, false);
    // calculate best fit columns
    var columns = Math.ceil(Math.sqrt(_cards.length * levelElement.value) / 1.5);
    // set columns css var
    containerElement.style.setProperty('--columns', columns.toString());
    // start game
    _game.start();

  }
  
  function handleSelectFiles(e) {
    // files
    var files = e.target.files;
    // no files guard
    if('undefined' === typeof(files) || files.length === 0)
      return;
    // total files size
    _totalFiles = files.length;
    // this is not used any more...
    var onCompleteHandler = () => {
      _processedCount++;
      if (_processedCount == _totalFiles) {  
        // done - this is not used any more...
        _totalFiles  = 0;
        _processedCount = 0;      
      }
    };
    // loop files
    for (var i = 0, f; f = files[i]; i++) {  
      // ensure image files
      if (!f.type.match('image.*')) 
        continue;  
      // create reader
      var reader = new FileReader();  
      // handle loaded file
      reader.onload = (function (file) {
        return function (e) {
          // create a div
          var div = document.createElement('div');
          // set its background image
          div.style.backgroundImage = 'url(' + (e.target).result + ')';  
          // create button for removing image
          var removeButton = document.createElement('button');
          // add its index to ease lookup later (crap: will die if text nodes exist in imageListElement, so nono add any)
          removeButton.dataset.idx = imageListElement.childNodes.length;
          // add click handler
          removeButton.addEventListener('click', function(e) {
            // remove image from list
            e.target.parentNode.remove();
          });
          div.appendChild(removeButton);

          // already in collection guard before adding
          let alreadyInList = false;
          for(let i = 0; i < imageListElement.childNodes.length;  i++) {
            if(!alreadyInList && imageListElement.childNodes[i].isEqualNode(div)) {
                alreadyInList = true;
            }
          }
          if(!alreadyInList) {
            // add div
            imageListElement.appendChild(div);         
          }
          onCompleteHandler();
        };
      })(f);
      // read data URL
      reader.readAsDataURL(f);
    }
  }
})();
