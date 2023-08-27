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
        nextRoundBttn.style.visibility = "visible";
        if ( roundWinnerId != -1){
            playerScores[roundWinnerId].textContent = players[roundWinnerId].getScore().toString();
            boardMsg.textContent = `${players[roundWinnerId].getName()} wins this round`;
        }else{
            boardMsg.textContent = "Round draws";
        }
        
        if ( gameDecided ){
            if ( gameWinnerId === -1){
                boardMsg.textContent = "Game draws";
            }else{
                boardMsg.textContent = `${players[gameWinnerId].getName()} wins the game!`;
            }
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

    let grids = [[0,0,0],[0,0,0],[0,0,0]]; //0 means empty, 1 means player 1, 2 ...
    let roundsRemained = 0;
    let movesRemained = 0;
    let currentPlayerId = 0;
    let [lastMoveGain, nextAvailRow, nextAvailCol] = [-1, 1, 1]; //lastMoveGain denotes the gain value of the move played by last player//nextAvailRow, nextAvailCol denotes the grid loc that thes last player can play to maximize the gain

    const reset = (movesRemainedVal=0, roundsRemainedVal=0)=>{
        grids.forEach(x=>x.fill(0));
        roundsRemained = roundsRemainedVal;
        movesRemained = movesRemainedVal;
        currentPlayerId = Math.round(Math.random());
        [lastMoveGain, nextAvailRow, nextAvailCol] = [-1, 1, 1]
        if ( movesRemained ){
            if ( players[currentPlayerId].isComputer() ){
                playStep();
            }
            displayController.displayTurnMsg(currentPlayerId);
            
        }
    }
    const nextRound = ()=>{
        if ( roundsRemained ){
            grids.forEach(x=>x.fill(0));
            movesRemained = 9;
            [lastMoveGain, nextAvailRow, nextAvailCol] = [-1, 1, 1]
            currentPlayerId = Math.round(Math.random());
            displayController.nextRound();
            if ( players[currentPlayerId].isComputer() ){
                playStep();
            }
            displayController.displayTurnMsg(currentPlayerId);
        }
    }
    const getCurrentPlayerId = ()=>currentPlayerId;
    function computerStep(){
        if (movesRemained>7 && (!grids[1][1])){ // Then computer will choose 1,1 as its first move, if available
            grids[1][1] = currentPlayerId+1;
            return [1,1];
        }else{
            let maxGain = - 1, bestRow, bestCol, tmp;
            /*Find the move that maximizes computer gain*/ 
            for (let row = 0; row < 3; row++){
                for (let col = 0; col < 3; col++){
                    if (!grids[row][col]){
                        tmp = getMaxGain(row, col, 0.25); //modify the gain so that
                        if (tmp[0]>maxGain){ //diagonal cell is preferred
                            maxGain = tmp[0];
                            bestRow = row;
                            bestCol = col;
                        }
                    }
                }
            }
            maxGain = Math.floor(maxGain); //scale down the gain so that is comparable to lastMovegain
            if ( maxGain > lastMoveGain ){ 
                lastMoveGain = maxGain;
                return [bestRow, bestCol]

            }else{
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
                    isValidMove = true;   
                    [lastMoveGain, nextAvailRow, nextAvailCol] = getMaxGain(row, col);
                }
            }
        }
        if (isValidMove){
            grids[row][col] = currentPlayerId+1;
            movesRemained -= 1;
            displayController.putMarkerInGrid(currentPlayerId, SelectedCell);
            if ( lastMoveGain == 3 || !movesRemained){
                movesRemained = 0;
                roundsRemained -= 1;
                let roundWinnerId;
                if ( lastMoveGain == 3){
                    players[currentPlayerId].incScore();
                    roundWinnerId = currentPlayerId;
                }else{
                    roundWinnerId = -1;
                }
                const [isGameDecided, gameWinnerId] = decideGameWinner();
                displayController.updateScore(
                    roundWinnerId, isGameDecided, gameWinnerId
                );
            }
            else{
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
    function getMaxGain(row, col, gain_modifier=0){
        let [maxGain, availRow, availCol] = [-1, -1, -1], possibleMoves, init_gain=1;
        if ( row === col ){  //check for diagonal streak
            possibleMoves = [[1,1],[0,1],[1,0]];
            init_gain += gain_modifier; //diaginal grid has higher chance so higher gain
        }else if( (2-row) === col){
            possibleMoves = [[1,-1],[0,1],[1,0]];//
            init_gain += gain_modifier;
        }else{
            possibleMoves = [[0,1],[1,0]];
        }//
        for ( step of possibleMoves){
            const tmp = getMoveGain(row, col, step, init_gain);
            if (tmp[0] > maxGain){
                [maxGain,availRow, availCol] = tmp;
            }
        }
        return [maxGain, availRow, availCol];
    }
    function getMoveGain(row, col, step, init_gain){

        let availRow=row, availCol=col, gain = init_gain, depth = 2, cr_row=row, cr_col=col;

        while ( depth>0 ){
            cr_row = (3+cr_row+step[0])%3; //to make
            cr_col = (3+cr_col+step[1])%3;//movememt circular (0,1)->(0,2)->(0,0)
            if ( grids[cr_row][cr_col] == (currentPlayerId+1) ){
                gain += 1;
            }else if ( !grids[cr_row][cr_col] ){
                availRow = cr_row;
                availCol = cr_col;
            }else{
                gain -= 1;
            }
            depth -= 1;
        }
        return [gain, availRow, availCol];    
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
        displayController.reset([players[0].getName(), players[1].getName()]);
        gameBoard.reset(9, ROUND_LIM);    
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