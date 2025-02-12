/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import {
  type DeclaredProp,
  type Prop,
  type PropGroupDef,
} from "@triplex/server";

interface PropGroup {
  defaultExpanded: boolean;
  name: string;
  order: number;
  props: (Prop | DeclaredProp)[];
}

const FALLBACK_ORDER = 21;

export function propsByGroup(
  props: (Prop | DeclaredProp)[],
  opts: {
    expandAll?: boolean;
    groupsDef: Record<string, PropGroupDef | undefined>;
  },
): PropGroup[] {
  const groups = new Map<string, PropGroup>();

  for (const prop of props) {
    const group = prop.group;
    const groupRef = opts.groupsDef[group];
    const defaultExpanded =
      (opts.expandAll || groupRef?.defaultExpanded) ?? true;
    const order = groupRef?.order ?? FALLBACK_ORDER;

    if (!groups.has(group)) {
      groups.set(group, {
        defaultExpanded,
        name: group,
        order,
        props: [],
      });
    }

    groups.get(group)!.props.push(prop);
  }

  const groupsArr = Array.from(groups.values());

  if (Array.from(groups.values()).length === 1) {
    groupsArr[0].defaultExpanded = true;
    return groupsArr;
  }

  return groupsArr.sort((a, b) => a.order - b.order);
}
