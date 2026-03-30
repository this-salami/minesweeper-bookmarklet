javascript: (() => { 
    const gameStart = [1, 1]; 
    const gameSize = [30, 16]; 
    const game = document.getElementById("game"); 
    if (game == null){ alert("couldn't find game"); return; }
    
    let mousebtn1Settings = {
        "view": window,
        "bubbles": true,
        "cancelable": false
    };
    const mousedownEvent = new MouseEvent("mousedown", mousebtn1Settings);
    const mouseupEvent = new MouseEvent("mouseup", mousebtn1Settings);
    
    let mousebtn2Settings = {
        "view": window,
        "bubbles": true,
        "cancelable": false,
        "button" : 2
    };
    const rightMousedownEvent = new MouseEvent("mousedown", mousebtn2Settings);
    const rightMouseupEvent = new MouseEvent("mouseup", mousebtn2Settings);
    
    let tilesOpened = 0;
    let flagsPlaced = 0;
    let chainsMade  = 0;
    
    function getTile(x, y){
        const tile = document.getElementById(`${y}_${x}`);
        return tile;
    }
    /**
     * @param linkIndex {Number=}
     */
    function openTile(tile, position, linkIndexes){
        let state = getTileState(tile);
        if (state !== null){
            return;
        }
        if (linkIndexes == undefined){
            /*linkIndex = chainedTilesArr.findIndex(chainedTilesArrFindIndexFunc, position);*/
            linkIndexes = getTileChainIndex(position);
        }
        if (linkIndexes.constructor == Array && linkIndexes.length > 0) {
            for (let i = 0; i < linkIndexes.length; i++){
                let linkIndex = linkIndexes[i];
                chainedTilesArr.splice(linkIndex - i, 1);
            }
        }
        tile.dispatchEvent(mousedownEvent);
        tile.dispatchEvent(mouseupEvent);
        
        tilesOpened++;
    }
    /**
     * @param linkIndex {Number=}
     */
    function flagTile(tile, position, linkIndexes){
        let state = getTileState(tile);
        if (state !== null){
            return;
        }
        if (linkIndexes == undefined){
            /*linkIndex = chainedTilesArr.findIndex(chainedTilesArrFindIndexFunc, position);*/
            linkIndexes = getTileChainIndex(position);
        }
        if (linkIndexes.constructor == Array && linkIndexes.length > 0) {
            for (let i = 0; i < linkIndexes.length; i++){
                let linkIndex = linkIndexes[i];
                chainedTilesArr.splice(linkIndex - i, 1);
            }
        }
        tile.dispatchEvent(rightMousedownEvent);
        tile.dispatchEvent(rightMouseupEvent);
        
        flagsPlaced++;
    }
    function getTileState(tile){
        let className = tile.className;
        if (className === "square blank") {
            return null;
        } else if (className === "square bombflagged") {
            return "flag";
        } else if (/square open[\d]/.test(className) == true) {
            return Number(className.charAt(className.length - 1));
        }
    }
    /**
     * @param tilePos {[Number, Number]}
     */
    function getTileChainIndex(tilePos){
        let returnArr = [];
        let startIndex = 0;
        while (startIndex < chainedTilesArr.length){
            let newIndex = chainedTilesArr.findIndex((v, index) => {
                if (index < startIndex) { return false; }
                return chainedTilesArrFindIndexFunc(v, tilePos);
                });
            if (newIndex === -1) { break; }
            returnArr.push(newIndex);
            startIndex = newIndex + 1;
        }
        
        return (returnArr.length === 0) ? -1 : returnArr;
    }
    function getAdjPositions(x, y){
        let adjPos = [];
        let isLeftValid = x !== gameStart[0];
        let isRightValid = x !== gameSize[0] + gameStart[0] - 1;
        let isTopValid = y !== gameStart[1];
        let isBottomValid = y !== gameSize[1] + gameStart[1] - 1;
        
        if (isLeftValid){
            adjPos.push([x - 1, y]);
        }
        if (isRightValid){
            adjPos.push([x + 1, y]);
        }
        if (isTopValid){
            adjPos.push([x, y - 1]);
        }
        if (isBottomValid){
            adjPos.push([x, y + 1]);
        }
        
        if (isLeftValid && isTopValid){
            adjPos.push([x - 1, y - 1]);
        }
        if (isRightValid && isTopValid){
            adjPos.push([x + 1, y - 1]);
        }
        if (isLeftValid && isBottomValid){
            adjPos.push([x - 1, y + 1]);
        }
        if (isRightValid && isBottomValid){
            adjPos.push([x + 1, y + 1]);
        }
        
        return adjPos;
    }
    
    let chainedTilesArr = [];
    function searchForPosInArray(v){
        return v[0] == this[0] && v[1] == this[1];
    }
    function chainedTilesArrFindIndexFunc(v, tilePos){
        return v.findIndex(searchForPosInArray, tilePos) !== -1;
    }
    function sortFunc(a, b){
        return a[0] + a[1] * gameSize[0] - b[0] - b[1] * gameSize[0];
    }
    /**
     * @param positions {[Number, Number][]}
     */
    function createChainedTiles(positions){
        positions.sort(sortFunc);
        let didReplace = false;
        let overlaps = false;
        let isDuplicate = false;
        for (let i = 0; i < positions.length; i++){
            let position = positions[i];
            let linkIndexes = getTileChainIndex(position);
            
            if (linkIndexes === -1) { continue; }
            
            let countRemoved = 0;
            for (let j = 0; j < linkIndexes.length; j++){
                let linkIndex = linkIndexes[j];
                let chainedTiles = chainedTilesArr[linkIndex - countRemoved];
                if (chainedTiles.length > positions.length) {
                    chainedTilesArr.splice(linkIndex - countRemoved, 1);
                    countRemoved++;
                    didReplace = true;
                    overlaps = true;
                } else if (chainedTiles.length < positions.length) {
                    overlaps = true;
                } else {
                    for (let k = 0; k < chainedTiles.length; k++){
                        let pos1 = chainedTiles[k];
                        let pos2 = positions[k];
                        let isSame = pos1[0] === pos2[0] && pos1[1] === pos2[1];
                        if (isSame === false){
                            break;
                        } else if (k === chainedTiles.length - 1){
                            isDuplicate = true;
                        }
                    }
                }
            }
            /*
            let res = chainedTilesArr.findIndex(chainedTilesArrFindIndexFunc, position);
            if (res > -1 && chainedTilesArr[res].length > positions.length) { 
                / * chainedTilesArr[res] = positions; * /
                chainedTilesArr.splice(res, 1);
                didReplace = true;
                overlaps = true;
            } else if (res > -1 && chainedTilesArr[res].length < positions.length) {
                overlaps = true;
            }
            */
        }
        if (isDuplicate == true) { return false; }
        if (overlaps == true && didReplace == false) { return false; }
        if (overlaps == false) { chainsMade++; }
        chainedTilesArr.push(positions);
        return true;
    }
    
    function mainLoop(){
        tilesOpened = 0;
        flagsPlaced = 0;
        chainsMade  = 0;
        
        let tilesToOpen = [];
        let tilePositionsToOpen = [];
        let tilesToFlag = [];
        let tilesPositionsToFlag = [];
        
        chainedTilesArr = [];
        
        for (let x = gameStart[0]; x < gameSize[0] + gameStart[0]; x++){
            for (let y = gameStart[1]; y < gameSize[1] + gameStart[1]; y++){
                const tile = getTile(x, y);
                tile.style.outlineStyle = "none";
                tile.style.outlineColor = "initial";
                let state = getTileState(tile);
                let adjPositions = getAdjPositions(x, y);
                let numAdjFlags = 0;
                for (let i = 0; i < adjPositions.length; i++){
                    let adjPosition = adjPositions[i];
                    let adjTile = getTile(adjPosition[0], adjPosition[1]);
                    let adjState = getTileState(adjTile);
                    if (adjState === "flag"){
                        numAdjFlags++;
                    }
                }
                
                if (state - numAdjFlags !== 1){ continue; }
                
                let blankAdjTilePositions = adjPositions.filter(v => { 
                    let tile = getTile(v[0], v[1]);
                    return getTileState(tile) == null;
                });
                createChainedTiles(blankAdjTilePositions);
            }
        }
        
        for (let x = gameStart[0]; x < gameSize[0] + gameStart[0]; x++){
            for (let y = gameStart[1]; y < gameSize[1] + gameStart[1]; y++){
                const tile = getTile(x, y);
                let state = getTileState(tile);
                if (state == null || state == "flag" || state === 0) {
                    continue;
                }
                let adjPositions = getAdjPositions(x, y);
                let numAdjFlags = 0;
                let numAdjPossibleMines = 0;
                let numAdjNonChained = 0;
                let adjChainsIndex = [];
                for (let i = 0; i < adjPositions.length; i++){
                    let adjPosition = adjPositions[i];
                    let adjTile = getTile(adjPosition[0], adjPosition[1]);
                    let adjState = getTileState(adjTile);
                    if (adjState == null) {
                        numAdjPossibleMines++;
                    } else if (adjState == "flag"){
                        numAdjFlags++;
                    }
                    /*
                    let linkIndex = chainedTilesArr.findIndex(chainedTilesArrFindIndexFunc, adjPosition);
                    if (linkIndex > -1 && adjChainsIndex.indexOf(linkIndex) == -1){
                        adjChainsIndex.push(linkIndex);
                    } else if (linkIndex == -1 && adjState == null){
                        numAdjNonChained++;
                    }*/
                    let linkIndexes = getTileChainIndex(adjPosition);
                    if (linkIndexes === -1 && adjState == null){
                        numAdjNonChained++;
                        continue;
                    }
                    if (linkIndexes === -1){ continue; }
                    for (let j = 0; j < linkIndexes.length; j++){
                        let linkIndex = linkIndexes[j];
                        if (adjChainsIndex.indexOf(linkIndex) === -1){
                            adjChainsIndex.push(linkIndex);
                        }
                    }
                }
                
                /*
                if (x === 2 && y === 8){
                    alert(adjChainsIndex);
                    for (let i = 0; i < adjChainsIndex.length; i++){
                        let chainedTiles = chainedTilesArr[adjChainsIndex[i]];
                        for (let j = 0; j < chainedTiles.length; j++){
                            let position = chainedTiles[j];
                            let tile = getTile(position[0], position[1]);
                            tile.style.outlineStyle = "solid";
                            let color = tile.style.outlineColor;
                            if (color === "red"){
                                color = "yellow";
                            } else if (color === "yellow"){
                                color = "green";
                            } else if (color === "green"){
                                color = "blue";
                            } else if (color === "blue"){
                                color = "purple";
                            } else {
                                color = "red";
                            }
                            tile.style.outlineColor = color;
                            tile.style.outlineOffset = "-3px";
                        }
                    }
                }
                */
                if (numAdjPossibleMines === 0){
                    continue;
                }
                
                mainIfStatement: if (state === numAdjFlags){ /* open all open spots */
                    for (let i = 0; i < adjPositions.length; i++){
                        let adjPosition = adjPositions[i];
                        let adjTile = getTile(adjPosition[0], adjPosition[1]);
                        let adjState = getTileState(adjTile);
                        
                        let shouldOpen = adjState == null;
                        if (shouldOpen === false){ continue; }
                        tilesToOpen.push(adjTile);
                        tilePositionsToOpen.push(adjPosition);
                    }
                } else if (state === numAdjPossibleMines + numAdjFlags){ /* flag all open spots */
                    for (let i = 0; i < adjPositions.length; i++){
                        let adjPosition = adjPositions[i];
                        let adjTile = getTile(adjPosition[0], adjPosition[1]);
                        let adjState = getTileState(adjTile);
                        
                        let shouldFlag = adjState == null;
                        if (shouldFlag === false){ continue; }
                        tilesToFlag.push(adjTile);
                        tilesPositionsToFlag.push(adjPosition);
                    }
                } else if (state - numAdjFlags === numAdjNonChained + adjChainsIndex.length){ 
                    /* flag all non-chained tiles */
                    for (let i = 0; i < adjPositions.length; i++){
                        let adjPosition = adjPositions[i];
                        let adjTile = getTile(adjPosition[0], adjPosition[1]);
                        let adjState = getTileState(adjTile);
                        let linkIndexes = getTileChainIndex(adjPosition);
                        
                        let shouldFlag = adjState == null && linkIndexes === -1;
                        if (shouldFlag === false){ continue; }
                        tilesToFlag.push(adjTile);
                        tilesPositionsToFlag.push(adjPosition);
                    }
                } else if (state <= adjChainsIndex.length + numAdjFlags){ 
                    /* open all non-chained tiles */
                    /* But only if chains lay entirely in adj range */
                    let openableChainIndex = [];
                    let currLen = adjChainsIndex.length;
                    
                    for (let i = 0; i < adjChainsIndex.length; i++){
                        let chainIndex = adjChainsIndex[i];
                        let chainedTiles = chainedTilesArr[chainIndex];
                        for (let j = 0; j < chainedTiles.length; j++){
                            let chainedTile = chainedTiles[j];
                            let isAdj = adjPositions.findIndex(searchForPosInArray, chainedTile);
                            
                            if (isAdj !== -1){ continue; }
                            currLen--;
                            openableChainIndex.push(chainIndex);
                            break;
                        }
                        let notEnoughChains = state > currLen + numAdjFlags;
                        if (notEnoughChains === false){ continue; }
                        break;
                    }
                    
                    if (state !== currLen + numAdjFlags){ break mainIfStatement; }
                    
                    for (let i = 0; i < adjPositions.length; i++){
                        let adjPosition = adjPositions[i];
                        let adjTile = getTile(adjPosition[0], adjPosition[1]);
                        let adjState = getTileState(adjTile);
                        if (adjState != null){ continue; }
                        let linkIndexes = getTileChainIndex(adjPosition);
                        
                        let shouldIgnore = false;
                        for (let j = 0; j < linkIndexes.length; j++){
                            let linkIndex = linkIndexes[j];
                            if (openableChainIndex.indexOf(linkIndex) === -1){
                                shouldIgnore = true;
                                break;
                            }
                        }
                        
                        let shouldOpen = linkIndexes === -1 || shouldIgnore === false;
                        if (shouldOpen === false) { continue; }
                        
                        tilesToOpen.push(adjTile);
                        tilePositionsToOpen.push(adjPosition);
                    }
                }
            }
        }
        
        for (let i = 0; i < tilesToOpen.length; i++){
            let tile = tilesToOpen[i];
            let position = tilePositionsToOpen[i];
            openTile(tile, position);
        }
        
        for (let i = 0; i < tilesToFlag.length; i++){
            let tile = tilesToFlag[i];
            let position = tilesPositionsToFlag[i];
            flagTile(tile, position);
        }
        
        let loop = confirm(`results:\nflagged: ${flagsPlaced},\nopened: ${tilesOpened},\nchains made: ${chainsMade},\nRun another loop?`);
        if (loop == false) { return; }
        setTimeout(mainLoop, 1000);
    }
    mainLoop();
})();
