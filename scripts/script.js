let innerMain = document.getElementById("main").innerHTML;  
const ageButton = document.getElementById("change-age-button");
const wrapperPrograms = document.getElementById("posts-summaries");
const wrapperEpisodes = document.getElementById("episodes-summaries")
const listenButtons = document.getElementsByClassName("listen-button");
const bodyEpisodes = document.getElementById("body-episodes");
const bodyPrograms = document.getElementById("body-programs");
const moreEpisodes = document.getElementById("more-episodes")
let auditivSignal;


async function makeRequest(url) {
  let response = await fetch(url);
  let commits = await response.json();
  return commits 
}

function findQuery(param) {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function setMainTitle(title, htmlId){
  document.getElementById(htmlId).innerHTML = title; 
}

//////////////////////////////// PROGRAM PAGE //////////////////////////////////

//Loading the programes for age 3-8 when starting the program-page
if(bodyPrograms){
populatePostsWithPrograms("//api.sr.se/api/v2/programs/index?programcategoryid=2&pagination=false&format=json")
}

// Change the programes for the range 3-8 or 9-13 on display and the buttoncolor and -text
if(ageButton) {
  ageButton.onclick = function(event) {
    if(parseInt(event.target.getAttribute("data-lowestAge")) === 3){
      wrapperPrograms.innerHTML = "";
      populatePostsWithPrograms("//api.sr.se/api/v2/programs/index?programcategoryid=132&pagination=false&format=json")
      ageButton.innerHTML = "Display the programes for age 3-8"; 
      ageButton.setAttribute("data-lowestAge", "9");
      ageButton.style.background = "#bf10e2";
    }else {
      wrapperPrograms.innerHTML = "";
      populatePostsWithPrograms("//api.sr.se/api/v2/programs/index?programcategoryid=2&pagination=false&format=json")
      ageButton.innerHTML = "Display the programes for age 9-13"; 
      ageButton.setAttribute("data-lowestAge", "3")
      ageButton.style.background = "#1b9bbb";
    }
  }
}

async function populatePostsWithPrograms(url){
  let result = await makeRequest(url)
  for(let i = 0; i < result.programs.length; i++){
    createPostProgram(result.programs[i]);
  }
}

function createPostProgram(programData) {
  if(!programData) return null; 
  if(programData.hasondemand || programData.haspod)
  wrapperPrograms.innerHTML += `<li class="post-wrapper__post"><a href="./pages/episodes.html?id=${programData.id}">
    <img src="${programData.programimage}" alt="Radioprograms image" />
    <div class="post-wrapper__content">
     <span>${programData.programcategory.name}</span>
     <h3>${programData.name}</h3>
     <p>
      ${programData.description}
     </p>
    </div>
    </a>
   </li>`;
}

///////////////////////// EPISODE PAGE///////////////////////

// When the episode-page loads all the episodes-posts will be created 
if(bodyEpisodes){
  populatePostsWithEpisodes();
}

// Depending if there are episodes and if pods or broadcasts, the different functions are called to show episodes on the page
async function populatePostsWithEpisodes(){
  let id = JSON.parse(findQuery("id"));
  let url = `//api.sr.se/api/v2/episodes/index?programid=${id}&audioquality=hi&pagination=false&format=json`;
  let result = await makeRequest(url)
  if(!result.episodes[0]) {
    alert("There are no episodes")
  }else if(result.episodes[0].listenpodfile) {
    setMainTitle("Pods for this program", "maintitle-episodes");
    if(result.episodes.length > 120){
      for(let i = 0; i < 120; i++){
        createPodEpisodes(result.episodes[i]);
      }
      moreEpisodes.innerHTML = "There are more then 120 episodes but only 120 showing here!";
    } else{
      for(let i = result.episodes.length - 1; i >= 0; i--){
        if(result.episodes[i].listenpodfile){
          createPodEpisodes(result.episodes[i]);
        } 
      }
      moreEpisodes.innerHTML = "";
    }
  }else if(result.episodes[0].broadcast) {
    setMainTitle("Broadcasts for this program from the last month", "maintitle-episodes")
    if(result.episodes.length > 120){
      for(let i = 0; i < 120; i++){
        if(result.episodes[i].broadcast){
          createBroadcastEpisodes(result.episodes[i]);
        }
      }
      moreEpisodes.innerHTML = "There are more then 120 episodes but only 120 showing here!";
    }else {
      for(let i = result.episodes.length - 1; i >= 0; i--){
        if(result.episodes[i].broadcast){
          createBroadcastEpisodes(result.episodes[i]);
        }
      }
      moreEpisodes.innerHTML = "";
    }
    
    
  }else {
    alert("There are no broadcasts or pods for this program")
    return
  }
  setListenButtons();
}

function createPodEpisodes(podEpisodeData){
  if(!podEpisodeData) return null; 
  let audioType = declareAudioTypeFromFileEnding(podEpisodeData.listenpodfile.url);
  wrapperEpisodes.innerHTML += `<li class="single-post-wrapper__post">
    <audio id="myAudio${podEpisodeData.id}">
      <source src="${podEpisodeData.listenpodfile.url}" type="audio/${audioType}">
      Your browser does not support the audio element.
    </audio>
    <img src="${podEpisodeData.imageurl}" alt="Radioprograms image" />
    <div class="single-post-wrapper__content">
     <span>${podEpisodeData.listenpodfile.program.name}</span>
     <h3>${podEpisodeData.listenpodfile.title}</h3>
     <p>
      ${podEpisodeData.description}
     </p>
     <button class="listen-button" type="button" data-id="${podEpisodeData.id}" data-actionSound="play" >Play</button> 
      <button class="listen-button" type="button" data-id="${podEpisodeData.id}" data-actionSound="pause">Pause</button>
    </div>
   </li>`; 
}

function createBroadcastEpisodes(ondemandEpisodData){
  if(!ondemandEpisodData) return null; 
  let audioType = declareAudioTypeFromFileEnding(ondemandEpisodData.broadcast.broadcastfiles[0].url);
  wrapperEpisodes.innerHTML += `<li class="single-post-wrapper__post">
  <audio id="myAudio${ondemandEpisodData.id}">
    <source src="${ondemandEpisodData.broadcast.broadcastfiles[0].url}" type="audio/${audioType}">
    Your browser does not support the audio element.
  </audio>
  <img src="${ondemandEpisodData.imageurl}" alt="Radioprograms image" />
  <div class="single-post-wrapper__content">
   <span>${ondemandEpisodData.program.name}</span>
   <h3>${ondemandEpisodData.title}</h3>
   <p>
    ${ondemandEpisodData.description}
   </p>
   <button class="listen-button" type="button" data-id="${ondemandEpisodData.id}" data-actionSound="play" >Play</button> 
    <button class="listen-button" type="button" data-id="${ondemandEpisodData.id}" data-actionSound="pause">Pause</button>
  </div>
 </li>`; 
}

/////////////////////AUDIO ON EPISODS-PAGE//////////////////////////

function declareAudioTypeFromFileEnding(audioFile){
  let audioFileType = audioFile.substr(audioFile.length - 3);
  switch(audioFileType){
    case "mp3":
      audioFileType = "mpeg";
      break;
    case "oga": 
      audioFileType = "ogg";
      break;
    case "m4a":
      audioFileType = "mp4";
      break;
    default:  
  }    
  return audioFileType;
}

//Setting an eventListener to the play and pause buttons
function setListenButtons(){
  for (var i = 0; i < listenButtons.length; i++) {
    listenButtons[i].addEventListener('click', listenEpisode);
  }
}

// When the button play or pause is clicked its playing or pausing the pod/broadcast
function listenEpisode(event){
  console.log(event)
  let episodeId = parseInt(event.target.getAttribute("data-id"));
  
  if(auditivSignal != document.getElementById(`myAudio${episodeId}`)){
    auditivSignal = document.getElementById(`myAudio${episodeId}`);
    auditivSignal.load();
  } 
  if(event.target.getAttribute("data-actionSound") === "play")
    auditivSignal.play();
  if(event.target.getAttribute("data-actionSound") === "pause")
    auditivSignal.pause();
  event.stopPropagation();
}

///////////////////////////////TODO AND SUGGESTED IMPROVEMENTS//////////////////////////
/*
- episodes with more than 168 or 243 are not loading more episodes so now there is a limit with 120
  -> laoding only 120 now and then have another page with other 100 in a next-button etc.?
- set icon for play and pause
- set a progressbar for the time-played/still-to-play
- when going back to main from episodes, make it back to the same program as before
  ->loading the page again with the same age-category-programs 
  ->scrolling down to the right program as before
- when listened to an episode make it change color or something to show its already listened
*/