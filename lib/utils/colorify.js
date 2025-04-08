// colorify.js 
const BASE_CODES = {
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    cyan: 36,
    gray: 90,
  
    bold: 1,
    underline: 4
  };
  
  const Colorify = (codes = []) => {
    const colorify = new Proxy(() => {}, {
      get(_, prop) {
        if (BASE_CODES[prop]) {
          return Colorify([...codes, BASE_CODES[prop]]);
        }
  
        if (prop.startsWith("bg")) {
          const baseColor = prop.slice(2).toLowerCase(); // bgRed -> red
          if (BASE_CODES[baseColor] && BASE_CODES[baseColor] >= 30 && BASE_CODES[baseColor] <= 37) {
            return Colorify([...codes, BASE_CODES[baseColor] + 10]);
          }
        }
  
        return undefined;
      },
      apply(_, __, args) {
        const text = args[0];
        const open = codes.map(code => `\x1b[${code}m`).join("");
        const close = `\x1b[0m`;
        return open + text + close;
      }
    });
  
    return colorify;
  };
  
  export default Colorify();
  