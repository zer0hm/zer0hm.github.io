const playerSelection = document.querySelectorAll('.playerSide img')
let playerScore = 0;
let computerScore = 0;
let isRunning = false;

playerSelection.forEach(element => {
    element.addEventListener("click",function(){
        if(!isRunning){
            isRunning = true;
            startGame(element) 
        }

    });
});




async function startGame(playerChoiceHTML){

    //skip if awaiting reset
    if(computerScore === 3 || playerScore === 3) return 0;


    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];


    const playerChoice = playerChoiceHTML.className;

    await computerAnimation(computerChoice);

    //tie
    if(playerChoice === computerChoice){
        let result = document.querySelector('.result-container');
        result.innerHTML = `
        <p class="result">
            You have chosen ${playerChoice}, computer chose ${computerChoice}.
        </p>
        <p style='color: yellow;'>You tied!</p>
        ` ;
        isRunning = false;
        return 0;
    }

    if(playerChoice === "rock"){
        if(computerChoice === "scissors"){
            win();
        }
        if(computerChoice === "paper"){
            loss();
        }
    }
    if(playerChoice === "paper"){
        if(computerChoice === "rock"){
            win();
        }
        if(computerChoice === "scissors"){
            loss();
        }
    }
    if(playerChoice === "scissors"){
        if(computerChoice === "paper"){
            win();
        }
        if(computerChoice === "rock"){
            loss();
        }
    }
  
    function win(){
        playerScore++;
        let result = document.querySelector('.result-container');
        result.innerHTML = `
        <p class="result">
            You have chosen ${playerChoice}, computer chose ${computerChoice}.
        </p>
        <p style='color: #73E9BA;'>You won!</p>
        ` ;

        result = document.querySelector('.button-container');
        if (playerScore === 3 || computerScore ===3){
            result.innerHTML = `
        <p class="playerScore">
            Score: ${playerScore}
        </p>
        <button class="reset">Reset</button>
        <p class="computerScore">
            Score: ${computerScore}
        </p>
            `
        }
        else{
            result.innerHTML = `
            <p class="playerScore">
                Score: ${playerScore}
            </p>
            <button class="reset" style="display:none;">Reset</button>
            <p class="computerScore">
                Score: ${computerScore}
            </p>
                `
        }

    }



    function loss(){
        computerScore++;
        let result = document.querySelector('.result-container');
        result.innerHTML = `
        <p class="result">
            You have chosen ${playerChoice}, computer chose ${computerChoice}.
        </p>
        <p style='color: orangered;'>You Lost!</p>
        ` ;

        result = document.querySelector('.button-container');
        if (playerScore === 3 || computerScore ===3){
            result.innerHTML = `
        <p class="playerScore">
            Score: ${playerScore}
        </p>
        <button class="reset">Reset</button>
        <p class="computerScore">
            Score: ${computerScore}
        </p>
            `
        }
        else{
            result.innerHTML = `
            <p class="playerScore">
                Score: ${playerScore}
            </p>
            <button class="reset" style="display:none;">Reset</button>
            <p class="computerScore">
                Score: ${computerScore}
            </p>
                `
        }
    }

    const resetButton = document.querySelector('button');
resetButton.addEventListener('click',function() {
    isRunning = false;
    playerScore = 0;
    computerScore = 0;
    let result = document.querySelector('.button-container');
    result.innerHTML = `
    <p class="playerScore">
        Score: ${playerScore}
    </p>
    <button class="reset" style="display:none;">Reset</button>
    <p class="computerScore">
        Score: ${computerScore}
    </p>
        `;
    result = document.querySelector('.result-container');
    result.innerHTML = `
    <p class="result">
        Please select Rock, Paper or Scissors.
    </p>
    ` ;
})

    isRunning = false;
}
    

const delay = (delayInMs) => {
    return new Promise(resolve => setTimeout(resolve, delayInMs));
}

// animation to scroll through all the selection and slowly land on the required one.
async function computerAnimation(computerChoice){
    const computerImage = document.querySelector(".computerSide img");
    const choice = ['rock', 'paper', 'scissors']

    for(let i=0; i<15; i++){
        await delay(15*i);
        computerImage.src = `resources/${choice[(i+1)%3]}.png`
    }
    computerImage.src = `resources/${computerChoice}.png`
}
