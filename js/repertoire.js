var repertoire = (function() {

  function Repertoire() {
    this.albums = [];
    this.container;
  };

  Repertoire.prototype.init = function(list) {
    // чтение списка, репертуара с актами, и отрисовка
    self = this;
//    var json = list + '.json';
    var n = list.lastIndexOf('/');
    var json = list.substring(0, n) + '/json' + list.substring(n);
    console.log('json=' + json);
    var xhr = new XMLHttpRequest();
    // Асинхронный запрос
    xhr.open('GET', json, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        self.albums = JSON.parse(xhr.responseText);
        self.albums.sort( function(a,b) {
          return (a.author < b.author ? -1 : 1);
        });
        self.build();
      };
    };
    xhr.send();
/*
    // Синхронный запрос
    xhr.open('GET', json, false);
    xhr.send();
    if (xhr.status == 200) {
      self.albums = JSON.parse(xhr.responseText);
      self.albums.sort(function(a,b){return (a.author < b.author ? -1 : 1);});
    }
    this.build();
*/
  };

  Repertoire.prototype.build = function() {
    this.container = document.querySelector(".container");
    // player DOM
    player.build(this.container);
    // repertoire DOM
    var repertoire = document.createElement('div');
    repertoire.className = "repertoire";
    repertoire.onclick = this.playerHandler;
    var spectacles = document.createElement('ul');
    for (var i = 0; i < this.albums.length; i++) {
      var spectacle = document.createElement('li');
      var title = document.createTextNode(this.albums[i].author + ". " + this.albums[i].title);
      spectacle.setAttribute('id', i);
      spectacle.appendChild(title);
      spectacles.appendChild(spectacle);
    };
    repertoire.appendChild(spectacles);
    this.container.appendChild(repertoire);
  };

  Repertoire.prototype.playerHandler = function(event) {
    if (event.target.tagName == 'LI') {
      var albumIndex = event.target.getAttribute('id');
      var albumTitle = repertoire.albums[albumIndex].author + ". " + repertoire.albums[albumIndex].title ;
      var albumTraks = repertoire.albums[albumIndex].tracks;
      player.init(albumTitle, albumTraks);
    };
    return false;
  };
  
  return new Repertoire();
})();

var player = (function() {

  function Player() {
    this.tracks;
    this.countTracks = 0;
    this.form;
    this.audioElement;
    this.toggleButton;
    this.tracksGroup;
    this.pause = true;
  };

  Player.prototype.build = function(container) {
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('id', 'audio');
//    audioElement.setAttribute('controls', '');
    audioElement.appendChild(document.createTextNode('Your browser does not support this audio format.'));
    audioElement.onended = player.nextTrack;
    
    var toggleButton = document.createElement('button');
    toggleButton.setAttribute('id', 'toggleButton');
    toggleButton.setAttribute('type', 'button');
    toggleButton.onclick = this.toggleAudio;
    toggleButton.className = 'shs-btn toggle';
    
    var titleElement = document.createElement('span');
    titleElement.setAttribute('id', 'title');
    
    var tracksGroup = document.createElement('div');
    tracksGroup.setAttribute('id', 'acts');
    tracksGroup.onclick = player.startHandler;
    
    var form = document.createElement('form');
    form.setAttribute("style", "display: none");
    form.appendChild(audioElement);
    form.appendChild(toggleButton);
    form.appendChild(titleElement);
//    form.appendChild(document.createElement('hr'));
    form.appendChild(tracksGroup);
//    form.appendChild(document.createElement('hr'));
    
    container.appendChild(form);
    
    this.toggleButton = toggleButton;
    this.tracksGroup  = tracksGroup;
    this.audioElement = audioElement;
    this.form = form;
  };

  Player.prototype.init = function(title, tracks) {
    // tracks DOM
    this.form.setAttribute("style", "display: block");
    this.title = title;
    this.tracks = tracks;
    this.countTracks = tracks.length;
    this.tracksGroup.innerHTML = '';
    for (var j = 0; j < this.countTracks; j++) {
      var act = document.createElement('button');
      act.setAttribute('type', 'button');
      act.setAttribute('value', j);
      act.className = 'shs-btn';
      act.innerHTML = tracks[j].title;
      this.tracksGroup.appendChild(act);
    }
    player.start(0);
  };

  Player.prototype.startHandler = function(event) {
    if (event.target.tagName == 'BUTTON') {
      player.start(event.target.getAttribute('value'));
    };
    return false;
  };

  Player.prototype.start = function(trackIndex) {
    this.audioElement.pause();
    this.audioElement.src = this.tracks[trackIndex].url;
    this.currentTrack = Number(trackIndex);
    this.pause = false;
    this.toggleButton.textContent = "Остановить";
    document.getElementById('title').innerHTML = '&nbsp; - <strong>' + this.tracks[trackIndex].title + '</strong> - &nbsp;' + this.title;
    this.audioElement.play();
    window.scrollTo(0, 0);
  }

  Player.prototype.toggleAudio = function() {
    // this === [object HTMLButtonElement]
    player.pause = !player.pause;
    var audio = document.getElementById('audio');
    var audio = player.audioElement
    if (player.pause) {
      this.textContent = "Продолжить";
      audio.pause();
    } else {
      this.textContent = "Остановить";
      audio.play();
    }
  }
  
  Player.prototype.nextTrack = function() {
    player.currentTrack++;
    if (player.currentTrack < player.countTracks)
      player.start(player.currentTrack);
    else
      player.toggleButton.textContent = "КОНЕЦ";
  }

  return new Player();
})();

window.onload = repertoire.init(document.querySelector('.current').href);
