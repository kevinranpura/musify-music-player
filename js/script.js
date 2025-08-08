

let currentsong = new Audio()
let songs
let currfolder

function sectomin(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    let min = Math.floor(seconds / 60)
    let sec = Math.floor(seconds % 60)

    let formattedmin = String(min).padStart(2, "0")
    let formattedsec = String(sec).padStart(2, "0")

    return `${formattedmin}:${formattedsec}`
}

async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchor = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < anchor.length; i++) {
        const element = anchor[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1].replaceAll("%20", " "))
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="music" src="img/music.svg" alt="">
                            <div class="songinfo">
                                <div class="sname">${song.split("-")[0]}</div>
                                <div class="sartist">${song.split("-")[1].split(".mp3")[0]}</div>
                            </div>
                            <img class="play2" src="img/playbutton3.svg" alt=""></li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        let click = e.lastElementChild;
        click.addEventListener("click", element => {
            playmusic(e.querySelector(".songinfo").firstElementChild.innerHTML + "-" + e.querySelector(".songinfo").getElementsByTagName("div")[1].innerHTML + ".mp3")
        })

    });

    return songs
}

const playmusic = (track) => {
    currentsong.src = `${currfolder}` + track
    currentsong.play()
    play.src = "img/pause.svg"
    document.querySelector(".songinfo2").innerHTML = track.split("-")[0] + "-" + track.split("-")[1].split(".mp3")[0]
    document.querySelector(".volume").style.top = 0
}

async function displayalbums() {
    let a = await fetch(`/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
 
        if (e.href.includes("/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/${folder}/info.json`)
            let response = await a.json()
            cardcontainer.innerHTML = cardcontainer.innerHTML +
            `   <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="img/playbutton.svg" height="45px" width="45px" alt="">
                    </div>
                    <img src="/${folder}/cover.jpg" alt="">
                    <h4>${response.title}</h4>
                    <p>${response.description}</p>
                </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`public/${item.currentTarget.dataset.folder}/`)
            playmusic(songs[0])
        })
    })

    previous.addEventListener("click", () => {
        if (currentsong.src == false) {
            playmusic(songs[0])
        }
        else {
            let index = songs.indexOf(currentsong.src.split(`${currfolder}`)[1].replaceAll("%20", " "));
            if (index - 1 >= 0) {
                playmusic(songs[index - 1])
            }
        }
    })

    next.addEventListener("click", () => {
        if (currentsong.src == false) {
            playmusic(songs[0])
        }
        else {
            let index = songs.indexOf(currentsong.src.split(`${currfolder}`)[1].replaceAll("%20", " "))
            if (index + 1 < songs.length) {
                playmusic(songs[index + 1])
            }
        }
    })
}


async function main() {
    songs = await getsongs("public/tunes/")

    displayalbums()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/playbutton2.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${sectomin(currentsong.currentTime)} / ${sectomin(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100


    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0

        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = 0.5
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })


}

main()

