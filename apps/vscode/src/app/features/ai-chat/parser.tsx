/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
const indentation: unique symbol = Symbol("indentation");

export interface Node {
  attributes: Record<string, string | number | boolean>;
  children: Node[];
  [indentation]: {
    baseline: {
      state: "resolving" | "resolved" | "ready";
      value: number;
    };
    buffer: {
      state: "resolving" | "ready";
      value: number;
    };
  };
  isResolved: boolean;
  name: string;
  text: string;
  type: "code" | "text";
}

export interface NodeValue {
  name: string;
  type: "string" | "number";
  value: string | number;
}

export class StreamingXMLParser {
  private nodes: Node[] = [];
  private nodeStack: Node[] = [];
  private textBuffer: string[] = [];
  private nextCharacter: string = "";

  private state:
    | "COLLECT_TEXT"
    | "COLLECT_CODE"
    | "COLLECT_TAG_NAME"
    | "CHECK_CLOSING_TAG"
    | "CHECK_SELF_CLOSING_TAG"
    | "COLLECT_TAG_ATTRIBUTE_NAME"
    | "COLLECT_TAG_ATTRIBUTE_VALUE" = "COLLECT_TEXT";

  private currentNode: Node | undefined = undefined;
  private currentAttribute: NodeValue | undefined = undefined;

  private flushAttribute(): void {
    if (this.currentAttribute) {
      const value = this.textBuffer.join("");

      if (this.currentAttribute.type === "string") {
        this.currentAttribute.value = value;
      } else if (this.currentAttribute.type === "number") {
        this.currentAttribute.value = Number(value);
      }
    }

    if (this.currentNode && this.currentAttribute) {
      this.currentNode.attributes[this.currentAttribute.name] =
        this.currentAttribute.value;
      this.currentAttribute = undefined;
    }

    this.textBuffer.length = 0;
  }

  private flushCurrentNode(): void {
    if (!this.currentNode) {
      throw new Error("invariant: expected currentNode to be defined");
    }

    if (this.currentNode.text.at(-1) === "\n") {
      this.currentNode.text = this.currentNode.text.slice(0, -1);
    }

    this.currentNode.isResolved = true;
    this.nodeStack.pop();
    this.currentNode = this.nodeStack.at(-1);
    this.textBuffer.length = 0;
  }

  private skipLeadingNewline(): boolean {
    if (this.currentNode?.text === "" && this.nextCharacter === "\n") {
      return true;
    }

    return false;
  }

  /**
   * Returns true if the character should continue to be processed. Will prepend
   * indentation to the current node text when needed.
   */
  private checkAndApplyIndentation(): boolean {
    if (!this.currentNode) {
      throw new Error("invariant: expected currentNode to be defined");
    }

    const char = this.nextCharacter;

    if (
      char === "\n" &&
      this.currentNode[indentation].baseline.state === "ready"
    ) {
      // We've found a new line so we need to start checking for indentation baseline.
      this.currentNode[indentation].baseline.state = "resolving";
    } else if (
      this.currentNode[indentation].baseline.state === "resolving" &&
      char === " "
    ) {
      // Continue resolving the indentation baseline when we find a space.
      this.currentNode[indentation].baseline.value += 1;
      return false;
    } else if (
      this.currentNode[indentation].baseline.state === "resolving" &&
      char !== " "
    ) {
      // We've found a non-space character so move to the next state.
      this.currentNode[indentation].baseline.state = "resolved";
      // Fall through to accumulate text.
    } else if (
      this.currentNode[indentation].baseline.state === "resolved" &&
      this.currentNode[indentation].buffer.state === "resolving" &&
      char === " "
    ) {
      this.currentNode[indentation].buffer.value += 1;
      // Skip accumulating the text, we'll do that when we've collected all the indentation.
      return false;
    } else if (
      this.currentNode[indentation].baseline.state === "resolved" &&
      this.currentNode[indentation].buffer.state === "resolving" &&
      char !== " "
    ) {
      // We've collected all the indentation, now we remove the baseline from it and add it to the node text.
      const value = Math.max(
        0,
        this.currentNode[indentation].buffer.value -
          this.currentNode[indentation].baseline.value,
      );
      this.currentNode.text += " ".repeat(value);

      this.currentNode[indentation].buffer.state = "ready";
      this.currentNode[indentation].buffer.value = 0;
      // Fall through to accumulate text.
    }

    if (
      this.currentNode[indentation].baseline.state === "resolved" &&
      char === "\n"
    ) {
      // We've found another new line, start accumulating the indentation buffer.
      this.currentNode[indentation].buffer.state = "resolving";
      this.currentNode[indentation].buffer.value = 0;
      // Fall through to accumulate text.
    }

    return true;
  }

