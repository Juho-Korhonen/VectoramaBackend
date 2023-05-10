export function REF(refname){
    return firebase.database().ref(refname)
}

export function generateRandomId(){
    return Math.floor(100000 + Math.random() * 900000)
}

export function getHtml(htmlName){
    if (htmlName == "adminStartView"){
        return `
            <h2>You are the admin of the game. this means that you get to decide when the game starts. Click start game to start!</h2>

            <p id="gameId">Game id: 231232</p>
            <p id="numberOfPlayers"></p>
            <button id="startButton" type="button">Start game</button>
        `
    } else if (htmlName == "initialView"){
        return `
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
            <p id="gameId">Game id: 231232</p>
            <p id="numberOfPlayers"></p>
        `
    } else if (htmlName == "gameView"){
        return `
            <div>
                <h1>gameView</h1>
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
