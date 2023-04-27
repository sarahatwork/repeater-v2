import contentful from "contentful-management";
import dotenv from "dotenv";
// import { PropertyTypes } from "../src/constants.ts";
// import { TPropertyTypeValue } from "../src/types.ts";

dotenv.config({ path: ".env.local" });

// const FIELD_TYPE_TO_LABEL: Record<TPropertyTypeValue, string> = {
//   [PropertyTypes.NONE]: "None",
//   [PropertyTypes.TEXT]: "Text",
//   [PropertyTypes.MEDIA]: "Media",
// };

// const options = Object.entries(FIELD_TYPE_TO_LABEL).map(([k, v]) => ({
//   [k]: v,
// }));

const run = async () => {
  if (!process.env.CONTENTFUL_CONTENT_MANAGEMENT_TOKEN)
    throw new Error("Missing CONTENTFUL_CONTENT_MANAGEMENT_TOKEN");

  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_CONTENT_MANAGEMENT_TOKEN,
  });
  const org = await client.getOrganization("7mEAnTknsJyos3weSjkJDO");
  const appDefinition = await org.getAppDefinition("2qCbX8TKJAgr3txm02ctOz");

  appDefinition.parameters = {
    instance: [
      {
        id: "PropertyTypes",
        type: "Symbol",
        name: "Field Types",
        default: "text",
        required: true,
      },
    ],
  };

  await appDefinition.update();
};

run();
