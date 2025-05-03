/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export interface Node {
  attributes: Record<string, string | boolean | number>;
  children: Node[];
  isResolved: boolean;
  name: string;
  text: string;
}

// Define possible parser states
export type ParserState =
  | "TEXT"
  | "TAG_OPEN"
  | "TAG_NAME"
  | "ATTRIB_NAME"
  | "ATTRIB_VALUE"
  | "TAG_CLOSE"
  | "CODE_BLOCK"
  | "CODE_TAG"
  | "INLINE_CODE";

export class XMLStreamParser {
  private state: ParserState;
  private currentCharBuffer: string[];
  private currentTag: Node | null;
  private tagStack: Node[];
  private root: Node;
  private currentAttribName: string;
  private currentAttribValue: string;
  private isClosingTag: boolean;
  private codeLookahead: string;

  constructor() {
    this.state = "TEXT";
    this.currentCharBuffer = [];
    this.currentTag = null;
    this.tagStack = [];
    this.root = {
      attributes: {},
      children: [],
      isResolved: true,
      name: "root",
      text: "",
    };
    this.currentAttribName = "";
    this.currentAttribValue = "";
    this.isClosingTag = false;
    this.codeLookahead = "";
  }

  // Process a chunk of one or more characters from the stream
  processChunk(chunk: string): void {
    for (const char of chunk) {
      switch (this.state) {
        case "TEXT":
          if (char === "<") {
            // Start of a tag
            if (this.currentCharBuffer.length > 0) {
              // Save accumulated text, discarding trailing newline
              let text = this.currentCharBuffer.join("");
              if (text.endsWith("\n")) {
                text = text.slice(0, -1);
              }
              if (this.currentTag && text) {
                this.currentTag.text = (this.currentTag.text || "") + text;
              }
              this.currentCharBuffer.length = 0;
            }
            this.currentCharBuffer.push(char);
            this.state = "TAG_OPEN";
          } else if (char === "`") {
            // Start of inline code
            this.currentCharBuffer.push(char);
            this.state = "INLINE_CODE";
          } else {
            // Check for start of Markdown code block (\n```)
            this.currentCharBuffer.push(char);
            this.codeLookahead += char;
            if (this.codeLookahead.endsWith("\n```")) {
              // Start code block, include ``` in text
              this.codeLookahead = "";
              this.state = "CODE_BLOCK";
            } else if (this.codeLookahead.length > 3) {
              this.codeLookahead = this.codeLookahead.slice(-3);
            }
          }
          break;

        case "INLINE_CODE":
          this.currentCharBuffer.push(char);
          if (char === "`") {
            // End of inline code
            if (this.currentTag) {
              const text = this.currentCharBuffer.join("");
              this.currentTag.text = (this.currentTag.text || "") + text;
            }
            this.currentCharBuffer.length = 0;
            this.state = "TEXT";
          }
          break;

        case "CODE_BLOCK":
          this.currentCharBuffer.push(char);
          this.codeLookahead += char;
          if (this.codeLookahead.endsWith("\n```")) {
            // End code block, include ``` in text
            this.codeLookahead = "";
            if (this.currentTag) {
              const text = this.currentCharBuffer.join("");
              this.currentTag.text = (this.currentTag.text || "") + text;
            }
            this.currentCharBuffer.length = 0;
            this.state = "TEXT";
          } else if (this.codeLookahead.length > 3) {
            this.codeLookahead = this.codeLookahead.slice(-3);
          }
          break;

        case "CODE_TAG": {
          this.currentCharBuffer.push(char);
          this.codeLookahead += char;
          const closingTag = `</${this.currentTag!.name}>`;
          if (this.codeLookahead.endsWith(closingTag)) {
            // End code tag, commit text and parse closing tag
            let text = this.currentCharBuffer.join("");
            if (text.endsWith("\n")) {
              text = text.slice(0, -1);
            }
            if (this.currentTag && text) {
              this.currentTag.text =
                (this.currentTag.text || "") +
                text.slice(0, -closingTag.length);
            }
            this.currentCharBuffer.length = 0;
            this.codeLookahead = "";
            // Process closing tag
            if (this.tagStack.length > 0) {
              this.tagStack.pop();
              this.currentTag =
                this.tagStack.length > 0 ? this.tagStack.at(-1)! : null;
            }
            this.state = "TEXT";
          } else if (this.codeLookahead.length > closingTag.length) {
            this.codeLookahead = this.codeLookahead.slice(-closingTag.length);
          }
          break;
        }

        case "TAG_OPEN":
          if (char === "/") {
            this.isClosingTag = true;
            this.currentTag!.isResolved = true;
            this.currentCharBuffer.length = 0;
          } else {
            this.currentCharBuffer.length = 0;
            this.currentCharBuffer.push(char);
            this.state = "TAG_NAME";
          }
          break;

        case "TAG_NAME":
          if (char === " " || char === ">") {
            // End of tag name
            const tagName = this.currentCharBuffer.join("");
            if (this.isClosingTag) {
              // Closing tag
              if (this.tagStack.length > 0) {
                const closingTag = this.tagStack.pop()!;
                if (closingTag.name !== tagName) {
                  throw new Error(
                    `Mismatched closing tag: expected </${closingTag.name}>, got </${tagName}>`,
                  );
                }
                this.currentTag =
                  this.tagStack.length > 0 ? this.tagStack.at(-1)! : null;
              }
              this.isClosingTag = false;
              this.currentCharBuffer.length = 0;
              this.state = char === ">" ? "TEXT" : "TAG_CLOSE";
            } else {
              // Opening tag
              const newTag: Node = {
                attributes: {},
                children: [],
                isResolved: false,
                name: tagName,
                text: "",
              };
              if (!this.currentTag) {
                this.root.children.push(newTag);
              } else {
                this.currentTag.children.push(newTag);
              }
              this.tagStack.push(newTag);
              this.currentTag = newTag;
              this.currentCharBuffer.length = 0;
              this.state =
                char === ">"
                  ? tagName === "code_add" || tagName === "code_replace"
                    ? "CODE_TAG"
                    : "TEXT"
                  : "ATTRIB_NAME";
            }
          } else {
            this.currentCharBuffer.push(char);
          }
          break;

        case "ATTRIB_NAME":
          if (char === "=") {
            this.currentAttribName = this.currentCharBuffer.join("");
            this.currentCharBuffer.length = 0;
            this.state = "ATTRIB_VALUE";
          } else if (char === ">" || char === " ") {
            // Handle attributes without values
            if (this.currentCharBuffer.length > 0) {
              this.currentTag!.attributes[this.currentCharBuffer.join("")] =
                true;
              this.currentCharBuffer.length = 0;
            }
            this.state =
              char === ">"
                ? this.currentTag!.name === "code_add" ||
                  this.currentTag!.name === "code_replace"
                  ? "CODE_TAG"
                  : "TEXT"
                : "ATTRIB_NAME";
          } else {
            this.currentCharBuffer.push(char);
          }
          break;

        case "ATTRIB_VALUE":
          if (
            (char === '"' || char === "{") &&
            this.currentCharBuffer.length === 0
          ) {
            // Start of quoted or numeric value
            this.currentCharBuffer.length = 0;
            this.currentAttribValue = char; // Track delimiter
          } else if (
            (char === '"' && this.currentAttribValue === '"') ||
            (char === "}" &&
              this.currentAttribValue === "{" &&
              this.currentCharBuffer.length > 0)
          ) {
            // End of value
            const value = this.currentCharBuffer.join("");
            if (this.currentAttribValue === "{") {
              // Try parsing as number
              const num = Number.parseFloat(value);
              this.currentTag!.attributes[this.currentAttribName] =
                Number.isNaN(num) ? value : num;
            } else {
              // String value
              this.currentTag!.attributes[this.currentAttribName] = value;
            }
            this.currentCharBuffer.length = 0;
            this.currentAttribName = "";
            this.currentAttribValue = "";
            this.state = "ATTRIB_NAME";
          } else {
            this.currentCharBuffer.push(char);
          }
          break;

        case "TAG_CLOSE":
          if (char === ">") {
            this.state =
              this.currentTag!.name === "code_add" ||
              this.currentTag!.name === "code_replace"
                ? "CODE_TAG"
                : "TEXT";
            this.currentCharBuffer.length = 0;
          } else if (char === "/") {
            // Self-closing tag
            if (this.tagStack.length > 0) {
              this.currentTag = this.tagStack.pop()!;
              this.currentTag =
                this.tagStack.length > 0 ? this.tagStack.at(-1)! : null;
            }
            this.state = "TEXT";
            this.currentCharBuffer.length = 0;
          }
          break;
      }
    }
  }

