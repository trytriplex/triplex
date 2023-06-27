import {
  JsxElement,
  JsxSelfClosingElement,
  Node,
  PropertySignature,
  Symbol as SymbolType,
  ts,
  Type,
} from "ts-morph";
import { getAttributes } from "./jsx";
import type { PropType, Type as UnrolledType } from "../types";

export function unrollType(type: Type, name?: string): UnrolledType {
  if (type.isUndefined()) {
    return {
      type: "undefined",
    };
  }

  if (type.isNumber()) {
    return {
      type: "number",
    };
  }

  if (type.isString()) {
    return {
      type: "string",
    };
  }

  if (type.isBoolean() || type.isBooleanLiteral()) {
    return {
      type: "boolean",
    };
  }

  if (type.isTuple()) {
    const elements = type.getTupleElements();
    const labels = ((type.compilerType as ts.TupleType).target as ts.TupleType)
      .labeledElementDeclarations;

    return {
      type: "tuple",
      values: elements.map((val, index) => ({
        ...unrollType(val, name),
        label: labels ? labels[index].name.getText() : undefined,
        required: labels ? !labels[index].questionToken : true,
      })),
    };
  }

  if (type.isUnion()) {
    const types = type.getUnionTypes();
    const values = types
      .map((val) => unrollType(val, name))
      // Filter out unknown values - if its unknown we don't want to handle it.
      .filter((val) => val.type !== "unknown")
      .filter(
        // Remove duplicates if any exist
        (v, i, a) =>
          a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
      );

    if (values.length === 1) {
      // After filter if there is only one value let's throw away the union and return the
      // only value inside it. Easier for us to handle on the client that way.
      return values[0];
    }

    return {
      type: "union",
      value: "",
      values,
    };
  }

  if (type.isStringLiteral()) {
    return {
      type: "string",
      value: `${type.getLiteralValueOrThrow()}`,
    };
  }

  return {
    type: "unknown",
  };
}

function getJsxDeclProps(element: JsxSelfClosingElement | JsxElement) {
  const tagName = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();

  if (/^[a-z]/.exec(tagName.getText())) {
    const jsxType = tagName.getSymbolOrThrow().getDeclarations()[0].getType();
    return {
      declaration: element,
      properties: jsxType.getApparentProperties(),
    };
  } else {
    const jsxType = tagName.getType();
    const signatures = jsxType.getCallSignatures();
    if (signatures.length === 0) {
      // No signatures for this call-like node found.
      return null;
    }

    const [props] = signatures[0].getParameters();
    if (!props) {
      // No props arg
      return null;
    }

    const valueDeclaration = props.getValueDeclaration();
    if (!valueDeclaration) {
      // No decl found!
      return null;
    }
    const declaration = jsxType.getSymbolOrThrow().getDeclarations()[0];
    const propsType = element
      .getProject()
      .getTypeChecker()
      .getTypeOfSymbolAtLocation(props, valueDeclaration);

    const properties = propsType.getApparentProperties();

    return {
      properties,
      declaration,
    };
  }
}

function toPrimitive(value?: string): string | boolean | number {
  if (value === undefined || value === "true") {
    return true;
  }

  const valueAsNumber = Number(value);

  if (Number.isNaN(valueAsNumber)) {
    return value;
  }

  return valueAsNumber;
}

function extractJSDoc(symbol: SymbolType) {
  const decls = symbol.getDeclarations().filter(Node.isJSDocable);

  const tags: Record<string, string | boolean | number> = {};
  let description: string[] = [];

  for (let i = 0; i < decls.length; i++) {
    const decl = decls[i];
    const jsdocs = decl.getJsDocs();

    jsdocs.forEach((doc) => {
      description.push(doc.getDescription().trim());
      doc.getTags().map((tag) => {
        const name = tag.getTagName();
        const value = tag.getCommentText();

        tags[name] = toPrimitive(value);
      });
    });
  }

  return {
    description: description.length ? description.join("\n") : undefined,
    tags,
  };
}

export function getJsxElementPropTypes(
  element: JsxSelfClosingElement | JsxElement
) {
  const propTypes: PropType[] = [];
  const attributeDecls = getAttributes(element);
  const jsxDecl = getJsxDeclProps(element);

  if (!jsxDecl) {
    return {
      propTypes: [],
      transforms: { rotate: false, scale: false, translate: false },
    };
  }

  const { declaration, properties } = jsxDecl;
  let rotate = false;
  let scale = false;
  let translate = false;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const declarations = prop.getDeclarations();
    const propDeclaration = declarations[0] as PropertySignature;
    const propName = prop.getName();
    const propType = prop.getTypeAtLocation(declaration);
    const { description, tags } = extractJSDoc(prop);

    if (propName === "rotation") {
      rotate = true;
    } else if (propName === "position") {
      translate = true;
    } else if (propName === "scale") {
      scale = true;
    }

    propTypes.push({
      name: propName,
      declared: !!attributeDecls[propName],
      required: !propDeclaration?.hasQuestionToken?.(),
      description: description || undefined,
      type: unrollType(propType, propName),
      tags,
    });
  }

  return { propTypes, transforms: { rotate, translate, scale } };
}
