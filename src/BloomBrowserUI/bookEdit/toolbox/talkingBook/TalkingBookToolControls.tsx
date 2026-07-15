import { css, ThemeProvider } from "@emotion/react";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { toolboxTheme } from "../../../bloomMaterialUITheme";
import { Span } from "../../../react_components/l10nComponents";
import BloomButton from "../../../react_components/bloomButton";
import { Link } from "../../../react_components/link";
import { IAudioRecorder } from "./IAudioRecorder";
import { Status, TalkingBookUiState } from "./TalkingBookUiState";
import { kBloomPanelBackground, kBloomYellow } from "../../../utils/colorUtils";
import { RecordingMode } from "./recordingMode";
import { TalkingBookAdvancedSection } from "./talkingBookAdvancedSection";
import { BloomTooltip } from "../../../react_components/BloomToolTip";
import { Menu } from "@mui/material";
import { LocalizableMenuItem } from "../../../react_components/localizableMenuItem";

const RecordingMeterAndText: FunctionComponent<{
    level: string;
    inputDevice: { iconSrc: string; title: string };
    shouldDisplay: boolean;
    audioDevices: string[];
    audioRecorder: IAudioRecorder;
}> = (props) => {
    const meterCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const meterCanvas = meterCanvasRef.current;
        if (!meterCanvas) return;
        const ctx = meterCanvas.getContext("2d");
        if (!ctx) return;
        const height = 15;
        const width = 80;

        ctx.fillStyle = window.getComputedStyle(
            meterCanvas.parentElement!,
        ).backgroundColor!;

        ctx.fillRect(0, 0, width, height);

        // Draw the appropriate number and color of bars
        const gap = 2;
        const barWidth = 4;
        const interval = gap + barWidth;
        const bars = Math.floor(width / interval);
        const loudBars = 2;
        const quietBars = 2;
        const mediumBars = Math.max(bars - (loudBars + quietBars), 1);
        const showBars = Math.floor(bars * parseFloat(props.level)); // + 1;
        ctx.fillStyle = "#D2D2D2"; // should match text color or "#00FF00";
        for (let i = 0; i < showBars; i++) {
            const left = interval * i;
            if (i >= quietBars) ctx.fillStyle = "#0C8597";
            if (i >= quietBars + mediumBars) ctx.fillStyle = "#FF0000"; //red
            ctx.fillRect(left, 0, barWidth, height);
        }
    }, [props.level]);
    return (
        <>
            <div>
                <span>{"1) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.CheckSettingsLabel">
                    Check that you are recording into the correct device and
                    that these levels are showing blue:
                </Span>
            </div>
            <BloomTooltip
                tip={props.inputDevice.title}
                placement="bottom-end"
                slotProps={{
                    tooltip: { sx: { width: "auto", maxWidth: "165px" } },
                }}
            >
                <img
                    onClick={() => props.audioRecorder.changeInputDevice()}
                    width={30}
                    height={30}
                    src={props.inputDevice.iconSrc}
                    alt="mic"
                ></img>
            </BloomTooltip>
            <canvas ref={meterCanvasRef} width={80} height={15}></canvas>
            <Menu
                open={props.shouldDisplay}
                css={css`
                    z-index: 18002;
                `}
            >
                {props.audioDevices.map((item, index) => (
                    <LocalizableMenuItem
                        key={index}
                        onClick={() => props.audioRecorder.setInputDevice(item)}
                        english={item.replace(/Microphone \(([^\)]*)\)?/, "$1")}
                        l10nId={null}
                    />
                ))}
            </Menu>
        </>
    );
};

const RecordButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    let imgFile = "";
    switch (props.status) {
        case Status.Active:
            imgFile = "record_active.svg";
            break;
        case Status.Disabled:
            imgFile = "record_enabled.svg";
            break;
        case Status.Enabled:
            imgFile = "record_enabled.svg";
            break;
        case Status.Expected:
            imgFile = "record_expected.svg";
            break;
    }
    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile={`/bloom/bookEdit/toolbox/talkingBook/${imgFile}`}
                disabledImageFile={`/bloom/bookEdit/toolbox/talkingBook/${imgFile}`}
                disableRipple
                disableFocusRipple
                onMouseDown={() => {
                    props.audioRecorder.startRecordCurrentAsync();
                }}
                onMouseUp={() => {
                    props.audioRecorder.endRecordCurrentAsync();
                }}
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                <span>{"3) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.SpeakLabel">
                    Speak
                </Span>
            </div>
        </>
    );
};

const PlayButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    let imgFile = "";
    switch (props.status) {
        case Status.Active:
            imgFile = "/bloom/bookEdit/toolbox/talkingBook/pause_yellow.svg";
            break;
        case Status.Disabled:
            imgFile = "/bloom/images/play_enabled.svg";
            break;
        case Status.Enabled:
            imgFile = "/bloom/images/play_enabled.svg";
            break;
        case Status.Expected:
            imgFile = "/bloom/bookEdit/toolbox/talkingBook/play_expected.svg";
            break;
    }

    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile={`${imgFile}`}
                disabledImageFile={`${imgFile}`}
                disableRipple
                disableFocusRipple
                onClick={() => {
                    props.audioRecorder.togglePlayCurrentAsync();
                }}
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                {props.status !== Status.Active && <span>{"4) "}</span>}
                <Span
                    l10nKey={
                        props.status === Status.Active
                            ? "Common.Pause"
                            : "EditTab.Toolbox.TalkingBookTool.CheckLabel"
                    }
                >
                    {props.status !== Status.Active ? "Check" : "Pause"}
                </Span>
            </div>
        </>
    );
};

const AdjustTimingsButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile="/bloom/bookEdit/toolbox/talkingBook/adjustTimings.svg"
                disabledImageFile="/bloom/bookEdit/toolbox/talkingBook/adjustTimings.svg"
                disableRipple
                disableFocusRipple
                onClick={() => {
                    props.audioRecorder.showAdjustTimingsDialog();
                }}
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                <span>{"5) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.AdjustTimings">
                    Adjust Timings...
                </Span>
            </div>
        </>
    );
};

const NextButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    let imgFile =
        props.status === Status.Expected
            ? "next_expected.svg"
            : "next_enabled.svg";
    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile={`/bloom/bookEdit/toolbox/talkingBook/${imgFile}`}
                disabledImageFile={`/bloom/bookEdit/toolbox/talkingBook/${imgFile}`}
                disableRipple
                disableFocusRipple
                onClick={() => {
                    props.audioRecorder.moveToNextAudioElement();
                }}
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                <span>
                    {props.audioRecorder.recordingMode === RecordingMode.TextBox
                        ? "6) "
                        : "5) "}
                </span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.NextLabel">
                    Next
                </Span>
            </div>
        </>
    );
};

const PrevButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile="/bloom/bookEdit/toolbox/talkingBook/prev_enabled.svg"
                disabledImageFile="/bloom/bookEdit/toolbox/talkingBook/prev_enabled.svg"
                disableRipple
                disableFocusRipple
                onClick={() =>
                    props.audioRecorder.moveToPrevAudioElementAsync()
                }
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <Span
                l10nKey="EditTab.Toolbox.TalkingBookTool.Back"
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                Back
            </Span>
        </>
    );
};

const ClearButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile="/bloom/bookEdit/toolbox/talkingBook/clear_enabled.svg"
                disabledImageFile="/bloom/bookEdit/toolbox/talkingBook/clear_enabled.svg"
                disableRipple
                disableFocusRipple
                onClick={() => {
                    props.audioRecorder.clearRecordingAsync();
                }}
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <Span
                l10nKey="EditTab.Toolbox.TalkingBookTool.Clear"
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                Clear
            </Span>
        </>
    );
};

const ListenButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    let imgFile =
        props.status === Status.Active
            ? "listen_active.svg"
            : "listen_enabled.svg";
    return (
        <>
            <BloomButton
                l10nKey="already-localized"
                variant="text"
                enabled={props.status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile={`/bloom/bookEdit/toolbox/talkingBook/${imgFile}`}
                disabledImageFile={`/bloom/bookEdit/toolbox/talkingBook/${imgFile}`}
                disableRipple
                disableFocusRipple
                onClick={() => {
                    props.audioRecorder.listenAsync();
                }}
                css={css`
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <Span
                l10nKey="EditTab.Toolbox.TalkingBookTool.Listen"
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : "White"};
                `}
            >
                Listen to the whole page
            </Span>
        </>
    );
};

export const TalkingBookToolControls: FunctionComponent<{
    audioRecorder: IAudioRecorder;
}> = (props) => {
    const [uiState, setUiState] = useState<TalkingBookUiState>(
        props.audioRecorder.uiState,
    );

    useEffect(() => {
        return props.audioRecorder.registerStateListener((newState) => {
            setUiState(newState);
        });
    }, [props.audioRecorder]);

    return (
        <ThemeProvider theme={toolboxTheme}>
            {uiState.inShowPlaybackOrderMode && (
                <div
                    css={css`
                        z-index: 1001;
                        opacity: 0.7;
                        position: fixed;
                        top: inherit;
                        background-color: ${kBloomPanelBackground};
                        height: 100%;
                        width: calc(100% - 20px);
                    `}
                ></div>
            )}
            <RecordingMeterAndText
                level={uiState.peakLevel}
                inputDevice={uiState.inputDevice}
                shouldDisplay={uiState.shouldShowDeviceMenu}
                audioDevices={uiState.audioDevices}
                audioRecorder={props.audioRecorder}
            />
            <div>
                <span>{"2) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.LookAtSentenceLabel">
                    Look at the highlighted text
                </Span>
            </div>
            <RecordButton
                status={uiState.buttons.record}
                audioRecorder={props.audioRecorder}
            />
            <PlayButton
                status={uiState.buttons.play}
                audioRecorder={props.audioRecorder}
            />
            {props.audioRecorder.recordingMode === RecordingMode.TextBox && (
                <AdjustTimingsButton
                    status={uiState.buttons.split}
                    audioRecorder={props.audioRecorder}
                />
            )}
            <NextButton
                status={uiState.buttons.next}
                audioRecorder={props.audioRecorder}
            />
            <PrevButton
                status={uiState.buttons.prev}
                audioRecorder={props.audioRecorder}
            />
            <ClearButton
                status={uiState.buttons.clear}
                audioRecorder={props.audioRecorder}
            />
            <ListenButton
                status={uiState.buttons.listen}
                audioRecorder={props.audioRecorder}
            />
            <TalkingBookAdvancedSection
                recordingMode={uiState.recordingMode}
                haveACurrentTextboxModeRecording={
                    uiState.haveACurrentTextboxModeRecording
                }
                setRecordingMode={(recordingMode) =>
                    props.audioRecorder.setRecordingMode(recordingMode)
                }
                hasAudio={uiState.hasAudio}
                hasRecordableDivs={uiState.hasRecordableDivs}
                handleImportRecordingClick={() =>
                    props.audioRecorder.handleImportRecordingClick()
                }
                insertSegmentMarker={() =>
                    props.audioRecorder.insertSegmentMarker()
                }
                inShowPlaybackOrderMode={uiState.inShowPlaybackOrderMode}
                setShowPlaybackOrder={(isOn) =>
                    props.audioRecorder.setShowPlaybackOrder(isOn)
                }
                showingImageDescriptions={uiState.showingImageDescriptions}
                setShowingImageDescriptions={(isOn) =>
                    props.audioRecorder.setShowingImageDescriptions(isOn)
                }
            />
            <div
                css={css`
                    position: relative;
                    z-index: 1002;
                `}
            >
                <Link
                    l10nKey="Common.Help"
                    href="/bloom/api/help?topic=Tasks/Edit_tasks/Record_Audio/Talking_Book_Tool_overview.htm"
                >
                    Help
                </Link>
            </div>
        </ThemeProvider>
    );
};
