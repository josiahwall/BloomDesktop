import { css } from "@emotion/react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, Tab, Tabs } from "@mui/material";
import $ from "jquery";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { getToolboxBundleExports } from "../../../js/workspaceFrames";
import { get } from "../../../../utils/bloomApi";
import { useMountEffect } from "../../../../utils/useMountEffect";
import { useL10n } from "../../../../react_components/l10nHooks";
import { Span } from "../../../../react_components/l10nComponents";
import { ReaderSettings, ReaderStage } from "../ReaderSettings";
import { kBloomGreenTeal } from "../../../../utils/colorUtils";

// Keeps the dialog's draft separate from the settings currently used by the toolbox.
const cloneSettings = (source: ReaderSettings): ReaderSettings => {
    return {
        ...source,
        levels: source.levels.map((level) => ({ ...level })),
        stages: source.stages.map((stage) => ({ ...stage })),
    } as ReaderSettings;
};

const cleanSightWords = (words: string): string => {
    return words
        .replace(/[,\r\n]/g, " ")
        .trim()
        .replace(/ {2,}/g, " ");
};

const SortableStageRow: React.FunctionComponent<{
    id: string;
    index: number;
    stage: ReaderStage;
    isSelected: boolean;
    isExpanded: boolean;
    fontName: string;
    onSelect: () => void;
    onToggleExpanded: () => void;
}> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });
    const lettersCellRef = useRef<HTMLSpanElement>(null);
    const sightWordsCellRef = useRef<HTMLSpanElement>(null);
    const [hasWrappedContent, setHasWrappedContent] = useState(false);
    const checkForWrappedContent = useCallback(() => {
        if (props.isExpanded) {
            return;
        }

        setHasWrappedContent(
            [lettersCellRef.current, sightWordsCellRef.current].some(
                (cell) => cell && cell.scrollHeight > cell.clientHeight,
            ),
        );
    }, [props.isExpanded]);

    useLayoutEffect(() => {
        checkForWrappedContent();
        const observer = new ResizeObserver(checkForWrappedContent);
        if (lettersCellRef.current) {
            observer.observe(lettersCellRef.current);
        }
        if (sightWordsCellRef.current) {
            observer.observe(sightWordsCellRef.current);
        }
        return () => observer.disconnect();
    }, [checkForWrappedContent, props.stage.letters, props.stage.sightWords]);

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
            }}
            onClick={props.onSelect}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    props.onSelect();
                }
            }}
            {...attributes}
            {...listeners}
            css={css`
                position: relative;
                display: grid;
                width: 100%;
                box-sizing: border-box;
                grid-template-columns: 76px 88px minmax(0, 1fr);
                align-items: ${props.isExpanded ? "start" : "center"};
                min-height: 42px;
                padding: ${props.isExpanded ? "10px 14px" : "0 14px"};
                border: 0;
                border-bottom: 1px solid #eeeeee;
                background: ${props.isSelected ? "#e4f3f4" : "white"};
                color: #202020;
                font-size: 11pt;
                font-weight: 400;
                text-align: left;
                cursor: grab;
                ${props.isSelected
                    ? `box-shadow: inset 4px 0 ${kBloomGreenTeal};`
                    : ""}
                &:active {
                    cursor: grabbing;
                }
            `}
        >
            <span
                css={css`
                    color: ${props.isSelected ? kBloomGreenTeal : "#202020"};
                `}
            >
                {props.index + 1}
            </span>
            <span
                ref={lettersCellRef}
                css={css`
                    display: block;
                    min-width: 0;
                    box-sizing: border-box;
                    padding-right: 12px;
                    line-height: 18px;
                    overflow-wrap: break-word;
                    ${props.isExpanded
                        ? ""
                        : "max-height: 18px; overflow: hidden;"}
                    color: #202020;
                    font-family: ${props.fontName};
                `}
            >
                {props.stage.letters}
            </span>
            <span
                ref={sightWordsCellRef}
                css={css`
                    display: block;
                    min-width: 0;
                    padding-right: 22px;
                    line-height: 18px;
                    overflow-wrap: break-word;
                    ${props.isExpanded
                        ? ""
                        : "max-height: 18px; overflow: hidden;"}
                    color: #4a4a4a;
                    font-family: ${props.fontName};
                `}
            >
                {cleanSightWords(props.stage.sightWords)}
            </span>
            <button
                type="button"
                aria-label={`${
                    props.isExpanded ? "Hide" : "Show"
                } all of stage ${props.index + 1}`}
                aria-expanded={props.isExpanded}
                disabled={!hasWrappedContent}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation();
                    props.onSelect();
                    if (hasWrappedContent) {
                        props.onToggleExpanded();
                    }
                }}
                css={css`
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    padding: 0;
                    border: 0;
                    background: transparent;
                    color: ${props.isSelected ? kBloomGreenTeal : "#8a929c"};
                    cursor: ${hasWrappedContent ? "pointer" : "default"};
                    transform: ${props.isExpanded ? "rotate(90deg)" : "none"};
                    &:disabled {
                        opacity: 0.5;
                    }
                    .MuiSvgIcon-root {
                        font-size: 22px;
                    }
                `}
            >
                <ChevronRightIcon />
            </button>
        </div>
    );
};

