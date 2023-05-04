import {
  addReferencesNodeToRichTextValue,
  parseBlockFieldDefinitions,
} from "./utils";

describe("parseBlockFieldDefinitions", () => {
  it("works", () => {
    expect(
      parseBlockFieldDefinitions("Title:text!,Featured Image:media")
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

  it("supports dropdowns", () => {
    expect(
      parseBlockFieldDefinitions(
        "Optional Dropdown:text-Twitter-Instagram-Pet Finder,Required Dropdown:text-Twitter-Instagram-Pet Finder!"
      )
    ).toEqual([
      {
        label: "Optional Dropdown",
        name: "optionalDropdown",
        type: "text",
        options: ["Twitter", "Instagram", "Pet Finder"],
        isRequired: false,
      },
      {
        label: "Required Dropdown",
        name: "requiredDropdown",
        type: "text",
        options: ["Twitter", "Instagram", "Pet Finder"],
        isRequired: true,
      },
    ]);
  });

  it("throws error on invalid definition format", () => {
    expect(() =>
      parseBlockFieldDefinitions("Titletext!,Featured Image:media")
    ).toThrowError("Invalid Block Field Definitions: Titletext!");
  });

  it("throws error on undefined input", () => {
    expect(() => parseBlockFieldDefinitions()).toThrowError(
      "Block Field Definitions input is undefined"
    );
  });

  it("throws error on invalid type", () => {
    expect(() =>
      parseBlockFieldDefinitions("Title:banana!,Featured Image:media")
    ).toThrowErrorMatchingInlineSnapshot(`
"[
  {
    \\"received\\": \\"banana\\",
    \\"code\\": \\"invalid_enum_value\\",
    \\"options\\": [
      \\"text\\",
      \\"media\\",
      \\"richText\\",
      \\"boolean\\"
    ],
    \\"path\\": [],
    \\"message\\": \\"Invalid enum value. Expected 'text' | 'media' | 'richText' | 'boolean', received 'banana'\\"
  }
]"
`);
  });
});

describe("addReferencesNodeToRichTextValue", () => {
  const testData = {
    nodeType: `paragraph`,
    content: [
      {
        nodeType: `text`,
        value: `Inline Link: `,
        data: {},
      },
      {
        nodeType: `embedded-entry-inline`,
        content: [],
        data: {
          target: {
            sys: {
              id: `456`,
              type: `Link`,
              linkType: `Entry`,
            },
          },
        },
      },
      {
        nodeType: `text`,
        value: ``,
        data: {},
      },
    ],
    data: {
      target: {
        sys: {
          id: `123`,
          type: `Link`,
          linkType: `Asset`,
        },
      },
    },
  };
  expect(addReferencesNodeToRichTextValue(testData)).toEqual({
    ...testData,
    references: [
      {
        contentful_id: "123",
        type: "Asset",
      },
      {
        contentful_id: "456",
        type: "Entry",
      },
    ],
  });
});
