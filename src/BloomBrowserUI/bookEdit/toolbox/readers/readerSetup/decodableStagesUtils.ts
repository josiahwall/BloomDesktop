import { ReaderSettings } from "../ReaderSettings";

export const cloneReaderSettings = (source: ReaderSettings): ReaderSettings => {
    return {
        ...source,
        levels: source.levels.map((level) => ({ ...level })),
        stages: source.stages.map((stage) => ({ ...stage })),
    } as ReaderSettings;
};

export const cleanSightWords = (words: string): string => {
    return words
        .replace(/[,\r\n]/g, " ")
        .trim()
        .replace(/ {2,}/g, " ");
};
