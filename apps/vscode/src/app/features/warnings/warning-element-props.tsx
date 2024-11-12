/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "../../hooks/ws";
import { WarningPredicate } from "./warning";

export function WarningElementProps({
  name,
  ...props
}: {
  column: number;
  line: number;
  name: string;
  path: string;
}) {
  const elementProps = useLazySubscription(
    "/scene/:path/object/:line/:column",
    props,
  );
  const missingRequiredProps = elementProps.props.some((prop) =>
    "value" in prop ? false : prop.required,
  );
  const predicate = missingRequiredProps
    ? `The ${name} element is missing required props.`
    : false;

  return (
    <WarningPredicate
      actionId="notification_element_missingrequiredprops"
      position="center-right"
      predicate={predicate}
    />
  );
}
