import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePassword(length = 24) {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  const alphanum = letters + digits;
  const specials = "!@#$%^&*-=_+";
  const innerCharset = alphanum + specials;
  
  let res = "";
  
  // Buffer of random values to minimize crypto calls
  const randomValues = new Uint32Array(length * 3);
  window.crypto.getRandomValues(randomValues);
  let randomIndex = 0;
  
  const getRandomChar = (charset: string) => {
    if (randomIndex >= randomValues.length) {
      window.crypto.getRandomValues(randomValues);
      randomIndex = 0;
    }
    return charset[randomValues[randomIndex++] % charset.length];
  };

  const isSpecial = (c: string) => specials.includes(c);
  
  for (let i = 0; i < length; i++) {
    const charsetToUse = (i === 0 || i === length - 1) ? letters : innerCharset;
    
    let char = "";
    let isValid = false;
    
    while (!isValid) {
      char = getRandomChar(charsetToUse);
      isValid = true;
      
      if (i > 0) {
        const prev = res[i - 1];
        
        // No adjacent specials
        if (isSpecial(prev) && isSpecial(char)) {
          isValid = false;
        }
        
        // No adjacent identical letters/digits (case-insensitive)
        if (prev.toLowerCase() === char.toLowerCase()) {
          isValid = false;
        }
      }
    }
    
    res += char;
  }
  
  return res;
}
