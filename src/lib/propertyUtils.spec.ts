import { parsePropertyDefinitions } from "./propertyUtils";

describe("parsePropertyDefinitions", () => {
  it("works", () => {
    expect(
      parsePropertyDefinitions("Title:text!,Featured Image:media")
    ).toEqual([
      {
        label: "Title",
        name: "title",
        type: "text",
        isRequired: true,
      },
      {
        label: "Featured Image",
        name: "featuredImage",
        type: "media",
        isRequired: false,
      },
    ]);
  });

  it("throws error on invalid definition format", () => {
    expect(() =>
      parsePropertyDefinitions("Titletext!,Featured Image:media")
    ).toThrowError("Invalid property definition: Titletext!");
  });

  it("throws error on undefined input", () => {
    expect(() => parsePropertyDefinitions()).toThrowError(
      "Property definition input is undefined"
    );
  });

  it("throws error on invalid type", () => {
    expect(() => parsePropertyDefinitions("Title:banana!,Featured Image:media"))
      .toThrowErrorMatchingInlineSnapshot(`
"[
  {
    \\"received\\": \\"banana\\",
    \\"code\\": \\"invalid_enum_value\\",
    \\"options\\": [
      \\"text\\",
      \\"media\\"
    ],
    \\"path\\": [],
    \\"message\\": \\"Invalid enum value. Expected 'text' | 'media', received 'banana'\\"
  }
]"
`);
  });
});