  // Get the current parsed structure, computing effective text without modifying state
  getStructure(): Node {
    // Compute effective text for the current tag without modifying it
    let effectiveTag = this.currentTag;
    if (this.currentTag && this.currentCharBuffer.length > 0) {
      let text = this.currentCharBuffer.join("");
      if (
        this.state !== "CODE_BLOCK" &&
        this.state !== "CODE_TAG" &&
        this.state !== "INLINE_CODE" &&
        text.endsWith("\n")
      ) {
        text = text.slice(0, -1);
      }
      // Create a copy of the current tag with updated text
      effectiveTag = {
        ...this.currentTag,
        text: (this.currentTag.text || "") + text,
      };
    }
    // Return the root, replacing currentTag with effectiveTag in its hierarchy
    const replaceTagInChildren = (
      children: Node[],
      target: Node,
      replacement: Node,
    ): Node[] => {
      return children.map((child) => {
        if (child === target) {
          return replacement;
        }
        return {
          ...child,
          children: replaceTagInChildren(child.children, target, replacement),
        };
      });
    };
    return {
      ...this.root,
      children: effectiveTag
        ? replaceTagInChildren(
            this.root.children,
            this.currentTag!,
            effectiveTag,
          )
        : this.root.children,
    };
  }

  // Process a complete string (for testing)
  parseString(str: string): void {
    this.processChunk(str);
  }
}
