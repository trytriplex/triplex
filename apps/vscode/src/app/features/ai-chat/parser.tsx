/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export interface Node {
  attributes: Record<string, string | number | boolean>;
  children: Node[];
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
    if (this.currentNode) {
      this.currentNode.isResolved = true;
      this.nodeStack.pop();
      this.currentNode = this.nodeStack.at(-1);
      this.textBuffer.length = 0;
    }
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
          // Accumulate text onto the current node.
          this.currentNode.text += char;
        } else {
          // Accumulate text onto the text buffer.
          this.textBuffer.push(char);
        }

        break;
      }

      case "COLLECT_CODE": {
        if (!this.currentNode) {
          throw new Error("invariant: expected currentNode to be defined");
        }

        if (char === "<") {
          // We've found a closing tag so start pushing to the text buffer.
          // This doesn't get flushed to the node until we either confirm this isn't
          // the actual closing tag, or we confirm it is.
          this.textBuffer.push(char);
        } else if (this.textBuffer.length > 0) {
          this.textBuffer.push(char);

          const possibleClosingTagName = this.textBuffer.join("");
          const actualClosingTagName = `</${this.currentNode.name}>`;

          if (actualClosingTagName === possibleClosingTagName) {
            this.flushCurrentNode();
            this.state = "COLLECT_TEXT";
          } else if (
            possibleClosingTagName.length > actualClosingTagName.length
          ) {
            this.currentNode.text += possibleClosingTagName;
            this.textBuffer.length = 0;
          }
        } else {
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
