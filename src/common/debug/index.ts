export const debug = (...args: any[]) => {
  if (process.env.DEBUG_MODE !== "true") {
    return;
  }

  if (args.length === 0) {
    return;
  }

  // Color configuration
  const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    bold: "\x1b[1m",
  };

  // Default color and label
  let color = colors.red;
  let label = "DEBUG:";

  // Check if first argument is a color keyword
  if (typeof args[0] === "string") {
    const colorArg = args[0].toLowerCase();
    if (colorArg in colors) {
      //@ts-ignore
      color = colors[colorArg];
      args.shift(); // Remove the color argument
    }

    // Check if next argument is a label
    if (args.length > 0 && typeof args[0] === "string") {
      label = args.shift();
    }
  }

  // Process each argument
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      const jsonString = JSON.stringify(arg, null, 2)
        .replace(/"(\w+)":/g, `${colors.cyan}"$1"${colors.reset}:`) // Cyan keys
        .replace(/: ("[^"]*")/g, `: ${colors.yellow}$1${colors.reset}`) // Yellow strings
        .replace(/: (true|false|null)/g, `: ${colors.magenta}$1${colors.reset}`) // Magenta booleans/null
        .replace(/: (\d+)/g, `: ${colors.blue}$1${colors.reset}`); // Blue numbers

      return `${colors.gray}${jsonString}${colors.reset}`;
    }

    return `${color}${arg}${colors.reset}`;
  });

  // Add timestamp
  const timestamp = new Date().toISOString();
  console.log(
    // `${colors.gray}[${timestamp}]${colors.reset} ${colors.bold}${color}${label}${colors.reset}`,
    `${colors.reset} ${colors.bold}${color}${label}${colors.reset}`,
    ...formattedArgs
  );
};
