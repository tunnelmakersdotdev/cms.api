export function toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  
  type replacePrefixFromTextProps = {
    prefix?: string | string[];
    text: any;
  };
  export const replacePrefixFromText = ({
    prefix,
    text,
  }: replacePrefixFromTextProps) => {
    if (!prefix) {
      return text;
    }
    if (Array.isArray(prefix)) {
      for (const element of prefix) {
        const textLower = text?.toLowerCase();
        const prefixLower = element?.toLowerCase();
        if (textLower.startsWith(prefixLower)) {
          text = textLower.replace(prefixLower, "");
        }
      }
      return text;
    } else {
      const textLower = text?.toLowerCase();
      const prefixLower = prefix?.toLowerCase();
      if (textLower.startsWith(prefixLower)) {
        text = textLower.replace(prefixLower, "");
      }
    }
    return text;
  };