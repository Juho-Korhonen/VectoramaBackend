import {REF, generateRandomId, getHtml} from './FUNCTIONS.js';

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

    firebase.auth().onAuthStateChanged(user => {

        function InitWaitingRoom(){
            roomRef.on("value",snapshot => {// activates when room values change(for updating values and handling disconnects/leaves)
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

                if(roomRefVal.gameStarted){// KEHITSYS JATKUU KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ KEHITSYS JATKUU TÄÄLLÄ
                    gameContainerElement.innerHTML = getHtml("gameView");
                }else{
                    handleWaitingRoomHtml()
                }
            })
            function handleWaitingRoomHtml(){
                if(isAdmin){
                    gameContainerElement.innerHTML = getHtml("adminStartView")
                    document.getElementById("gameId").innerHTML = "Room id: " + roomId;
                    document.getElementById("numberOfPlayers").innerHTML = "Number of players: " + Number(roomRefVal.players.length+1);
    
                    document.getElementById("startButton").addEventListener("click", () => {// if the admin presses to start game
                        if(roomRefVal.players.length > 0){
                            gameContainerElement.innerHTML = getHtml("gameView");
                            roomRef.update({
                                gameStarted: true
                            })
                        } else {
                            alert("Not enough players currently, need atleast 4 players.")
                        }
                    })
                }else {
                    gameContainerElement.innerHTML = getHtml("normalStartView");
                    document.getElementById("gameId").innerHTML = "Room id: " + roomId;
                    document.getElementById("numberOfPlayers").innerHTML = "Number of players: " + Number(roomRefVal.players.length+1);
                }
            }
            handleWaitingRoomHtml()


        }
        


        if(user){// auth onnistunut
            playerId = user.uid;

            createRoomBtn.addEventListener("click", () => {
                if(validateUserName()){
                    playerName = validateUserName(true)
                    roomId = generateRandomId().toString();
                    roomRef = REF(roomId);
                    roomRef.set({
                        adminId: playerId,
                        adminName: playerName,
                        id: roomId,
                        players: [{
                            uid: playerId,
                            username: playerName
                        }],
                        gameStarted: false,
                        gameStartTime: Date.now()
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
                            oldRoomRef.players.push({uid: playerId, username: playerName});
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