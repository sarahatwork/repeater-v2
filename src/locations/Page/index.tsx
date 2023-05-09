import { Workbench } from "@contentful/f36-workbench";

import BlockFieldDefinitionGenerator from "./BlockFieldDefinitionGenerator";

const Page = () => {
  return (
    <Workbench>
      <Workbench.Header title="Block Repeater App" />
      <Workbench.Content>
        <BlockFieldDefinitionGenerator />
      </Workbench.Content>
    </Workbench>
  );
};

export default Page;
