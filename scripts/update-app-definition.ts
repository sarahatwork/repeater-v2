import contentful from "contentful-management";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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
        id: "field1Type",
        type: "Enum",
        name: "Field 1 Type",
        options: [{ none: "None" }, { text: "Text" }, { slug: "Slug" }],
        default: "none",
        required: true,
      },
    ],
  };

  await appDefinition.update();
};

run();
