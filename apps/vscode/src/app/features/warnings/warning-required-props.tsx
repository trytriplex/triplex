/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useSubscription } from "../../hooks/ws";
import { useSceneStore } from "../../stores/scene";
import { WarningPredicate } from "./warning";

export function WarningRequiredProps() {
  const context = useSceneStore((store) => store.context);
  const props = useSubscription("/scene/:path/:exportName/props", context);
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
