export function capitalize<TString extends string>(
  str: TString,
): Capitalize<TString> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<TString>;
}
