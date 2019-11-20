class UI{
    constructor(){
        //replace dataArr & connectionsArr by an object board with properties board[i]data & board[i]connections, where 0 < i < 100
        this.componentIndexArr = [];
        this.componentTypes = {
            wire: '.',
            resistors: 'R',
            voltageSources: 'V',
            currentSources: 'I',
            ground: 'G'
        }
        this.connectionsArr = [];
        this.container = document.getElementById('container');
        this.currentSources = {amount:0};
        this.dataArr = [];
        this.directions = ['north','east','south','west'];
        this.nodesDOM = [];
        this.inputGrid = document.getElementById('circuit-grid');
        this.nodes = {amount:0};
        this.resistors = {amount:0}; 
        this.visualGrid = document.getElementById('circuit-visual')
        this.voltageSources = {amount:0};
        this.solution = [];
    }
    checkConnection(dir, index){ //BEAUTIFUL CODE
        switch(dir){
            case 'north':
                return this.dataArr[index-10] != '';
            case 'east':
                return this.dataArr[index+1] != '';
            case 'south':
                return this.dataArr[index+10] != '';
            default: //west
                return this.dataArr[index-1] != '';            
        }
    }
    clearComponents(){
        [...document.getElementsByClassName('horizontal-component')].map(n=> n && n.remove());
        [...document.getElementsByClassName('vertical-component')].map(n=> n && n.remove())
    }
    eventListenerFunctions(type){
        //const outside for closures (Check if it works properly)
        const self = this;
        function generateCircuitBtn(){
            const btn = document.getElementById('generate-circuit-btn');
            btn.addEventListener('click',(e)=>{
                e.preventDefault();
                self.retrieveData1();
                self.fillConnectionsArray();
                self.generateVisualCircuit();
                self.generateComponentNumbering();
                self.generateNumericalDataRequest();
                solveBtn();
            })
        }
        function solveBtn(){
            const btn = document.getElementById('solve-btn');
            btn.addEventListener('click', (e)=>{
                e.preventDefault();
                self.retrieveData2();
                self.findNodes();
                
                self.generateVisualNodes();
                const solve = new Solve();

                solve.importData(self.exportData('nodes'),self.exportData('resistors'),self.exportData('voltageSources'),self.exportData('currentSources'), self.exportData('componentIndexArr'))
                self.solution = [...solve.init()]; //Strange but I think it's efficient to have solve.init() return the solution array
                self.generateResultsHTML();


            })
        }
        switch(type){
            case 'generate circuit':
                return generateCircuitBtn();
            case 'solve':
                return solveBtn();
        }
        
    }
    exportData(type){ //type === 'resistors' || 'voltageSources' || 'currentSources' || 'node' || 'componentIndexArr'
        const self = this;
        if(type === 'componentIndexArr'){
            let deepClone = [...self.componentIndexArr];
            return deepClone;
        }
        let deepClone = JSON.parse(JSON.stringify(self[type]));
        return deepClone;
    }
    fillConnectionsArray(){
        const self = this;
        self.connectionsArr = [];
        for(let k=0; k<100; k++){
            //connections instantiated every loop in order to reset
            let connections = {
                north: false,
                east: false,
                south: false,
                west: false,
                number: 0
            };
            //ending in 0 & avoiding first row
            if(k===0){
                self.directions.forEach((e)=>{
                    if(e != 'north' && e!='west' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            }
            else if(k===9){
                self.directions.forEach((e)=>{
                    if(e != 'north' && e!='east' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            }
            else if (k===99){
                self.directions.forEach((e)=>{
                    if(e != 'east' && e!='south' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            }
            else if(k%10 === 0 && k!=0 && k!=90){
                self.directions.forEach((e)=>{
                    if(e != 'west' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            } 
            //ending in 9 & avoiding first row
            else if(k%10 === 9 && k!=9 && k!=99){ 
                self.directions.forEach((e)=>{
                    if(e != 'east' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            }        
            else if(k<10) {
                self.directions.forEach((e)=>{
                    if(e != 'north' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);

            } else if (k>=90){
                self.directions.forEach((e)=>{
                    if(e != 'south' && e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            } else{
                self.directions.forEach((e)=>{
                    if(e!='number'){
                        connections[e] = self.checkConnection(e,k);
                        if(self.checkConnection(e,k)){
                            connections.number += 1;
                        }
                    }
                });
                self.connectionsArr.push(connections);
            }
        }
    }
    findNodes(){
        const self = this;
        let connectionIndex;
        for(let componentType in self.componentTypes){
            if (componentType === 'wire' || componentType === 'ground'){
                continue;
            }
            for(let component in self[componentType]){
                if(component === 'amount'){
                    continue;
                }
                let currentComponent = self[componentType][component];

                self.directions.forEach((dir)=>{
                if(self.connectionsArr[currentComponent.index][dir]){
                    switch(dir){
                        case 'north':
                            connectionIndex = currentComponent.index - 10
                            break;
                        case 'east':
                            connectionIndex = currentComponent.index + 1;
                            break;
                        case 'south':
                            connectionIndex = currentComponent.index + 10;
                            break;
                        default: //west
                        connectionIndex = currentComponent.index - 1;
                            break;
                    }
                    self.nodes.amount++
                    self.nodes[`node${self.nodes.amount}`] = {};
                    let node = self.nodes[`node${self.nodes.amount}`];
                    node.ground = false;
                    node.currents = [];
                    node.currents.push(currentComponent.index);
                    node.DOM = [];
                    self.connectionsArr[currentComponent.index][dir] = false;
                    self.connectionsArr[currentComponent.index].number--;
                    self.followPath(connectionIndex, dir);
                }
                })
            }
        }
    }
    followPath(nextIndex, dir){
        const self = this;
        let oppositeDir = '';
        let nextNextIndex;

        //OG has if(typeof dir !== String){switch}; I'm not sure why that if is needed.
        switch(dir){
            case 'north':
                oppositeDir = 'south';
                break;
            case 'east':
                oppositeDir = 'west';
                break;
            case 'south':
                oppositeDir = 'north';
                break;
            default: //west
                oppositeDir = 'east';
                break;
        }
        self.connectionsArr[nextIndex][oppositeDir] = false;
        self.connectionsArr[nextIndex].number--; //Would prefer to change .number to .amount to keep naming consistent, but changing it causes problems, fix later

        let node = self.nodes[`node${self.nodes.amount}`];
        //nodes get created 1 by 1, so self.nodes.amount properly names them
        switch(self.connectionsArr[nextIndex].number){
            case 0: //occurs to the LAST component of a circuit when the last component isn't immediately adjacent to another component [hypothesis?]
            //FOR NOW: Let's pretend like it doesn't happen to wires
            node.currents.push(nextIndex);
                break;
            case 1: //If there is only one connection, there's no need to worry about wires splitting
                if(self.dataArr[nextIndex] === '.' || self.dataArr[nextIndex] === 'G'){
                    if (self.dataArr[nextIndex] === 'G'){
                        node.ground = true; 
                    }
                    node.DOM.push(nextIndex);
                    self.directions.forEach((nextDir)=>{
                        if(self.connectionsArr[nextIndex][nextDir]){
                            switch(nextDir){
                                case 'north':
                                    nextNextIndex = nextIndex - 10;
                                    break;
                                case 'east':
                                    nextNextIndex = nextIndex + 1;
                                    break;
                                case 'south':
                                    nextNextIndex = nextIndex + 10;
                                    break;
                                default: //west
                                    nextNextIndex = nextIndex - 1;
                                    break;
                            }
                            self.connectionsArr[nextIndex][nextDir] = false;   
                            self.connectionsArr[nextIndex].number--;
                            self.followPath(nextNextIndex, nextDir);

                        }
                    })
                } else{
                    node.currents.push(nextIndex);
                }
                break;
            default:
                if (self.dataArr[nextIndex] === 'G'){
                    self.nodes[`node${self.nodes.amount}`].ground = true;
                }
                node.DOM.push(nextIndex);
                self.directions.forEach((nextDir)=>{
                        if(self.connectionsArr[nextIndex][nextDir]){
                            switch(nextDir){
                                case 'north':
                                    nextNextIndex = nextIndex - 10;
                                    break;
                                case 'east':
                                    nextNextIndex = nextIndex + 1;
                                    break;
                                case 'south':
                                    nextNextIndex = nextIndex + 10;
                                    break;
                                default: //west
                                    nextNextIndex = nextIndex - 1;
                                    break;
                            }
                            self.connectionsArr[nextIndex][nextDir] = false;
                            self.connectionsArr[nextIndex].number--;
                            self.followPath(nextNextIndex, nextDir);
                        }
                    })
                break;
        }

    }
    generateComponentNumbering(){ //R1, R2, etc. on visual circuit
        const self = this;
        for(let componentType in self.componentTypes){
            if(componentType === 'wire' || componentType === 'ground'){
                continue;
            }
            for(let component in self[componentType]){
                if(component === 'amount'){
                    continue;
                }
                let individualComponent = self[componentType][component];
                let div = document.createElement('div');
                let vgrid = document.getElementById(`vgrid-${individualComponent.index}`);
                if(individualComponent.orientation === 'horizontal'){
                    div.className = 'horizontal-component';
                } else{
                    div.className = 'vertical-component'
                }
                div.innerHTML = component;
                vgrid.appendChild(div);
            }
        }
    }
    generateNumericalDataRequest(){
        const self = this;
        if(document.getElementById('data-request-container') === null){
            let div = document.createElement('div');
            div.id = 'data-request-container';
            self.container.appendChild(div);
        } else{
            document.getElementById('data-request-container').innerHTML = '';
        }
        const dataRequestContainer = document.getElementById('data-request-container');

        //Solve Button
        const btn = document.createElement('input');
        btn.setAttribute('type','button');
        btn.setAttribute('value', 'Solve');
        btn.id ='solve-btn';
        dataRequestContainer.appendChild(btn);

        for(let componentType in self.componentTypes){
            if (componentType === 'wire' || componentType === 'ground'){
                continue;
            }
            let text;
            switch(componentType){
                case 'resistors':
                    text = 'Resistors (Ohms)';
                    break;
                case 'voltageSources':
                    text = 'Voltage Sources (Volts)'
                    break;
                default: //currentSources
                    text = 'Current Sources (Amps)'
                    break;
            }
            let div = document.createElement('div');
            div.className = 'component';
            div.id = componentType;
            let innerdiv = document.createElement('div');
            innerdiv.innerHTML = text;
            div.appendChild(innerdiv);
            let textinputdiv = document.createElement('div');
            textinputdiv.className = 'text-input';
            textinputdiv.id = `${componentType}-input`;

            for(let component in self[componentType]){
                if (component === 'amount'){
                    continue;
                }
                let textinput = document.createElement('input');
                textinput.setAttribute('type', 'text');
                textinput.setAttribute('placeholder', component)
                textinput.id = component
                textinputdiv.appendChild(textinput);
            }
            div.appendChild(textinputdiv);
            dataRequestContainer.appendChild(div);
        }

    }
    generateResultsHTML(){
        const self = this;
        let div = document.getElementById('results');
        let HTML = '';
        for(let i=1; i<=self.solution.length; i++){
            HTML += `
            <div class="node-${i}"><u>Node ${i}</u><p id="node-${i}-value">${self.solution[i-1]}V</p></div>
            `
        }
        div.innerHTML = HTML;
    }
    generateTileImage(type, rotationAngle){
        let image;
        switch(type){
            case 'STRAIGHT_WIRE':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/straight-wire.png';
                break;
            case 'CORNER_WIRE':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/corner-wire.png';
                break;
            case 'T_WIRE':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/T-wire.png';
                break;
            case 'CROSS_WIRE':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/cross-wire.png';
                break;
            case 'RESISTOR':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/resistor.png';
                break;
            case 'VOLTAGE_SRC':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/voltage-source.png';
                break;
            case 'CURRENT_SRC':
                image = document.createElement('img');
                image.src = '/Circuit-Analyzer/IMG/current-source.png';
                break;
            default:
                break;
        }
        image.className = 'vgrid-img'
        if(rotationAngle != 0){
        image.classList += ` rotate${rotationAngle}`;
        }

        return image;
    }
    generateVisualCircuit(){ //Also assigns orientations
        const self = this;
        function assignOrientation(component, orientation, index){
            switch(component){
                case 'resistor':
                    for(let resistor in self.resistors){
                        if(resistor === 'amount'){
                            continue;
                        }
                        if(self.resistors[resistor].index === index){
                            self.resistors[resistor]['orientation'] = orientation;
                        }
                    }
                    break;
                case 'currentSource':
                    for(let currentSource in self.currentSources){
                        if(currentSource === 'amount'){
                            continue;
                        }
                        if(self.currentSources[currentSource].index === index){
                            self.currentSources[currentSource]['orientation'] = orientation;
                        }
                    }
                    break;
                default: //voltageSource
                    for(let voltageSource in self.voltageSources){
                        if(voltageSource === 'amount'){
                            continue;
                        }
                        if(self.voltageSources[voltageSource].index === index){
                            self.voltageSources[voltageSource]['orientation'] = orientation;
                        }
                    }
                    break;
            }
        }
        for(let j=0; j<100; j++){
            //Clearing existing images
            let gridbox = document.getElementById(`vgrid-${j}`);
            if(gridbox.hasChildNodes()){
                gridbox.removeChild(gridbox.firstChild);
            }
            //To do: throw error if more than 2 connections for R,V,C
            let connectionObject = self.connectionsArr[j];
            switch(this.dataArr[j]){
            /* Ground and Wires have the same look, except ground will have a special effect on the node its on. */
            case 'G':
            case '.':
                // 2 CONNECTIONS
                if (connectionObject.number === 2){
                    //Straight-Wire
                    if(connectionObject.north && connectionObject.south){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('STRAIGHT_WIRE', 0));
                    } else if (connectionObject.west && connectionObject.east){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('STRAIGHT_WIRE', 90));
                    //Corner-Wire
                    } else if (connectionObject.east && connectionObject.south){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CORNER_WIRE', 0));}
                    else if (connectionObject.south && connectionObject.west){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CORNER_WIRE', 90));}
                    else if (connectionObject.west && connectionObject.north){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CORNER_WIRE', 180));}
                        else if (connectionObject.north && connectionObject.east){
                            document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CORNER_WIRE', 270));}
                // 3 CONNECTIONS
                } else if(connectionObject.number === 3){
                     //T-wire
                     if(connectionObject.north && connectionObject.east && connectionObject.south){
                         document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('T_WIRE', 0));
                     } else if(connectionObject.east && connectionObject.south && connectionObject.west){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('T_WIRE', 90));
                    } else if(connectionObject.south && connectionObject.west && connectionObject.north){
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('T_WIRE', 180));
                    } else {
                        document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('T_WIRE', 270));
                    }
                // 4 CONNECTIONS
                } else if(connectionObject.number === 4){
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CROSS_WIRE', 0));
                }
                break;
            case 'R':
                if(connectionObject.north){
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('RESISTOR', 0))
                    assignOrientation('resistor', 'vertical', j)
                    
                } else{
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('RESISTOR', 90))
                    assignOrientation('resistor', 'horizontal', j)
                }
                break;
            case 'V':
                if(connectionObject.north){
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('VOLTAGE_SRC', 0))
                    assignOrientation('voltageSource', 'vertical', j)
                } else{
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('VOLTAGE_SRC', 270))
                    assignOrientation('voltageSource', 'horizontal', j)
                }
                break;
            case 'I':
                if(connectionObject.north){
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CURRENT_SRC', 180))
                    assignOrientation('currentSource', 'vertical', j)
                } else{
                    document.getElementById(`vgrid-${j}`).appendChild(self.generateTileImage('CURRENT_SRC', 90))
                    assignOrientation('currentSource', 'horizontal', j)
                }
                break;
            default:
                break;
            }
        }
    }
    generateVisualNodes(){
        const self = this;
        for(let i=1; i<=self.nodes.amount; i++){
            self.nodes[`node${i}`].DOM.forEach((index)=>{
                let vgrid = document.getElementById(`vgrid-${index}`)
                vgrid.classList += ` node-${i}`; //space before word is important
                vgrid.firstChild.classList += ' faded-wire';
            })
        }
    }
    init(){
        this.initializeUserInputGrid();
        this.initializeVisualGrid();
        this.eventListenerFunctions('generate circuit');
    }
    initializeUserInputGrid(){
        //creates an array of an object's values
        const componentsID = Object.values(this.componentTypes);
        componentsID.unshift('');

        for(let i = 0; i<100; i++){
            let gridbox = document.createElement('div');
            gridbox.className = 'gridbox'
            gridbox.id = `grid-${i}`
            gridbox.innerHTML='';
            this.inputGrid.appendChild(gridbox);
            gridbox.addEventListener('click', (e)=>{
                e.preventDefault();
                for(let k = 0; k < componentsID.length; k++){
                    if (e.target.innerHTML === componentsID[k]){
                        if (e.target.innerHTML === 'G'){
                            e.target.innerHTML = '';
                            break;
                        }
                        e.target.innerHTML = componentsID[k+1];
                        break;
                    }
                }
            });
            gridbox.addEventListener('contextmenu',(e)=>{
                e.preventDefault();
                e.target.innerHTML = '';
            })
        }
    }
    initializeVisualGrid(){
        for(let i = 0; i<100; i++){
            let gridbox = document.createElement('div');
            gridbox.class = 'visual-grid';
            gridbox.id = `vgrid-${i}`;
            this.visualGrid.appendChild(gridbox);
        }
    }
    retrieveData1(){ //Retrieves Circuit
        const self = this;
        self.dataArr = []; //clear dataArr
        for(let i=0; i<100; i++){
            let gridHTML = document.getElementById(`grid-${i}`).innerHTML;
            self.dataArr.push(gridHTML);
            switch(gridHTML){
                case 'R':
                    self.resistors.amount++;
                    this.resistors[`R${self.resistors.amount}`] = {
                        index: i,
                        numericalValue: null
                    };
                    this.componentIndexArr.push(i);
                    break;
                case 'V':
                    self.voltageSources.amount++;
                    this.voltageSources[`V${self.voltageSources.amount}`] = {
                        index: i,
                        numericalValue: null
                    };
                    this.componentIndexArr.push(i);
                    break;
                case 'I':
                    self.currentSources.amount++;
                    this.currentSources[`I${self.currentSources.amount}`] = {
                        index: i,
                        numericalValue: null
                    };
                    this.componentIndexArr.push(i);
                    break;
                default:
                    break;            
            }
        }
    }
    retrieveData2(){ //Retrieves Numerical Values of Components
        const self = this;
        for(let componentType in self.componentTypes){
            if (componentType === 'wire' || componentType === 'ground'){
                continue;
            }
            for(let component in self[componentType]){
                if(component === 'amount'){
                    continue;
                }
                let value = document.getElementById(component).value;

                if(value === ''){
                    self[componentType][component].numericalValue = null;
                } else {
                    self[componentType][component].numericalValue = Number(value);
                }
            }
        }
    }
}

class Solve{
    constructor(){
        this.currents = {};
        this.currentsIndexArr = [];
        this.currentSources = {};
        this.matrix = [];
        this.nodes = {};
        this.resistors = {};
        this.voltageSources = {};     
        this.solution = []; 
        this.solvingEqs = {nodeVoltageEqs:{}, currentVoltageEqs: {}, solutionVector: [], supernodes: {}};
        this.templateArr = [];
    }
    applyKCL(){
        const self = this;
        for(let node in self.nodes){
            if (node === 'amount'){continue;}
            let index = self.retrieveIndex(node);

            if(self.nodes[node].voltage !== null){ //Non-null node voltages are ground node and nodes next to voltage sources.
                self.solvingEqs.nodeVoltageEqs[node][index] = 1;
                self.solvingEqs.solutionVector[index] = self.nodes[node].voltage;
                continue;
            }
            let nodeObj = self.nodes[node];
            
            nodeObj.currents.forEach((nodeCurrent)=>{
                let skippable = false;
                for(let currentSource in self.currentSources){
                    if(currentSource === 'amount'){continue;}
                    let currentSourceObj = self.currentSources[currentSource];
                    if(currentSourceObj.index === Math.abs(nodeCurrent)){
                        // Since we have the eq in the form i1+i2-i3 = 0, if we want to send Is to the other side, we have to do the opposite of sumOrSubstract() for the solution Vector
                        switch(self.sumOrSubstract(node, nodeCurrent)){
                            case 'sum':
                                self.solvingEqs.solutionVector[index] -= currentSourceObj.numericalValue;
                                break;
                            case 'substract':
                                    self.solvingEqs.solutionVector[index] += currentSourceObj.numericalValue;
                                break;
                        }
                        skippable = true;
                        
                    }
                }
                for(let voltageSource in self.voltageSources){
                    if(voltageSource === 'amount'){continue;}
                    let voltageSourceObj = self.voltageSources[voltageSource];
                    if(voltageSourceObj.index === Math.abs(nodeCurrent)){
                        //Voltage source current is useless for nodal analysis
                        skippable = true;
                        
                    }
                }  
                if(!skippable){
                    self.arrayOperations(self.solvingEqs.nodeVoltageEqs[node], self.solvingEqs.currentVoltageEqs[String(Math.abs(nodeCurrent))].array, self.sumOrSubstract(node, nodeCurrent))
                }
            });
        }
    }
    applyVoltageSources(){ //For now assumes only 1 voltage source next to ground, and ground is on the negative side of the voltage source.
        const self = this;

        self.solvingEqs.supernodes.amount = 0;

        for(let voltageSource in self.voltageSources){
            if(voltageSource === 'amount'){continue;}
            let supernode = true;
            let voltageSourceObj = self.voltageSources[voltageSource];
            let currentObj = self.currents[String(voltageSourceObj.index)]
            currentObj.nodeConnections.forEach((node, i)=>{
                let otherIndex = (i===0) ? 1 : 0;
                if(self.nodes[node].ground){
                    self.nodes[currentObj.nodeConnections[otherIndex]].voltage = voltageSourceObj.numericalValue;
                    supernode = false;
                }
            })

            if(supernode){
                self.solvingEqs.supernodes.amount++;
                let positiveSide, negativeSide;
                switch(voltageSourceObj.orientation){
                    case 'horizontal':
                        self.nodes[currentObj.nodeConnections[0]].DOM.forEach((index)=>{
                            if(index == voltageSourceObj.index-1){
                                positiveSide = currentObj.nodeConnections[0];
                                negativeSide = currentObj.nodeConnections[1];
                                return;
                            } else if (index == voltageSourceObj.index+1){
                                positiveSide = currentObj.nodeConnections[1];
                                negativeSide = currentObj.nodeConnections[0];
                                return;
                            }
                        })
                        break;
                    case 'vertical':
                        self.nodes[currentObj.nodeConnections[0]].DOM.forEach((index)=>{
                            if(index == voltageSourceObj.index-10){
                                positiveSide = currentObj.nodeConnections[0];
                                negativeSide = currentObj.nodeConnections[1];
                                return;
                            } else if (index == voltageSourceObj.index+10){
                                positiveSide = currentObj.nodeConnections[1];
                                negativeSide = currentObj.nodeConnections[0];
                                return;
                            }
                        })
                        break;
                }
                let supernodeObj = self.solvingEqs.supernodes;
                let supernodeX = supernodeObj[`supernode${self.solvingEqs.supernodes.amount}`] = {};
                supernodeX.voltageEq = [...self.templateArr];
                let positiveIndex = self.retrieveIndex(positiveSide);
                let negativeIndex = self.retrieveIndex(negativeSide);

                supernodeX.voltageEq[positiveIndex] = 1;
                supernodeX.voltageEq[negativeIndex] = -1;
                supernodeX.solution = voltageSourceObj.numericalValue;
            }
        }
    }
    arrayOperations(array1, array2, operation){
        array1.forEach((e,i)=>{
            switch(operation){
                case 'sum':
                    array1[i] += array2[i];
                    break;
                case 'substract':
                    array1[i] -= array2[i];
                    break;
            }
        })
    }
    assignPolarity(){
        const self = this;
        let functionsObj = {
            assignCurrentSourcePolarity(){
                for(let currentSource in self.currentSources){
                    if(currentSource === 'amount'){
                        continue;
                    }
                    let current = self.currentSources[currentSource];
                    for(let node in self.nodes){
                        if (node === 'amount'){
                            continue;
                        }
                        self.nodes[node].currents.forEach((e,i)=>{
                            if(e===current.index){
                                switch(current.orientation){
                                    case 'vertical': //top to bottom
                                        self.nodes[node].DOM.forEach((elem)=>{
                                            if(elem===(e-10)){ //node is north of current source
                                                self.nodes[node].currents[i] *= -1;
                                                self.currents[current.index].finalPolarity = true;
                                                return;
                                            } else if(elem===(e+10)){ //node is south of current source
                                                self.currents[current.index].finalPolarity = true;
                                                return;
                                            }
                                        })
                                        break;
                                    default: //horizontal: left to right
                                        self.nodes[node].DOM.forEach((elem)=>{
                                            if(elem===(e-1)){ //node is west of current source
                                                self.nodes[node].currents[i] *= -1;
                                                self.currents[current.index].finalPolarity = true;
                                                return;
                                            } else if(elem===(e+1)){ //node is east of current source
                                                self.currents[current.index].finalPolarity = true;
                                                return;
                                            }
                                        })
                                        break;
                                }
                            }
                        })
                    }
                }
            },
            assignNodeCurrentPolarity(nodeString, absCurrent, polarity){  //COMPLETED
                let node = self.nodes[nodeString];
                node.currents.forEach((e,i)=>{
                    if(Math.abs(e) === absCurrent){
                        switch(polarity){
                            case '+':
                                node.currents[i] = absCurrent;
                                break;
                            case '-':
                                node.currents[i] = absCurrent*-1;
                                break;
                        }
                    }
                })
                self.currents[String(absCurrent)].finalPolarity = true;
            },
            findNodeConnections(){ //COMPLETED: Finds which nodes each current connects
                for(let current in self.currents){
                    let currentObj = self.currents[current];
                    currentObj.nodeConnections = [];
                    for(let node in self.nodes){
                        if(node === 'amount'){continue;}
                        let nodeObj = self.nodes[node];
                        nodeObj.currents.forEach((e)=>{
                            if(e==current){ //== not === because e = Number, current = String
                                currentObj.nodeConnections.push(node);
                            }
                        })
                    }
                }
            },
            initializePolarity(){ //COMPLETED: adds finalPolarity = false property to current objects
                self.currentsIndexArr.forEach((e)=>{
                    self.currents[e].finalPolarity = false;
                })
            },
            requiresImmediatePolarity(nodeString){
                function checkPolarityConsistency(nodeStr){
                    let node = self.nodes[nodeStr];
                    let consistent = true;
                    let polarity = '';
                    let finalPolarityArr = [];
                    node.currents.forEach((e)=>{
                        if(self.currents[String(Math.abs(e))].finalPolarity){
                            finalPolarityArr.push(e)
                        }
                    });
                    if(finalPolarityArr.every(elem=>elem>0)){
                        consistent = true;
                        polarity = '+';
            
                    } else if(finalPolarityArr.every(elem=>elem<0)){
                        consistent = true;
                        polarity = '-';
            
                    } else{
                        consistent = false;
                    }
                    let consistency = {consistent: consistent,
                        polarity: polarity
                    };
                    return consistency;
                };
                function checkFreeCurrents(nodeStr){ //COMPLETED: Finds how many !finalPolarity currents a node has
                    let node = self.nodes[nodeStr];
                    let freeCurrents = 0;
                    node.currents.forEach((e)=>{
                        if(!self.currents[String(Math.abs(e))].finalPolarity){
                            freeCurrents++;
                        }
                    })
                    return freeCurrents;
                }
                let consistencyObj = checkPolarityConsistency(nodeString);
                if(checkFreeCurrents(nodeString) === 1 && consistencyObj.consistent){
                    switch(consistencyObj.polarity){
                        case '+':
                            return '-';
                        case '-':
                            return '+';
                    }
                }
                return null
            }
        };

        //Outside of functionsObj because it calls functions from functionsObj
        function requiresSwitch(absCurrent, nodeRequires, nodeString, linkedNodeString){
            function findFreeCurrent(){
                self.nodes[nodeString].currents.forEach((e)=>{
                    if(!self.currents[String(Math.abs(e))].finalPolarity){
                        absCurrent = Math.abs(e);
                        self.currents[String(Math.abs(e))].nodeConnections.forEach((elem)=>{
                            if(elem !== nodeString){
                                linkedNodeString = elem;
                            }
                        })
                    }
                })
            }

            if(nodeRequires !== null){
                if(absCurrent === null){
                    findFreeCurrent();
                }
                let nodeCurrentIndex, linkedNodeCurrentIndex, deepRequire;
                switch(nodeRequires){
                    case '+':
                        functionsObj.assignNodeCurrentPolarity(nodeString, absCurrent, '+');
                        functionsObj.assignNodeCurrentPolarity(linkedNodeString, absCurrent, '-');
                        deepRequire = functionsObj.requiresImmediatePolarity(linkedNodeString);
                        break;
                    case '-':
                        functionsObj.assignNodeCurrentPolarity(nodeString, absCurrent, '-');
                        functionsObj.assignNodeCurrentPolarity(linkedNodeString, absCurrent, '+');
                        deepRequire = functionsObj.requiresImmediatePolarity(linkedNodeString);
                        break;
                    default:
                        break;
                }
                requiresSwitch(null, deepRequire, linkedNodeString, null);
            }
        }

        functionsObj.findNodeConnections();
        functionsObj.initializePolarity();
        functionsObj.assignCurrentSourcePolarity();

        for(let current in self.currents){
            //Prelim setup
            let currentObj = self.currents[current];
            let absCurrent = Math.abs(Number(current));
            if(currentObj.finalPolarity){continue;}
            let node1String = currentObj.nodeConnections[0];
            let node2String = currentObj.nodeConnections[1];
            
            let node1Requires = functionsObj.requiresImmediatePolarity(node1String);
            let node2Requires = functionsObj.requiresImmediatePolarity(node2String);
            requiresSwitch(absCurrent, node1Requires, node1String, node2String);
            requiresSwitch(absCurrent, node2Requires, node2String, node1String);

            //Holy shit, spent a lot of time wondering why assigning polarity didn't work. I forgot to check if requiresSwitch assigned a finalPolarity to the current...
            if(currentObj.finalPolarity){continue;}
            functionsObj.assignNodeCurrentPolarity(node1String, absCurrent, '+');
            functionsObj.assignNodeCurrentPolarity(node2String, absCurrent, '-');
        }
    }
    convertCurrentsToVoltages(){
        const self = this;
        for(let current in self.solvingEqs.currentVoltageEqs){
            let currentObj = self.currents[current];
            let solvingCurrentObj = self.solvingEqs.currentVoltageEqs[current];
            let value = 1 / solvingCurrentObj.numericalValue;
            let inIndex = self.retrieveIndex(currentObj.in);
            let outIndex = self.retrieveIndex(currentObj.out);
           solvingCurrentObj.array[outIndex] = value;
           solvingCurrentObj.array[inIndex] = value*-1;
        }
    }
    createMatrix(){ //and adds supernode eqs to solution vector
        const self = this;
        let i=0
        for(; i<self.nodes.amount; i++){
            self.matrix[i] = [...self.solvingEqs.nodeVoltageEqs[`node${i+1}`]];
        }
        for(let k=0; k<self.solvingEqs.supernodes.amount; k++){
            self.matrix[i+k] =[...self.solvingEqs.supernodes[`supernode${k+1}`].voltageEq];
            self.solvingEqs.solutionVector.push(self.solvingEqs.supernodes[`supernode${k+1}`].solution)
        }
    

    }
    findCurrentDirection(){ //Didn't realize this would be needed. There might be ways to optimize by using this in other places. switch(true) code inside. it's interesting
        const self = this;
        for(let current in self.currents){
            let currentObj = self.currents[current];
            currentObj.nodeConnections.forEach((node)=>{
                self.nodes[node].currents.forEach((nodeCurrent)=>{
                    if(Math.abs(nodeCurrent) == current){
                        switch(true){
                            case (nodeCurrent>0):
                                if(!currentObj.hasOwnProperty('in')) {currentObj.in = node;}
                                break;
                            case (nodeCurrent<0):
                                if(!currentObj.hasOwnProperty('out')) {currentObj.out = node;}
                                break;
                        }
                    }
                })
            })
        }
    }
    gaussianElim(twoDimArr, solVector){
    // Lower Upper Solver
    function lusolve(A, b, update) {
        var lu = ludcmp(A, update)
        if (lu === undefined) return // Singular Matrix!
        return lubksb(lu, b, update)
    }
    
    // Lower Upper Decomposition
    function ludcmp(A, update) {
        // A is a matrix that we want to decompose into Lower and Upper matrices.
        var d = true
        var n = A.length
        var idx = new Array(n) // Output vector with row permutations from partial pivoting
        var vv = new Array(n)  // Scaling information
    
        for (var i=0; i<n; i++) {
            var max = 0
            for (var j=0; j<n; j++) {
                var temp = Math.abs(A[i][j])
                if (temp > max) max = temp
            }
            if (max == 0) return // Singular Matrix!
            vv[i] = 1 / max // Scaling
        }
    
        if (!update) { // make a copy of A 
            var Acpy = new Array(n)
            for (var i=0; i<n; i++) {		
                var Ai = A[i] 
                var Acpyi = new Array(Ai.length)
                for (j=0; j<Ai.length; j+=1) Acpyi[j] = Ai[j]
                Acpy[i] = Acpyi
            }
            A = Acpy
        }
    
        var tiny = 1e-20 // in case pivot element is zero
        for (var i=0; ; i++) {
            for (var j=0; j<i; j++) {
                var sum = A[j][i]
                for (var k=0; k<j; k++) sum -= A[j][k] * A[k][i];
                A[j][i] = sum
            }
            var jmax = 0
            var max = 0;
            for (var j=i; j<n; j++) {
                var sum = A[j][i]
                for (var k=0; k<i; k++) sum -= A[j][k] * A[k][i];
                A[j][i] = sum
                var temp = vv[j] * Math.abs(sum)
                if (temp >= max) {
                    max = temp
                    jmax = j
                }
            }
            if (i <= jmax) {
                for (var j=0; j<n; j++) {
                    var temp = A[jmax][j]
                    A[jmax][j] = A[i][j]
                    A[i][j] = temp
                }
                d = !d;
                vv[jmax] = vv[i]
            }
            idx[i] = jmax;
            if (i == n-1) break;
            var temp = A[i][i]
            if (temp == 0) A[i][i] = temp = tiny
            temp = 1 / temp
            for (var j=i+1; j<n; j++) A[j][i] *= temp
        }
        return {A:A, idx:idx, d:d}
    }
    
    // Lower Upper Back Substitution
    function lubksb(lu, b, update) {
        // solves the set of n linear equations A*x = b.
        // lu is the object containing A, idx and d as determined by the routine ludcmp.
        var A = lu.A
        var idx = lu.idx
        var n = idx.length
    
        if (!update) { // make a copy of b
            var bcpy = new Array(n) 
            for (var i=0; i<b.length; i+=1) bcpy[i] = b[i]
            b = bcpy
        }
    
        for (var ii=-1, i=0; i<n; i++) {
            var ix = idx[i]
            var sum = b[ix]
            b[ix] = b[i]
            if (ii > -1)
                for (var j=ii; j<i; j++) sum -= A[i][j] * b[j]
            else if (sum)
                ii = i
            b[i] = sum
        }
        for (var i=n-1; i>=0; i--) {
            var sum = b[i]
            for (var j=i+1; j<n; j++) sum -= A[i][j] * b[j]
            b[i] = sum / A[i][i]
        }
        return b // solution vector x
        }
        const self = this;

        self.solution = [...lusolve(twoDimArr, solVector)]
    }
    importData(nodes, resistors, voltageSources, currentSources, componentIndexArr){ //COMPLETED: Imports data from UI, and creates self.currents[#] Objects
        const self = this;
        self.resistors = JSON.parse(JSON.stringify(resistors));
        self.currentSources = JSON.parse(JSON.stringify(currentSources));
        self.voltageSources = JSON.parse(JSON.stringify(voltageSources));
        self.nodes = JSON.parse(JSON.stringify(nodes));
        self.currentsIndexArr = [...componentIndexArr];
        self.currentsIndexArr.forEach((e)=>{
            self.currents[e] = {};
        })
    }
    init(){
        const self = this;
        self.assignPolarity();
        self.initializeNodeVoltages();
        self.solve();
        self.twoDecimalPlaces(self.solution);

        console.log('voltage sources: ', self.voltageSources);
        console.log('nodes: ', self.nodes);
        console.log('currents: ', self.currents);
        console.log('matrix', self.matrix);
        console.log('solving eqs: ', self.solvingEqs);

        return self.solution;
    }
    initializeNodeVoltages(){
        const self = this;
        for(let node in self.nodes){
            if (node === 'amount'){continue;}
            let nodeObj = self.nodes[node];
            if(nodeObj.ground){
                nodeObj.voltage = 0;
            } else {
                nodeObj.voltage = null;
            }
        }
    }
    initializeCurrentVoltageEqsForResistors(){ //current voltage equations FOR resistors.
        const self = this;
        for(let resistor in self.resistors){
            if(resistor==='amount'){continue;} 
            self.solvingEqs.currentVoltageEqs[String(self.resistors[resistor].index)] = {array: [...self.templateArr],
            numericalValue: self.resistors[resistor].numericalValue};
        }
    }
    initializeNodeVoltageEqs(){
        const self = this;
        for(let node in self.nodes){ 
            if(node === 'amount'){continue;}
            self.solvingEqs.nodeVoltageEqs[node] = [...self.templateArr];
        }

    }
    initializeSolutionVector(){ //must be same size as template;
        const self = this;
        self.solvingEqs.solutionVector = [...self.templateArr];
    }
    initializeTemplateArr(){
        const self = this;
        let nodeAmount = self.nodes.amount;
        for(let i=0; i<nodeAmount; i++){
            self.templateArr.push(0);
        }
    }
    retrieveIndex(nodeString){
        let regex = /\d+/g;
        let index = Number(nodeString.match(regex))-1;
        return index;
    }
    twoDecimalPlaces(solutionArr){
        solutionArr.forEach((e,i)=>{
            solutionArr[i] = Math.floor(e*100)/100;
        })
    }
    solve(){
        const self = this;
        self.initializeTemplateArr();
        self.applyVoltageSources();
        self.initializeNodeVoltageEqs();
        self.initializeSolutionVector();
        self.initializeCurrentVoltageEqsForResistors(); //What the fuck is this name...
        self.findCurrentDirection();
        self.convertCurrentsToVoltages();
        self.applyKCL();
        self.createMatrix();
        self.gaussianElim(self.matrix, self.solvingEqs.solutionVector);
    }
    sumOrSubstract(nodeString, current){
        const self = this;
        if(self.currents[String(Math.abs(current))].in === nodeString){
            return 'sum';
        } else if (self.currents[String(Math.abs(current))].out === nodeString){
            return 'substract';
        }
        
    }

}
 
const ui = new UI();
ui.init();
