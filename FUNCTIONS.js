export function REF(refname){
    return firebase.database().ref(refname)
}

export function generateRandomId(){
    return Math.floor(100000 + Math.random() * 900000)
}

export function getHtml(htmlName){
    if (htmlName == "adminStartView"){
        return `
        <div class="odotus-room">
            <p id="currentView" style="visibility: hidden">adminStartView</p>
            <h2>You are the admin of the game. this means that you get to decide when the game starts. Click start game to start!</h2>
            <p id="gameId">Game id: 231232</p>
            <p id="numberOfPlayers"></p>
            <button class="btn" id="startButton" type="button">Start game</button>
        </div>
        `
    } else if (htmlName == "initialView"){
        return `
            <p id="currentView" style="visibility: hidden">initialView</p>
            <div class="container">
                <button id="createRoomBtn" class="btn" onclick="">Luo huone</button>
            </div>
            <div class="container">
                <button id="joinRoomBtn" class="btn" onclick="">Liity huoneeseen</button>
                <input placeholder="huoneen id" id="roomCodeInput" maxlength="10" type="text" />
            </div>
            <div class="container">
                <input placeholder="username" id="usernameInput" maxlength="10" type="text" />
            </div>
        `
    } else if(htmlName == "normalStartView"){
        return `
        <div class="odotus-room">
            <p id="currentView" style="visibility: hidden">normalStartView</p>
            <p id="gameId">Game id: 231232</p>
            <p id="numberOfPlayers"></p>
        </div>
        `
    } else if (htmlName == "gameView"){
        return `
            <div>
                <p id="currentView" style="visibility: hidden">gameView</p>
                <h1>gameView</h1>
            </div>
        `
    }else if (htmlName == "votingView"){
        return `
        <div>
            <p id="currentView" style="visibility: hidden">votingView</p>
            <div id="peopleToVote"></div>
            <button id="sendMessageButton" class="btn" onclick="">Vahvista valinta</button>
            <p id="timer"></p>
        </div>
    `
    }else if (htmlName == "chatView"){
        return `
        <section class="messenger">
        <div class="messenger-header">
            <h1 style="position: relative;" id="kysymys">Kysymyksiä Firebasesta</h1><br>
            <p id="timer"></p>
        </div>
        <!-- Start of the Messages -->
        <main class="messenger-chat">
            <!-- First Left Message AI -->
            <div class="message left-message">
                <div class="message-img" style="background-image: url(https://cdn-icons-png.flaticon.com/512/773/773330.png);"></div>
                <div class="message-bubble">
                    <div class="message-info">
                        <div class="message-info-name" id="ai_username"></div>
                        <div class="message-info-time">00:00</div>
                    </div>
                    <!-- id="response" että AI ymmärtää sinne sen laittaa -->
                    <div class="message-text" id="response1" >
                    </div>
                </div>
            </div>
            <!-- First Right Message Player -->
            <div class="message right-message">
                <div class="message-img" style="background-image: url(https://freesvg.org/img/abstract-user-flat-4.png);"></div>
                <div class="message-bubble">
                    <div class="message-info">
                        <div class="message-info-name" id="username"></div>
                        <div class="message-info-time">00:00</div>
                    </div>
                    <div class="message-text">
                        >Oma Vastaus<
                    </div>
                </div>
            </div>
        </main>
        <!-- Oma vastaus -->
        <form class="messenger-inputarea">
            <input id="sendMessageInput" maxlength="10" type="text" class="messenger-input" placeholder="Kirjoita vastauksesi...">
            <button id="sendMessageButton" type="button" class="messenger-send-btn" onclick=""><i class="bi bi-send"></i></button>
        </form>
        </section>
            <div>
                <p id="currentView" style="visibility: hidden">chatView</p>
                <div class="container">
                    <button id="sendMessageButton" class="btn" onclick="">Lähetä viesti</button>
                    <input placeholder="viestin sisältö" id="sendMessageInput" maxlength="10" type="text" />
                    <div id="messages"></div>
                    <p id="timer"></p>
                </div>
            </div>
        `
    }
}

/* 

    REF.set({data}) overwrites all data 
    REF.update({}) creates new ref is it doesnt exist, and if it does exist, it updates the data
    REF.get() returns a promise. to see value of the result, do result.val(), 
        you can also do result.exists() to check if it exists(returns bool result)

    typeOfEvent = "value";
    REF.on(typeOfEvent, snapshot => {})

    gets triggered when value changes. the snapshot returns the new value.
    typeOfEvent can be any of the following ["child_added","child_removed"]
    to see snapshot value do snapshot.val()

*/
