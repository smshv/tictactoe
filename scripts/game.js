const ROUND_LIM = 5;
const players=[null,null];
const Player = (playerName, computer)=>{
    const name = playerName;
    let score = 0;
    const isComputer = ()=>computer;
    const incScore = () =>{score=(score+1)};
    const getScore = () => score;
    const getName = () => name;
    return {incScore, getScore, getName, isComputer};
}

const displayController = (()=>{
    const markers = ['X','O'];
    const cells = document.querySelectorAll(".cell");
    const playerScores = [document.querySelector("#player-1-score"), document.querySelector("#player-2-score")];
    const boardMsg = document.querySelector("#board-msg");
    const nextRoundBttn = document.querySelector("#next-bttn-wrap");

    function clearCells(){
        cells.forEach(cell=>{
            cell.textContent="";
        });
    }
    const reset = (player_names=["Player 1", "Player 2"])=>{
        clearCells();
        nextRoundBttn.style.visibility ="hidden";
        document.querySelector("#player-1-name").textContent = player_names[0];
        document.querySelector("#player-2-name").textContent = player_names[1];
        playerScores[0].textContent = "0";
        playerScores[1].textContent = '0';
        boardMsg.textContent="";
    }
    const nextRound = ()=>{
        clearCells();
        nextRoundBttn.style.visibility = "hidden";
        boardMsg.textContent="";   
    }
    
    const updateScore = (roundWinnerId, gameDecided, gameWinnerId)=>{
        playerScores[roundWinnerId].textContent = players[roundWinnerId].getScore().toString();
        if ( gameDecided ){
            if ( gameWinnerId === -1){
                boardMsg.textContent = "Game draws";
            }else{
                boardMsg.textContent = `${players[gameWinnerId].getName()} wins the game!`;
            }
        }else{
            boardMsg.textContent = `${players[roundWinnerId].getName()} wins this round`;
            nextRoundBttn.style.visibility = "visible";
        }
    }
    const putMarkerInGrid = (playerId, cell)=>{
        cell.textContent = markers[playerId];
    }
    const displayTurnMsg = (playerId)=>{
        boardMsg.textContent = `${players[playerId].getName()}'s turn`;
    }
    return {reset, nextRound, updateScore, putMarkerInGrid, displayTurnMsg};
}
)();

