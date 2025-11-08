export const LETTERS = [
    "A","B","C","D","E","F","G","H","I","J",
    "K","L","M","N","O","P","Q","R","S","T",
    "U","V","W","X","Y","Z"
  ];
  
  export function nextLetter(prev) {
    if (LETTERS.length === 1) return LETTERS[0];
    let l = prev;
    while (l === prev) {
      l = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
    return l;
  }