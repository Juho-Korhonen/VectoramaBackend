import {REF, generateRandomId, getHtml} from './FUNCTIONS.js';
import {getData, handleAiData} from './FIRESTOREFUNCTIONS.js';
function handleError(error){
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage)
}
function validateUserName(fetching=false){// if fetching, return field value, otherwise return if field is valid
    if(fetching){
        return document.getElementById("usernameInput").value
    }else{
        const userNameInput = document.getElementById("usernameInput");
        if (userNameInput.value.length > 2 && userNameInput.value.length < 15){
            return true
        } else {
            alert("Lisää nimi!")
            return false
        }
    }
}



(function(){
    const createRoomBtn = document.getElementById("createRoomBtn");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const joinRoomCode = document.getElementById("roomCodeInput");
    const gameContainerElement = document.getElementById("gameContainerElement");

    var playerId;
    var playerName;
    var roomRef;
    var roomRefVal;
    var roomId;
    var isAdmin;// if user is admin/creator
    var thirtySecondsInTS = 30000;// 30 seconds in time stamp

    firebase.auth().onAuthStateChanged(user => {

        function handleWaitingRoomHtml(roomRefVal, isAdmin) {
            if(isAdmin){
                gameContainerElement.innerHTML = getHtml("adminStartView")
                document.getElementById("gameId").innerHTML = "Room id: " + roomId;
                document.getElementById("numberOfPlayers").innerHTML = "Number of players: " + Number(roomRefVal.players.length+1)
                document.getElementById("startButton").addEventListener("click", () => {// if the admin presses to start game
                    if(roomRefVal.players.length > -3){
                        gameContainerElement.innerHTML = getHtml("gameView");
                        roomRef.update({
                            gameStarted: true
                        })
                    } else {
                        alert("Not enough players currently, need atleast 4 players.")
                    }
                })
            } else {
                gameContainerElement.innerHTML = getHtml("normalStartView");
                document.getElementById("gameId").innerHTML = "Room id: " + roomId;
                document.getElementById("numberOfPlayers").innerHTML = "Number of players: " + Number(roomRefVal.players.length+1);
            }
        }

        function handleRoomUpdate(snapshot) {
            const roomRefVal = snapshot.val();
            const isAdmin = roomRefVal.adminId === playerId;
            handleWaitingRoomHtml(roomRefVal, isAdmin);
        }

        function InitWaitingRoom() {
                roomRef.on("value", snapshot => {// activates when room values change(for updating values and handling disconnects/leaves)
                    roomRefVal = snapshot.val();// resetting roomRefVal on change
                    isAdmin = roomRefVal.adminId == playerId;
                    // setting Disconnect rules.
                    if(isAdmin){
                        const index = roomRefVal.players.findIndex(player => player.uid == playerId);
                        var playersList = roomRefVal.players;
                        playersList.splice(index,1);
                        if(playersList.length == 0){
                            roomRef.onDisconnect().remove()
                        }else{
                            const randomPlayer = playersList[Math.floor(Math.random()*playersList.length)]
                            var leftObject = roomRefVal;
                            leftObject.adminId = randomPlayer.uid;
                            leftObject.adminName = randomPlayer.username
                            leftObject.players = playersList;
                            roomRef.onDisconnect().update(leftObject)
                        }
                    }else {
                        const index = roomRefVal.players.findIndex(player => player.uid == playerId);
                        var leftObject = roomRefVal;
                        leftObject.players.splice(index,1);
                        roomRef.onDisconnect().update(leftObject)
                    } 

                    if(roomRefVal.gameStarted) {// KEHITSYS JATKUU KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ
                        gameContainerElement.innerHTML = getHtml("gameView");

                        if(roomRefVal.AIs[0] == "empty"){// if there is no AIs, we add the right amount of them
                            var numberOfAisWanted = Math.round((roomRefVal.players.length/4)-0.5)
                            handleAiData(numberOfAisWanted == 0 ? 1 : numberOfAisWanted).then(aiData => {
                                roomRef.update({AIs: aiData})
                            })
                        }

                        if(roomRefVal.timerEndTime == "unset"){// if timer hasnt been set, set it
                            roomRef.update({timerEndTime: Date.now() + thirtySecondsInTS})
                        }

                        setInterval(() => { //Timer function
                            roomRef.transaction(currentData => {
                                if (currentData && currentData.timerSetting === "answering") {
                                    if (currentData.timerEndTime < Date.now()) {
                                        if (currentData.players) {
                                            for (let i = 0; i < currentData.players.length; i++) {
                                                currentData.players[i].points = 0;
                                            }
                                        }
                                        currentData.timerSetting = "voting";
                                        currentData.timerEndTime = Date.now() + thirtySecondsInTS / 6;
                                    }
                                } else {
                                    if (currentData.timerEndTime < Date.now()) {
                                        currentData.timerSetting = "answering";
                                        currentData.timerEndTime = Date.now() + thirtySecondsInTS / 6;
                                    }
                                }
                                return currentData;
                            });
                        }, 3000);
                    } else {
                        handleRoomUpdate(snapshot);
                    }
                });

                /* handleWaitingRoomHtml(); */
        }
        


        if(user){// auth onnistunut
            playerId = user.uid;

            createRoomBtn.addEventListener("click", () => {
                if(validateUserName()){
                    playerName = validateUserName(true)
                    roomId = generateRandomId().toString();
                    roomRef = REF(roomId);
                    console.log("Setting")
                    roomRef.set({
                        duplicateQuestions: ["empty"], 
                        AIs: ["empty"], // jos laittaa tyhjän arrayn, firebase ei ota sitä vastaan.
                        adminId: playerId,
                        adminName: playerName,
                        id: roomId,
                        players: [{
                            uid: playerId,
                            username: playerName,
                            points: 10,
                        }],

                        gameStarted: false,
                        gameStartTime: Date.now(),
                        timerSetting: 'answering',
                        timerEndTime: "unset"
                    })
                    roomRef.get().then(res => {
                        roomRefVal = res.val();
                        InitWaitingRoom();
                    })
                }
            })

            joinRoomBtn.addEventListener("click", async () => {
                if(validateUserName()){
                    playerName = validateUserName(true);
                    roomId = joinRoomCode.value;
                    roomRef = REF(roomId);
                    let oldRoomRef = await roomRef.get();
                    if(oldRoomRef.exists()){
                        oldRoomRef = oldRoomRef.val();

                        const userInGame = oldRoomRef.players.find(player => player.uid == playerId) !== undefined;
                        if(!userInGame){
                            oldRoomRef.players.push({
                                uid: playerId, 
                                username: playerName,
                                points: 0
                            });
                            roomRef.update(oldRoomRef)
                        }
                        roomRef.get().then(res => {
                            roomRefVal = res.val();
                            InitWaitingRoom();
                        })
                    } else alert("REF doesn't exist")

                }
            })
        }
    })
    firebase.auth().signInAnonymously().catch(handleError)
}())