const gameBoard = (()=>{

    let grids = [[0,0,0],[0,0,0],[0,0,0]];
    let roundsRemained = 0;
    let movesRemained = 0;
    let currentPlayerId = 0;
    let [lastMoveGain, nextAvailRow, nextAvailCol] = [-1, 1, 1];

    const reset = (movesRemainedVal=0, roundsRemainedVal=0)=>{
        grids.forEach(x=>x.fill(0));
        roundsRemained = roundsRemainedVal;
        movesRemained = movesRemainedVal;
        currentPlayerId = Math.round(Math.random());
        if ( movesRemained ){
            if ( players[currentPlayerId].isComputer() ){
                playStep();
            }else{
                displayController.displayTurnMsg(currentPlayerId);
            }
        }
        [lastMoveGain, nextAvailRow, nextAvailCol] = [-1, 1, 1]
    }
    const nextRound = ()=>{
        if ( roundsRemained ){
            grids.forEach(x=>x.fill(0));
            movesRemained = 9;
            [lastMoveGain, nextAvailRow, nextAvailCol] = [-1, 1, 1]
            currentPlayerId = Math.round(Math.random());
            displayController.nextRound();
            displayController.displayTurnMsg(currentPlayerId);
            if ( players[currentPlayerId].isComputer() ){
                playStep();
            }
        }
    }
    const getCurrentPlayerId = ()=>currentPlayerId;
    function computerStep(){
        if (movesRemained>7 && (!grids[1][1])){
            grids[1][1] = currentPlayerId+1;
            return [1,1];
        }else{
            let maxGain = - 1, bestRow, bestCol, tmp; 
            for (let row = 0; row < 3; row++){
                for (let col = 0; col < 3; col++){
                    if (!grids[row][col]){
                        tmp = getMaxGain(row, col);
                        if (tmp[0]>maxGain){
                            maxGain = tmp[0];
                            bestRow = row;
                            bestCol = col;
                        }
                    }
                }
            }
            if ( maxGain > lastMoveGain ){
                grids[bestRow][bestCol] =  (currentPlayerId+1);
                lastMoveGain = maxGain;
                return [bestRow, bestCol]

            }else{
                grids[nextAvailRow][nextAvailCol] = (currentPlayerId+1);
                lastMoveGain = 0;
                return [nextAvailRow, nextAvailCol];
            }
        }
    }
    const playStep = (cell=null)=>{
        let isValidMove = false, row, col;
        let SelectedCell = cell;
        if ( movesRemained ){
            if ( players[currentPlayerId].isComputer()){
                [row, col] = computerStep();
                isValidMove = true;
                SelectedCell = document.querySelector(`.cell[row="${row}"][col="${col}"]`);
            }else{
                [row, col] = [parseInt(cell.getAttribute("row")), parseInt(cell.getAttribute("col"))];
                if( !grids[row][col]){
                    grids[row][col] = (currentPlayerId+1);
                    isValidMove = true;   
                }
                [lastMoveGain, nextAvailRow, nextAvailCol] = getMaxGain(row, col);
            }
        }
        if (isValidMove){
            movesRemained -= 1;
            displayController.putMarkerInGrid(currentPlayerId, SelectedCell);
            if ( lastMoveGain == 3 ){
                movesRemained = 0;
                roundsRemained -= 1;
                players[currentPlayerId].incScore();
                const [isGameDecided, gameWinnerId] = decideGameWinner();
                displayController.updateScore(
                    currentPlayerId, isGameDecided, gameWinnerId
                );
            }else{
                toggleCurrentPlayerId();
            }
        }
        return isValidMove;
    }
    function decideGameWinner(){
        if ( ! roundsRemained ){
            if ( players[0].getScore === players[1].getScore() ){
                return [true, -1];
            }
            else if ( players[0].getScore() > players[1].getScore()){
                return [true, 0]; 
            }else{
                return [true, 1];
            }
        }else if ( players[currentPlayerId].getScore() > roundsRemained ) {
            roundsRemained = 0;
            return [true, currentPlayerId];
        }else{
            return [false, -1]; //gameDecided, gameWinnerId
        }
    }
    function getMaxGain(row, col){
        let [maxGain, new_row, new_col] = [-1, -1, -1], possibleMoves = [[0,1],[1,0]];
        if ( row === col ){  //check for diagonal streak
            possibleMoves.push([1,1]);
        }else if( (2-row) === col){
            possibleMoves.push([1,-1]);
        }
        for ( step of possibleMoves){
            const tmp = getMoveGain(row, col, step);
            if (tmp[0] > maxGain){
                [maxGain,new_row, new_col] = tmp;
            }
        }
        return [maxGain, new_row, new_col];
    }
    function getMoveGain(row, col, step){

        let new_row=row, new_col=col, gain = 1, depth = 2, cr_row=row, cr_col=col;

        while ( depth>0 ){
            cr_row = (3+cr_row+step[0])%3;
            cr_col = (3+cr_col+step[1])%3;
            if ( grids[cr_row][cr_col] == (currentPlayerId+1) ){
                gain += 1;
            }else if ( !grids[cr_row][cr_col]){
                new_row = cr_row;
                new_col = cr_col;
            }else{
                gain -= 1;
            }
            depth -= 1;
        }
        return [gain, new_row, new_col];    
    }
    function toggleCurrentPlayerId(){
        currentPlayerId = 1 - currentPlayerId;
        if ( movesRemained ){
            displayController.displayTurnMsg(currentPlayerId);
        }
        return currentPlayerId;
    }
    return {reset, nextRound, playStep, getCurrentPlayerId};
})();
document.querySelector("#reset").addEventListener("click", ()=>{
    gameBoard.reset();
    displayController.reset();
})
document.querySelectorAll(".play").forEach(bttn=>
    bttn.addEventListener("click", ()=>{
        players[0] = Player(prompt("Input Player 1's name:"), false);
        if (bttn.getAttribute("against") === "human"){
            players[1] = Player(prompt("Input Player 2's name:"), false);
        }else{
            players[1] = Player("Computer", true);
        }
        gameBoard.reset(9, ROUND_LIM);
        displayController.reset([players[0].getName(), players[1].getName()]);    
}));
document.querySelector("#next").addEventListener("click", ()=>{
    gameBoard.nextRound();
})
document.querySelectorAll(".cell").forEach(cell=>{
    cell.addEventListener("click", (e)=>{
        let isValidMove;
        do{
            isValidMove = gameBoard.playStep(e.currentTarget);
        }while( players[gameBoard.getCurrentPlayerId()].isComputer() && isValidMove)
    });
});