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
    var minuteInTs = 60000*2000;// minute in time stamp

    firebase.auth().onAuthStateChanged(user => {

        function handleWaitingRoomHtml(roomRefVal, isAdmin) {
            if(isAdmin){
                gameContainerElement.innerHTML = getHtml("adminStartView")
                document.getElementById("gameId").innerHTML = "Room id: " + roomId;
                document.getElementById("numberOfPlayers").innerHTML = "Number of players: " + Number(roomRefVal.players.length)
                document.getElementById("startButton").addEventListener("click", () => {// if the admin presses to start game
                    if(roomRefVal.players.length > -3){
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
                document.getElementById("numberOfPlayers").innerHTML = "Number of players: " + Number(roomRefVal.players.length);
            }
        }

        function handleRoomUpdate(snapshot) {
            const roomRefVal = snapshot.val();
            const isAdmin = roomRefVal.adminId === playerId;
            handleWaitingRoomHtml(roomRefVal, isAdmin);
        }

        function initializeSendMessageButtonListener(currentData){
            document.getElementById("sendMessageButton").addEventListener("click", () => {
                const fieldValue = document.getElementById("sendMessageInput").value
                if(fieldValue.length > 1){
                    
                    if(currentData.players.find(player => player.uid == playerId).canSendMessage){
                        currentData.messages.push({
                            time: Date.now(),
                            sender: playerName,
                            text: fieldValue
                        })
                        for (let i = 0; i < currentData.players.length; i++) {
                            if(currentData.players[i].uid === playerId){
                                currentData.players[i].canSendMessage = false;
                            }
                        }
                        roomRef.update({
                            messages: currentData.messages,
                            players: currentData.players
                        })
                    }else alert("Olet lähettänyt jo viestin!")
                }else alert("Liian lyhyt viesti.")
            })
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
                        if(roomRefVal.AIs[0] == "empty"){// if there is no AIs, we add the right amount of them
                            var numberOfAisWanted = Math.round((roomRefVal.players.length/4)-0.5)
                            handleAiData(numberOfAisWanted == 0 ? 1 : numberOfAisWanted).then(aiData => {
                                roomRef.update({AIs: aiData})
                            })
                        }

                        if(roomRefVal.timerEndTime == "unset"){// if timer hasnt been set, set it
                            roomRef.update({timerEndTime: Date.now() + minuteInTs})
                        }

                        setInterval(() => { //Timer function
                            roomRef.transaction(currentData => {
                                function updateMessages(){
                                    var messagesElement = document.getElementById("messages")
                                    if(messagesElement !== null){
                                        var messages = roomRefVal.messages;
                                        var messagesObject = "";
                                        for (let i = 1; i < messages.length; i++) {
                                            var message = messages[i]
                                            var amISenderOfMessage = message.sender == playerName
                                            const date = new Date(message.time)
                                            const minutes = date.getMinutes()
                                            if(minutes.length == 1){
                                                minutes = "0"+minutes
                                            }
                                            if(amISenderOfMessage){
                                                messagesObject = messagesObject + 
                                                `
                                                <div class="message right-message">
                                                  <div class="message-bubble">
                                                    <div class="message-info">
                                                      <div class="message-info-name" id="username">${message.sender}</div>
                                                      <div class="message-info-time">${date.getHours()+":"+minutes}</div>
                                                    </div>
                                                    <div class="message-text">${message.text}</div>
                                                  </div>
                                                </div>
                                                `
                                            }else {
                                                messagesObject = messagesObject + 
                                                `
                                                <div class="message left-message">
                                                  <div class="message-bubble">
                                                    <div class="message-info">
                                                      <div class="message-info-name" id="username">${message.sender}</div>
                                                      <div class="message-info-time">${date.getHours()+":"+minutes}</div>
                                                    </div>
                                                    <div class="message-text">${message.text}</div>
                                                  </div>
                                                </div>
                                                `
                                            }
    
                                        }
                                        messagesElement.innerHTML = messagesObject;
                                    }
    
                                }
                                function setUsersToVoteFor(){
                                    var peopleToVote = document.getElementById("peopleToVote");
                                    if(peopleToVote !== null){
                                        var peopleToVoteElement = "";
                                        for (let i = 0; i < currentData.players.length; i++) {
                                            const player = currentData.players[i];
                                            peopleToVoteElement = peopleToVoteElement + 
                                            `
                                                <button class="btn">pelaajan nimi: ${player.username}</p><br>
                                            `
                                        }
                                        peopleToVote.innerHTML = peopleToVoteElement;
                                    }

                                }
                                updateMessages()
                                setUsersToVoteFor()


                                const timer = document.getElementById("timer");

                                timer !== null ? document.getElementById("timer").innerHTML = Math.round((currentData.timerEndTime - Date.now()) / 1000): null
                            
                                if (currentData && currentData.timerSetting === "chat") {
                                    if(document.getElementById("currentView").innerHTML !== "chatView"){// if not chatview, set chatview
                                        gameContainerElement.innerHTML = getHtml("chatView")
                                        initializeSendMessageButtonListener(currentData)
                                    }
                                    if (currentData.timerEndTime < Date.now()) {// empty players points, timer functionality
                                        if (currentData.players) {
                                            for (let i = 0; i < currentData.players.length; i++) {
                                                currentData.players[i].points = 0;
                                            }// setting all users points to 0 for voting time.
                                        };
                                        for (let i = 0; i < currentData.players.length; i++) {
                                            if(currentData.players[i].uid === playerId){
                                                currentData.players[i].canSendMessage = true
                                            }
                                        }
                                        roomRef.update({
                                            messages: ["empty"],
                                            players: currentData.players
                                        })
                                        currentData.messages = ["empty"]
                                        currentData.timerSetting = "voting";
                                        currentData.timerEndTime = Date.now() + minuteInTs;

                                    }

                                    

                                } else {
                                    if(document.getElementById("currentView").innerHTML !== "votingView"){// if not votingview, set votingview
                                        gameContainerElement.innerHTML = getHtml("votingView");
                                        

                                    }
                                    if (currentData.timerEndTime < Date.now()) {// timer functionality, reset chat
                                        currentData.timerSetting = "chat";
                                        currentData.timerEndTime = Date.now() + minuteInTs;
                                    }

                                    function handleVotingView(){

                                    }
                                    handleVotingView()
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
                            points: 0,
                            canSendMessage: true,
                            canVote: true
                        }],
                        messages:["empty"],
                        gameStarted: false,
                        gameStartTime: Date.now(),
                        timerSetting: 'chat',
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