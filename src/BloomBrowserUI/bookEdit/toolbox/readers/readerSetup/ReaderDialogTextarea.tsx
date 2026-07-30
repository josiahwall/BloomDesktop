import * as React from "react";
import { useCallback } from "react";
import { getToolboxBundleExports } from "../../../js/workspaceFrames";
import $ from "jquery";

export const ReaderDialogTextarea: React.FunctionComponent<{
    updateSettings: (value: string) => void;
    value: string;
    className?: string;
}> = (props) => {
    const activateLongPressForSightWords = useCallback(
        (textarea: HTMLTextAreaElement | null) => {
            if (textarea) {
                getToolboxBundleExports()?.activateLongPressFor($(textarea));
            }
        },
        [],
    );
    return (
        <textarea
            aria-label="New Sight Words"
            ref={activateLongPressForSightWords}
            value={props.value}
            onChange={(event) => props.updateSettings(event.target.value)}
            onBlur={(event) => props.updateSettings(event.currentTarget.value)}
            className={props.className}
        />
    );
};
