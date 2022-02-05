const MAX_GUESSES = 6;
const NUM_LETTERS = 5;

const words = ( await ( await fetch( 'sgb-words.txt' ) ).text() ).split( '\n' );

const DIFFICULTY_RANGE_SIZE = 2000; //words.length / 3;

const DEFAULT_MESSAGE = 'Choose your letters then click Guess.';
const messageDiv = document.getElementById( 'message' );

const Guess = { Wrong: 'wrong', Partial: 'partial', Correct: 'correct' };

const boardDiv = document.getElementById( 'board' );

for ( let g = 0; g < MAX_GUESSES; g ++ ) {
  const guess = document.createElement( 'div' );
  guess.className = 'guess';

  for ( let l = 0; l < NUM_LETTERS; l ++ ) {
    const letter = document.createElement( 'div' );
    letter.className = 'letter button';
    guess.appendChild( letter );
  }

  boardDiv.appendChild( guess );
}

const alphabet = {};
const alphabetDiv = document.getElementById( 'alphabet' );

for ( let index = 0, row = 0; row < 3; row ++ ) {
  const alphaRowDiv = document.createElement( 'div' );
  alphaRowDiv.className = 'alpha-row';

  for ( let col = 0; col < 9 && index < 26; col ++, index ++ ) {
    const letter = String.fromCharCode( 'a'.charCodeAt( 0 ) + index );

    const letterDiv = document.createElement( 'div' );
    letterDiv.className = 'letter button';
    letterDiv.textContent = letter;
    

    alphabet[ letter ] = letterDiv;

    alphaRowDiv.appendChild( letterDiv );
  }
  
  alphabetDiv.appendChild( alphaRowDiv );
}


export class Board {
  answer;
  alphabet;

  #guessIndex = 0;
  #letterIndex = 0;

  static fromDifficulty( difficulty ) {
    const wordIndex = Math.floor( ( difficulty + Math.random() ) * DIFFICULTY_RANGE_SIZE );
    return new Board( words[ wordIndex ] );
  }

  // TODO: New board should use existing UI, which we only make once staticly outside of class
  constructor( answer ) {
    console.log( answer );
    this.answer = answer;

    for ( let guess = 0; guess < MAX_GUESSES; guess ++ ) {
      for ( let letter = 0; letter < NUM_LETTERS; letter ++ ) {
        const letterDiv = boardDiv.children[ guess ].children[ letter ];
        letterDiv.textContent = '';
        letterDiv.classList.remove( Guess.Correct );
        letterDiv.classList.remove( Guess.Partial );
        letterDiv.classList.remove( Guess.Wrong );
      }
    }

    for ( const letter in alphabet ) {
      alphabet[ letter ].classList.remove( Guess.Correct );
      alphabet[ letter ].classList.remove( Guess.Partial );
      alphabet[ letter ].classList.remove( Guess.Wrong );

      alphabet[ letter ].onclick = () => this.addLetter( letter );
    }
    
    messageDiv.textContent = DEFAULT_MESSAGE;
  }

  addLetter( letter ) {
    if ( this.#letterIndex < NUM_LETTERS ) {
      const letterDiv = boardDiv.children[ this.#guessIndex ].children[ this.#letterIndex ];
      letterDiv.textContent = letter;
      this.#letterIndex ++;

      messageDiv.textContent = DEFAULT_MESSAGE;
    }
    else {
      messageDiv.textContent = 'Too many letters!';
    }
  }

  clearLetter() {
    if ( 0 < this.#letterIndex ) {
      this.#letterIndex --;
      const letterDiv = boardDiv.children[ this.#guessIndex ].children[ this.#letterIndex ];
      letterDiv.textContent = '';

      messageDiv.textContent = DEFAULT_MESSAGE;
    }
    else {
      messageDiv.textContent = 'Already empty!';
    }
  }

  applyGuess() {
    if ( this.#letterIndex != NUM_LETTERS ) {
      messageDiv.textContent = `Not enough letters!`;
      return;
    }

    const guess = boardDiv.children[ this.#guessIndex ];
    const word = [ ...guess?.children ].map( child => child.textContent ).join('');

    if ( !words.includes( word ) ) {
      messageDiv.textContent = `'${ word.toUpperCase() }' is not an allowed word.`;
      return;
    }

    let numTotal = 0, numCorrect = 0;

    for ( let i = 0; i < NUM_LETTERS; i ++ ) {
      const letterDiv = guess.children[ i ];
      const letter = letterDiv.textContent;

      if ( letter == this.answer[ i ] ) {
        letterDiv.classList.add( Guess.Correct );

        alphabet[ letter ].classList.remove( Guess.Partial );
        alphabet[ letter ].classList.add( Guess.Correct );

        numCorrect ++;
        numTotal ++;
      }
      else if ( this.answer.includes( letter ) ) {
        letterDiv.classList.add( Guess.Partial );

        alphabet[ letter ].classList.remove( Guess.Correct );
        alphabet[ letter ].classList.add( Guess.Partial );

        numTotal ++;
      }
      else {
        letterDiv.classList.add( Guess.Wrong );
        alphabet[ letter ].classList.add( Guess.Wrong );
      }
    }

    messageDiv.textContent = `Found ${ numTotal } letters, ${ numCorrect } in correct spot.`;

    this.#guessIndex ++;
    this.#letterIndex = 0;
    
    if ( word == this.answer ) {
      messageDiv.textContent = `Correctly guessed with ${ this.#guessIndex } tries!`;
    }
    else if ( this.#guessIndex == MAX_GUESSES ) {
      messageDiv.textContent = `Out of tries! Answer was: '${ this.answer.toUpperCase() }'.`;
    }
  }
}