import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { json } from "@codemirror/lang-json";

export default {
  json: json,
  shell: () => StreamLanguage.define(shell)
};
