import { EditableDivUtils } from "./editableDivUtils";

export function createValidXhtmlUniqueId(): string {
    let newId = EditableDivUtils.createUuid();
    if (/^\d/.test(newId)) {
        newId = "i" + newId; // valid ID in XHTML can't start with digit
    }

    return newId;
}