  /**
   * Processes the buffer. Returns true if the buffer was processed, false if
   * the buffer is empty.
   */
  private process(): void {
    const char = this.nextCharacter;
    if (!char) {
      return;
    }

    switch (this.state) {
      case "COLLECT_TEXT": {
        const skipAccumulatingText = this.skipLeadingNewline();

        if (this.currentNode?.type === "code") {
          // Correct state for a code node.
          this.state = "COLLECT_CODE";
          this.process();
        } else if (char === "<") {
          this.state = "COLLECT_TAG_NAME";
        } else if (char === "`") {
          // We've found the start of a code block. Assume the rest of the text is code.
          this.state = "COLLECT_CODE";
          this.process();
        } else if (this.currentNode) {
          if (this.checkAndApplyIndentation() && !skipAccumulatingText) {
            // Accumulate non-closing tag text onto the current node.
            this.currentNode.text += char;
          }
        }
        break;
      }

      case "COLLECT_CODE": {
        if (!this.currentNode) {
          throw new Error("invariant: expected currentNode to be defined");
        }

        let skipAccumulatingText = this.skipLeadingNewline();

        if (char === "<") {
          // We've found a closing tag so start pushing to the text buffer.
          // This doesn't get flushed to the node until we either confirm this isn't
          // the actual closing tag, or we confirm it is.
          this.textBuffer.push(char);
          skipAccumulatingText = true;
        } else if (this.textBuffer.length > 0) {
          // The text buffer is non-empty so we begin checking for a matching closing tag.
          this.textBuffer.push(char);
          skipAccumulatingText = true;

          const possibleClosingTagName = this.textBuffer.join("");
          const actualClosingTagName = `</${this.currentNode.name}>`;

          if (possibleClosingTagName.startsWith(actualClosingTagName)) {
            this.flushCurrentNode();
            this.state = "COLLECT_TEXT";
            break;
          } else if (char === " " || char === ">") {
            // We've found the end of the tag name but it doesn't match. Bail out and start finding again.
            this.currentNode.text += possibleClosingTagName;
            this.textBuffer.length = 0;
          }
        }

        if (this.checkAndApplyIndentation() && !skipAccumulatingText) {
          // Accumulate non-closing tag text onto the current node.
          this.currentNode.text += char;
        }

        break;
      }

      case "COLLECT_TAG_NAME": {
        if (char === "/") {
          // Found the start of a self closing tag, perform a state transition.
          this.state = "CHECK_SELF_CLOSING_TAG";
          this.textBuffer.length = 0;
        } else if (char === " " || char === ">") {
          // We've reached the end of the tag name.
          const tagName = this.textBuffer.join("");
          this.textBuffer.length = 0;

          this.currentNode = {
            attributes: {},
            children: [],
            [indentation]: {
              baseline: { state: "ready", value: 0 },
              buffer: { state: "ready", value: 0 },
            },
            isResolved: false,
            name: tagName,
            text: "",
            type: tagName.startsWith("code_") ? "code" : "text",
          };

          if (this.nodeStack.length > 0) {
            // We're inside a node, so add the current node to the last element.
            this.nodeStack.at(-1)!.children.push(this.currentNode);
          } else {
            // We're at the root level, so add the current node to the nodes array.
            this.nodes.push(this.currentNode);
          }

          // Add to the stack as we're now inside this node
          this.nodeStack.push(this.currentNode);

          if (char === " ") {
            // The tag continues with attributes
            this.state = "COLLECT_TAG_ATTRIBUTE_NAME";
          } else if (char === ">") {
            // Go back to collecting text.
            this.state = "COLLECT_TEXT";
          }
        } else {
          // Keep collecting the tag name.
          this.textBuffer.push(char);
        }

        break;
      }

      case "CHECK_CLOSING_TAG": {
        if (!this.currentNode) {
          throw new Error("invariant: expected currentNode to be defined");
        }

        if (char === ">") {
          const tagName = this.textBuffer.join("");

          if (tagName !== this.currentNode.name) {
            throw new Error(
              `invariant: tag name mismatch <${this.currentNode.name}>...</${tagName}>`,
            );
          }

          this.flushCurrentNode();
          this.state = "COLLECT_TEXT";
        } else {
          this.textBuffer.push(char);
        }

        break;
      }

      case "CHECK_SELF_CLOSING_TAG": {
        if (char !== ">") {
          // This isn't a self-closing tag.
          this.state = "CHECK_CLOSING_TAG";
          this.process();
        } else if (!this.currentNode) {
          throw new Error("invariant: expected currentNode to be defined");
        } else {
          // We've found the end of a self-closing tag.
          this.flushCurrentNode();
          this.state = "COLLECT_TEXT";
        }

        break;
      }

      case "COLLECT_TAG_ATTRIBUTE_NAME": {
        if (char === "=") {
          // We've found the end of an attribute name.
          this.currentAttribute = {
            name: this.textBuffer.join(""),
            type: "string",
            value: "",
          };
          this.textBuffer.length = 0;
          this.state = "COLLECT_TAG_ATTRIBUTE_VALUE";
        } else if (char === " " || char === ">" || char === "/") {
          // We've gotten to the end of an attribute name that isn't assign a value.
          // Skip creating the intermediate attribute object and immediately assign.
          if (this.textBuffer.length > 0) {
            if (this.currentNode) {
              const attributeName = this.textBuffer.join("");
              this.currentNode.attributes[attributeName] = true;
              this.textBuffer.length = 0;
            }
          }

          if (char === ">") {
            this.state = "COLLECT_TEXT";
          } else if (char === "/") {
            this.state = "CHECK_SELF_CLOSING_TAG";
          }
        } else if (char === "<") {
          // We've found a new tag.
          this.state = "COLLECT_TAG_NAME";
        } else {
          // Keep collecting the attribute name.
          this.textBuffer.push(char);
        }

        break;
      }

      case "COLLECT_TAG_ATTRIBUTE_VALUE": {
        if (char === '"' || char === "'" || char === "{" || char === "}") {
          if (char === "{" && this.textBuffer.length === 0) {
            // We're at the start of an attribute value that should be a number.
            this.currentAttribute!.type = "number";
          } else if (this.textBuffer.length > 0) {
            // End of attribute value
            this.flushAttribute();
            this.state = "COLLECT_TAG_ATTRIBUTE_NAME";
          }
        } else {
          // Keep collecting the attribute value.
          this.textBuffer.push(char);
        }

        break;
      }
    }
  }

  processChunk(chunk: string): void {
    for (const char of chunk) {
      this.nextCharacter = char;
      this.process();
    }

    this.nextCharacter = "";
  }

  parseString(str: string): Node[] {
    this.nodes = [];
    this.processChunk(str);
    return structuredClone(this.nodes);
  }

  toStructure(): Node[] {
    return structuredClone(this.nodes);
  }
}
