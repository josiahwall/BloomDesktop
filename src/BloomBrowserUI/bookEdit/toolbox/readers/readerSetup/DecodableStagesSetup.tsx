import { css } from "@emotion/react";
import { Chip, Tab, Tabs } from "@mui/material";
import $ from "jquery";
import * as React from "react";
import { useCallback, useState } from "react";
import { getToolboxBundleExports } from "../../../js/workspaceFrames";
import { get } from "../../../../utils/bloomApi";
import { useMountEffect } from "../../../../utils/useMountEffect";
import { useL10n } from "../../../../react_components/l10nHooks";
import { Div, Span } from "../../../../react_components/l10nComponents";
import { ReaderSettings, ReaderStage } from "../ReaderSettings";
import { kBloomBlue } from "../../../../utils/colorUtils";
import { ReaderDialogPhaseSection } from "./ReaderDialogPhaseSection";
import { cleanSightWords, cloneReaderSettings } from "./decodableStagesUtils";

const kMutedText = "#707477";
import { Link } from "../../../../react_components/link";

export const DecodableStagesSetup: React.FunctionComponent<{
    onSettingsLoaded: (settings: ReaderSettings) => void;
}> = (props) => {
    const [settings, setSettings] = useState<ReaderSettings>();
    const [fontName, setFontName] = useState("");
    const [stageIds, setStageIds] = useState<string[]>([]);
    const [curTab, setCurTab] = useState<number>(2);
    const nextStageId = React.useRef(0);

    const lettersTab = useL10n("Letters", "ReaderSetup.Letters");
    const sampleWordsTab = useL10n("Sample Words", "ReaderSetup.SampleWords");
    const stagesTab = useL10n(
        "Decodable Stages",
        "ReaderSetup.DecodableStages",
    );

    // The settings API is external to React, so it must be synchronized when this dialog mounts.
    useMountEffect(() => {
        get("readers/io/readerToolSettings", (result) => {
            const source =
                typeof result.data === "string"
                    ? (JSON.parse(result.data) as ReaderSettings)
                    : (result.data as ReaderSettings);
            const copy = cloneReaderSettings(source);
            if (copy.stages.length === 0) {
                copy.stages.push(new ReaderStage("1"));
            }
            setStageIds(
                copy.stages.map(
                    () => `decodable-stage-${nextStageId.current++}`,
                ),
            );
            setSettings(copy);
            props.onSettingsLoaded(copy);
        });
        get("collection/defaultFont", (result) => setFontName(result.data));
    });

    if (!settings) {
        return <div />;
    }

    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                height: 100%;
                min-height: 0;
                margin: -20px -24px;
                background: #f4f5f5;
            `}
        >
            <Tabs
                value={curTab}
                aria-label="Reader setup tabs"
                css={css`
                    min-height: 50px;
                    padding: 0 6px;
                    background: white;
                    border-bottom: 1px solid #e5e5e5;
                    .MuiTab-root {
                        min-height: 50px;
                        min-width: 0;
                        padding: 0 22px;
                        font-size: 15px;
                        text-transform: none;
                        font-weight: 600;
                    }
                    .Mui-selected {
                        color: ${kBloomBlue} !important;
                    }
                    .MuiTabs-indicator {
                        background-color: ${kBloomBlue};
                    }
                `}
            >
                <Tab label={lettersTab} onClick={() => setCurTab(0)} />
                <Tab label={sampleWordsTab} onClick={() => setCurTab(1)} />
                <Tab label={stagesTab} onClick={() => setCurTab(2)} />
            </Tabs>
            <div
                css={css`
                    flex: 1 1 auto;
                    min-height: 0;
                    margin: 24px;
                    background: white;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
                    overflow: hidden;
                `}
            >
                {curTab === 0 ? (
                    <LettersTab
                        settings={settings}
                        setSettings={setSettings}
                        fontName={fontName}
                        onSettingsLoaded={props.onSettingsLoaded}
                    />
                ) : (
                    curTab === 2 && (
                        <StagesTab
                            settings={settings}
                            setSettings={setSettings}
                            stageIds={stageIds}
                            nextStageId={nextStageId}
                            setStageIds={setStageIds}
                            setCurTab={setCurTab}
                            fontName={fontName}
                            onSettingsLoaded={props.onSettingsLoaded}
                        />
                    )
                )}
            </div>
        </div>
    );
};

const LettersTab: React.FunctionComponent<{
    settings: ReaderSettings;
    setSettings: (value: ReaderSettings) => void;
    fontName: string;
    onSettingsLoaded: (settings: ReaderSettings) => void;
}> = (props) => {
    const updateLetters = (change: (settings: ReaderSettings) => void) => {
        const updatedSettings = cloneReaderSettings(props.settings);
        change(updatedSettings);
        props.setSettings(updatedSettings);
        props.onSettingsLoaded(updatedSettings);
    };
    return (
        <div
            css={css`
                grid-column: 1 / -1;
                min-width: 0;
                padding: 22px;
                box-sizing: border-box;
            `}
        >
            <Div
                l10nKey="ReaderSetup.Letters.Header"
                css={css`
                    margin-bottom: 7px;
                    color: ${kMutedText};
                    font-size: 8pt;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                `}
            >
                Letters and Letter Combinations
            </Div>
            <textarea
                aria-label="Letters and Letter Combinations"
                value={props.settings.letters}
                onChange={(event) =>
                    updateLetters((settings) => {
                        settings.letters = event.target.value;
                    })
                }
                css={css`
                    display: block;
                    width: 325px;
                    height: 55px;
                    box-sizing: border-box;
                    resize: none;
                    overflow: auto;
                    border: 1px solid #d8dce0;
                    border-radius: 6px;
                    padding: 8px;
                    color: #202020;
                    font-family: ${props.fontName};
                    font-size: 10pt;
                    line-height: 17px;
                    &:focus {
                        outline: none;
                        border-color: ${kBloomBlue};
                        border-width: 2px;
                        padding: 7px 6.5px;
                    }
                `}
            />
            <Div
                css={css`
                    margin-top: 7px;
                    margin-bottom: 24px;
                    color: ${kMutedText};
                    font-size: 9pt;
                `}
                l10nKey="ReaderSetup.Letters.Intro"
            >
                To help you make decodable readers, Bloom needs to know the
                letters and letter combinations that you will be teaching.
            </Div>
            <Div
                l10nKey="ReaderSetup.Letters.LetterHelp1"
                css={css`
                    max-width: 720px;
                    margin-bottom: 4px;
                    color: ${kMutedText};
                    font-size: 9pt;
                    line-height: 1.45;
                `}
            >
                Separate each letter or letter combination with a space. For
                example, here is what we might use for the English language:
            </Div>
            <div
                css={css`
                    max-width: 720px;
                    margin-bottom: 24px;
                    color: ${kMutedText};
                    font-size: 9pt;
                    line-height: 1.45;
                `}
            >
                a b c ch d e f g h i j k l m n ng o p q r s sh t th u v w x y z
                ' -
            </div>
            <div
                css={css`
                    max-width: 720px;
                    margin-bottom: 24px;
                    color: ${kMutedText};
                    font-size: 9pt;
                    line-height: 1.45;
                `}
            >
                <Span l10nKey="ReaderSetup.Letters.LetterHelp2">
                    Notice that the English list includes symbols that are used
                    to make words, like ' in&nbsp;
                </Span>
                <Span
                    l10nKey="ReaderSetup.Letters.LetterHelp3"
                    css={css`
                        font-style: italic;
                    `}
                >
                    it's
                </Span>
                <Span l10nKey="ReaderSetup.Letters.LetterHelp4">.</Span>
            </div>
            <Div
                l10nKey="ReaderSetup.Letters.LetterHelp5"
                css={css`
                    max-width: 720px;
                    color: ${kMutedText};
                    font-size: 9pt;
                    line-height: 1.45;
                `}
            >
                Do not include punctuation in this list. Bloom does not support
                the inclusion of punctuation in decodable stages.
            </Div>
        </div>
    );
};

const StagesTab: React.FunctionComponent<{
    settings: ReaderSettings;
    setSettings: (value: ReaderSettings) => void;
    stageIds: string[];
    nextStageId: React.MutableRefObject<number>;
    setStageIds: (value: string[]) => void;
    setCurTab: (value: number) => void;
    fontName: string;
    onSettingsLoaded: (settings: ReaderSettings) => void;
}> = (props) => {
    const [selectedStageIndex, setSelectedStageIndex] = useState(0);

    useMountEffect(() => {
        const configuredLetters = new Set(
            props.settings.letters
                .replace(/[,\r\n]/g, " ")
                .trim()
                .split(/\s+/)
                .filter(Boolean),
        );

        const updatedSettings = cloneReaderSettings(props.settings);
        let changed = false;

        for (const stage of updatedSettings.stages) {
            const filteredLetters = stage.letters
                .split(/\s+/)
                .filter((letter) => configuredLetters.has(letter))
                .join(" ");

            if (stage.letters !== filteredLetters) {
                stage.letters = filteredLetters;
                changed = true;
            }
        }

        if (changed) {
            props.setSettings(updatedSettings);
            props.onSettingsLoaded(updatedSettings);
        }
    });

    const activateLongPressForSightWords = useCallback(
        (textarea: HTMLTextAreaElement | null) => {
            if (textarea) {
                getToolboxBundleExports()?.activateLongPressFor($(textarea));
            }
        },
        [],
    );

    const stage = props.settings.stages[selectedStageIndex]!;

    const stageLetters = new Set(stage.letters.split(" "));
    const matchingWords = Array.from(
        new Set(
            props.settings.stages
                .slice(0, selectedStageIndex + 1)
                .flatMap((oneStage) =>
                    cleanSightWords(oneStage.sightWords).split(/\s+/),
                )
                .filter(Boolean),
        ),
    ).sort((firstWord, secondWord) => firstWord.localeCompare(secondWord));

    const allLetters = props.settings.letters
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const previousLetters = new Set(
        props.settings.stages
            .slice(0, selectedStageIndex)
            .flatMap((previousStage) => previousStage.letters.split(" ")),
    );

    const updateStage = (change: (updatedStage: ReaderStage) => void) => {
        const updatedSettings = cloneReaderSettings(props.settings);
        change(updatedSettings.stages[selectedStageIndex]!);
        props.setSettings(updatedSettings);
        props.onSettingsLoaded(updatedSettings);
    };

    const selectLetter = (letter: string) => {
        if (previousLetters.has(letter)) {
            return;
        }
        updateStage((updatedStage) => {
            const updatedLetters = new Set(updatedStage.letters.split(" "));
            if (updatedLetters.has(letter)) {
                updatedLetters.delete(letter);
            } else {
                updatedLetters.add(letter);
            }
            updatedStage.letters = allLetters
                .filter((knownLetter) => updatedLetters.has(knownLetter))
                .join(" ");
        });
    };

    return (
        <div
            css={css`
                display: grid;
                grid-template-columns: minmax(280px, 34%) minmax(0, 1fr);
                height: 100%;
            `}
        >
            <ReaderDialogPhaseSection
                settings={props.settings}
                setSettings={props.setSettings}
                stageIds={props.stageIds}
                nextStageId={props.nextStageId}
                setStageIds={props.setStageIds}
                selectedStageIndex={selectedStageIndex}
                setSelectedStageIndex={setSelectedStageIndex}
                onSettingsLoaded={props.onSettingsLoaded}
                fontName={props.fontName}
            />
            <div
                css={css`
                    display: grid;
                    grid-template-columns: minmax(300px, 65%) minmax(0, 1fr);
                    grid-template-rows: 56px 1fr;
                    min-width: 0;
                    min-height: 0;
                `}
            >
                <div
                    css={css`
                        grid-column: 1 / -1;
                        display: flex;
                        align-items: center;
                        padding: 0 22px;
                        border-bottom: 1px solid #e5e5e5;
                        font-size: 14pt;
                        font-weight: 600;
                    `}
                >
                    <span
                        css={css`
                            width: 8px;
                            height: 8px;
                            margin-right: 10px;
                            border-radius: 50%;
                            background: ${kBloomBlue};
                        `}
                    />{" "}
                    <Span l10nKey="ReaderSetup.StageLabel">Stage</Span>{" "}
                    {selectedStageIndex + 1}
                </div>
                <div
                    css={css`
                        min-width: 0;
                        padding: 22px;
                    `}
                >
                    <div
                        css={css`
                            margin-bottom: 7px;
                            color: ${kMutedText};
                            font-size: 8pt;
                            font-weight: 700;
                            letter-spacing: 0.03em;
                            text-transform: uppercase;
                        `}
                    >
                        <Span l10nKey="ReaderSetup.SightWordLabel">
                            New Sight Words
                        </Span>
                    </div>
                    <textarea
                        aria-label="New Sight Words"
                        ref={activateLongPressForSightWords}
                        value={stage.sightWords}
                        onChange={(event) =>
                            updateStage((updatedStage) => {
                                updatedStage.sightWords = event.target.value;
                            })
                        }
                        css={css`
                            display: block;
                            width: 325px;
                            height: 35px;
                            box-sizing: border-box;
                            resize: none;
                            overflow: auto;
                            border: 1px solid #d8dce0;
                            border-radius: 6px;
                            padding: 8px;
                            color: #202020;
                            font-family: ${props.fontName};
                            font-size: 10pt;
                            line-height: 17px;
                            &:focus {
                                outline: none;
                                border-color: ${kBloomBlue};
                                border-width: 2px;
                                padding: 7px 6.5px;
                            }
                        `}
                    />
                    <div
                        css={css`
                            margin-top: 7px;
                            margin-bottom: 20px;
                            color: ${kMutedText};
                            font-size: 9pt;
                        `}
                    >
                        Separate words with spaces.
                    </div>
                    <div
                        css={css`
                            margin-bottom: 10px;
                            color: ${kMutedText};
                            font-size: 8pt;
                            font-weight: 700;
                            letter-spacing: 0.03em;
                            text-transform: uppercase;
                        `}
                    >
                        <Span l10nKey="ReaderSetup.SelectedLetters">
                            Previous and New Letters
                        </Span>
                    </div>
                    {allLetters.length === 0 ? (
                        <div
                            css={css`
                                color: ${kMutedText};
                                margin: 20px 0;
                                font-size: 10pt;
                            `}
                        >
                            <Span l10nKey="ReaderSetup.FirstSetupAlphabet">
                                First,
                            </Span>{" "}
                            <Link
                                l10nKey="ReaderSetup.SetupAlphabet"
                                onClick={() => props.setCurTab(0)}
                            >
                                set up the alphabet for this language.
                            </Link>
                        </div>
                    ) : (
                        <div
                            css={css`
                                display: grid;
                                grid-template-columns: repeat(7, 46px);
                                gap: 8px;
                            `}
                        >
                            {allLetters.map((letter) => {
                                const isPrevious = previousLetters.has(letter);
                                const isCurrent = stageLetters.has(letter);
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => selectLetter(letter)}
                                        css={css`
                                            width: 46px;
                                            height: 46px;
                                            border: ${isCurrent
                                                ? `1px solid ${kBloomBlue}`
                                                : isPrevious
                                                  ? `2px solid ${kBloomBlue}`
                                                  : "1px solid #e2e5e7"};
                                            border-radius: 6px;
                                            background: ${isCurrent
                                                ? kBloomBlue
                                                : "white"};
                                            color: ${isCurrent
                                                ? "white"
                                                : isPrevious
                                                  ? kBloomBlue
                                                  : "#b7bec5"};
                                            cursor: ${isPrevious
                                                ? "default"
                                                : "pointer"};
                                            font-family: ${props.fontName};
                                            font-size: 14pt;
                                        `}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div
                        css={css`
                            margin-top: 12px;
                            font-size: 9pt;
                            color: ${kMutedText};
                        `}
                    >
                        <Span l10nKey="ReaderSetup.ClickLetter">
                            Click a letter to add it to this stage.
                        </Span>
                    </div>
                </div>
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        min-width: 0;
                        min-height: 0;
                        background: #fafafa;
                        border-left: 1px solid #e5e5e5;
                    `}
                >
                    <strong
                        css={css`
                            flex: 0 0 auto;
                            padding: 22px 22px 0;
                        `}
                    >
                        <span
                            css={css`
                                color: ${kBloomBlue};
                            `}
                        >
                            {matchingWords.length}{" "}
                        </span>
                        <Span l10nKey="ReaderSetup.MatchingWords">
                            matching words
                        </Span>
                    </strong>
                    <div
                        css={css`
                            flex: 1 1 auto;
                            min-height: 0;
                            overflow: auto;
                            margin-top: 15px;
                        `}
                    >
                        <div
                            css={css`
                                display: flex;
                                flex-wrap: wrap;
                                align-content: flex-start;
                                gap: 8px;
                                min-width: 100%;
                                min-height: 100%;
                                box-sizing: border-box;
                                padding: 0 22px 22px;
                            `}
                        >
                            {matchingWords.map((word) => (
                                <Chip
                                    key={word}
                                    label={word}
                                    css={css`
                                        height: auto;
                                        padding: 4px 10px;
                                        border-radius: 16px;
                                        background: #f1f3f4;
                                        color: #4a4a4a;
                                        font-family: ${props.fontName};
                                        font-size: 11pt;
                                        .MuiChip-label {
                                            padding: 0;
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
