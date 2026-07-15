import { StringListCheckbox } from "../../../react_components/stringListCheckbox";
import { RecordingMode } from "./recordingMode";

export enum Status {
    Disabled, // Can't use button now (e.g., Play when there is no recording)
    DisabledUnlessHover, // Same as disabled, except it will become enabled if the user hovers over it.
    Enabled, // Can use now, not the most likely thing to do next
    Expected, // The most likely/appropriate button to use next (e.g., Play right after recording)
    Active, // Button now active (Play while playing; Record while held down)
}

export interface TalkingBookUiState {
    buttons: Record<
        "record" | "play" | "split" | "next" | "prev" | "clear" | "listen",
        Status
    >;
    isPlaying: boolean; // drives the Check/Pause label swap
    splitButtonVisible: boolean; // today: updateSplitButton's wrapper classes
    recordingMode: RecordingMode;
    hasAudio: boolean;
    hasRecordableDivs: boolean;
    haveACurrentTextboxModeRecording: boolean;
    inShowPlaybackOrderMode: boolean;
    showingImageDescriptions: boolean;
    inputDevice: { iconSrc: string; title: string };
    shouldShowDeviceMenu: boolean;
    audioDevices: string[];
    peakLevel: string;
    disableEverything: boolean; // the overlay
}
