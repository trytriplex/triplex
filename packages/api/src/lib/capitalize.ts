/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export function capitalize<TString extends string>(
  str: TString,
): Capitalize<TString> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<TString>;
}