export const DecodableStagesSetup: React.FunctionComponent<{
    onSettingsLoaded: (settings: ReaderSettings) => void;
}> = (props) => {
    const [settings, setSettings] = useState<ReaderSettings>();
    const [fontName, setFontName] = useState("");
    const [selectedStageIndex, setSelectedStageIndex] = useState(0);
    const [stageIds, setStageIds] = useState<string[]>([]);
    const [expandedStageIds, setExpandedStageIds] = useState<Set<string>>(
        new Set(),
    );
    const nextStageId = React.useRef(0);
    const stageSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );
    const lettersTab = useL10n("Letters", "ReaderSetup.Letters");
    const sampleWordsTab = useL10n("Sample Words", "ReaderSetup.SampleWords");
    const stagesTab = useL10n(
        "Decodable Stages",
        "ReaderSetup.DecodableStages",
    );
    const activateLongPressForSightWords = useCallback(
        (textarea: HTMLTextAreaElement | null) => {
            if (textarea) {
                getToolboxBundleExports()?.activateLongPressFor($(textarea));
            }
        },
        [],
    );

    // The settings API is external to React, so it must be synchronized when this dialog mounts.
    useMountEffect(() => {
        get("readers/io/readerToolSettings", (result) => {
            const source =
                typeof result.data === "string"
                    ? (JSON.parse(result.data) as ReaderSettings)
                    : (result.data as ReaderSettings);
            const copy = cloneSettings(source);
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

    const stage = settings.stages[selectedStageIndex]!;
    const allLetters = settings.letters.trim().split(/\s+/).filter(Boolean);
    const previousLetters = new Set(
        settings.stages
            .slice(0, selectedStageIndex)
            .flatMap((previousStage) => previousStage.letters.split(" ")),
    );
    const stageLetters = new Set(stage.letters.split(" "));
    const matchingWords = Array.from(
        new Set(
            settings.stages
                .slice(0, selectedStageIndex + 1)
                .flatMap((oneStage) =>
                    cleanSightWords(oneStage.sightWords).split(/\s+/),
                )
                .filter(Boolean),
        ),
    ).sort((firstWord, secondWord) => firstWord.localeCompare(secondWord));

    const updateStage = (change: (updatedStage: ReaderStage) => void) => {
        const updatedSettings = cloneSettings(settings);
        change(updatedSettings.stages[selectedStageIndex]!);
        setSettings(updatedSettings);
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

    const addNewStage = () => {
        const updatedSettings = cloneSettings(settings);
        updatedSettings.stages.push(
            new ReaderStage((updatedSettings.stages.length + 1).toString()),
        );
        setSettings(updatedSettings);
        setSelectedStageIndex(updatedSettings.stages.length - 1);
        setStageIds([...stageIds, `decodable-stage-${nextStageId.current++}`]);
        props.onSettingsLoaded(updatedSettings);
    };

    const removeSelectedStage = () => {
        const updatedSettings = cloneSettings(settings);
        updatedSettings.stages.splice(selectedStageIndex, 1);
        setSelectedStageIndex(Math.max(0, selectedStageIndex - 1));
        setStageIds(
            stageIds.filter((_, index) => index !== selectedStageIndex),
        );
        setSettings(updatedSettings);
        props.onSettingsLoaded(updatedSettings);
    };

    const reorderStages = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = stageIds.indexOf(active.id as string);
        const newIndex = stageIds.indexOf(over.id as string);
        if (oldIndex < 0 || newIndex < 0) {
            return;
        }

        const selectedStageId = stageIds[selectedStageIndex]!;
        const updatedSettings = cloneSettings(settings);
        updatedSettings.stages = arrayMove(
            updatedSettings.stages,
            oldIndex,
            newIndex,
        );
        const reorderedStageIds = arrayMove(stageIds, oldIndex, newIndex);
        setStageIds(reorderedStageIds);
        setSelectedStageIndex(reorderedStageIds.indexOf(selectedStageId));
        setSettings(updatedSettings);
        props.onSettingsLoaded(updatedSettings);
    };

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
                value={2}
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
                        color: ${kBloomGreenTeal} !important;
                    }
                    .MuiTabs-indicator {
                        background-color: ${kBloomGreenTeal};
                    }
                `}
            >
                <Tab label={lettersTab} />
                <Tab label={sampleWordsTab} />
                <Tab label={stagesTab} />
            </Tabs>
            <div
                css={css`
                    display: grid;
                    grid-template-columns: minmax(280px, 34%) minmax(0, 1fr);
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
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        min-width: 0;
                        min-height: 0;
                        border-right: 1px solid #e5e5e5;
                    `}
                >
                    <div
                        css={css`
                            display: grid;
                            grid-template-columns: 76px 88px 1fr;
                            padding: 11px 14px;
                            background: #fafafa;
                            border-bottom: 1px solid #e5e5e5;
                            color: #8a929c;
                            font-size: 8pt;
                            font-weight: 700;
                            letter-spacing: 0.03em;
                            text-transform: uppercase;
                        `}
                    >
                        <Span l10nKey="ReaderSetup.StageLabel">Stage</Span>
                        <Span l10nKey="ReaderSetup.lettersHeader">Letters</Span>
                        <Span l10nKey="ReaderSetup.SightWordsHeader">
                            Sight Words
                        </Span>
                    </div>
                    <div
                        css={css`
                            flex: 1 1 auto;
                            min-height: 0;
                            overflow-y: auto;
                        `}
                    >
                        <DndContext
                            sensors={stageSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={reorderStages}
                        >
                            <SortableContext
                                items={stageIds}
                                strategy={verticalListSortingStrategy}
                            >
                                {settings.stages.map((oneStage, index) => (
                                    <SortableStageRow
                                        key={stageIds[index]}
                                        id={stageIds[index]!}
                                        index={index}
                                        stage={oneStage}
                                        isSelected={
                                            index === selectedStageIndex
                                        }
                                        isExpanded={expandedStageIds.has(
                                            stageIds[index]!,
                                        )}
                                        fontName={fontName}
                                        onSelect={() =>
                                            setSelectedStageIndex(index)
                                        }
                                        onToggleExpanded={() => {
                                            const stageId = stageIds[index]!;
                                            setExpandedStageIds(
                                                (previousExpandedStageIds) => {
                                                    const updatedExpandedStageIds =
                                                        new Set(
                                                            previousExpandedStageIds,
                                                        );
                                                    if (
                                                        updatedExpandedStageIds.has(
                                                            stageId,
                                                        )
                                                    ) {
                                                        updatedExpandedStageIds.delete(
                                                            stageId,
                                                        );
                                                    } else {
                                                        updatedExpandedStageIds.add(
                                                            stageId,
                                                        );
                                                    }
                                                    return updatedExpandedStageIds;
                                                },
                                            );
                                        }}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <div
                            css={css`
                                width: 100%;
                                border-bottom: 1px solid #eeeeee;
                            `}
                        >
                            <Button
                                onClick={addNewStage}
                                startIcon={<AddIcon />}
                                css={css`
                                    justify-content: flex-start;
                                    min-height: 42px;
                                    padding: 0 14px;
                                    border-radius: 0;
                                    color: ${kBloomGreenTeal};
                                    font-size: 11pt;
                                    font-weight: 500;
                                    letter-spacing: 0;
                                    text-transform: none;
                                    .MuiButton-startIcon {
                                        margin-right: 6px;
                                        svg {
                                            font-size: 18px;
                                        }
                                    }
                                `}
                            >
                                <Span l10nKey="ReaderSetup.AddStage">
                                    Add Stage
                                </Span>
                            </Button>
                        </div>
                    </div>
                    <div
                        css={css`
                            display: flex;
                            align-items: center;
                            margin-top: auto;
                            flex: 0 0 40px;
                            box-sizing: border-box;
                            padding: 0 14px;
                            color: #858a8e;
                            font-size: 8pt;
                            border-top: 1px solid #eeeeee;
                        `}
                    >
                        <Span l10nKey="ReaderSetup.ReorderStages">
                            Drag rows to reorder stages.
                        </Span>
                        <Button
                            onClick={removeSelectedStage}
                            disabled={settings.stages.length === 1}
                            startIcon={<DeleteOutlineIcon />}
                            css={css`
                                margin-left: auto;
                                min-width: 0;
                                min-height: 28px;
                                padding: 0;
                                color: #858a8e;
                                font-size: 8pt;
                                font-weight: 400;
                                letter-spacing: 0;
                                text-transform: none;
                                .MuiButton-startIcon {
                                    margin-right: 5px;
                                    svg {
                                        font-size: 16px;
                                    }
                                }
                            `}
                        >
                            <Span
                                l10nKey="ReaderSetup.RemoveStage"
                                l10nParam0={(selectedStageIndex + 1).toString()}
                            >
                                Remove Stage {selectedStageIndex + 1}
                            </Span>
                        </Button>
                    </div>
                </div>
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
                                background: ${kBloomGreenTeal};
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
                                color: #7c8490;
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
                                    updatedStage.sightWords =
                                        event.target.value;
                                })
                            }
                            css={css`
                                display: block;
                                width: 325px;
                                height: 35px;
                                box-sizing: border-box;
                                resize: none;
                                overflow: auto;
                                scrollbar-gutter: stable;
                                border: 1px solid #d8dce0;
                                border-radius: 6px;
                                padding: 8px;
                                color: #202020;
                                font-family: ${fontName};
                                font-size: 10pt;
                                line-height: 17px;
                                &:focus {
                                    outline: none;
                                    border-color: ${kBloomGreenTeal};
                                }
                            `}
                        />
                        <div
                            css={css`
                                margin-top: 7px;
                                margin-bottom: 20px;
                                color: #7c8490;
                                font-size: 9pt;
                            `}
                        >
                            Separate words with spaces.
                        </div>
                        <div
                            css={css`
                                margin-bottom: 10px;
                                color: #7c8490;
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
                                                ? `1px solid ${kBloomGreenTeal}`
                                                : isPrevious
                                                  ? `2px solid ${kBloomGreenTeal}`
                                                  : "1px solid #e2e5e7"};
                                            border-radius: 6px;
                                            background: ${isCurrent
                                                ? kBloomGreenTeal
                                                : "white"};
                                            color: ${isCurrent
                                                ? "white"
                                                : isPrevious
                                                  ? kBloomGreenTeal
                                                  : "#b7bec5"};
                                            cursor: ${isPrevious
                                                ? "default"
                                                : "pointer"};
                                            font-family: ${fontName};
                                            font-size: 14pt;
                                        `}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                        <div
                            css={css`
                                margin-top: 12px;
                                color: #7c8490;
                                font-size: 9pt;
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
                                    color: ${kBloomGreenTeal};
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
                                    <span
                                        key={word}
                                        css={css`
                                            padding: 4px 10px;
                                            border-radius: 16px;
                                            background: #f1f3f4;
                                            color: #4a4a4a;
                                            font-family: ${fontName};
                                            font-size: 11pt;
                                        `}
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
