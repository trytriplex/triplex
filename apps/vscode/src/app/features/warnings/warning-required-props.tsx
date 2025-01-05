/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "../../hooks/ws";
import { useSceneContext } from "../app-root/context";
import { WarningPredicate } from "./warning";

export function WarningRequiredProps() {
  const context = useSceneContext();
  const props = useLazySubscription("/scene/:path/:exportName/props", context);
  const missingRequiredProps = props.props
    .filter((prop) => prop.required && prop.defaultValue === undefined)
    .map((prop) => prop.name);
  const predicate = missingRequiredProps.length
    ? `Your component may not render correctly without the following props: ${missingRequiredProps.join(", ")}. To resolve create a component with the required props and open it.`
    : false;

  return (
    <WarningPredicate
      actionId="notification_component_missingrequiredprops"
      predicate={predicate}
    />
  );
}
