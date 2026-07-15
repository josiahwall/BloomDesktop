import { css, ThemeProvider } from "@emotion/react";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import {
    toolboxMenuPopupTheme,
    toolboxTheme,
} from "../../../bloomMaterialUITheme";
import { Span } from "../../../react_components/l10nComponents";
import BloomButton from "../../../react_components/bloomButton";
import { Link } from "../../../react_components/link";
import { IAudioRecorder } from "./IAudioRecorder";
import { Status, TalkingBookUiState } from "./TalkingBookUiState";
import {
    kBloomBuff,
    kBloomPanelBackground,
    kBloomYellow,
} from "../../../utils/colorUtils";
import { RecordingMode } from "./recordingMode";
import { TalkingBookAdvancedSection } from "./talkingBookAdvancedSection";
import { BloomTooltip } from "../../../react_components/BloomToolTip";
import { Menu } from "@mui/material";
import { LocalizableMenuItem } from "../../../react_components/localizableMenuItem";
import { useMountEffect } from "../../../utils/useMountEffect";

const RecordingMeterAndText: FunctionComponent<{
    inputDevice: { iconSrc: string; title: string } | undefined;
    shouldDisplay: boolean;
    audioDevices: string[];
    audioRecorder: IAudioRecorder;
}> = (props) => {
    const meterCanvasRef = useRef<HTMLCanvasElement>(null);

    useMountEffect(() => {
        props.audioRecorder.setLevelCanvas(meterCanvasRef.current);

        return () => props.audioRecorder.setLevelCanvas(null);
    });

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();

    return (
        <>
            <div
                css={css`
                    color: ${kBloomBuff};
                `}
            >
                <span>{"1) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.CheckSettingsLabel">
                    Check that you are recording into the correct device and
                    that these levels are showing blue:
                </Span>
            </div>
            <div
                css={css`
                    margin-top: 5px;
                    margin-bottom: 12px;
                `}
            >
                {props.inputDevice && (
                    <BloomTooltip
                        tip={props.inputDevice.title}
                        placement="bottom-end"
                        slotProps={{
                            tooltip: {
                                sx: { width: "auto", maxWidth: "165px" },
                            },
                        }}
                    >
                        <img
                            onClick={(event) => {
                                setMenuAnchor(event.currentTarget);
                                props.audioRecorder.changeInputDevice();
                            }}
                            width={30}
                            height={30}
                            src={props.inputDevice.iconSrc}
                            alt="mic"
                        ></img>
                    </BloomTooltip>
                )}
                <canvas ref={meterCanvasRef} width={80} height={15}></canvas>
            </div>
            <ThemeProvider theme={toolboxMenuPopupTheme}>
                <Menu
                    anchorEl={menuAnchor}
                    open={props.shouldDisplay}
                    css={css`
                        margin-top: 1px;
                        margin-left: -2px;
                        margin-right: -13px;
                    `}
                    slotProps={{
                        paper: {
                            sx: {
                                width: "180px",
                                overflowX: "hidden",
                            },
                        },
                    }}
                    onClose={() => props.audioRecorder.closeDeviceSelectMenu()}
                >
                    {props.audioDevices.map((item, index) => (
                        <LocalizableMenuItem
                            key={index}
                            onClick={() =>
                                props.audioRecorder.setInputDevice(item)
                            }
                            english={item.replace(
                                /Microphone \(([^\)]*)\)?/,
                                "$1",
                            )}
                            l10nId={null}
                            hasLeadingIconSpace={false}
                            labelCss={css`
                                font-size: 12px;
                                white-space: nowrap;
                            `}
                            css={css`
                                min-height: 20px;
                                padding-left: 5px;
                                padding-top: 3px;
                                padding-bottom: 3px;
                                margin-top: 0;
                            `}
                        />
                    ))}
                </Menu>
            </ThemeProvider>
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
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                    width: 40px;
                    height: 40px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 40px;
                        width: 40px;
                        margin-left: -20px;
                    }
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : kBloomBuff};
                `}
            >
                <span>{"3) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.SpeakLabel">
                    Speak
                </Span>
            </div>
        </div>
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
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                onClickCapture={(event) => {
                    if (event.ctrlKey) {
                        props.audioRecorder.playESpeakPreview();
                    } else {
                        props.audioRecorder.togglePlayCurrentAsync();
                    }
                }}
                css={css`
                    width: 45px;
                    height: 45px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 45px;
                        width: 45px;
                        margin-left: -20px;
                    }
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : kBloomBuff};
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
        </div>
    );
};

const AdjustTimingsButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    return (
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                    width: 45px;
                    height: 45px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 45px;
                        width: 45px;
                        margin-left: -20px;
                    }
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : kBloomBuff};
                `}
            >
                <span>{"5) "}</span>
                <Span l10nKey="EditTab.Toolbox.TalkingBookTool.AdjustTimings">
                    Adjust Timings...
                </Span>
            </div>
        </div>
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
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                    width: 40px;
                    height: 40px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 40px;
                        width: 40px;
                        margin-left: -20px;
                    }
                    &:hover {
                        background-color: transparent;
                    }
                `}
            ></BloomButton>
            <div
                css={css`
                    color: ${props.status === Status.Expected
                        ? kBloomYellow
                        : kBloomBuff};
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
        </div>
    );
};

const PrevButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    return (
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                    width: 20px;
                    height: 20px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 20px;
                        width: 20px;
                        margin-left: -20px;
                    }
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
                        : kBloomBuff};
                `}
            >
                Back
            </Span>
        </div>
    );
};

const ClearButton: FunctionComponent<{
    status: Status;
    audioRecorder: IAudioRecorder;
}> = (props) => {
    return (
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                    width: 20px;
                    height: 20px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 20px;
                        width: 20px;
                        margin-left: -20px;
                    }
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
                        : kBloomBuff};
                `}
            >
                Clear
            </Span>
        </div>
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
        <div
            css={css`
                display: flex;
                align-items: center;
                margin-top: 10px;
                margin-bottom: 5px;
            `}
        >
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
                    height: 40px;
                    width: 40px;
                    opacity: ${props.status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: 40px;
                        width: 40px;
                        margin-left: -20px;
                    }
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
                        : kBloomBuff};
                `}
            >
                Listen to the whole page
            </Span>
        </div>
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
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                    height: calc(100% - 2 * 15px);
                    padding: 15px;
                `}
            >
                <RecordingMeterAndText
                    inputDevice={uiState.inputDevice}
                    shouldDisplay={uiState.shouldShowDeviceMenu}
                    audioDevices={uiState.audioDevices}
                    audioRecorder={props.audioRecorder}
                />
                <div
                    css={css`
                        color: ${kBloomBuff};
                    `}
                >
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
                {props.audioRecorder.recordingMode ===
                    RecordingMode.TextBox && (
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
                        margin-top: auto;
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
            </div>
        </ThemeProvider>
    );
};
