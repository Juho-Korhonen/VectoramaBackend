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
        } else return false
    }

}



(function(){
    const userNameInput = document.getElementById("userNameInput");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const joinRoomCode = document.getElementById("roomCodeInput");

    var playerId;
    var playerName;
    var roomRef;
    var roomId;
    var players;



    firebase.auth().onAuthStateChanged(user => {
        if(user){// auth onnistunut
            playerId = user.uid;
            createRoomBtn.addEventListener("click", () => {
                roomId = Date.now().toString().substring(-6);
                alert(roomId)
                if(validateUserName()){
                    playerName = validateUserName(true);
                    roomRef = firebase.database().ref("rooms/" + roomId);
                    roomRef.set({
                        players:[{username: playerName, uid: playerId}],
                        creator:playerName,
                        roomId: roomId
                    }).then(() => {
                        window.location.href = "odotushuone.html";
                    })
                } else alert("Nimesi täytyy olla pidempi kuin 3 ja lyhyempi kuin 15.")
                
            })
            joinRoomBtn.addEventListener("click", () => {
                alert(roomId)
                roomId = joinRoomCode.value;
                if(validateUserName()){
                    playerName = validateUserName(true);
                    try{
                        roomRef = firebase.database().ref("rooms/" + roomId);
                        roomRef.update({
                            players: [{username: playerName, uid: playerId}]
                        }).then(() => {
                            window.location.href = "odotushuone.html";
                        })
                    }catch(error){
                        alert("Tarkista koodi, kirjoitithan sen oikein?")
                    }
                } else alert("Nimesi täytyy olla pidempi kuin 3 ja lyhyempi kuin 15.")
            })

        }
    })
    firebase.auth().signInAnonymously().catch(handleError)




}())