import {
  addReferencesNodeToRichTextValue,
  parsePropertyDefinitions,
} from "./propertyUtils";

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

  it("supports dropdowns", () => {
    expect(
      parsePropertyDefinitions(
        "Optional Dropdown:dropdown-Twitter-Instagram-Pet Finder,Required Dropdown:dropdown-Twitter-Instagram-Pet Finder!"
      )
    ).toEqual([
      {
        label: "Optional Dropdown",
        name: "optionalDropdown",
        type: "dropdown",
        options: ["Twitter", "Instagram", "Pet Finder"],
        isRequired: false,
      },
      {
        label: "Required Dropdown",
        name: "requiredDropdown",
        type: "dropdown",
        options: ["Twitter", "Instagram", "Pet Finder"],
        isRequired: true,
      },
    ]);
  });

  it("throws error on invalid definition format", () => {
    expect(() =>
      parsePropertyDefinitions("Titletext!,Featured Image:media")
    ).toThrowError("Invalid property definition: Titletext!");
  });

  it("throw error on invalid dropdown", () => {
    expect(() => parsePropertyDefinitions("Network:dropdown")).toThrowError(
      "Missing options for dropdown definition: Network:dropdown"
    );
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
      \\"media\\",
      \\"richText\\",
      \\"boolean\\",
      \\"dropdown\\"
    ],
    \\"path\\": [],
    \\"message\\": \\"Invalid enum value. Expected 'text' | 'media' | 'richText' | 'boolean' | 'dropdown', received 'banana'\\"
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
