/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { describe, expect, it } from "vitest";
import { buildPath } from "../lib";

describe("buildPath()", () => {
  it("replaces parameters in route", () => {
    const route = "/users/:id";
    const params = { id: "123" };

    expect(buildPath(route, params)).toBe("/users/123");
  });

  it("replaces multiple parameters in route", () => {
    const route = "/users/:userId/posts/:postId";
    const params = { postId: "456", userId: "123" };

    expect(buildPath(route, params)).toBe("/users/123/posts/456");
  });

  it("handles undefined values by replacing them with empty string", () => {
    const route = "/users/:id";
    const params = { id: undefined };

    expect(buildPath(route, params)).toBe("/users/");
  });

  it("handles optional params", () => {
    const route = "/users{/:id}/more";
    const params = {};

    expect(buildPath(route, params)).toBe("/users/more");
  });

  it("URI encodes parameter values", () => {
    const route = "/search/:query";
    const params = { query: "hello world" };

    expect(buildPath(route, params)).toBe("/search/hello%20world");
  });

  it("collapses unreplaced optionals", () => {
    const route = "/users/:userId{/:postId}";
    const params = { userId: "123" };

    expect(buildPath(route, params)).toBe("/users/123");
  });

  it("removes braces from filled optional parameters", () => {
    const route = "/users/:userId{/:postId}";
    const params = { postId: "456", userId: "123" };

    expect(buildPath(route, params)).toBe("/users/123/456");
  });

  it("handles boolean values", () => {
    const route = "/feature/:enabled";
    const params = { enabled: true };

    expect(buildPath(route, params)).toBe("/feature/true");
  });

  it("handles numeric values", () => {
    const route = "/page/:num";
    const params = { num: 42 };

    expect(buildPath(route, params)).toBe("/page/42");
  });

  it("handles special characters in parameter values", () => {
    const route = "/users/:name";
    const params = { name: "john&doe=test+plus" };

    expect(buildPath(route, params)).toBe("/users/john%26doe%3Dtest%2Bplus");
  });

  it("handles empty params object", () => {
    const route = "/static/path";
    expect(buildPath(route, {})).toBe("/static/path");
  });
});
