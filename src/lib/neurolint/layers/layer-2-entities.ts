
const HTML_ENTITIES: [RegExp, string][] = [
  [/&quot;/g, '"'],
  [/&#x27;/g, "'"],
  [/&apos;/g, "'"],
  [/&amp;/g, "&"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&#36;/g, "$"],
  [/&#x24;/g, "$"],
  [/&euro;/g, "€"],
  [/&#8364;/g, "€"],
  [/&#x20AC;/g, "€"],
  [/&pound;/g, "£"],
  [/&#163;/g, "£"],
  [/&yen;/g, "¥"],
  [/&#165;/g, "¥"],
  [/&ndash;/g, "–"],
  [/&#8211;/g, "–"],
  [/&mdash;/g, "—"],
  [/&#8212;/g, "—"],
  [/&#8217;/g, "’"],
  [/&#64;/g, "@"],
  [/&nbsp;/g, " "],
  [/&copy;/g, "©"],
  [/&reg;/g, "®"],
  [/&trade;/g, "™"],
  [/&sect;/g, "§"],
  [/&para;/g, "¶"],
  [/&bull;/g, "•"],
  [/&deg;/g, "°"],
  [/&#8209;/g, "-"],
];

export async function transform(code: string): Promise<string> {
  let transformed = code;
  for (const [pat, rep] of HTML_ENTITIES) {
    transformed = transformed.replace(pat, rep);
  }
  return transformed;
}
