export function voteForPlayer(playerId){
    playerToVote = playerId;
    for(var i=0;i<players.length; i++){
        if(players[i] == playerId){
            document.getElementById(players[i]).style.backgroundColor = "lightblue";
        }else{
            document.getElementById(players[i]).style.backgroundColor = "lightgrey";
        }
    }

    
}
export function submit(){
    if(playerToVote !== undefined){
        alert("You boted for" + playerToVote)
    }else{
        if(confirm("Are you sure to proceed withouthh voting")){
            alert("You didnt vote")
        }
    }
}