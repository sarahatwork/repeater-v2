import { TBlockFieldType } from "./types";
import {
  addReferencesNodeToRichTextValue,
  parseBlockFieldDefinitions,
  parseSdkBlocks,
  stringifyBlocksForSdk,
} from "./utils";

const TEST_SDK_BLOCKS = [
  {
    id: "500dc77b-0127-477a-bb64-abe87ddd809d",
    data__REPEATER: {
      image: {
        label: "Image",
        type: "mediaSingle" as TBlockFieldType,
        isRequired: true,
        name: "image",
        data: {
          sys: {
            type: "Link",
            linkType: "Asset",
            id: "4WsHqDzyBOrDdKR0f3TAFZ",
          },
        },
      },
      caption: {
        label: "Caption",
        type: "richText" as TBlockFieldType,
        isRequired: true,
        name: "caption",
        data: {
          nodeType: "document",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Julian loves to play with the rope toy",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
          references: [],
        },
      },
      photoCredit: {
        label: "Photo Credit",
        type: "text" as TBlockFieldType,
        isRequired: false,
        name: "photoCredit",
        data: "Sarah Mogin",
      },
      featured: {
        label: "Featured",
        type: "boolean" as TBlockFieldType,
        isRequired: false,
        name: "featured",
        data: true,
      },
    },
  },
  {
    id: "7d2bae59-9335-45d6-8f58-6046954c6962",
    data__REPEATER: {
      image: {
        label: "Image",
        type: "mediaSingle" as TBlockFieldType,
        isRequired: true,
        name: "image",
        data: {
          sys: {
            type: "Link",
            linkType: "Asset",
            id: "363uwOPxBTIj34ZD0zNVMA",
          },
        },
      },
      caption: {
        label: "Caption",
        type: "richText" as TBlockFieldType,
        isRequired: true,
        name: "caption",
        data: {
          nodeType: "document",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Julian is a ",
                  marks: [],
                  data: {},
                },
                {
                  nodeType: "text",
                  value: "cuddle bug.",
                  marks: [{ type: "underline" }],
                  data: {},
                },
              ],
            },
          ],
          references: [],
        },
      },
      photoCredit: {
        label: "Photo Credit",
        type: "text" as TBlockFieldType,
        isRequired: false,
        name: "photoCredit",
        data: null,
      },
      featured: {
        label: "Featured",
        type: "boolean" as TBlockFieldType,
        isRequired: false,
        name: "featured",
        data: null,
      },
    },
  },
];

const TEST_PARSED_BLOCKS = [
  {
    id: "500dc77b-0127-477a-bb64-abe87ddd809d",
    fields: [
      {
        label: "Image",
        type: "mediaSingle" as TBlockFieldType,
        isRequired: true,
        name: "image",
        value: {
          sys: {
            type: "Link",
            linkType: "Asset",
            id: "4WsHqDzyBOrDdKR0f3TAFZ",
          },
        },
      },
      {
        label: "Caption",
        type: "richText" as TBlockFieldType,
        isRequired: true,
        name: "caption",
        value: {
          nodeType: "document",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Julian loves to play with the rope toy",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
          references: [],
        },
      },
      {
        label: "Photo Credit",
        type: "text" as TBlockFieldType,
        isRequired: false,
        name: "photoCredit",
        value: "Sarah Mogin",
      },
      {
        label: "Featured",
        type: "boolean" as TBlockFieldType,
        isRequired: false,
        name: "featured",
        value: true,
      },
    ],
  },
  {
    id: "7d2bae59-9335-45d6-8f58-6046954c6962",
    fields: [
      {
        label: "Image",
        type: "mediaSingle" as TBlockFieldType,
        isRequired: true,
        name: "image",
        value: {
          sys: {
            type: "Link",
            linkType: "Asset",
            id: "363uwOPxBTIj34ZD0zNVMA",
          },
        },
      },
      {
        label: "Caption",
        type: "richText" as TBlockFieldType,
        isRequired: true,
        name: "caption",
        value: {
          nodeType: "document",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Julian is a ",
                  marks: [],
                  data: {},
                },
                {
                  nodeType: "text",
                  value: "cuddle bug.",
                  marks: [{ type: "underline" }],
                  data: {},
                },
              ],
            },
          ],
          references: [],
        },
      },
      {
        label: "Photo Credit",
        type: "text" as TBlockFieldType,
        isRequired: false,
        name: "photoCredit",
        value: null,
      },
      {
        label: "Featured",
        type: "boolean" as TBlockFieldType,
        isRequired: false,
        name: "featured",
        value: null,
      },
    ],
  },
];

describe("parseSdkBlocks", () => {
  it("works", () => {
    expect(parseSdkBlocks(TEST_SDK_BLOCKS)).toEqual(TEST_PARSED_BLOCKS);
  });
});

describe("stringifyBlocksForSdk", () => {
  it("works", () => {
    expect(stringifyBlocksForSdk(TEST_PARSED_BLOCKS)).toEqual(TEST_SDK_BLOCKS);
  });
});

describe("parseBlockFieldDefinitions", () => {
  it("works", () => {
    expect(
      parseBlockFieldDefinitions("Title:text!,Featured Image:mediaSingle")
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
        type: "mediaSingle",
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
      parseBlockFieldDefinitions("Titletext!,Featured Image:mediaSingle")
    ).toThrowError("Invalid Block Field Definitions: Titletext!");
  });

  it("throws error on undefined input", () => {
    expect(() => parseBlockFieldDefinitions()).toThrowError(
      "Block Field Definitions input is undefined"
    );
  });

  it("throws error on invalid type", () => {
    expect(() =>
parseBlockFieldDefinitions("Title:banana!,Featured Image:mediaSingle")).
toThrowErrorMatchingInlineSnapshot(`
"[
  {
    \\"received\\": \\"banana\\",
    \\"code\\": \\"invalid_enum_value\\",
    \\"options\\": [
      \\"text\\",
      \\"mediaSingle\\",
      \\"mediaMultiple\\",
      \\"richText\\",
      \\"boolean\\",
      \\"referenceSingle\\",
      \\"referenceMultiple\\"
    ],
    \\"path\\": [],
    \\"message\\": \\"Invalid enum value. Expected 'text' | 'mediaSingle' | 'mediaMultiple' | 'richText' | 'boolean' | 'referenceSingle' | 'referenceMultiple', received 'banana'\\"
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
