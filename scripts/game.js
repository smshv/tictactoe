const ROUND_LIM = 5;
const nextRoundBttn = document.querySelector("next-bttn-wrap");
const players=[null,null];
const Player = (name, computer)=>{
    const name = name;
    let score = 0;
    const isComputer = ()=>computer;
    const incScore = () =>(score+1);
    const getScore = () => score;
    const getName = () => name;
    return {incScore, getScore, getName, isComputer};
}

const displayController = (()=>{
    const markers = ['X','O'];
    const cells = document.querySelectorAll(".cell");
    const playerScores = [document.querySelector("player-1-score"), document.querySelector("player-2-score")];
    const strikeLine = document.querySelector("#strike");
    const boardMsg = document.querySelector("#board-msg");

    const setMarker = (playerId, marker)=>{
        if (!playerId || marker[playerId] !== marker[0]){
            markers[playerId] = marker;
        }else{
            markers[0] = 'X';
            markers[1] = 'O';
            window.alert("There has been a conflict with marker chosen. Setting markers to defaults.")
        }
        
    }
    
    function clearCells(){
        cells.forEach(cell=>{
            cell.textContent="";
        });
    }
    const reset = (player_names=["Player 1", "Player 2"])=>{
        nextRoundBttn.setAttribute("visibility", "false");
        strikeLine.setAttribute("visibility", "false");
        strikeLine.setAttribute("transform", "none");
        document.querySelector("player-1-name").textContent = player_names[0];
        document.querySelector("player-2-name").textContent = player_names[1];
        playerScores[0].textContent = "0";
        playerScores[1].textContent = '0';
        boardMsg.textContent="";
    }
    const nextRound = ()=>{
        clearCells();
        strikeLine.setAttribute("visibility", "false");
        strikeLine.setAttribute("transform", "none");
        boardMsg.textContent="";   
    }
    
    const updateScore = (roundWinnerId, gameDecided, gameWinnerId)=>{
        playerScores[roundWinnerId].textContent = players[roundWinnerId].getScore().toString();
        if ( gameDecided ){
            boardMsg.textContent = `${players[gameWinnerId].getName()} wins the game!`;
        }else{
            boardMsg.textContent = `${players[roundWinnerId].getName()}`;
        }
    }
    const putMarkerInGrid = (playerId, cell)=>{
        cell.textContent = markers[playerId];
    }
    return {setMarker, reset, nextRound, updateScore, putMarkerInGrid};
}
)();

const gameBoard = (()=>{

    let grids = [[0,0,0],[0,0,0],[0,0,0]];
    let roundsRemained = 0;
    let movesRemained = 0;
    let currentPlayerId = 0;

    const reset = (movesRemainedVal=0)=>{
        grids.fill(0);
        roundsRemained = ROUND_LIM;
        movesRemained = movesRemainedVal;
        currentPlayerId = Math.round(Math.random());
    }
    const nextRound = ()=>{
        if ( roundsRemained ){
            grids.fill(0);
            movesRemained = 9;
            currentPlayerId = Math.round(Math.random());
        }
    }
    function computerStep(row, col){

        return true;
    }
    const playStep = (cell)=>{
        if ( movesRemained ){
            let validMove = false;
            const [row, col] = [cell.getAttribute("row"), cell.getAttribute("col")]
            if ( players[currentPlayerId].isComputer() ){
                validMove = true;
                [row,col] = computerStep(row, col);
            }else if( !grids[row][col]){
                grids[row][col] = currentPlayerId+1;
                movesRemained -= 1;
                validMove = true;   
            }
            if (validMove){
                displayController.putMarkerInGrid(currentPlayerId, row, col);
                const [isIdRoundWinner, gameDecided, gameWinnerId] = isRoundWinner(row, col);
                if ( isIdRoundWinner ){
                    displayController.shoWinMoves(); //yet to implement
                    displayController.updateScore(
                        currentPlayerId, gameDecided, gameWinnerId
                    );
                }
            }
        }
        return false;
    }
    function decideGameWinner(){
        if ( ! roundsRemained ){
            if ( players[0].getScore() > players[1].getScore()){
                return [true, 0]; 
            }else if ( players[0].getScore < players[1].getScore() ){
                return [true, 1];
            }
            gameDecided = true;
        }else if ( players[currentPlayerId].getScore() == parseInt(ROUND_LIM/2)+1 ) {
            return [true, currentPlayerId];
        }else{
            return [false, -1]; //gameDecided, gameWinnerId
        }
    }

    const isRoundWinner = (row, col)=>{
        let gameDecided = false;
        let gameWinnerId = -1;
        let isCurrentIdWinner = false;
        if (movesRemained < 5){
            const delta = [[0, 1],[0,-1],[1,0],[-1,0],
                        [1,1],[-1,1],[1,-1],[-1,-1]];
            for (step in delta){
                const new_row = row+step[0];
                const new_col = col+step[1]; 
                if (checkValidGrid(new_row, new_col)
                   && checkValidGrid(new_row+step[0], new_col+step[1])){
                    roundPlayed += 1;
                    players[currentPlayerId].incScore();
                    movesRemained = 0;
                    isCurrentIdWinner = true;
                    [gameDecided, gameWinnerId] = decideGameWinner();
                    break;
                }
            }
        }
        return [isCurrentIdWinner, gameDecided, gameWinnerId]; 
    }
    function checkValidGrid(row, col){
        if ( row >-1 && col>-1 && row<3 && col<3 && 
            grids[row][col] == (currentPlayerId)){
                return true;
        }
        return false;
    }
    function toggleCurrentPlayerId(){
        currentPlayerId = 1 - currentPlayerId;
    }
    return {reset, nextRound, playStep, isRoundWinner, toggleCurrentPlayerId};
})();

document.querySelectorAll(".cell");
document.querySelector("#reset").addEventListener("click", ()=>{
    gameBoard.reset();
    displayController.reset();
})
document.querySelectorAll("#play").forEach(bttn=>
    bttn.addEventListener("click", ()=>{
        players[0] = Player(prompt("Input Player 1's name:"), false);
        if (bttn.getAttribute("against") === "human"){
            players[1] = Player(prompt("Input Player 2's name:"), false);
        }else{
            players[1] = Player("Computer", true);
        }
        gameBoard.reset(9);
        displayController.reset([players[0].getName(), players[1].getName()])
}));
document.querySelector("#next").addEventListener("click", ()=>{
    gameBoard.nextRound();
    displayController.nextRound();
})
document.querySelectorAll(".cell").forEach(cell=>{
    cell.addEventListener("click", ()=>{
        do{
            gameBoard.playStep(cell);
        }while( players[gameBoard.toggleCurrentPlayerId()].isComputer() )
    });
});

