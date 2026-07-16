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
import { useWatchApiData } from "../../../utils/bloomApi";

const RecordingMeterAndText: FunctionComponent<{
    inputDevice: { iconSrc: string; title: string } | undefined;
    shouldDisplay: boolean;
    audioDevices: string[];
    audioRecorder: IAudioRecorder;
    uiLanguage: string;
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
                <span>{`${new Intl.NumberFormat(props.uiLanguage).format(1)}) `}</span>
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
                <BloomTooltip
                    tip={props.inputDevice ? props.inputDevice.title : ""}
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
                        src={
                            props.inputDevice
                                ? props.inputDevice.iconSrc
                                : "/bloom/bookEdit/toolbox/talkingBook/microphone.svg"
                        }
                        alt="mic"
                        css={css`
                            &:hover {
                                transform: scale(1.05);
                            }
                        `}
                    ></img>
                </BloomTooltip>
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

const TalkingBookButton: FunctionComponent<{
    status: Status;
    enabledImgFile: string;
    expectedImgFile?: string;
    activeImgFile?: string;
    size: number;
    dontMoveRight?: boolean;
    stepNum?: number;
    uiLanguage?: string;
    hideStepNum?: boolean;
    l10nKey: string;
    l10nText: string;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onClickCapture?: (event) => void;
    onClick?: () => void;
}> = (props) => {
    const {
        status,
        enabledImgFile,
        expectedImgFile,
        activeImgFile,
        size,
        dontMoveRight,
        stepNum,
        uiLanguage,
        hideStepNum,
        l10nKey,
        l10nText,
        ...possibleEventHandlers
    } = props;
    let imgFile = enabledImgFile;
    switch (status) {
        case Status.Active:
            imgFile = activeImgFile ?? enabledImgFile;
            break;
        case Status.Expected:
            imgFile = expectedImgFile ?? enabledImgFile;
            break;
        default:
            imgFile = enabledImgFile;
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
                enabled={status !== Status.Disabled}
                hasText={false}
                alreadyLocalized={true}
                enabledImageFile={imgFile}
                disabledImageFile={imgFile}
                disableRipple
                disableFocusRipple
                css={css`
                    width: ${size}px;
                    height: ${size}px;
                    pointer-events: none;
                    opacity: ${status !== Status.Disabled ? 1 : 0.4};
                    img {
                        height: ${size}px;
                        width: ${size}px;
                        margin-left: -20px;
                        pointer-events: auto;
                    }
                    &:hover {
                        background-color: transparent;
                        transform: ${status !== Status.Disabled
                            ? `translateX(${dontMoveRight ? "0px" : "0.5px"}) scale(1.05)`
                            : "none"};
                    }
                `}
                {...possibleEventHandlers}
            ></BloomButton>
            <div
                css={css`
                    color: ${status === Status.Expected
                        ? kBloomYellow
                        : kBloomBuff};
                `}
            >
                {!hideStepNum && stepNum && uiLanguage && (
                    <span>{`${new Intl.NumberFormat(uiLanguage).format(stepNum)}) `}</span>
                )}
                <Span l10nKey={l10nKey}>{l10nText}</Span>
            </div>
        </div>
    );
};

export const TalkingBookToolControls: FunctionComponent<{
    audioRecorder: IAudioRecorder;
}> = (props) => {
    const uiLanguage = useWatchApiData(
        "currentUiLanguage",
        "en",
        "app",
        "uiLanguageChanged",
    );
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
                        width: calc(100% - 15px);
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
                    uiLanguage={uiLanguage}
                />
                <div
                    css={css`
                        color: ${kBloomBuff};
                    `}
                >
                    <span>{`${new Intl.NumberFormat(uiLanguage).format(2)}) `}</span>
                    <Span l10nKey="EditTab.Toolbox.TalkingBookTool.LookAtSentenceLabel">
                        Look at the highlighted text
                    </Span>
                </div>
                {/* record/speak button */}
                <TalkingBookButton
                    status={uiState.buttons.record}
                    enabledImgFile="/bloom/bookEdit/toolbox/talkingBook/record_enabled.svg"
                    expectedImgFile="/bloom/bookEdit/toolbox/talkingBook/record_expected.svg"
                    activeImgFile="/bloom/bookEdit/toolbox/talkingBook/record_active.svg"
                    size={40}
                    stepNum={3}
                    uiLanguage={uiLanguage}
                    l10nKey="EditTab.Toolbox.TalkingBookTool.SpeakLabel"
                    l10nText="Speak"
                    onMouseDown={() => {
                        props.audioRecorder.startRecordCurrentAsync();
                    }}
                    onMouseUp={() => {
                        props.audioRecorder.endRecordCurrentAsync();
                    }}
                />
                {/* play/check button */}
                <TalkingBookButton
                    status={uiState.buttons.play}
                    enabledImgFile="/bloom/images/play_enabled.svg"
                    expectedImgFile="/bloom/bookEdit/toolbox/talkingBook/play_expected.svg"
                    activeImgFile="/bloom/bookEdit/toolbox/talkingBook/pause_yellow.svg"
                    size={45}
                    stepNum={4}
                    uiLanguage={uiLanguage}
                    hideStepNum={uiState.buttons.play === Status.Active}
                    l10nKey={
                        uiState.buttons.play === Status.Active
                            ? "Common.Pause"
                            : "EditTab.Toolbox.TalkingBookTool.CheckLabel"
                    }
                    l10nText={
                        uiState.buttons.play === Status.Active
                            ? "Pause"
                            : "Check"
                    }
                    onClickCapture={(event) => {
                        if (event.ctrlKey) {
                            props.audioRecorder.playESpeakPreview();
                        } else {
                            props.audioRecorder.togglePlayCurrentAsync();
                        }
                    }}
                />
                {/* adjust timings button, displayed only when recording the whole textbox */}
                {props.audioRecorder.recordingMode ===
                    RecordingMode.TextBox && (
                    <TalkingBookButton
                        status={uiState.buttons.split}
                        enabledImgFile="/bloom/bookEdit/toolbox/talkingBook/adjustTimings.svg"
                        size={45}
                        dontMoveRight
                        stepNum={5}
                        uiLanguage={uiLanguage}
                        l10nKey="EditTab.Toolbox.TalkingBookTool.AdjustTimings"
                        l10nText="Adjust Timings..."
                        onClick={() => {
                            props.audioRecorder.showAdjustTimingsDialog();
                        }}
                    />
                )}
                {/* next button */}
                <TalkingBookButton
                    status={uiState.buttons.next}
                    enabledImgFile="/bloom/bookEdit/toolbox/talkingBook/next_enabled.svg"
                    expectedImgFile="/bloom/bookEdit/toolbox/talkingBook/next_expected.svg"
                    size={40}
                    stepNum={
                        uiState.recordingMode === RecordingMode.TextBox ? 6 : 5
                    }
                    uiLanguage={uiLanguage}
                    l10nKey="EditTab.Toolbox.TalkingBookTool.NextLabel"
                    l10nText="Next"
                    onClick={() => {
                        props.audioRecorder.moveToNextAudioElement();
                    }}
                />
                {/* back/prev button */}
                <TalkingBookButton
                    status={uiState.buttons.prev}
                    enabledImgFile="/bloom/bookEdit/toolbox/talkingBook/prev_enabled.svg"
                    size={20}
                    l10nKey="EditTab.Toolbox.TalkingBookTool.Back"
                    l10nText="Back"
                    onClick={() => {
                        props.audioRecorder.moveToPrevAudioElementAsync();
                    }}
                />
                {/* clear button */}
                <TalkingBookButton
                    status={uiState.buttons.clear}
                    enabledImgFile="/bloom/bookEdit/toolbox/talkingBook/clear_enabled.svg"
                    size={20}
                    l10nKey="EditTab.Toolbox.TalkingBookTool.Clear"
                    l10nText="Clear"
                    onClick={() => {
                        props.audioRecorder.clearRecordingAsync();
                    }}
                />
                {/* listen to whole page button */}
                <TalkingBookButton
                    status={uiState.buttons.listen}
                    enabledImgFile="/bloom/bookEdit/toolbox/talkingBook/listen_enabled.svg"
                    activeImgFile="/bloom/bookEdit/toolbox/talkingBook/listen_active.svg"
                    size={40}
                    l10nKey="EditTab.Toolbox.TalkingBookTool.Listen"
                    l10nText="Listen to the whole page"
                    onClick={() => {
                        props.audioRecorder.listenAsync();
                    }}
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
