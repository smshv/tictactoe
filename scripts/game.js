const ROUND_LIM = 5;

const gameBoard = (()=>{

    let grids = [[0,0,0],[0,0,0],[0,0,0]];
    let scores = [0,0];
    let currentPlayer = Math.round(Math.random());
    let roundPlayed = 0;
    let possibleMoves = 9;
    let opponent = 0; //1 means human, -1 means computer

    const reset = ()=>{
        grids.fill(0);
        roundPlayed = 0;
        possibleMoves = 9;
        scores.fill(0);
        opponent = 0;
    }
    const setOpponent = (opponentType)=>{ //1 means human, -1 means computer
        opponent = opponentType;
        roundPlayed = 0;
        scores.fill(0);
        nextRound();
    }
    const nextRound = ()=>{  //computer is always player 1
        grids.fill(0);
        possibleMoves = 9;
        currentPlayer = Math.round(Math.random())
        if (opponent === -1 && currentPlayer == 1){
            grids[1][1] = 1;
        }

    }
    function computerStep(){

    }
    const playStep = (row, col)=>{
        if (!grids[row][col] && opponent){
            grids[row][col] = 1+currentPlayer;
            possibleMoves -= 1;
            if  ( opponent === -1 && currentPlayer == 0){
                computerStep(row, col);
            }
            return true;
        }
        return false;
    }
    function checkValidGrid(row, col){
        if ( row >-1 && col>-1 && row<3 && col<3 && 
            grids[row][col] == (currentPlayer+1)){
                return true;
        }
        return false;
    }
    const decideRoundWinner = (row, col)=>{
        if (possibleMoves < 5){
            const delta = [[0, 1],[0,-1],[1,0],[-1,0],
                        [1,1],[-1,1],[1,-1],[-1,-1]];
            for (step in delta){
                const new_row = row+step[0];
                const new_col = col+step[1]; 
                if (checkValidGrid(new_row, new_col)
                   && checkValidGrid(new_row+step[0], new_col+step[1])){
                    roundPlayed += 1;
                    scores[currentPlayer] += 1;
                    return currentPlayer;
                }
            }
            if ( possibleMoves === 0 ){ //round draws
                roundPlayed += 1;
                return -2;
            }
        }
        return -1;
    }
    const decideGameWinner = ()=>{
        if (roundPlayed === ROUND_LIM){
            if ( scores[0] > scores[1] ){
                return 0;
            }else if ( scores[1] > scores[0] ){
                return 1;
            }else{
                return -2;
            }
        }
        return -1;
    }
    
    return {reset, nextRound, playStep, decideRoundWinner, decideGameWinner, setOpponent};
})();