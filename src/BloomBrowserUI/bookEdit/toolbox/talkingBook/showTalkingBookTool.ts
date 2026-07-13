import { getToolboxBundleExports } from "../../js/workspaceFrames";

const kTalkingBookToolId = "talkingBook";

export function showTalkingBookTool() {
    getToolboxBundleExports()
        ?.getTheOneToolbox()
        .activateToolFromId(kTalkingBookToolId);
}
