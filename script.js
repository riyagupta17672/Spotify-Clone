let currentSong = new Audio;
let songs;
let currFolder;

function convertToMinutesSeconds(seconds) {
    // Ensure seconds is an integer by using Math.floor to remove decimals
    seconds = Math.floor(seconds);

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds to always have two digits
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    // Return the formatted string in MM:SS format
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="svg_img/music.svg" alt="">
                         <div class="info">
                             <div> ${song.replaceAll("%20", " ")} </div>
                             <div>Artist</div>
                         </div>
                         <div class="playNow">
                             <span>Play Now</span>
                             <img  class="invert" src="svg_img/play.svg" alt=""> 
                         </div>
                        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
        play.src = "svg_img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
           
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle -->
                                <circle cx="50" cy="50" r="25" fill="#3be477" />

                                <!-- Black Play Button -->
                                <polygon points="45,40 45,60 60,50" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.by}</p>
                    </div>`

        }
    }

    // Load the plylist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })

    });
}

async function main() {

    // Get the list of all songs

    await getSongs("songs/day");
    playMusic(songs[0], true)

    // Display all the albums on the page 

    displayAlbums()


    // Attach an event listener to previous and next song

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg_img/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "svg_img/play.svg";
        }
    })

    // Listen to time update event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentSong.currentTime)} / ${convertToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for cancel button

    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to previous button

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    // Add an event listener to next button

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event listener to volume 

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0) {
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("svg_img/mute.svg", "svg_img/volume.svg")
        }
    })

    // Add event listener to mute the track

    document.querySelector(".volume > img").addEventListener("click", e => {
        if(e.target.src.includes("svg_img/volume.svg")) {
            e.target.src = e.target.src.replace("svg_img/volume.svg", "svg_img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("svg_img/mute.svg", "svg_img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })    


}

main()
