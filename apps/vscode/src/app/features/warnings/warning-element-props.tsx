/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
