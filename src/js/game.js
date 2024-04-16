/*
TODO:  Prioritized
*/

import RetroBuffer from './core/RetroBuffer.js';
import MusicPlayer from './core/musicplayer.js';

//sound assets
import tada from './sounds/tada.js';

import { playSound, Key, choice, inView, lerp, callOnce } from './core/utils.js';
//import Stats from './Stats.js';
import Splode from './splode.js';
//stats = new Stats();
//stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
(function(){

document.body.style="margin:0; background-color:black; overflow:hidden";
if(innerWidth < 800){
  w = innerWidth;
h = innerHeight;
}else if(innerWidth < 1300){
  w = Math.floor(innerWidth/2);
  h = Math.floor(innerHeight/2);
}else  {
  w = Math.floor(innerWidth/3.5);
h = Math.floor(innerHeight/3.5);
}

//TODO: move palette loading to RetroBuffer--
const atlasURL = 'DATAURL:src/img/palette.webp';
atlasImage = new Image();
atlasImage.src = atlasURL;

atlasImage.onload = function(){ 
  let c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  let ctx = c.getContext('2d');
  ctx.drawImage(this, 0, 0);
  atlas = new Uint32Array( ctx.getImageData(0,0,64, 64).data.buffer );
  window.r = new RetroBuffer(w, h, atlas, 10);
  gameInit();
};
//--------------------------------------------

function gameInit(){
  window.playSound = playSound;
  gamebox = document.getElementById("game");
  gamebox.appendChild(r.c);
  gameloop();
}

//document.body.appendChild( stats.dom );

window.t = 1;


sounds = {};
soundsReady = 0;
totalSounds = 8;
audioTxt = "";
debugText = "";
gamestate = 0;
started = false;


function initGameData(){
  //initialize game data
}

function initAudio(){
  audioCtx = new AudioContext;
  audioMaster = audioCtx.createGain();
  compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-60, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime); 
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

  audioMaster.connect(compressor);
  compressor.connect(audioCtx.destination);

  sndData = [
    {name:'tada', data: tada}
  ]
  totalSounds = sndData.length;
  soundsReady = 0;
  sndData.forEach(function(o){
    var sndGenerator = new MusicPlayer();
    sndGenerator.init(o.data);
    var done = false;
    setInterval(function () {
      if (done) {
        return;
      }
      done = sndGenerator.generate() == 1;
      soundsReady+=done;
      if(done){
        let wave = sndGenerator.createWave().buffer;
        audioCtx.decodeAudioData(wave, function(buffer) {
          sounds[o.name] = buffer;
        })
      }
    },0)
  })
}


function updateGame(){
  t+=1;
}

function drawGame(){
  r.clear(64, r.SCREEN);
  let txt = "GAME SCREEN";
  r.text([txt, w/2-2, 100, 1, 3, 'center', 'top', 1, 22]);
  r.render();
}

function titlescreen(){
  r.clear(64, r.SCREEN);
  let txt = "TITLE SCREEN";
  r.text([txt, w/2-2, 100, 1, 3, 'center', 'top', 1, 22]);
  r.render();
}

function resetGame(){
  //reset arrays to emmpty, etc
  //then re-init
  initGameData();
  gameState = 2;
}

function preload(){
  r.clear(64, r.SCREEN);
  r.renderTarget = r.SCREEN;
  r.text([audioTxt, w/2-2, 100, 1, 3, 'center', 'top', 1, 22]);
  if(Key.justReleased(Key.UP) || Key.justReleased(Key.w) || Key.justReleased(Key.z)){
    if(soundsReady == 0 && !started){
    initGameData();
    initAudio();
    started = true;
    }else {
      callOnce(playSound(sounds.tada, 1, 0, 1, false));
      gamestate = 2;
    }
  }; 
  audioTxt = "CLICK TO ALLOW AUDIOCONTEXT TO CONTINUE";
  if(soundsReady == totalSounds){
    audioTxt="ALL SOUNDS RENDERED.\nPRESS UP/W/Z TO CONTINUE";
  } else if (started){
    audioTxt = "SOUNDS RENDERING... " + soundsReady;
  } else {
    audioTxt = "CLICK TO ALLOW AUDIOCONTEXT TO CONTINUE";
  }
  r.renderSource = r.PAGE_1;
  r.renderTarget = r.SCREEN;
  r.sspr(0,0,w,h,0,0,w,h,false,false);
  r.render();
}

//initialize  event listeners--------------------------
window.addEventListener('keyup', function (event) {
  Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function (event) {
  Key.onKeydown(event);
}, false);
window.addEventListener('blur', function (event) {
  paused = true;
}, false);
window.addEventListener('focus', function (event) {
  paused = false;
}, false);

onclick=e=>{
  x=e.pageX;y=e.pageY;
  paused = false;
  switch(gamestate){
      case 0: // react to clicks on screen 0s
        if(soundsReady == 0 && !started){
          initGameData();
          initAudio();
          started = true;
        }
      break;
      case 1: // react to clicks on screen 1
      case 2: // react to clicks on screen 2
      case 3: // react to clicks on screen 3
  }
}

function pruneDead(entitiesArray){
  for(let i = 0; i < entitiesArray.length; i++){
    let e = entitiesArray[i];
    if(!e.alive){
      entitiesArray.splice(i,1);
    }
  }
}

function pruneScreen(entitiesArray){
  for(let i = 0; i < entitiesArray.length; i++){
    let e = entitiesArray[i];
    if(!inView(e)){
      entitiesArray.splice(i,1);
    }
  }
}

function drawCollected(){
  collected.forEach(function(d, i, a){
    r.rect(5+i*20, h-20, 10, 10, 22);
    r.fillRect(5+i*20, h-20, 10, 10, d.color);
  });
}


function gameloop(){
  if(1==1){
  //stats.begin();
    switch(gamestate){
      case 0: //title screen
        preload();
        break;
      case 1: //game
        updateGame();
        drawGame();
        break;
      case 2: //game over
        titlescreen();
        break;
    }
    Key.update();
   // stats.end();
    requestAnimationFrame(gameloop);
  }
}

})();
