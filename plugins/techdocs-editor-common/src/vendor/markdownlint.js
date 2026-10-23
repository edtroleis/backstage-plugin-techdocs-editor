/* eslint-disable */
// Gerado por scripts/bundle-markdownlint.mjs a partir de markdownlint@0.42.0 e dependências
// (licenças em THIRD_PARTY_NOTICES.md). Não editar à mão.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/markdownlint/helpers/shared.cjs
var require_shared = __commonJS({
  "../../node_modules/markdownlint/helpers/shared.cjs"(exports, module) {
    "use strict";
    module.exports.flatTokensSymbol = /* @__PURE__ */ Symbol("flat-tokens");
    module.exports.htmlFlowSymbol = /* @__PURE__ */ Symbol("html-flow");
    module.exports.newlineRe = /\r\n?|\n/g;
    module.exports.nextLinesRe = /[\r\n][\s\S]*$/;
  }
});

// ../../node_modules/markdownlint/helpers/micromark-helpers.cjs
var require_micromark_helpers = __commonJS({
  "../../node_modules/markdownlint/helpers/micromark-helpers.cjs"(exports, module) {
    "use strict";
    var { flatTokensSymbol: flatTokensSymbol2, htmlFlowSymbol: htmlFlowSymbol2, newlineRe: newlineRe2 } = require_shared();
    function inHtmlFlow3(token) {
      return Object.hasOwn(token, htmlFlowSymbol2);
    }
    function isHtmlFlowComment4(token) {
      const { text: text4, type } = token;
      if (type === "htmlFlow" && text4.startsWith("<!--") && text4.endsWith("-->")) {
        const comment = text4.slice(4, -3);
        return !comment.startsWith(">") && !comment.startsWith("->") && !comment.endsWith("-");
      }
      return false;
    }
    function addRangeToSet7(set, start, end) {
      for (let i = start; i <= end; i++) {
        set.add(i);
      }
    }
    function filterByPredicate7(tokens, allowed, transformChildren) {
      const result = [];
      const queue = [
        {
          "array": tokens,
          "index": 0
        }
      ];
      while (queue.length > 0) {
        const current = queue[queue.length - 1];
        const { array, index } = current;
        if (index < array.length) {
          const token = array[current.index++];
          if (allowed(token)) {
            result.push(token);
          }
          const { children } = token;
          if (children.length > 0) {
            const transformed = transformChildren ? transformChildren(token) : children;
            queue.push(
              {
                "array": transformed,
                "index": 0
              }
            );
          }
        } else {
          queue.pop();
        }
      }
      return result;
    }
    function filterByTypes6(tokens, types, htmlFlow2) {
      const predicate = (token) => types.includes(token.type) && (htmlFlow2 || !inHtmlFlow3(token));
      const flatTokens = (
        // @ts-ignore
        tokens[flatTokensSymbol2]
      );
      return flatTokens ? flatTokens.filter(predicate) : filterByPredicate7(tokens, predicate);
    }
    function getBlockQuotePrefixText4(tokens, lineNumber, count = 1) {
      return filterByTypes6(tokens, ["blockQuotePrefix", "linePrefix"]).filter((prefix) => prefix.startLine === lineNumber).map((prefix) => prefix.text).join("").trimEnd().concat("\n").repeat(count);
    }
    function getDescendantsByType14(parent, typePath) {
      let tokens = Array.isArray(parent) ? parent : [parent];
      for (const type of typePath) {
        const predicate = (token) => Array.isArray(type) ? type.includes(token.type) : type === token.type;
        tokens = tokens.flatMap((t) => t.children.filter(predicate));
      }
      return tokens;
    }
    function getHeadingLevel8(heading) {
      let level = 1;
      const headingSequence = heading.children.find(
        (child) => ["atxHeadingSequence", "setextHeadingLine"].includes(child.type)
      );
      const { text: text4 } = headingSequence;
      if (text4[0] === "#") {
        level = Math.min(text4.length, 6);
      } else if (text4[0] === "-") {
        level = 2;
      }
      return level;
    }
    function getHeadingStyle3(heading) {
      if (heading.type === "setextHeading") {
        return "setext";
      }
      const atxHeadingSequenceLength = heading.children.filter(
        (child) => child.type === "atxHeadingSequence"
      ).length;
      return atxHeadingSequenceLength === 1 ? "atx" : "atx_closed";
    }
    function getHeadingText4(heading) {
      return getDescendantsByType14(heading, [["atxHeadingText", "setextHeadingText"]]).flatMap((descendant) => descendant.children.filter((child) => child.type !== "htmlText")).map((data) => data.text).join("").replace(newlineRe2, " ").trim();
    }
    function getHtmlTagInfo6(token) {
      const htmlTagNameRe = /^<([^!>][^/\s>]*)/;
      if (token.type === "htmlText") {
        const match = htmlTagNameRe.exec(token.text);
        if (match) {
          const name = match[1];
          const close = name.startsWith("/");
          return {
            close,
            "name": close ? name.slice(1) : name
          };
        }
      }
      return null;
    }
    function getParentOfType8(token, types) {
      let current = token;
      while ((current = current.parent) && !types.includes(current.type)) {
      }
      return current;
    }
    var docfxTabSyntaxRe = /^#tab\//;
    function isDocfxTab3(heading) {
      if (heading?.type === "atxHeading") {
        const headingTexts = getDescendantsByType14(heading, ["atxHeadingText"]);
        if (headingTexts.length === 1 && headingTexts[0].children.length === 1 && headingTexts[0].children[0].type === "link") {
          const resourceDestinationStrings = filterByTypes6(headingTexts[0].children[0].children, ["resourceDestinationString"]);
          return resourceDestinationStrings.length === 1 && docfxTabSyntaxRe.test(resourceDestinationStrings[0].text);
        }
      }
      return false;
    }
    var nonContentTokens4 = /* @__PURE__ */ new Set([
      "blockQuoteMarker",
      "blockQuotePrefix",
      "blockQuotePrefixWhitespace",
      "gfmFootnoteDefinitionIndent",
      "lineEnding",
      "lineEndingBlank",
      "linePrefix",
      "listItemIndent",
      "undefinedReference",
      "undefinedReferenceCollapsed",
      "undefinedReferenceFull",
      "undefinedReferenceShortcut"
    ]);
    module.exports = {
      addRangeToSet: addRangeToSet7,
      filterByPredicate: filterByPredicate7,
      filterByTypes: filterByTypes6,
      getBlockQuotePrefixText: getBlockQuotePrefixText4,
      getDescendantsByType: getDescendantsByType14,
      getHeadingLevel: getHeadingLevel8,
      getHeadingStyle: getHeadingStyle3,
      getHeadingText: getHeadingText4,
      getHtmlTagInfo: getHtmlTagInfo6,
      getParentOfType: getParentOfType8,
      inHtmlFlow: inHtmlFlow3,
      isDocfxTab: isDocfxTab3,
      isHtmlFlowComment: isHtmlFlowComment4,
      nonContentTokens: nonContentTokens4
    };
  }
});

// ../../node_modules/markdownlint/helpers/helpers.cjs
var require_helpers = __commonJS({
  "../../node_modules/markdownlint/helpers/helpers.cjs"(exports, module) {
    "use strict";
    var micromark = require_micromark_helpers();
    var { newlineRe: newlineRe2, nextLinesRe: nextLinesRe4 } = require_shared();
    module.exports.newLineRe = newlineRe2;
    module.exports.nextLinesRe = nextLinesRe4;
    module.exports.frontMatterRe = // eslint-disable-next-line redos/no-vulnerable, unicorn/prefer-unicode-code-point-escapes
    /((^---[^\S\r\n\u2028\u2029]*$[\s\S]+?^---\s*)|(^\+\+\+[^\S\r\n\u2028\u2029]*$[\s\S]+?^(\+\+\+|\.\.\.)\s*)|(^\{[^\S\r\n\u2028\u2029]*$[\s\S]+?^\}\s*))(\r\n|\r|\n|$)/m;
    var inlineCommentStartRe2 = /(<!--\s*markdownlint-(disable|enable|capture|restore|disable-file|enable-file|disable-line|disable-next-line|configure-file))(?:\s|-->)/gi;
    module.exports.inlineCommentStartRe = inlineCommentStartRe2;
    module.exports.endOfLineHtmlEntityRe = /&(?:#\d+|#[xX][\da-fA-F]+|[a-zA-Z]{2,31}|blk\d{2}|emsp1[34]|frac\d{2}|sup\d|there4);$/;
    module.exports.endOfLineGemojiCodeRe = /:(?:[abmovx]|[-+]1|100|1234|(?:1st|2nd|3rd)_place_medal|8ball|clock\d{1,4}|e-mail|non-potable_water|o2|t-rex|u5272|u5408|u55b6|u6307|u6708|u6709|u6e80|u7121|u7533|u7981|u7a7a|[a-z]{2,15}2?|[a-z]{1,14}(?:_[a-z\d]{1,16})+):$/;
    var allPunctuation2 = ".,;:!?\u3002\uFF0C\uFF1B\uFF1A\uFF01\uFF1F";
    module.exports.allPunctuation = allPunctuation2;
    module.exports.allPunctuationNoQuestion = allPunctuation2.replace(/[?？]/gu, "");
    function isBoolean2(obj) {
      return typeof obj === "boolean";
    }
    module.exports.isBoolean = isBoolean2;
    function isNumber2(obj) {
      return typeof obj === "number";
    }
    module.exports.isNumber = isNumber2;
    function isString2(obj) {
      return typeof obj === "string";
    }
    module.exports.isString = isString2;
    function isEmptyString2(str) {
      return str.length === 0;
    }
    module.exports.isEmptyString = isEmptyString2;
    function isObject2(obj) {
      return !!obj && typeof obj === "object" && !Array.isArray(obj);
    }
    module.exports.isObject = isObject2;
    function isUrl2(obj) {
      return !!obj && Object.getPrototypeOf(obj) === URL.prototype;
    }
    module.exports.isUrl = isUrl2;
    function cloneIfArray2(arr) {
      return Array.isArray(arr) ? [...arr] : arr;
    }
    module.exports.cloneIfArray = cloneIfArray2;
    function cloneIfUrl2(url) {
      return isUrl2(url) ? new URL(url) : url;
    }
    module.exports.cloneIfUrl = cloneIfUrl2;
    module.exports.getHtmlAttributeRe = function getHtmlAttributeRe3(name) {
      return new RegExp(`\\s${name}\\s*=\\s*['"]?([^'"\\s>]*)`, "iu");
    };
    function isBlankLine6(line) {
      const startComment = "<!--";
      const endComment = "-->";
      const removeComments = (s) => {
        while (true) {
          const start = s.indexOf(startComment);
          const end = s.indexOf(endComment);
          if (end !== -1 && (start === -1 || end < start)) {
            s = s.slice(end + endComment.length);
          } else if (start !== -1 && end !== -1) {
            s = s.slice(0, start) + s.slice(end + endComment.length);
          } else if (start !== -1 && end === -1) {
            s = s.slice(0, start);
          } else {
            return s;
          }
        }
      };
      return !line || !line.trim() || !removeComments(line).replace(/>/g, "").trim();
    }
    module.exports.isBlankLine = isBlankLine6;
    var htmlCommentBegin = "<!--";
    var htmlCommentEnd = "-->";
    var safeCommentCharacter = ".";
    var startsWithPipeRe = /^ *\|/;
    var notCrLfRe = /[^\r\n]/g;
    var notSpaceCrLfRe = /[^ \r\n]/g;
    var trailingSpaceRe = /(?<=^|[^ ]) +[\r\n]/g;
    var replaceTrailingSpace = (s) => s.replace(notCrLfRe, safeCommentCharacter);
    module.exports.clearHtmlCommentText = function clearHtmlCommentText2(text4) {
      let i = 0;
      while ((i = text4.indexOf(htmlCommentBegin, i)) !== -1) {
        const j = text4.indexOf(htmlCommentEnd, i + 2);
        if (j === -1) {
          break;
        }
        if (j > i + htmlCommentBegin.length) {
          const content3 = text4.slice(i + htmlCommentBegin.length, j);
          const lastLf = text4.lastIndexOf("\n", i) + 1;
          const preText = text4.slice(lastLf, i);
          const isBlock = preText.trim().length === 0;
          const couldBeTable = startsWithPipeRe.test(preText);
          const spansTableCells = couldBeTable && content3.includes("\n");
          const isValid = isBlock || !(spansTableCells || content3.startsWith(">") || content3.startsWith("->") || content3.endsWith("-") || content3.includes("--"));
          if (isValid) {
            const clearedContent = content3.replace(notSpaceCrLfRe, safeCommentCharacter).replace(trailingSpaceRe, replaceTrailingSpace);
            text4 = text4.slice(0, i + htmlCommentBegin.length) + clearedContent + text4.slice(j);
          }
        }
        i = j + htmlCommentEnd.length;
      }
      return text4;
    };
    module.exports.escapeForRegExp = function escapeForRegExp3(str) {
      return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    function ellipsify2(text4, start, end) {
      if (text4.length <= 30) {
      } else if (start && end) {
        text4 = text4.slice(0, 15) + "..." + text4.slice(-15);
      } else if (end) {
        text4 = "..." + text4.slice(-30);
      } else {
        text4 = text4.slice(0, 30) + "...";
      }
      return text4;
    }
    module.exports.ellipsify = ellipsify2;
    function addError19(onError, lineNumber, detail, context, range, fixInfo) {
      onError({
        lineNumber,
        detail,
        context,
        range,
        fixInfo
      });
    }
    module.exports.addError = addError19;
    function addErrorDetailIf18(onError, lineNumber, expected, actual, detail, context, range, fixInfo) {
      if (expected !== actual) {
        addError19(
          onError,
          lineNumber,
          "Expected: " + expected + "; Actual: " + actual + (detail ? "; " + detail : ""),
          context,
          range,
          fixInfo
        );
      }
    }
    module.exports.addErrorDetailIf = addErrorDetailIf18;
    function addErrorContext21(onError, lineNumber, context, start, end, range, fixInfo) {
      context = ellipsify2(context.replace(newlineRe2, "\n"), start, end);
      addError19(onError, lineNumber, void 0, context, range, fixInfo);
    }
    module.exports.addErrorContext = addErrorContext21;
    var positionLessThanOrEqual = (lineA, columnA, lineB, columnB) => lineA < lineB || lineA === lineB && columnA <= columnB;
    module.exports.hasOverlap = function hasOverlap4(rangeA, rangeB) {
      const lte = positionLessThanOrEqual(rangeA.startLine, rangeA.startColumn, rangeB.startLine, rangeB.startColumn);
      const first = lte ? rangeA : rangeB;
      const second = lte ? rangeB : rangeA;
      return positionLessThanOrEqual(second.startLine, second.startColumn, first.endLine, first.endColumn);
    };
    module.exports.frontMatterHasTitle = function frontMatterHasTitle4(frontMatterLines, frontMatterTitlePattern) {
      const ignoreFrontMatter = frontMatterTitlePattern !== void 0 && !frontMatterTitlePattern;
      const frontMatterTitleRe = new RegExp(
        String(frontMatterTitlePattern || '^\\s*"?title"?\\s*[:=]'),
        "i"
      );
      return !ignoreFrontMatter && frontMatterLines.some((line) => frontMatterTitleRe.test(line));
    };
    function getReferenceLinkImageData2(tokens) {
      const normalizeReference = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
      const getText2 = (t) => t?.children.filter((c) => c.type !== "blockQuotePrefix").map((c) => c.text).join("");
      const references = /* @__PURE__ */ new Map();
      const shortcuts = /* @__PURE__ */ new Map();
      const addReferenceToDictionary = (token, label4, isShortcut) => {
        const referenceDatum = [
          token.startLine - 1,
          token.startColumn - 1,
          token.text.length
        ];
        const reference = normalizeReference(label4);
        const dictionary = isShortcut ? shortcuts : references;
        const referenceData = dictionary.get(reference) || [];
        referenceData.push(referenceDatum);
        dictionary.set(reference, referenceData);
      };
      const definitions = /* @__PURE__ */ new Map();
      const definitionLineIndices = [];
      const duplicateDefinitions = [];
      const filteredTokens = micromark.filterByTypes(
        tokens,
        [
          // definitionLineIndices
          "definition",
          "gfmFootnoteDefinition",
          // definitions and definitionLineIndices
          "definitionLabelString",
          "gfmFootnoteDefinitionLabelString",
          // references and shortcuts
          "gfmFootnoteCall",
          "image",
          "link",
          // undefined link labels
          "undefinedReferenceCollapsed",
          "undefinedReferenceFull",
          "undefinedReferenceShortcut"
        ]
      );
      for (const token of filteredTokens) {
        let labelPrefix = "";
        switch (token.type) {
          case "definition":
          case "gfmFootnoteDefinition":
            for (let i = token.startLine; i <= token.endLine; i++) {
              definitionLineIndices.push(i - 1);
            }
            break;
          case "gfmFootnoteDefinitionLabelString":
            labelPrefix = "^";
          case "definitionLabelString": {
            const reference = normalizeReference(`${labelPrefix}${token.text}`);
            if (definitions.has(reference)) {
              duplicateDefinitions.push([reference, token.startLine - 1]);
            } else {
              const parent = micromark.getParentOfType(token, ["definition"]);
              const destinationString = parent && micromark.getDescendantsByType(parent, ["definitionDestination", "definitionDestinationRaw", "definitionDestinationString"])[0]?.text;
              definitions.set(
                reference,
                [token.startLine - 1, destinationString || ""]
              );
            }
            break;
          }
          case "gfmFootnoteCall":
          case "image":
          case "link": {
            let isShortcut = token.children.length === 1;
            const isFullOrCollapsed = token.children.length === 2 && !token.children.some((t) => t.type === "resource");
            const [labelText] = micromark.getDescendantsByType(token, ["label", "labelText"]);
            const [referenceString] = micromark.getDescendantsByType(token, ["reference", "referenceString"]);
            let label4 = getText2(labelText);
            if (!isShortcut && !isFullOrCollapsed) {
              const [footnoteCallMarker, footnoteCallString] = token.children.filter(
                (t) => ["gfmFootnoteCallMarker", "gfmFootnoteCallString"].includes(t.type)
              );
              if (footnoteCallMarker && footnoteCallString) {
                label4 = `${footnoteCallMarker.text}${footnoteCallString.text}`;
                isShortcut = true;
              }
            }
            if (isShortcut || isFullOrCollapsed) {
              addReferenceToDictionary(token, getText2(referenceString) || label4, isShortcut);
            }
            break;
          }
          case "undefinedReferenceCollapsed":
          case "undefinedReferenceFull":
          case "undefinedReferenceShortcut": {
            const undefinedReference = micromark.getDescendantsByType(token, ["undefinedReference"])[0];
            const label4 = undefinedReference.children.map((t) => t.text).join("");
            const isShortcut = token.type === "undefinedReferenceShortcut";
            addReferenceToDictionary(token, label4, isShortcut);
            break;
          }
        }
      }
      return {
        references,
        shortcuts,
        definitions,
        duplicateDefinitions,
        definitionLineIndices
      };
    }
    module.exports.getReferenceLinkImageData = getReferenceLinkImageData2;
    function getPreferredLineEnding2(input, os2) {
      let cr = 0;
      let lf = 0;
      let crlf = 0;
      const endings = input.match(newlineRe2) || [];
      for (const ending of endings) {
        switch (ending) {
          case "\r":
            cr++;
            break;
          case "\n":
            lf++;
            break;
          case "\r\n":
            crlf++;
            break;
        }
      }
      let preferredLineEnding = null;
      if (!cr && !lf && !crlf) {
        preferredLineEnding = os2 && os2.EOL || "\n";
      } else if (lf >= crlf && lf >= cr) {
        preferredLineEnding = "\n";
      } else if (crlf >= cr) {
        preferredLineEnding = "\r\n";
      } else {
        preferredLineEnding = "\r";
      }
      return preferredLineEnding;
    }
    module.exports.getPreferredLineEnding = getPreferredLineEnding2;
    function expandTildePath2(file, os2) {
      const homedir = os2 && os2.homedir && os2.homedir();
      return homedir ? file.replace(/^~($|\/|\\)/, `${homedir}$1`) : file;
    }
    module.exports.expandTildePath = expandTildePath2;
    function convertLintErrorsVersion3To2(errors) {
      const noPrevious = {
        "ruleNames": [],
        "lineNumber": -1
      };
      return errors.filter((error, index, array) => {
        delete error.fixInfo;
        delete error.severity;
        const previous4 = array[index - 1] || noPrevious;
        return error.ruleNames[0] !== previous4.ruleNames[0] || error.lineNumber !== previous4.lineNumber;
      });
    }
    function convertLintErrorsVersion2To1(errors) {
      for (const error of errors) {
        error.ruleName = error.ruleNames[0];
        error.ruleAlias = error.ruleNames[1] || error.ruleName;
        delete error.ruleNames;
      }
      return errors;
    }
    function convertLintErrorsVersion2To0(errors) {
      const dictionary = {};
      for (const error of errors) {
        const ruleName = error.ruleNames[0];
        const ruleLines = dictionary[ruleName] || [];
        ruleLines.push(error.lineNumber);
        dictionary[ruleName] = ruleLines;
      }
      return dictionary;
    }
    function copyAndTransformResults(results, transform) {
      const newResults = {};
      for (const [key, value] of Object.entries(results)) {
        const arr = value.map((r) => ({ ...r }));
        newResults[key] = transform(arr);
      }
      return newResults;
    }
    module.exports.convertToResultVersion0 = function convertToResultVersion0(results) {
      return copyAndTransformResults(results, (r) => convertLintErrorsVersion2To0(convertLintErrorsVersion3To2(r)));
    };
    module.exports.convertToResultVersion1 = function convertToResultVersion1(results) {
      return copyAndTransformResults(results, (r) => convertLintErrorsVersion2To1(convertLintErrorsVersion3To2(r)));
    };
    module.exports.convertToResultVersion2 = function convertToResultVersion2(results) {
      return copyAndTransformResults(results, convertLintErrorsVersion3To2);
    };
    module.exports.formatLintResults = function formatLintResults(lintResults) {
      const results = [];
      const entries = Object.entries(lintResults || {});
      entries.sort((a, b) => a[0].localeCompare(b[0]));
      for (const [source, lintErrors] of entries) {
        for (const lintError of lintErrors) {
          const { lineNumber, ruleNames, ruleDescription, errorDetail, errorContext, errorRange, severity } = lintError;
          const rule = ruleNames.join("/");
          const line = `:${lineNumber}`;
          const rangeStart = errorRange && errorRange[0] || 0;
          const column = rangeStart ? `:${rangeStart}` : "";
          const description = ruleDescription;
          const detail = errorDetail ? ` [${errorDetail}]` : "";
          const context = errorContext ? ` [Context: "${errorContext}"]` : "";
          results.push(`${source}${line}${column} ${severity} ${rule} ${description}${detail}${context}`);
        }
      }
      return results;
    };
  }
});

// ../../node_modules/markdownlint/lib/markdownit.cjs
var require_markdownit = __commonJS({
  "../../node_modules/markdownlint/lib/markdownit.cjs"(exports, module) {
    "use strict";
    var { newlineRe: newlineRe2 } = require_shared();
    function forEachInlineCodeSpan(input, handler) {
      const backtickRe = /`+/g;
      let match = null;
      const backticksLengthAndIndex = [];
      while ((match = backtickRe.exec(input)) !== null) {
        backticksLengthAndIndex.push([match[0].length, match.index]);
      }
      const newLinesIndex = [];
      while ((match = newlineRe2.exec(input)) !== null) {
        newLinesIndex.push(match.index);
      }
      let lineIndex = 0;
      let lineStartIndex = 0;
      let k = 0;
      for (let i = 0; i < backticksLengthAndIndex.length - 1; i++) {
        const [startLength, startIndex] = backticksLengthAndIndex[i];
        if (startIndex === 0 || input[startIndex - 1] !== "\\") {
          for (let j = i + 1; j < backticksLengthAndIndex.length; j++) {
            const [endLength, endIndex] = backticksLengthAndIndex[j];
            if (startLength === endLength) {
              for (; k < newLinesIndex.length; k++) {
                const newlineIndex = newLinesIndex[k];
                if (startIndex < newlineIndex) {
                  break;
                }
                lineIndex++;
                lineStartIndex = newlineIndex + 1;
              }
              const columnIndex = startIndex - lineStartIndex + startLength;
              handler(
                input.slice(startIndex + startLength, endIndex),
                lineIndex,
                columnIndex,
                startLength
              );
              i = j;
              break;
            }
          }
        }
      }
    }
    function freezeToken(token) {
      if (token.attrs) {
        for (const attr of token.attrs) {
          Object.freeze(attr);
        }
        Object.freeze(token.attrs);
      }
      if (token.children) {
        for (const child of token.children) {
          freezeToken(child);
        }
        Object.freeze(token.children);
      }
      if (token.map) {
        Object.freeze(token.map);
      }
      if (token.meta) {
        for (const meta in token.meta) {
          Object.freeze(meta);
        }
        Object.freeze(token.meta);
      }
      Object.freeze(token);
    }
    function annotateAndFreezeTokens(tokens, lines) {
      let trMap = null;
      const markdownItTokens = tokens;
      for (const token of markdownItTokens) {
        if (token.type === "tr_open") {
          trMap = token.map;
        } else if (token.type === "tr_close") {
          trMap = null;
        }
        if (trMap && !token.map) {
          token.map = [...trMap];
        }
        if (token.map) {
          token.line = lines[token.map[0]];
          token.lineNumber = token.map[0] + 1;
          while (token.map[1] && !(lines[token.map[1] - 1] || "").trim()) {
            token.map[1]--;
          }
        }
        if (token.children) {
          const codeSpanExtraLines = [];
          if (token.children.some((child) => child.type === "code_inline")) {
            forEachInlineCodeSpan(token.content, (code18) => {
              codeSpanExtraLines.push(code18.split(newlineRe2).length - 1);
            });
          }
          let lineNumber = token.lineNumber;
          for (const child of token.children) {
            child.lineNumber = lineNumber;
            child.line = lines[lineNumber - 1];
            if (child.type === "softbreak" || child.type === "hardbreak") {
              lineNumber++;
            } else if (child.type === "code_inline") {
              lineNumber += codeSpanExtraLines.shift() || 0;
            }
          }
        }
        freezeToken(token);
      }
      Object.freeze(tokens);
    }
    function getMarkdownItTokens(markdownIt, content3, lines) {
      const tokens = markdownIt.parse(content3, {});
      annotateAndFreezeTokens(tokens, lines);
      return tokens;
    }
    module.exports = {
      forEachInlineCodeSpan,
      getMarkdownItTokens
    };
  }
});

// ../../node_modules/markdownlint/lib/defer-require.cjs
var require_defer_require = __commonJS({
  "../../node_modules/markdownlint/lib/defer-require.cjs"(exports, module) {
    "use strict";
    function requireMarkdownItCjs2() {
      return require_markdownit();
    }
    module.exports = {
      requireMarkdownItCjs: requireMarkdownItCjs2
    };
  }
});

// ../../node_modules/markdownlint/lib/resolve-module.cjs
var require_resolve_module = __commonJS({
  "../../node_modules/markdownlint/lib/resolve-module.cjs"(exports, module) {
    module.exports = { resolveModule: (id) => {
      throw new Error(`Cannot load "${id}" in the browser`);
    } };
  }
});

// ../../node_modules/markdownlint/lib/node-imports-browser.mjs
var getError = () => new Error("Node APIs are not available in browser context.");
var throwForSync = () => {
  throw getError();
};
var fs = {
  // @ts-ignore
  "access": (path3, callback) => callback(getError()),
  "accessSync": throwForSync,
  // @ts-ignore
  "readFile": (path3, options, callback) => callback(getError()),
  "readFileSync": throwForSync
};
var os = {};

// ../../node_modules/re2js/build/index.js
/*!
* re2js
* RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
*
* @version v2.8.6
* @author Oleksii Vasyliev
* @homepage https://github.com/le0pard/re2js#readme
* @repository github:le0pard/re2js
* @license MIT
*/
var RE2Flags = class RE2Flags2 {
  static FOLD_CASE = 1;
  static LITERAL = 2;
  static CLASS_NL = 4;
  static DOT_NL = 8;
  static ONE_LINE = 16;
  static NON_GREEDY = 32;
  static PERL_X = 64;
  static UNICODE_GROUPS = 128;
  static WAS_DOLLAR = 256;
  static LOOKBEHIND = 512;
  static MATCH_NL = RE2Flags2.CLASS_NL | RE2Flags2.DOT_NL;
  static PERL = RE2Flags2.CLASS_NL | RE2Flags2.ONE_LINE | RE2Flags2.PERL_X | RE2Flags2.UNICODE_GROUPS;
  static POSIX = 0;
  static UNANCHORED = 0;
  static ANCHOR_START = 1;
  static ANCHOR_BOTH = 2;
};
var PublicFlags = {
  CASE_INSENSITIVE: 1,
  DOTALL: 2,
  MULTILINE: 4,
  DISABLE_UNICODE_GROUPS: 8,
  LONGEST_MATCH: 16,
  LOOKBEHINDS: 512
};
var ASCII_SIZE = 128;
var ASCII_TO_UPPER = new Int32Array(ASCII_SIZE);
var ASCII_TO_LOWER = new Int32Array(ASCII_SIZE);
var MAX_BMP = 65535;
for (let i = 0; i < ASCII_SIZE; i++) {
  if (i >= 97 && i <= 122) ASCII_TO_UPPER[i] = i - 32;
  else ASCII_TO_UPPER[i] = i;
  if (i >= 65 && i <= 90) ASCII_TO_LOWER[i] = i + 32;
  else ASCII_TO_LOWER[i] = i;
}
var Codepoint = class {
  static CODES = /* @__PURE__ */ new Map([
    ["\x07", 7],
    ["\b", 8],
    ["	", 9],
    ["\n", 10],
    ["\v", 11],
    ["\f", 12],
    ["\r", 13],
    [" ", 32],
    ['"', 34],
    ["$", 36],
    ["&", 38],
    ["'", 39],
    ["(", 40],
    [")", 41],
    ["*", 42],
    ["+", 43],
    ["-", 45],
    [".", 46],
    ["0", 48],
    ["1", 49],
    ["2", 50],
    ["3", 51],
    ["4", 52],
    ["5", 53],
    ["6", 54],
    ["7", 55],
    ["8", 56],
    ["9", 57],
    [":", 58],
    ["<", 60],
    [">", 62],
    ["?", 63],
    ["A", 65],
    ["B", 66],
    ["C", 67],
    ["F", 70],
    ["P", 80],
    ["Q", 81],
    ["U", 85],
    ["Z", 90],
    ["[", 91],
    ["\\", 92],
    ["]", 93],
    ["^", 94],
    ["_", 95],
    ["`", 96],
    ["a", 97],
    ["b", 98],
    ["f", 102],
    ["i", 105],
    ["m", 109],
    ["n", 110],
    ["r", 114],
    ["s", 115],
    ["t", 116],
    ["v", 118],
    ["x", 120],
    ["z", 122],
    ["{", 123],
    ["|", 124],
    ["}", 125]
  ]);
  static toUpperCase(codepoint) {
    if (codepoint < ASCII_SIZE) return ASCII_TO_UPPER[codepoint];
    const s = String.fromCodePoint(codepoint).toUpperCase();
    const expectedLen = s.codePointAt(0) > MAX_BMP ? 2 : 1;
    if (s.length > expectedLen) return codepoint;
    const sOrigin = String.fromCodePoint(s.codePointAt(0)).toLowerCase();
    const originExpectedLen = sOrigin.codePointAt(0) > MAX_BMP ? 2 : 1;
    if (sOrigin.length > originExpectedLen || sOrigin.codePointAt(0) !== codepoint) return codepoint;
    return s.codePointAt(0);
  }
  static toLowerCase(codepoint) {
    if (codepoint < ASCII_SIZE) return ASCII_TO_LOWER[codepoint];
    const s = String.fromCodePoint(codepoint).toLowerCase();
    const expectedLen = s.codePointAt(0) > MAX_BMP ? 2 : 1;
    if (s.length > expectedLen) return codepoint;
    const sOrigin = String.fromCodePoint(s.codePointAt(0)).toUpperCase();
    const originExpectedLen = sOrigin.codePointAt(0) > MAX_BMP ? 2 : 1;
    if (sOrigin.length > originExpectedLen || sOrigin.codePointAt(0) !== codepoint) return codepoint;
    return s.codePointAt(0);
  }
};
var UnicodeRangeTable = class {
  /**
  * @param {Uint32Array | number[]} data
  * @param {boolean} isStride1
  */
  constructor(data, isStride1 = false) {
    this.data = data;
    this.isStride1 = isStride1;
    this.SIZE = isStride1 ? 2 : 3;
  }
  getLo(index) {
    return this.data[index * this.SIZE];
  }
  getHi(index) {
    return this.data[index * this.SIZE + 1];
  }
  getStride(index) {
    return this.isStride1 ? 1 : this.data[index * this.SIZE + 2];
  }
  get length() {
    return this.data.length / this.SIZE;
  }
};
var B64_MAP = /* @__PURE__ */ new Uint8Array(256);
for (let i = 0, b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-"; i < 64; i++) B64_MAP[b.charCodeAt(i)] = i;
var decodeVLQ = (str) => {
  const res = [];
  let value = 0, shift = 0;
  for (let i = 0; i < str.length; i++) {
    let digit = B64_MAP[str.charCodeAt(i)];
    value |= (digit & 31) << shift;
    if ((digit & 32) === 0) {
      res.push(value);
      value = 0;
      shift = 0;
    } else shift += 5;
  }
  return res;
};
var decodeRanges = (str, isStride1) => {
  const res = decodeVLQ(str);
  const numRanges = isStride1 ? res.length / 2 : res.length / 3;
  const out = new Uint32Array(numRanges * 3);
  let current = 0, resIdx = 0;
  for (let i = 0; i < numRanges; i++) {
    current += res[resIdx++];
    out[i * 3] = current;
    current += res[resIdx++];
    out[i * 3 + 1] = current;
    out[i * 3 + 2] = isStride1 ? 1 : res[resIdx++];
  }
  return out;
};
var decodeOrbit = (str) => {
  const res = decodeVLQ(str);
  const map2 = /* @__PURE__ */ new Map();
  let currentKey = 0;
  for (let i = 0; i < res.length; i += 2) {
    currentKey += res[i];
    const zz = res[i + 1];
    const delta = zz >>> 1 ^ -(zz & 1);
    map2.set(currentKey, currentKey + delta);
  }
  return map2;
};
var LazyMap = class {
  constructor(initializer) {
    this.initializer = initializer;
    this.cache = /* @__PURE__ */ new Map();
  }
  has(key) {
    return key in this.initializer;
  }
  get(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const fn = this.initializer[key];
    const val = fn ? fn() : null;
    this.cache.set(key, val);
    return val;
  }
};
var UnicodeTables = class {
  static _CASE_ORBIT = null;
  static get CASE_ORBIT() {
    if (!this._CASE_ORBIT) this._CASE_ORBIT = decodeOrbit("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC");
    return this._CASE_ORBIT;
  }
  static _Print = null;
  static get Print() {
    if (!this._Print) this._Print = new UnicodeRangeTable(decodeRanges("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB", false));
    return this._Print;
  }
  static CATEGORIES = new LazyMap({
    C: () => new UnicodeRangeTable(decodeRanges("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB", false)),
    Cc: () => new UnicodeRangeTable(decodeRanges("AfgDgB", true)),
    Cf: () => new UnicodeRangeTable(decodeRanges("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB", false)),
    Cn: () => new UnicodeRangeTable(decodeRanges("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB", false)),
    Co: () => new UnicodeRangeTable(decodeRanges("gg4B-nGh4hc9--BD9--B", true)),
    Cs: () => new UnicodeRangeTable(decodeRanges("gg2B--B", true)),
    L: () => new UnicodeRangeTable(decodeRanges("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", false)),
    LC: () => new UnicodeRangeTable(decodeRanges("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB", false)),
    Ll: () => new UnicodeRangeTable(decodeRanges("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB", false)),
    Lm: () => new UnicodeRangeTable(decodeRanges("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB", false)),
    Lo: () => new UnicodeRangeTable(decodeRanges("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", false)),
    Lt: () => new UnicodeRangeTable(decodeRanges("lOGDnB2sH2sHBGBJHBJHBNQQwBAB", false)),
    Lu: () => new UnicodeRangeTable(decodeRanges("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB", false)),
    M: () => new UnicodeRangeTable(decodeRanges("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", false)),
    Mc: () => new UnicodeRangeTable(decodeRanges("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB", false)),
    Me: () => new UnicodeRangeTable(decodeRanges("okBBB1xF-wB-wBBCBCCBsshBCB", false)),
    Mn: () => new UnicodeRangeTable(decodeRanges("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", false)),
    N: () => new UnicodeRangeTable(decodeRanges("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB", false)),
    Nd: () => new UnicodeRangeTable(decodeRanges("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ", true)),
    Nl: () => new UnicodeRangeTable(decodeRanges("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB", false)),
    No: () => new UnicodeRangeTable(decodeRanges("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB", false)),
    P: () => new UnicodeRangeTable(decodeRanges("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", false)),
    Pc: () => new UnicodeRangeTable(decodeRanges("-Cg-Hg-HBUU-u3BBBZCBwHAB", false)),
    Pd: () => new UnicodeRangeTable(decodeRanges("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", false)),
    Pe: () => new UnicodeRangeTable(decodeRanges("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD", false)),
    Pf: () => new UnicodeRangeTable(decodeRanges("7F+6H+6HEddpuDCCFDDQEE", false)),
    Pi: () => new UnicodeRangeTable(decodeRanges("rFt7Ht7HDBBDaapuDCCFDDQEE", false)),
    Po: () => new UnicodeRangeTable(decodeRanges("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", false)),
    Ps: () => new UnicodeRangeTable(decodeRanges("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB", false)),
    S: () => new UnicodeRangeTable(decodeRanges("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", false)),
    Sc: () => new UnicodeRangeTable(decodeRanges("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC", false)),
    Sk: () => new UnicodeRangeTable(decodeRanges("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB", false)),
    Sm: () => new UnicodeRangeTable(decodeRanges("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB", false)),
    So: () => new UnicodeRangeTable(decodeRanges("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", false)),
    Z: () => new UnicodeRangeTable(decodeRanges("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB", false)),
    Zl: () => new UnicodeRangeTable(decodeRanges("ohIA", true)),
    Zp: () => new UnicodeRangeTable(decodeRanges("phIA", true)),
    Zs: () => new UnicodeRangeTable(decodeRanges("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB", false)),
    ASCII_Hex_Digit: () => new UnicodeRangeTable(decodeRanges("wBJIFbF", true)),
    Alphabetic: () => new UnicodeRangeTable(decodeRanges("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", false)),
    Dash: () => new UnicodeRangeTable(decodeRanges("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", false)),
    Emoji: () => new UnicodeRangeTable(decodeRanges("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", false)),
    Emoji_Component: () => new UnicodeRangeTable(decodeRanges("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB", false)),
    Emoji_Modifier: () => new UnicodeRangeTable(decodeRanges("7-8DE", true)),
    Emoji_Modifier_Base: () => new UnicodeRangeTable(decodeRanges("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB", false)),
    Emoji_Presentation: () => new UnicodeRangeTable(decodeRanges("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", false)),
    Extended_Pictographic: () => new UnicodeRangeTable(decodeRanges("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB", false)),
    Hex_Digit: () => new UnicodeRangeTable(decodeRanges("wBJIFbFq1-BJIFbF", true)),
    Lowercase: () => new UnicodeRangeTable(decodeRanges("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB", false)),
    Math: () => new UnicodeRangeTable(decodeRanges("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB", false)),
    Quotation_Mark: () => new UnicodeRangeTable(decodeRanges("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB", false)),
    Terminal_Punctuation: () => new UnicodeRangeTable(decodeRanges("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB", false)),
    Uppercase: () => new UnicodeRangeTable(decodeRanges("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB", false)),
    White_Space: () => new UnicodeRangeTable(decodeRanges("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB", false))
  });
  static get Upper() {
    return this.CATEGORIES.get("Lu");
  }
  static SCRIPTS = new LazyMap({
    Adlam: () => new UnicodeRangeTable(decodeRanges("go6DrCFJFB", true)),
    Ahom: () => new UnicodeRangeTable(decodeRanges("g4lCaDOFW", true)),
    Anatolian_Hieroglyphs: () => new UnicodeRangeTable(decodeRanges("ggxCmS", true)),
    Arabic: () => new UnicodeRangeTable(decodeRanges("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB", false)),
    Armenian: () => new UnicodeRangeTable(decodeRanges("xpBlBDxBDCks9BE", true)),
    Avestan: () => new UnicodeRangeTable(decodeRanges("g4iC1BEG", true)),
    Balinese: () => new UnicodeRangeTable(decodeRanges("g4GsCCxB", true)),
    Bamum: () => new UnicodeRangeTable(decodeRanges("g1pB3CpowB4R", true)),
    Bassa_Vah: () => new UnicodeRangeTable(decodeRanges("w26CdDF", true)),
    Batak: () => new UnicodeRangeTable(decodeRanges("g+GzBJD", true)),
    Bengali: () => new UnicodeRangeTable(decodeRanges("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB", false)),
    Beria_Erfe: () => new UnicodeRangeTable(decodeRanges("g17CYDY", true)),
    Bhaiksuki: () => new UnicodeRangeTable(decodeRanges("ggnCICsBCNLc", true)),
    Bopomofo: () => new UnicodeRangeTable(decodeRanges("qXB6wLqBxDf", true)),
    Brahmi: () => new UnicodeRangeTable(decodeRanges("ggkCtCFjBKA", true)),
    Braille: () => new UnicodeRangeTable(decodeRanges("ggK-H", true)),
    Buginese: () => new UnicodeRangeTable(decodeRanges("gwGbDB", true)),
    Buhid: () => new UnicodeRangeTable(decodeRanges("g6FT", true)),
    Canadian_Aboriginal: () => new UnicodeRangeTable(decodeRanges("ggF-TxRlC7tgCP", true)),
    Carian: () => new UnicodeRangeTable(decodeRanges("g1gCwB", true)),
    Caucasian_Albanian: () => new UnicodeRangeTable(decodeRanges("wphCzBMA", true)),
    Chakma: () => new UnicodeRangeTable(decodeRanges("gokC0BCR", true)),
    Cham: () => new UnicodeRangeTable(decodeRanges("gwqB2BKNDJDD", true)),
    Cherokee: () => new UnicodeRangeTable(decodeRanges("g9E1CDFz7lBvC", true)),
    Chorasmian: () => new UnicodeRangeTable(decodeRanges("w9jCb", true)),
    Common: () => new UnicodeRangeTable(decodeRanges("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB", false)),
    Coptic: () => new UnicodeRangeTable(decodeRanges("ifNxkKzDGG", true)),
    Cuneiform: () => new UnicodeRangeTable(decodeRanges("ggoC5cnDuDCEMjG", true)),
    Cypriot: () => new UnicodeRangeTable(decodeRanges("ggiCFBDCCBqBBCBBEDD", false)),
    Cypro_Minoan: () => new UnicodeRangeTable(decodeRanges("w8rCiD", true)),
    Cyrillic: () => new UnicodeRangeTable(decodeRanges("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB", false)),
    Deseret: () => new UnicodeRangeTable(decodeRanges("gghCvC", true)),
    Devanagari: () => new UnicodeRangeTable(decodeRanges("goCwCFODZh7nBfhwcJ", true)),
    Dives_Akuru: () => new UnicodeRangeTable(decodeRanges("gomCGBDDDBGBCBBCdBCBBDLBKJB", false)),
    Dogra: () => new UnicodeRangeTable(decodeRanges("ggmC7B", true)),
    Duployan: () => new UnicodeRangeTable(decodeRanges("ggvDqDGMEIIJDD", true)),
    Egyptian_Hieroglyphs: () => new UnicodeRangeTable(decodeRanges("ggsC1iBL68D", true)),
    Elbasan: () => new UnicodeRangeTable(decodeRanges("gohCnB", true)),
    Elymaic: () => new UnicodeRangeTable(decodeRanges("g-jCW", true)),
    Ethiopic: () => new UnicodeRangeTable(decodeRanges("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB", false)),
    Garay: () => new UnicodeRangeTable(decodeRanges("gqjClBEcJB", true)),
    Georgian: () => new UnicodeRangeTable(decodeRanges("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG", false)),
    Glagolitic: () => new UnicodeRangeTable(decodeRanges("ggL-Ch9sDGCQDGCBCE", true)),
    Gothic: () => new UnicodeRangeTable(decodeRanges("w5gCa", true)),
    Grantha: () => new UnicodeRangeTable(decodeRanges("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB", false)),
    Greek: () => new UnicodeRangeTable(decodeRanges("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB", false)),
    Gujarati: () => new UnicodeRangeTable(decodeRanges("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB", false)),
    Gunjala_Gondi: () => new UnicodeRangeTable(decodeRanges("grnCFCBCkBCBCFIJ", true)),
    Gurmukhi: () => new UnicodeRangeTable(decodeRanges("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB", false)),
    Gurung_Khema: () => new UnicodeRangeTable(decodeRanges("go4C5B", true)),
    Han: () => new UnicodeRangeTable(decodeRanges("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", false)),
    Hangul: () => new UnicodeRangeTable(decodeRanges("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC", true)),
    Hanifi_Rohingya: () => new UnicodeRangeTable(decodeRanges("gojCnBJJ", true)),
    Hanunoo: () => new UnicodeRangeTable(decodeRanges("g5FU", true)),
    Hatran: () => new UnicodeRangeTable(decodeRanges("gniCSCBGE", true)),
    Hebrew: () => new UnicodeRangeTable(decodeRanges("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB", false)),
    Hiragana: () => new UnicodeRangeTable(decodeRanges("hiM1CBHCBi7-C+IBTeeBBBulQAB", false)),
    Imperial_Aramaic: () => new UnicodeRangeTable(decodeRanges("giiCVCI", true)),
    Inherited: () => new UnicodeRangeTable(decodeRanges("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB", false)),
    Inscriptional_Pahlavi: () => new UnicodeRangeTable(decodeRanges("g7iCSGH", true)),
    Inscriptional_Parthian: () => new UnicodeRangeTable(decodeRanges("g6iCVDH", true)),
    Javanese: () => new UnicodeRangeTable(decodeRanges("gsqBtCDJFB", true)),
    Kaithi: () => new UnicodeRangeTable(decodeRanges("gkkCiCLA", true)),
    Kannada: () => new UnicodeRangeTable(decodeRanges("gkDMCCCWCJCEDICCCDIBGCCDDJCC", true)),
    Katakana: () => new UnicodeRangeTable(decodeRanges("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB", false)),
    Kawi: () => new UnicodeRangeTable(decodeRanges("g4nCQCoBEc", true)),
    Kayah_Li: () => new UnicodeRangeTable(decodeRanges("goqBtBCA", true)),
    Kharoshthi: () => new UnicodeRangeTable(decodeRanges("gwiCDCBGHCCCcDCFJII", true)),
    Khitan_Small_Script: () => new UnicodeRangeTable(decodeRanges("k-7C84G84GB0OBqBAB", false)),
    Khmer: () => new UnicodeRangeTable(decodeRanges("g8F9CDJHJnPf", true)),
    Khojki: () => new UnicodeRangeTable(decodeRanges("gwkCRCuB", true)),
    Khudawadi: () => new UnicodeRangeTable(decodeRanges("w1kC6BGJ", true)),
    Kirat_Rai: () => new UnicodeRangeTable(decodeRanges("gq7C5B", true)),
    Lao: () => new UnicodeRangeTable(decodeRanges("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB", false)),
    Latin: () => new UnicodeRangeTable(decodeRanges("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB", false)),
    Lepcha: () => new UnicodeRangeTable(decodeRanges("ggH3BEOEC", true)),
    Limbu: () => new UnicodeRangeTable(decodeRanges("goGeBCLBFLBFEEBKB", false)),
    Linear_A: () => new UnicodeRangeTable(decodeRanges("gwhC2JKVLH", true)),
    Linear_B: () => new UnicodeRangeTable(decodeRanges("gggCLCZCSCBCODNjB6D", true)),
    Lisu: () => new UnicodeRangeTable(decodeRanges("wmpBvBx1eA", true)),
    Lycian: () => new UnicodeRangeTable(decodeRanges("g0gCc", true)),
    Lydian: () => new UnicodeRangeTable(decodeRanges("gpiCZGA", true)),
    Mahajani: () => new UnicodeRangeTable(decodeRanges("wqkCmB", true)),
    Makasar: () => new UnicodeRangeTable(decodeRanges("g3nCY", true)),
    Malayalam: () => new UnicodeRangeTable(decodeRanges("goDMCCCyBCCCFFPDZ", true)),
    Mandaic: () => new UnicodeRangeTable(decodeRanges("giCbDA", true)),
    Manichaean: () => new UnicodeRangeTable(decodeRanges("g2iCmBFL", true)),
    Marchen: () => new UnicodeRangeTable(decodeRanges("wjnCfDVCN", true)),
    Masaram_Gondi: () => new UnicodeRangeTable(decodeRanges("gonCGBCBBCrBBECCBCCBHBJJB", false)),
    Medefaidrin: () => new UnicodeRangeTable(decodeRanges("gy7C6C", true)),
    Meetei_Mayek: () => new UnicodeRangeTable(decodeRanges("g3qBWqGtBDJ", true)),
    Mende_Kikakui: () => new UnicodeRangeTable(decodeRanges("gg6DkGDP", true)),
    Meroitic_Cursive: () => new UnicodeRangeTable(decodeRanges("gtiCXFTDtB", true)),
    Meroitic_Hieroglyphs: () => new UnicodeRangeTable(decodeRanges("gsiCf", true)),
    Miao: () => new UnicodeRangeTable(decodeRanges("g47CqCF4BIQ", true)),
    Modi: () => new UnicodeRangeTable(decodeRanges("gwlCkCMJ", true)),
    Mongolian: () => new UnicodeRangeTable(decodeRanges("ggGBBDCCBSBH4CBIqBB2t-BMB", false)),
    Mro: () => new UnicodeRangeTable(decodeRanges("gy6CeCJFB", true)),
    Multani: () => new UnicodeRangeTable(decodeRanges("g0kCGBCCCBCBCOBCKB", false)),
    Myanmar: () => new UnicodeRangeTable(decodeRanges("ggE-EhqmBeiDfxibT", true)),
    Nabataean: () => new UnicodeRangeTable(decodeRanges("gkiCeJI", true)),
    Nag_Mundari: () => new UnicodeRangeTable(decodeRanges("wm5DpB", true)),
    Nandinagari: () => new UnicodeRangeTable(decodeRanges("gtmCHDtBDK", true)),
    New_Tai_Lue: () => new UnicodeRangeTable(decodeRanges("gsGrBFZHKEB", true)),
    Newa: () => new UnicodeRangeTable(decodeRanges("gglC7CCE", true)),
    Nko: () => new UnicodeRangeTable(decodeRanges("g+B6BDC", true)),
    Nushu: () => new UnicodeRangeTable(decodeRanges("h-7CvsQvsQBqMB", false)),
    Nyiakeng_Puachue_Hmong: () => new UnicodeRangeTable(decodeRanges("go4DsBENDJFB", true)),
    Ogham: () => new UnicodeRangeTable(decodeRanges("g0Fc", true)),
    Ol_Chiki: () => new UnicodeRangeTable(decodeRanges("wiHvB", true)),
    Ol_Onal: () => new UnicodeRangeTable(decodeRanges("wu5DqBFA", true)),
    Old_Hungarian: () => new UnicodeRangeTable(decodeRanges("gkjCyBOyBIF", true)),
    Old_Italic: () => new UnicodeRangeTable(decodeRanges("g4gCjBKC", true)),
    Old_North_Arabian: () => new UnicodeRangeTable(decodeRanges("g0iCf", true)),
    Old_Permic: () => new UnicodeRangeTable(decodeRanges("w6gCqB", true)),
    Old_Persian: () => new UnicodeRangeTable(decodeRanges("g9gCjBFN", true)),
    Old_Sogdian: () => new UnicodeRangeTable(decodeRanges("g4jCnB", true)),
    Old_South_Arabian: () => new UnicodeRangeTable(decodeRanges("gziCf", true)),
    Old_Turkic: () => new UnicodeRangeTable(decodeRanges("ggjCoC", true)),
    Old_Uyghur: () => new UnicodeRangeTable(decodeRanges("w7jCZ", true)),
    Oriya: () => new UnicodeRangeTable(decodeRanges("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR", true)),
    Osage: () => new UnicodeRangeTable(decodeRanges("wlhCjBFjB", true)),
    Osmanya: () => new UnicodeRangeTable(decodeRanges("gkhCdDJ", true)),
    Pahawh_Hmong: () => new UnicodeRangeTable(decodeRanges("g46ClCLJCGCUGS", true)),
    Palmyrene: () => new UnicodeRangeTable(decodeRanges("gjiCf", true)),
    Pau_Cin_Hau: () => new UnicodeRangeTable(decodeRanges("g2mC4B", true)),
    Phags_Pa: () => new UnicodeRangeTable(decodeRanges("giqB3B", true)),
    Phoenician: () => new UnicodeRangeTable(decodeRanges("goiCbEA", true)),
    Psalter_Pahlavi: () => new UnicodeRangeTable(decodeRanges("g8iCRIDNG", true)),
    Rejang: () => new UnicodeRangeTable(decodeRanges("wpqBjBMA", true)),
    Runic: () => new UnicodeRangeTable(decodeRanges("g1FqCEK", true)),
    Samaritan: () => new UnicodeRangeTable(decodeRanges("ggCtBDO", true)),
    Saurashtra: () => new UnicodeRangeTable(decodeRanges("gkqBlCJL", true)),
    Sharada: () => new UnicodeRangeTable(decodeRanges("gskC-ChsCH", true)),
    Shavian: () => new UnicodeRangeTable(decodeRanges("wihCvB", true)),
    Siddham: () => new UnicodeRangeTable(decodeRanges("gslC1BDlB", true)),
    Sidetic: () => new UnicodeRangeTable(decodeRanges("gqiCZ", true)),
    SignWriting: () => new UnicodeRangeTable(decodeRanges("gg2DrUQECO", true)),
    Sinhala: () => new UnicodeRangeTable(decodeRanges("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB", false)),
    Sogdian: () => new UnicodeRangeTable(decodeRanges("w5jCpB", true)),
    Sora_Sompeng: () => new UnicodeRangeTable(decodeRanges("wmkCYIJ", true)),
    Soyombo: () => new UnicodeRangeTable(decodeRanges("wymCyC", true)),
    Sundanese: () => new UnicodeRangeTable(decodeRanges("g8G-BhIH", true)),
    Sunuwar: () => new UnicodeRangeTable(decodeRanges("g+mChBPJ", true)),
    Syloti_Nagri: () => new UnicodeRangeTable(decodeRanges("ggqBsB", true)),
    Syriac: () => new UnicodeRangeTable(decodeRanges("g4BNC7BDCxIK", true)),
    Tagalog: () => new UnicodeRangeTable(decodeRanges("g4FVKA", true)),
    Tagbanwa: () => new UnicodeRangeTable(decodeRanges("g7FMCCCB", true)),
    Tai_Le: () => new UnicodeRangeTable(decodeRanges("wqGdDE", true)),
    Tai_Tham: () => new UnicodeRangeTable(decodeRanges("gxG+BCcDKHJHN", true)),
    Tai_Viet: () => new UnicodeRangeTable(decodeRanges("g0qBiCZE", true)),
    Tai_Yo: () => new UnicodeRangeTable(decodeRanges("g25DeCVJB", true)),
    Takri: () => new UnicodeRangeTable(decodeRanges("g0lC5BHJ", true)),
    Tamil: () => new UnicodeRangeTable(decodeRanges("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB", false)),
    Tangsa: () => new UnicodeRangeTable(decodeRanges("wz6CuCCJ", true)),
    Tangut: () => new UnicodeRangeTable(decodeRanges("g-7CgBgBB+3GBhQeBiDyDB", false)),
    Telugu: () => new UnicodeRangeTable(decodeRanges("ggDMCCCWCPDICCCDIBCCCBDDDJII", true)),
    Thaana: () => new UnicodeRangeTable(decodeRanges("g8BxB", true)),
    Thai: () => new UnicodeRangeTable(decodeRanges("hwD5BGb", true)),
    Tibetan: () => new UnicodeRangeTable(decodeRanges("g4DnCCjBFmBCjBCOCGFB", true)),
    Tifinagh: () => new UnicodeRangeTable(decodeRanges("wpL3BIBPA", true)),
    Tirhuta: () => new UnicodeRangeTable(decodeRanges("gklCnCJJ", true)),
    Todhri: () => new UnicodeRangeTable(decodeRanges("guhCzB", true)),
    Tolong_Siki: () => new UnicodeRangeTable(decodeRanges("wtnCrBFJ", true)),
    Toto: () => new UnicodeRangeTable(decodeRanges("w04De", true)),
    Tulu_Tigalari: () => new UnicodeRangeTable(decodeRanges("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB", false)),
    Ugaritic: () => new UnicodeRangeTable(decodeRanges("g8gCdCA", true)),
    Unknown: () => new UnicodeRangeTable(decodeRanges("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB", false)),
    Vai: () => new UnicodeRangeTable(decodeRanges("gopBrJ", true)),
    Vithkuqi: () => new UnicodeRangeTable(decodeRanges("wrhCKCOCGCBCKCOCGCB", true)),
    Wancho: () => new UnicodeRangeTable(decodeRanges("g24D5BGA", true)),
    Warang_Citi: () => new UnicodeRangeTable(decodeRanges("glmCyCNA", true)),
    Yezidi: () => new UnicodeRangeTable(decodeRanges("g0jCpBCCDB", true)),
    Yi: () => new UnicodeRangeTable(decodeRanges("ggoBskBE2B", true)),
    Zanabazar_Square: () => new UnicodeRangeTable(decodeRanges("gwmCnC", true))
  });
  static FOLD_CATEGORIES = new LazyMap({
    L: () => new UnicodeRangeTable(decodeRanges("laA", true)),
    LC: () => new UnicodeRangeTable(decodeRanges("laA", true)),
    Ll: () => new UnicodeRangeTable(decodeRanges("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", false)),
    Lt: () => new UnicodeRangeTable(decodeRanges("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB", false)),
    Lu: () => new UnicodeRangeTable(decodeRanges("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", false)),
    M: () => new UnicodeRangeTable(decodeRanges("5cgBgBlgHAB", false)),
    Mn: () => new UnicodeRangeTable(decodeRanges("5cgBgBlgHAB", false)),
    Emoji: () => new UnicodeRangeTable(decodeRanges("8mJA", true)),
    Extended_Pictographic: () => new UnicodeRangeTable(decodeRanges("8mJA", true)),
    Lowercase: () => new UnicodeRangeTable(decodeRanges("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", false)),
    Math: () => new UnicodeRangeTable(decodeRanges("ycGDCHHFMMDDDCHHFAB", false)),
    Uppercase: () => new UnicodeRangeTable(decodeRanges("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", false))
  });
  static FOLD_SCRIPT = new LazyMap({
    Common: () => new UnicodeRangeTable(decodeRanges("8cgBgB", false)),
    Greek: () => new UnicodeRangeTable(decodeRanges("1FwUwU", false)),
    Inherited: () => new UnicodeRangeTable(decodeRanges("5cgBgBlgHAB", false))
  });
};
var Unicode = class Unicode2 {
  static MAX_RUNE = 1114111;
  static MAX_ASCII = 127;
  static MAX_LATIN1 = 255;
  static MAX_BMP = 65535;
  static MIN_FOLD = 65;
  static MAX_FOLD = 125251;
  static MIN_HIGH_SURROGATE = 55296;
  static MAX_HIGH_SURROGATE = 56319;
  static MIN_LOW_SURROGATE = 56320;
  static MAX_LOW_SURROGATE = 57343;
  static MIN_SUPPLEMENTARY_CODE_POINT = 65536;
  static is32(ranges, r) {
    let lo = 0;
    let hi = ranges.length;
    while (lo < hi) {
      const m = lo + Math.floor((hi - lo) / 2);
      const rlo = ranges.getLo(m);
      const rhi = ranges.getHi(m);
      if (rlo <= r && r <= rhi) {
        const stride = ranges.getStride(m);
        return (r - rlo) % stride === 0;
      }
      if (r < rlo) hi = m;
      else lo = m + 1;
    }
    return false;
  }
  static is(ranges, r) {
    if (r <= Unicode2.MAX_LATIN1) {
      for (let i = 0; i < ranges.length; i++) {
        if (r > ranges.getHi(i)) continue;
        const rlo = ranges.getLo(i);
        if (r < rlo) return false;
        const stride = ranges.getStride(i);
        return (r - rlo) % stride === 0;
      }
      return false;
    }
    return ranges.length > 0 && r >= ranges.getLo(0) && Unicode2.is32(ranges, r);
  }
  static isUpper(r) {
    if (r <= Unicode2.MAX_LATIN1) {
      const s = String.fromCodePoint(r);
      return s.toUpperCase() === s && s.toLowerCase() !== s;
    }
    return Unicode2.is(UnicodeTables.Upper, r);
  }
  static isPrint(r) {
    if (r <= Unicode2.MAX_LATIN1) return r >= 32 && r < Unicode2.MAX_ASCII || r >= 161 && r !== 173;
    return Unicode2.is(UnicodeTables.Print, r);
  }
  static simpleFold(r) {
    if (UnicodeTables.CASE_ORBIT.has(r)) return UnicodeTables.CASE_ORBIT.get(r);
    const l = Codepoint.toLowerCase(r);
    if (l !== r) return l;
    return Codepoint.toUpperCase(r);
  }
  static equalsIgnoreCase(r1, r2) {
    if (r1 === r2) return true;
    if (r1 < 0 || r2 < 0) return false;
    if (r1 <= Unicode2.MAX_ASCII && r2 <= Unicode2.MAX_ASCII) {
      if (65 <= r1 && r1 <= 90) r1 |= 32;
      if (65 <= r2 && r2 <= 90) r2 |= 32;
      return r1 === r2;
    }
    for (let r = Unicode2.simpleFold(r1); r !== r1; r = Unicode2.simpleFold(r)) if (r === r2) return true;
    return false;
  }
};
var FAST_PATH_TABLE_SIZE = 256;
var WORD_RUNE_TABLE = new Uint8Array(FAST_PATH_TABLE_SIZE);
for (let i = 0; i < FAST_PATH_TABLE_SIZE; i++) WORD_RUNE_TABLE[i] = 97 <= i && i <= 122 || 65 <= i && i <= 90 || 48 <= i && i <= 57 || i === 95 ? 1 : 0;
var cachedNativeEncoder = null;
var cachedNativeDecoder = null;
var Utils = class Utils2 {
  static METACHARACTERS = "\\.+*?()|[]{}^$";
  static EMPTY_BEGIN_LINE = 1;
  static EMPTY_END_LINE = 2;
  static EMPTY_BEGIN_TEXT = 4;
  static EMPTY_END_TEXT = 8;
  static EMPTY_WORD_BOUNDARY = 16;
  static EMPTY_NO_WORD_BOUNDARY = 32;
  static EMPTY_ALL = -1;
  static emptyInts() {
    return [];
  }
  static isByteArray(input) {
    return Array.isArray(input) || input instanceof Uint8Array;
  }
  static isalnum(c) {
    return Codepoint.CODES.get("0") <= c && c <= Codepoint.CODES.get("9") || Codepoint.CODES.get("a") <= c && c <= Codepoint.CODES.get("z") || Codepoint.CODES.get("A") <= c && c <= Codepoint.CODES.get("Z");
  }
  static unhex(c) {
    if (Codepoint.CODES.get("0") <= c && c <= Codepoint.CODES.get("9")) return c - Codepoint.CODES.get("0");
    if (Codepoint.CODES.get("a") <= c && c <= Codepoint.CODES.get("f")) return c - Codepoint.CODES.get("a") + 10;
    if (Codepoint.CODES.get("A") <= c && c <= Codepoint.CODES.get("F")) return c - Codepoint.CODES.get("A") + 10;
    return -1;
  }
  static escapeRune(rune) {
    let out = "";
    if (Unicode.isPrint(rune)) {
      if (Utils2.METACHARACTERS.indexOf(String.fromCodePoint(rune)) >= 0) out += "\\";
      out += String.fromCodePoint(rune);
    } else switch (rune) {
      case Codepoint.CODES.get('"'):
        out += '\\"';
        break;
      case Codepoint.CODES.get("\\"):
        out += "\\\\";
        break;
      case Codepoint.CODES.get("	"):
        out += "\\t";
        break;
      case Codepoint.CODES.get("\n"):
        out += "\\n";
        break;
      case Codepoint.CODES.get("\r"):
        out += "\\r";
        break;
      case Codepoint.CODES.get("\b"):
        out += "\\b";
        break;
      case Codepoint.CODES.get("\f"):
        out += "\\f";
        break;
      default: {
        let s = rune.toString(16);
        if (rune < 256) {
          out += "\\x";
          if (s.length === 1) out += "0";
          out += s;
        } else out += `\\x{${s}}`;
        break;
      }
    }
    return out;
  }
  static stringToRunes(str) {
    const string3 = String(str);
    const runes = [];
    let i = 0;
    while (i < string3.length) {
      const cp = string3.codePointAt(i);
      runes.push(cp);
      i += cp > Unicode.MAX_BMP ? 2 : 1;
    }
    return runes;
  }
  static runeToString(r) {
    return String.fromCodePoint(r);
  }
  static isWordRune(r) {
    return r < FAST_PATH_TABLE_SIZE ? WORD_RUNE_TABLE[r] === 1 : false;
  }
  static emptyOpContext(r1, r2) {
    let op = 0;
    if (r1 < 0) op |= Utils2.EMPTY_BEGIN_TEXT | Utils2.EMPTY_BEGIN_LINE;
    if (r1 === 10) op |= Utils2.EMPTY_BEGIN_LINE;
    if (r2 < 0) op |= Utils2.EMPTY_END_TEXT | Utils2.EMPTY_END_LINE;
    if (r2 === 10) op |= Utils2.EMPTY_END_LINE;
    if (Utils2.isWordRune(r1) !== Utils2.isWordRune(r2)) op |= Utils2.EMPTY_WORD_BOUNDARY;
    else op |= Utils2.EMPTY_NO_WORD_BOUNDARY;
    return op;
  }
  /**
  * Returns a string that quotes all regular expression metacharacters inside the argument text;
  * the returned string is a regular expression matching the literal text. For example,
  * {@code quoteMeta("[foo]").equals("\\[foo\\]")}.
  * @param {string} str
  * @returns {string}
  */
  static quoteMeta(str) {
    return str.split("").map((s) => {
      if (Utils2.METACHARACTERS.indexOf(s) >= 0) return `\\${s}`;
      return s;
    }).join("");
  }
  static charCount(codePoint) {
    return codePoint > Unicode.MAX_BMP ? 2 : 1;
  }
  /**
  * High-speed conversion from TypedArrays to standard JS Arrays.
  * Bypasses the expensive Symbol.iterator overhead of Array.from()
  */
  static toArray(typedArray) {
    const len = typedArray.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) res[i] = typedArray[i];
    return res;
  }
  static stringToUtf8ByteArray(str) {
    if (globalThis.TextEncoder) {
      if (!cachedNativeEncoder) cachedNativeEncoder = new TextEncoder();
      return cachedNativeEncoder.encode(str);
    } else {
      let out = [], p = 0;
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) out[p++] = c;
        else if (c < 2048) {
          out[p++] = c >> 6 | 192;
          out[p++] = c & 63 | 128;
        } else if ((c & 64512) === Unicode.MIN_HIGH_SURROGATE && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === Unicode.MIN_LOW_SURROGATE) {
          c = Unicode.MIN_SUPPLEMENTARY_CODE_POINT + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
          out[p++] = c >> 18 | 240;
          out[p++] = c >> 12 & 63 | 128;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        } else {
          out[p++] = c >> 12 | 224;
          out[p++] = c >> 6 & 63 | 128;
          out[p++] = c & 63 | 128;
        }
      }
      return out;
    }
  }
  static utf8ByteArrayToString(bytes) {
    if (globalThis.TextDecoder) {
      if (!cachedNativeDecoder) cachedNativeDecoder = new TextDecoder("utf-8");
      const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      return cachedNativeDecoder.decode(view);
    } else {
      let out = [], pos = 0, c = 0;
      while (pos < bytes.length) {
        let c1 = bytes[pos++];
        if (c1 < 128) out[c++] = String.fromCharCode(c1);
        else if (c1 > 191 && c1 < 224) {
          let c2 = bytes[pos++];
          out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
          let c2 = bytes[pos++];
          let c3 = bytes[pos++];
          let c4 = bytes[pos++];
          let u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - Unicode.MIN_SUPPLEMENTARY_CODE_POINT;
          out[c++] = String.fromCharCode(Unicode.MIN_HIGH_SURROGATE + (u >> 10));
          out[c++] = String.fromCharCode(Unicode.MIN_LOW_SURROGATE + (u & 1023));
        } else {
          let c2 = bytes[pos++];
          let c3 = bytes[pos++];
          out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
      }
      return out.join("");
    }
  }
};
var createEnum = (values = [], initNum = 0) => {
  const enumObject = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const keyVal = initNum + i;
    enumObject[val] = keyVal;
    enumObject[keyVal] = val;
  }
  return Object.freeze(enumObject);
};
var MatcherInputBase = class MatcherInputBase2 {
  static Encoding = createEnum(["UTF_16", "UTF_8"]);
  getEncoding() {
    throw Error("not implemented");
  }
  /** @returns {string} */
  asCharSequence() {
    throw Error("not implemented");
  }
  /** @returns {Uint8Array|number[]} */
  asBytes() {
    throw Error("not implemented");
  }
  /** @returns {number} */
  length() {
    throw Error("not implemented");
  }
  /**
  *
  * @returns {boolean}
  */
  isUTF8Encoding() {
    return this.getEncoding() === MatcherInputBase2.Encoding.UTF_8;
  }
  /**
  *
  * @returns {boolean}
  */
  isUTF16Encoding() {
    return this.getEncoding() === MatcherInputBase2.Encoding.UTF_16;
  }
};
var Utf8MatcherInput = class extends MatcherInputBase {
  /** @param {Uint8Array|number[]|null} bytes */
  constructor(bytes = null) {
    super();
    this.bytes = bytes;
  }
  getEncoding() {
    return MatcherInputBase.Encoding.UTF_8;
  }
  /**
  *
  * @returns {string}
  */
  asCharSequence() {
    return Utils.utf8ByteArrayToString(this.bytes);
  }
  /**
  *
  * @returns {Uint8Array|number[]|null}
  */
  asBytes() {
    return this.bytes;
  }
  /**
  *
  * @returns {number}
  */
  length() {
    return this.bytes.length;
  }
};
var Utf16MatcherInput = class extends MatcherInputBase {
  /** @param {string|null} charSequence */
  constructor(charSequence = null) {
    super();
    this.charSequence = charSequence;
  }
  getEncoding() {
    return MatcherInputBase.Encoding.UTF_16;
  }
  /**
  *
  * @returns {string}
  */
  asCharSequence() {
    return this.charSequence;
  }
  /**
  *
  * @returns {number[]}
  */
  asBytes() {
    return Utils.stringToUtf8ByteArray(this.charSequence.toString());
  }
  /**
  *
  * @returns {number}
  */
  length() {
    return this.charSequence.length;
  }
};
var MatcherInput = class {
  /**
  * Return the MatcherInput for UTF_16 encoding.
  * @returns {Utf16MatcherInput}
  */
  static utf16(charSequence) {
    return new Utf16MatcherInput(charSequence);
  }
  /**
  * Return the MatcherInput for UTF_8 encoding.
  * @returns {Utf8MatcherInput}
  */
  static utf8(input) {
    if (Utils.isByteArray(input)) return new Utf8MatcherInput(input);
    return new Utf8MatcherInput(Utils.stringToUtf8ByteArray(input));
  }
};
var MachineInputBase = class {
  static EOF() {
    return -8;
  }
  constructor() {
    this.end = 0;
  }
  canCheckPrefix() {
    return true;
  }
  endPos() {
    return this.end;
  }
  hasString() {
    return false;
  }
  hasAnyString() {
    return false;
  }
  prefixLength() {
    return 0;
  }
};
var MachineUTF8Input = class extends MachineInputBase {
  constructor(bytes, start = 0, end = bytes.length) {
    super();
    this.bytes = bytes;
    this.start = start;
    this.end = end;
  }
  hasString(prefilter, pos) {
    const target = prefilter.bytes;
    if (target.length === 0) return true;
    const idx = this.indexOf(this.bytes, target, this.start + pos);
    return idx !== -1 && idx <= this.end - target.length;
  }
  hasAnyString(prefilter, pos) {
    if (!prefilter.ac8) return false;
    return prefilter.ac8.searchUTF8(this.bytes, this.start + pos, this.end);
  }
  step(pos) {
    pos += this.start;
    if (pos >= this.end) return MachineInputBase.EOF();
    const c = this.bytes[pos] & 255;
    if (c < 128) return c << 3 | 1;
    else if (c >= 194 && c <= 223 && pos + 1 < this.end) {
      const c1 = this.bytes[pos + 1] & 255;
      if ((c1 & 192) !== 128) return c << 3 | 1;
      return ((c & 31) << 6 | c1 & 63) << 3 | 2;
    } else if (c >= 224 && c <= 239 && pos + 2 < this.end) {
      const c1 = this.bytes[pos + 1] & 255;
      if ((c1 & 192) !== 128) return c << 3 | 1;
      const c2 = this.bytes[pos + 2] & 255;
      if ((c2 & 192) !== 128) return c << 3 | 1;
      return ((c & 15) << 12 | (c1 & 63) << 6 | c2 & 63) << 3 | 3;
    } else if (c >= 240 && c <= 244 && pos + 3 < this.end) {
      const c1 = this.bytes[pos + 1] & 255;
      if ((c1 & 192) !== 128) return c << 3 | 1;
      const c2 = this.bytes[pos + 2] & 255;
      if ((c2 & 192) !== 128) return c << 3 | 1;
      const c3 = this.bytes[pos + 3] & 255;
      if ((c3 & 192) !== 128) return c << 3 | 1;
      return ((c & 7) << 18 | (c1 & 63) << 12 | (c2 & 63) << 6 | c3 & 63) << 3 | 4;
    } else return c << 3 | 1;
  }
  index(re2, pos) {
    pos += this.start;
    const i = this.indexOf(this.bytes, re2.prefixUTF8, pos);
    return i < 0 ? i : i - pos;
  }
  context(pos) {
    pos += this.start;
    let r1 = -1;
    if (pos > this.start && pos <= this.end) {
      let start = pos - 1;
      r1 = this.bytes[start--];
      if (r1 >= 128) {
        let lim = pos - 4;
        if (lim < this.start) lim = this.start;
        while (start >= lim && (this.bytes[start] & 192) === 128) start--;
        if (start < this.start) start = this.start;
        r1 = this.step(start - this.start) >> 3;
      }
    }
    const r2 = pos < this.end ? this.step(pos - this.start) >> 3 : -1;
    return Utils.emptyOpContext(r1, r2);
  }
  indexOf(source, target, fromIndex = 0) {
    let targetLength = target.length;
    if (targetLength === 0) return fromIndex <= this.end ? fromIndex : -1;
    const firstByte = target[0];
    let limit = this.end - targetLength;
    const hasNativeIndexOf = typeof source.indexOf === "function";
    let i = fromIndex;
    while (i <= limit) {
      if (hasNativeIndexOf) {
        i = source.indexOf(firstByte, i);
        if (i === -1 || i > limit) return -1;
      } else {
        while (i <= limit && source[i] !== firstByte) i++;
        if (i > limit) return -1;
      }
      let match = true;
      for (let j = 1; j < targetLength; j++) if (source[i + j] !== target[j]) {
        match = false;
        break;
      }
      if (match) return i;
      i++;
    }
    return -1;
  }
  prefixLength(re2) {
    return re2.prefixUTF8.length;
  }
};
var MachineUTF16Input = class extends MachineInputBase {
  constructor(charSequence, start = 0, end = charSequence.length) {
    super();
    this.charSequence = charSequence;
    this.start = start;
    this.end = end;
  }
  hasString(prefilter, pos) {
    const idx = this.charSequence.indexOf(prefilter.str, this.start + pos);
    return idx !== -1 && idx <= this.end - prefilter.str.length;
  }
  hasAnyString(prefilter, pos) {
    if (!prefilter.ac16) return false;
    return prefilter.ac16.searchUTF16(this.charSequence, this.start + pos, this.end);
  }
  step(pos) {
    pos += this.start;
    if (pos >= this.end) return MachineInputBase.EOF();
    const c1 = this.charSequence.charCodeAt(pos);
    if (c1 < Unicode.MIN_HIGH_SURROGATE || c1 > Unicode.MAX_HIGH_SURROGATE || pos + 1 >= this.end) return c1 << 3 | 1;
    const c2 = this.charSequence.charCodeAt(pos + 1);
    if (c2 >= Unicode.MIN_LOW_SURROGATE && c2 <= Unicode.MAX_LOW_SURROGATE) return (c1 - Unicode.MIN_HIGH_SURROGATE) * 1024 + (c2 - Unicode.MIN_LOW_SURROGATE) + Unicode.MIN_SUPPLEMENTARY_CODE_POINT << 3 | 2;
    return c1 << 3 | 1;
  }
  index(re2, pos) {
    pos += this.start;
    const i = this.charSequence.indexOf(re2.prefix, pos);
    if (i < 0 || i > this.end - re2.prefix.length) return -1;
    return i - pos;
  }
  context(pos) {
    pos += this.start;
    const r1 = pos > this.start && pos <= this.end ? this.charSequence.charCodeAt(pos - 1) : -1;
    const r2 = pos < this.end ? this.charSequence.charCodeAt(pos) : -1;
    return Utils.emptyOpContext(r1, r2);
  }
  prefixLength(re2) {
    return re2.prefix.length;
  }
};
var MachineInput = class {
  static fromUTF8(bytes, start = 0, end = bytes.length) {
    return new MachineUTF8Input(bytes, start, end);
  }
  static fromUTF16(charSequence, start = 0, end = charSequence.length) {
    return new MachineUTF16Input(charSequence, start, end);
  }
};
var RE2JSException = class extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "RE2JSException";
  }
};
var RE2JSSyntaxException = class extends RE2JSException {
  /**
  * @param {string} error
  * @param {string|null} [input=null]
  */
  constructor(error, input = null) {
    let message = `error parsing regexp: ${error}`;
    if (input) message += `: \`${input}\``;
    super(message);
    this.name = "RE2JSSyntaxException";
    this.message = message;
    this.error = error;
    this.input = input;
  }
  /**
  * Retrieves the description of the error.
  * @returns {string}
  */
  getDescription() {
    return this.error;
  }
  /**
  * Retrieves the erroneous regular-expression pattern.
  * @returns {string|null}
  */
  getPattern() {
    return this.input;
  }
};
var RE2JSCompileException = class extends RE2JSException {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "RE2JSCompileException";
  }
};
var RE2JSGroupException = class extends RE2JSException {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "RE2JSGroupException";
  }
};
var RE2JSFlagsException = class extends RE2JSException {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "RE2JSFlagsException";
  }
};
var RE2JSInternalException = class extends RE2JSException {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "RE2JSInternalException";
  }
};
var Matcher = class Matcher2 {
  /**
  * V8 and WebKit have historical hard limits on the number of arguments
  * that can be passed to a function. We cap replacer arguments to prevent
  * Call Stack Overflow (DoS) vulnerabilities on massive ASTs.
  */
  static MAX_REPLACER_ARGS = 65535;
  /**
  * Quotes '\' and '$' in {@code s}, so that the returned string could be used in
  * {@link #appendReplacement} as a literal replacement of {@code s}.
  *
  * @param {string} str the string to be quoted
  * @param {boolean} [javaMode=false] whether the replacement will be used in javaMode
  * @returns {string} the quoted string
  */
  static quoteReplacement(str, javaMode = false) {
    if (javaMode) {
      if (str.indexOf("\\") < 0 && str.indexOf("$") < 0) return str;
      return str.split("").map((s) => {
        const c = s.codePointAt(0);
        if (c === Codepoint.CODES.get("\\") || c === Codepoint.CODES.get("$")) return `\\${s}`;
        return s;
      }).join("");
    }
    if (str.indexOf("$") < 0) return str;
    return str.split("").map((s) => {
      if (s.codePointAt(0) === Codepoint.CODES.get("$")) return "$$";
      return s;
    }).join("");
  }
  /**
  *
  * @param {import('./index.js').RE2JS} pattern
  * @param {string|number[]|Uint8Array|MatcherInputBase} input
  */
  constructor(pattern, input) {
    if (pattern === null) throw new Error("pattern is null");
    this.patternInput = pattern;
    const re2 = this.patternInput.re2();
    this.patternGroupCount = re2.numberOfCapturingGroups();
    this.groups = [];
    this.namedGroups = re2.namedGroups;
    this.numberOfInstructions = re2.numberOfInstructions();
    if (input instanceof MatcherInputBase) this.resetMatcherInput(input);
    else if (Utils.isByteArray(input)) this.resetMatcherInput(MatcherInput.utf8(input));
    else this.resetMatcherInput(MatcherInput.utf16(input));
  }
  /**
  * Returns the {@code RE2JS} associated with this {@code Matcher}.
  * @returns {import('./index.js').RE2JS}
  */
  pattern() {
    return this.patternInput;
  }
  /**
  * Resets the {@code Matcher}, rewinding input and discarding any match information.
  *
  * @returns {Matcher} the {@code Matcher} itself, for chained method calls
  */
  reset() {
    this.matcherInputLength = this.matcherInput.length();
    this.appendPos = 0;
    this.hasMatch = false;
    this.hasGroups = false;
    this.anchorFlag = 0;
    return this;
  }
  /**
  * Resets the {@code Matcher} and changes the input.
  * @param {string|number[]|Uint8Array|MatcherInputBase} input
  * @returns {Matcher} the {@code Matcher} itself, for chained method calls
  */
  resetMatcherInput(input) {
    if (input === null) throw new Error("input is null");
    if (!(input instanceof MatcherInputBase)) if (Utils.isByteArray(input)) input = MatcherInput.utf8(input);
    else input = MatcherInput.utf16(input);
    this.matcherInput = input;
    this.reset();
    return this;
  }
  /**
  * Returns the start of the named group of the most recent match, or -1 if the group was not
  * matched.
  * @param {string|number} [group=0]
  * @returns {number}
  */
  start(group = 0) {
    if (typeof group === "string") {
      const groupInt = this.namedGroups[group];
      if (!Number.isFinite(groupInt)) throw new RE2JSGroupException(`group '${group}' not found`);
      group = groupInt;
    }
    this.loadGroup(group);
    return this.groups[2 * group];
  }
  /**
  * Returns the end of the named group of the most recent match, or -1 if the group was not
  * matched.
  * @param {string|number} [group=0]
  * @returns {number}
  */
  end(group = 0) {
    if (typeof group === "string") {
      const groupInt = this.namedGroups[group];
      if (!Number.isFinite(groupInt)) throw new RE2JSGroupException(`group '${group}' not found`);
      group = groupInt;
    }
    this.loadGroup(group);
    return this.groups[2 * group + 1];
  }
  /**
  * Returns the program size of this pattern.
  *
  * <p>
  * Similar to the C++ implementation, the program size is a very approximate measure of a regexp's
  * "cost". Larger numbers are more expensive than smaller numbers.
  * </p>
  *
  * @returns {number} the program size of this pattern
  */
  programSize() {
    return this.numberOfInstructions;
  }
  /**
  * Returns the named group of the most recent match, or {@code null} if the group was not matched.
  * @param {string|number} [group=0]
  * @returns {string|null}
  */
  group(group = 0) {
    if (typeof group === "string") {
      const groupInt = this.namedGroups[group];
      if (!Number.isFinite(groupInt)) throw new RE2JSGroupException(`group '${group}' not found`);
      group = groupInt;
    }
    const start = this.start(group);
    const end = this.end(group);
    if (start < 0 && end < 0) return null;
    return this.substring(start, end);
  }
  /**
  * Returns a dictionary map of all named capturing groups and their matched values.
  * If a group was not matched, its value will be `null`.
  * @returns {Record<string, string|null>}
  */
  getNamedGroups() {
    if (!this.hasMatch) throw new RE2JSGroupException("perhaps no match attempted");
    const result = /* @__PURE__ */ Object.create(null);
    for (const name of Object.keys(this.namedGroups)) result[name] = this.group(name);
    return result;
  }
  /**
  * Returns the number of subgroups in this pattern.
  *
  * @returns {number} the number of subgroups; the overall match (group 0) does not count
  */
  groupCount() {
    return this.patternGroupCount;
  }
  /**
  * Helper: finds subgroup information if needed for group.
  * @param {number} group
  * @private
  */
  loadGroup(group) {
    if (group < 0 || group > this.patternGroupCount) throw new RE2JSGroupException(`Group index out of bounds: ${group}`);
    if (!this.hasMatch) throw new RE2JSGroupException("perhaps no match attempted");
    if (group === 0 || this.hasGroups) return;
    const end = this.matcherInputLength;
    const res = this.patternInput.re2().matchMachineInput(this.matcherInput, this.groups[0], end, this.anchorFlag, 1 + this.patternGroupCount);
    if (!res[0]) throw new RE2JSGroupException("inconsistency in matching group data");
    this.groups = res[1];
    this.hasGroups = true;
  }
  /**
  * Matches the entire input against the pattern (anchored start and end). If there is a match,
  * {@code matches} sets the match state to describe it.
  *
  * @returns {boolean} true if the entire input matches the pattern
  */
  matches() {
    return this.genMatch(0, RE2Flags.ANCHOR_BOTH);
  }
  /**
  * Matches the beginning of input against the pattern (anchored start). If there is a match,
  * {@code lookingAt} sets the match state to describe it.
  *
  * @returns {boolean} true if the beginning of the input matches the pattern
  */
  lookingAt() {
    return this.genMatch(0, RE2Flags.ANCHOR_START);
  }
  /**
  * Matches the input against the pattern (unanchored), starting at a specified position. If there
  * is a match, {@code find} sets the match state to describe it.
  *
  * @param {number|null} [start=null] the input position where the search begins
  * @returns {boolean} if it finds a match
  * @throws IndexOutOfBoundsException if start is not a valid input position
  */
  find(start = null) {
    if (start !== null) {
      if (start < 0 || start > this.matcherInputLength) throw new RE2JSGroupException(`start index out of bounds: ${start}`);
      this.reset();
      return this.genMatch(start, 0);
    }
    start = 0;
    if (this.hasMatch) {
      start = this.groups[1];
      if (this.groups[0] === this.groups[1]) {
        const r = (this.matcherInput.isUTF16Encoding() ? MachineInput.fromUTF16(this.matcherInput.asCharSequence(), 0, this.matcherInputLength) : MachineInput.fromUTF8(this.matcherInput.asBytes(), 0, this.matcherInputLength)).step(start);
        if (r < 0) start++;
        else start += r & 7;
      }
    }
    return this.genMatch(start, RE2Flags.UNANCHORED);
  }
  /**
  * Helper: does match starting at start, with RE2 anchor flag.
  * @param {number} startByte
  * @param {number} anchor
  * @returns {boolean}
  * @private
  */
  genMatch(startByte, anchor) {
    const res = this.patternInput.re2().matchMachineInput(this.matcherInput, startByte, this.matcherInputLength, anchor, 1);
    if (!res[0]) {
      this.hasMatch = false;
      return false;
    }
    this.groups = res[1];
    this.hasMatch = true;
    this.hasGroups = this.patternGroupCount === 0;
    this.anchorFlag = anchor;
    return true;
  }
  /**
  * Helper: return substring for [start, end).
  * @param {number} start
  * @param {number} end
  * @returns {string}
  */
  substring(start, end) {
    if (this.matcherInput.isUTF8Encoding()) return Utils.utf8ByteArrayToString(this.matcherInput.asBytes().slice(start, end));
    return this.matcherInput.asCharSequence().substring(start, end).toString();
  }
  /**
  * Helper for Pattern: return input length.
  * @returns {number}
  */
  inputLength() {
    return this.matcherInputLength;
  }
  /**
  * Appends to result two strings: the text from the append position up to the beginning of the
  * most recent match, and then the replacement with submatch groups substituted for references of
  * the form {@code $n}, where {@code n} is the group number in decimal. It advances the append
  * position to where the most recent match ended.
  *
  * To embed a literal {@code $}, use \$ (actually {@code "\\$"} with string escapes). The escape
  * is only necessary when {@code $} is followed by a digit, but it is always allowed. Only
  * {@code $} and {@code \} need escaping, but any character can be escaped.
  *
  * The group number {@code n} in {@code $n} is always at least one digit and expands to use more
  * digits as long as the resulting number is a valid group number for this pattern. To cut it off
  * earlier, escape the first digit that should not be used.
  *
  * @param {string} replacement the replacement string
  * @param {boolean} [javaMode=false] activate java mode (different behaviour for capture groups and special characters)
  * @returns {string}
  * @throws IllegalStateException if there was no most recent match
  * @throws IndexOutOfBoundsException if replacement refers to an invalid group
  * @private
  */
  appendReplacement(replacement, javaMode = false) {
    let res = "";
    const s = this.start();
    const e = this.end();
    if (this.appendPos < s) res += this.substring(this.appendPos, s);
    this.appendPos = e;
    res += javaMode ? this.appendReplacementInternalJava(replacement) : this.appendReplacementInternalJs(replacement);
    return res;
  }
  /**
  * @param {string} replacement - the replacement string
  * @returns {string}
  * @private
  */
  appendReplacementInternalJava(replacement) {
    let res = "";
    let last = 0;
    const m = replacement.length;
    let i = 0;
    while (i < m) {
      const cCode = replacement.codePointAt(i);
      if (cCode === Codepoint.CODES.get("\\")) {
        if (last < i) res += replacement.substring(last, i);
        i++;
        if (i >= m) throw new RE2JSGroupException("character to be escaped is missing");
        last = i;
        i++;
        continue;
      }
      if (cCode === Codepoint.CODES.get("$")) {
        if (last < i) res += replacement.substring(last, i);
        if (i + 1 >= m) throw new RE2JSGroupException("Illegal group reference: group index is missing");
        const nextCode = replacement.codePointAt(i + 1);
        if (Codepoint.CODES.get("0") <= nextCode && nextCode <= Codepoint.CODES.get("9")) {
          let n = nextCode - Codepoint.CODES.get("0");
          let j = i + 2;
          for (; j < m; j++) {
            const digit = replacement.codePointAt(j);
            if (digit < Codepoint.CODES.get("0") || digit > Codepoint.CODES.get("9") || n * 10 + digit - Codepoint.CODES.get("0") > this.patternGroupCount) break;
            n = n * 10 + digit - Codepoint.CODES.get("0");
          }
          if (n > this.patternGroupCount) throw new RE2JSGroupException(`n > number of groups: ${n}`);
          const group = this.group(n);
          if (group !== null) res += group;
          i = j;
          last = i;
        } else if (nextCode === Codepoint.CODES.get("{")) {
          let j = i + 2;
          while (j < m && replacement.codePointAt(j) !== Codepoint.CODES.get("}")) j++;
          if (j >= m) throw new RE2JSGroupException("named capture group is missing trailing '}'");
          const groupName = replacement.substring(i + 2, j);
          const groupVal = this.group(groupName);
          if (groupVal !== null) res += groupVal;
          i = j + 1;
          last = i;
        } else throw new RE2JSGroupException("Illegal group reference");
        continue;
      }
      i++;
    }
    if (last < m) res += replacement.substring(last, m);
    return res;
  }
  /**
  * @param {string} replacement - the replacement string
  * @returns {string}
  * @private
  */
  appendReplacementInternalJs(replacement) {
    let res = "";
    let last = 0;
    const m = replacement.length;
    for (let i = 0; i < m - 1; i++) if (replacement.codePointAt(i) === Codepoint.CODES.get("$")) {
      let c = replacement.codePointAt(i + 1);
      if (Codepoint.CODES.get("$") === c) {
        if (last < i) res += replacement.substring(last, i);
        res += "$";
        i++;
        last = i + 1;
        continue;
      } else if (Codepoint.CODES.get("&") === c) {
        if (last < i) res += replacement.substring(last, i);
        const group = this.group(0);
        if (group !== null) res += group;
        else res += "$&";
        i++;
        last = i + 1;
        continue;
      } else if (Codepoint.CODES.get("`") === c) {
        if (last < i) res += replacement.substring(last, i);
        res += this.substring(0, this.start(0));
        i++;
        last = i + 1;
        continue;
      } else if (Codepoint.CODES.get("'") === c) {
        if (last < i) res += replacement.substring(last, i);
        res += this.substring(this.end(0), this.matcherInputLength);
        i++;
        last = i + 1;
        continue;
      } else if (Codepoint.CODES.get("1") <= c && c <= Codepoint.CODES.get("9")) {
        let n = c - Codepoint.CODES.get("0");
        if (last < i) res += replacement.substring(last, i);
        for (i += 2; i < m; i++) {
          c = replacement.codePointAt(i);
          if (c < Codepoint.CODES.get("0") || c > Codepoint.CODES.get("9") || n * 10 + c - Codepoint.CODES.get("0") > this.patternGroupCount) break;
          n = n * 10 + c - Codepoint.CODES.get("0");
        }
        if (n > this.patternGroupCount) {
          res += `$${n}`;
          last = i;
          i--;
          continue;
        }
        const group = this.group(n);
        if (group !== null) res += group;
        last = i;
        i--;
        continue;
      } else if (c === Codepoint.CODES.get("<")) {
        if (last < i) res += replacement.substring(last, i);
        i++;
        let j = i + 1;
        while (j < replacement.length && replacement.codePointAt(j) !== Codepoint.CODES.get(">") && replacement.codePointAt(j) !== Codepoint.CODES.get(" ")) j++;
        if (j === replacement.length || replacement.codePointAt(j) !== Codepoint.CODES.get(">")) {
          res += replacement.substring(i - 1, j + 1);
          last = j + 1;
          i = j;
          continue;
        }
        const groupName = replacement.substring(i + 1, j);
        if (Object.prototype.hasOwnProperty.call(this.namedGroups, groupName)) {
          const groupVal = this.group(groupName);
          if (groupVal !== null) res += groupVal;
        } else res += `$<${groupName}>`;
        last = j + 1;
        i = j;
        continue;
      }
    }
    if (last < m) res += replacement.substring(last, m);
    return res;
  }
  /**
  * Return the substring of the input from the append position to the end of the
  * input.
  * @returns {string}
  */
  appendTail() {
    return this.substring(this.appendPos, this.matcherInputLength);
  }
  /**
  * Returns the input with all matches replaced by {@code replacement}, interpreted as for
  * {@code appendReplacement}.
  *
  * @param {string|((...args: any[]) => string)} replacement - the replacement string or a replacer function
  * @param {boolean} [javaMode=false] - activate java mode (different behaviour for capture groups and special characters)
  * @returns {string} the input string with the matches replaced
  * @throws IndexOutOfBoundsException if replacement refers to an invalid group and javaMode is true
  */
  replaceAll(replacement, javaMode = false) {
    return this.replace(replacement, true, javaMode);
  }
  /**
  * Returns the input with the first match replaced by {@code replacement}, interpreted as for
  * {@code appendReplacement}.
  *
  * @param {string|((...args: any[]) => string)} replacement - the replacement string or a replacer function
  * @param {boolean} [javaMode=false] - activate java mode (different behaviour for capture groups and special characters)
  * @returns {string} the input string with the first match replaced
  * @throws IndexOutOfBoundsException if replacement refers to an invalid group and javaMode is true
  */
  replaceFirst(replacement, javaMode = false) {
    return this.replace(replacement, false, javaMode);
  }
  /**
  * Helper: replaceAll/replaceFirst hybrid.
  * @param {string|((...args: any[]) => string)} replacement - the replacement string or a replacer function
  * @param {boolean} [all=true] - replace all matches
  * @param {boolean} [javaMode=false] - activate java mode (different behaviour for capture groups and special characters)
  * @returns {string}
  * @private
  */
  replace(replacement, all = true, javaMode = false) {
    let res = "";
    this.reset();
    const isFunc = typeof replacement === "function";
    const hasNamedGroups = Object.keys(this.namedGroups).length > 0;
    let originalInput = null;
    if (isFunc) {
      if (this.groupCount() >= Matcher2.MAX_REPLACER_ARGS) throw new RE2JSGroupException("Too many capture groups to safely invoke replacer function");
      originalInput = this.matcherInput.isUTF8Encoding() ? this.matcherInput.asBytes() : this.matcherInput.asCharSequence();
    }
    while (this.find()) {
      res += isFunc ? this.appendReplacementFunc(replacement, hasNamedGroups, originalInput) : this.appendReplacement(replacement, javaMode);
      if (!all) break;
    }
    res += this.appendTail();
    return res;
  }
  /**
  * Evaluates a replacer function for the current match and appends the result,
  * along with any un-matched preceding text, advancing the append position.
  * @param {Function} replacer - the replacer function
  * @param {boolean} hasNamedGroups - cached flag if pattern has named groups
  * @param {string|Uint8Array|number[]} originalInput - the cached original input reference
  * @returns {string} the evaluated string to append
  * @private
  */
  appendReplacementFunc(replacer, hasNamedGroups, originalInput) {
    let res = "";
    const s = this.start();
    const e = this.end();
    if (this.appendPos < s) res += this.substring(this.appendPos, s);
    this.appendPos = e;
    const args = this.buildReplacerArgs(s, hasNamedGroups, originalInput);
    res += String(replacer(...args));
    return res;
  }
  /**
  * Builds the argument array for the replacer function matching the standard
  * JS String.prototype.replace(regex, replacer) signature.
  * @param {number} matchStart - the start index of the match
  * @param {boolean} hasNamedGroups - cached flag if pattern has named groups
  * @param {string|Uint8Array|number[]} originalInput - the cached original input reference
  * @returns {Array} array of arguments
  * @private
  */
  buildReplacerArgs(matchStart, hasNamedGroups, originalInput) {
    const args = [this.group(0)];
    const numGroups = this.groupCount();
    for (let i = 1; i <= numGroups; i++) {
      const start = this.start(i);
      if (start < 0) args.push(void 0);
      else args.push(this.substring(start, this.end(i)));
    }
    args.push(matchStart);
    args.push(originalInput);
    if (hasNamedGroups) {
      const parsedGroups = this.getNamedGroups();
      for (const key in parsedGroups) if (parsedGroups[key] === null) parsedGroups[key] = void 0;
      args.push(parsedGroups);
    }
    return args;
  }
};
var Inst = class Inst2 {
  static ALT = 1;
  static ALT_MATCH = 2;
  static CAPTURE = 3;
  static EMPTY_WIDTH = 4;
  static FAIL = 5;
  static MATCH = 6;
  static NOP = 7;
  static RUNE = 8;
  static RUNE1 = 9;
  static RUNE_ANY = 10;
  static RUNE_ANY_NOT_NL = 11;
  static LB_WRITE = 12;
  static LB_CHECK = 13;
  static isRuneOp(op) {
    return Inst2.RUNE <= op && op <= Inst2.RUNE_ANY_NOT_NL;
  }
  static escapeRunes(runes) {
    let out = '"';
    for (let rune of runes) out += Utils.escapeRune(rune);
    out += '"';
    return out;
  }
  constructor(op) {
    this.op = op;
    this.out = 0;
    this.arg = 0;
    this.runes = [];
    this.next = null;
  }
  matchRune(r) {
    if (this.runes.length === 1) {
      const r0 = this.runes[0];
      if ((this.arg & RE2Flags.FOLD_CASE) !== 0) return Unicode.equalsIgnoreCase(r0, r);
      return r === r0;
    }
    const len = this.runes.length;
    if (len === 0) return false;
    if (len === 2 || len === 4 || len === 6 || len === 8) {
      for (let j = 0; j < len; j += 2) {
        if (r < this.runes[j]) return false;
        if (r <= this.runes[j + 1]) return true;
      }
      return false;
    }
    let base = 0;
    let n = len >> 1;
    while (n > 1) {
      const half = n >> 1;
      base += this.runes[base + half << 1] <= r ? half : 0;
      n -= half;
    }
    base += this.runes[base << 1] <= r ? 1 : 0;
    const m = base - 1;
    return m >= 0 && r <= this.runes[m << 1 | 1];
  }
  matchRunePos(r) {
    if (this.runes.length === 1) {
      const r0 = this.runes[0];
      if ((this.arg & RE2Flags.FOLD_CASE) !== 0) return Unicode.equalsIgnoreCase(r0, r) ? 0 : -1;
      return r === r0 ? 0 : -1;
    }
    const len = this.runes.length;
    if (len === 0) return -1;
    if (len === 2 || len === 4 || len === 6 || len === 8) {
      for (let j = 0; j < len; j += 2) {
        if (r < this.runes[j]) return -1;
        if (r <= this.runes[j + 1]) return Math.floor(j / 2);
      }
      return -1;
    }
    let base = 0;
    let n = len >> 1;
    while (n > 1) {
      const half = n >> 1;
      base += this.runes[base + half << 1] <= r ? half : 0;
      n -= half;
    }
    base += this.runes[base << 1] <= r ? 1 : 0;
    const m = base - 1;
    return m >= 0 && r <= this.runes[m << 1 | 1] ? m : -1;
  }
  /**
  *
  * @returns {string}
  */
  toString() {
    switch (this.op) {
      case Inst2.ALT:
        return `alt -> ${this.out}, ${this.arg}`;
      case Inst2.ALT_MATCH:
        return `altmatch -> ${this.out}, ${this.arg}`;
      case Inst2.CAPTURE:
        return `cap ${this.arg} -> ${this.out}`;
      case Inst2.EMPTY_WIDTH:
        return `empty ${this.arg} -> ${this.out}`;
      case Inst2.MATCH:
        return `match${this.arg !== 0 ? ` ${this.arg}` : ""}`;
      case Inst2.FAIL:
        return "fail";
      case Inst2.NOP:
        return `nop -> ${this.out}`;
      case Inst2.LB_WRITE:
        return `lbwrite ${this.arg} -> ${this.out}`;
      case Inst2.LB_CHECK:
        return `lbcheck ${this.arg} -> ${this.out}`;
      case Inst2.RUNE:
        if (this.runes === null) return "rune <null>";
        return [
          "rune ",
          Inst2.escapeRunes(this.runes),
          (this.arg & RE2Flags.FOLD_CASE) !== 0 ? "/i" : "",
          " -> ",
          this.out
        ].join("");
      case Inst2.RUNE1:
        return `rune1 ${Inst2.escapeRunes(this.runes)} -> ${this.out}`;
      case Inst2.RUNE_ANY:
        return `any -> ${this.out}`;
      case Inst2.RUNE_ANY_NOT_NL:
        return `anynotnl -> ${this.out}`;
      default:
        throw new Error("unhandled case in Inst.toString");
    }
  }
};
var Queue = class {
  constructor(numInst) {
    this.sparse = new Int32Array(numInst);
    this.densePcs = new Int32Array(numInst);
    this.denseCaps = null;
    this.size = 0;
    this.ncap = 0;
  }
  init(ncap) {
    this.ncap = ncap;
    const needed = this.densePcs.length * ncap;
    if (!this.denseCaps || this.denseCaps.length < needed) this.denseCaps = new Int32Array(needed);
  }
  contains(pc) {
    const j = this.sparse[pc];
    return j < this.size && this.densePcs[j] === pc;
  }
  isEmpty() {
    return this.size === 0;
  }
  add(pc) {
    const j = this.size++;
    this.sparse[pc] = j;
    this.densePcs[j] = pc;
    return j;
  }
  clear() {
    this.size = 0;
  }
  toString() {
    let out = "{";
    for (let i = 0; i < this.size; i++) {
      if (i !== 0) out += ", ";
      out += this.densePcs[i];
    }
    out += "}";
    return out;
  }
};
var Machine = class Machine2 {
  static fromRE2(re2) {
    const m = new Machine2();
    m.prog = re2.prog;
    m.re2 = re2;
    m.q0 = new Queue(m.prog.numInst());
    m.q1 = new Queue(m.prog.numInst());
    m.matched = false;
    m.matchcap = new Int32Array(m.prog.numCap < 2 ? 2 : m.prog.numCap);
    m.ncap = 0;
    return m;
  }
  static fromMachine(machine) {
    return Machine2.fromRE2(machine.re2);
  }
  constructor() {
    this.prog = null;
    this.re2 = null;
    this.q0 = null;
    this.q1 = null;
    this.matched = false;
    this.matchcap = null;
    this.ncap = 0;
    this.lbTable = null;
  }
  init(ncap) {
    this.ncap = ncap;
    if (ncap > this.matchcap.length) this.matchcap = new Int32Array(ncap).fill(-1);
    else this.matchcap.fill(-1);
    this.q0.init(ncap);
    this.q1.init(ncap);
    if (this.prog.numLb > 0) {
      if (!this.lbTable || this.lbTable.length < this.prog.numLb + 1) this.lbTable = new Int32Array(this.prog.numLb + 1);
      this.lbTable.fill(-1);
    }
  }
  submatches() {
    if (this.ncap === 0) return Utils.emptyInts();
    return Utils.toArray(this.matchcap.subarray(0, this.ncap));
  }
  match(input, pos, anchor) {
    const startCond = this.re2.cond;
    if (startCond === Utils.EMPTY_ALL) return false;
    if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && pos !== 0) return false;
    this.matched = false;
    this.matchcap.fill(-1);
    let currentPos = this.prog.numLb > 0 ? 0 : pos;
    let matchStartPos = pos;
    let runq = this.q0;
    let nextq = this.q1;
    let r = input.step(currentPos);
    let rune = r >> 3;
    let width = r & 7;
    let rune1 = -1;
    let width1 = 0;
    if (r !== MachineInputBase.EOF()) {
      r = input.step(currentPos + width);
      rune1 = r >> 3;
      width1 = r & 7;
    }
    let flag;
    if (currentPos === 0) flag = Utils.emptyOpContext(-1, rune);
    else flag = input.context(currentPos);
    while (true) {
      if (runq.isEmpty()) {
        if ((startCond & Utils.EMPTY_BEGIN_TEXT) !== 0 && currentPos !== 0) break;
        if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && currentPos !== 0) break;
        if (this.matched) break;
        if (this.prog.numLb === 0 && !(this.re2.prefix.length === 0) && rune1 !== this.re2.prefixRune && input.canCheckPrefix()) {
          const advance = input.index(this.re2, currentPos);
          if (advance < 0) break;
          currentPos += advance;
          r = input.step(currentPos);
          rune = r >> 3;
          width = r & 7;
          r = input.step(currentPos + width);
          rune1 = r >> 3;
          width1 = r & 7;
          flag = input.context(currentPos);
        }
      }
      if (currentPos === 0 && this.prog.numLb > 0) for (let i = 0; i < this.prog.lbStarts.length; i++) this.add(runq, this.prog.lbStarts[i], currentPos, this.matchcap, 0, flag);
      if (!this.matched && (currentPos === 0 || anchor === RE2Flags.UNANCHORED)) {
        if (currentPos >= matchStartPos) {
          if (this.ncap > 0) this.matchcap[0] = currentPos;
          this.add(runq, this.prog.start, currentPos, this.matchcap, 0, flag);
        }
      }
      const nextPos = currentPos + width;
      flag = input.context(nextPos);
      this.step(runq, nextq, currentPos, nextPos, rune, flag, anchor, currentPos === input.endPos());
      if (width === 0) break;
      if (this.ncap === 0 && this.matched) break;
      currentPos += width;
      rune = rune1;
      width = width1;
      if (rune !== -1) {
        r = input.step(currentPos + width);
        rune1 = r >> 3;
        width1 = r & 7;
      }
      const tmpq = runq;
      runq = nextq;
      nextq = tmpq;
    }
    nextq.clear();
    return this.matched;
  }
  matchSet(input, pos, anchor) {
    const startCond = this.re2.cond;
    if (startCond === Utils.EMPTY_ALL) return [];
    if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && pos !== 0) return [];
    let currentPos = this.prog.numLb > 0 ? 0 : pos;
    let matchStartPos = pos;
    let runq = this.q0;
    let nextq = this.q1;
    let r = input.step(currentPos);
    let rune = r >> 3;
    let width = r & 7;
    let rune1 = -1;
    let width1 = 0;
    if (r !== MachineInputBase.EOF()) {
      r = input.step(currentPos + width);
      rune1 = r >> 3;
      width1 = r & 7;
    }
    let flag = currentPos === 0 ? Utils.emptyOpContext(-1, rune) : input.context(currentPos);
    const matches = /* @__PURE__ */ new Set();
    while (true) {
      if (runq.isEmpty()) {
        if ((startCond & Utils.EMPTY_BEGIN_TEXT) !== 0 && currentPos !== 0) break;
        if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && currentPos !== 0) break;
      }
      if (currentPos === 0 && this.prog.numLb > 0) for (let i = 0; i < this.prog.lbStarts.length; i++) this.add(runq, this.prog.lbStarts[i], currentPos, this.matchcap, 0, flag);
      if (currentPos === 0 || anchor === RE2Flags.UNANCHORED) {
        if (currentPos >= matchStartPos) this.add(runq, this.prog.start, currentPos, this.matchcap, 0, flag);
      }
      const nextPos = currentPos + width;
      flag = input.context(nextPos);
      for (let j = 0; j < runq.size; j++) {
        const pc = runq.densePcs[j];
        const i = this.prog.inst[pc];
        const capOffset = j * this.ncap;
        let add = false;
        switch (i.op) {
          case Inst.MATCH:
            if (anchor === RE2Flags.ANCHOR_BOTH && currentPos !== input.endPos()) break;
            matches.add(i.arg);
            break;
          case Inst.RUNE:
            add = i.matchRune(rune);
            break;
          case Inst.RUNE1:
            add = rune === i.runes[0];
            break;
          case Inst.RUNE_ANY:
            add = true;
            break;
          case Inst.RUNE_ANY_NOT_NL:
            add = rune !== 10;
            break;
          default:
            continue;
        }
        if (add) this.add(nextq, i.out, nextPos, runq.denseCaps, capOffset, flag);
      }
      runq.clear();
      if (width === 0) break;
      currentPos += width;
      rune = rune1;
      width = width1;
      if (rune !== -1) {
        r = input.step(currentPos + width);
        rune1 = r >> 3;
        width1 = r & 7;
      }
      const tmpq = runq;
      runq = nextq;
      nextq = tmpq;
    }
    nextq.clear();
    return Array.from(matches).sort((a, b) => a - b);
  }
  step(runq, nextq, pos, nextPos, c, nextCond, anchor, atEnd) {
    const longest = this.re2.longest;
    for (let j = 0; j < runq.size; j++) {
      const pc = runq.densePcs[j];
      const capOffset = j * this.ncap;
      if (longest && this.matched && this.ncap > 0 && this.matchcap[0] < runq.denseCaps[capOffset]) continue;
      const i = this.prog.inst[pc];
      let add = false;
      switch (i.op) {
        case Inst.MATCH:
          if (anchor === RE2Flags.ANCHOR_BOTH && !atEnd) break;
          if (this.ncap > 0 && (!longest || !this.matched || this.matchcap[1] < pos)) {
            runq.denseCaps[capOffset + 1] = pos;
            for (let k = 0; k < this.ncap; k++) this.matchcap[k] = runq.denseCaps[capOffset + k];
          }
          if (!longest) runq.size = 0;
          this.matched = true;
          break;
        case Inst.RUNE:
          add = i.matchRune(c);
          break;
        case Inst.RUNE1:
          add = c === i.runes[0];
          break;
        case Inst.RUNE_ANY:
          add = true;
          break;
        case Inst.RUNE_ANY_NOT_NL:
          add = c !== 10;
          break;
        default:
          continue;
      }
      if (add) this.add(nextq, i.out, nextPos, runq.denseCaps, capOffset, nextCond);
    }
    runq.clear();
  }
  add(q, pc, pos, capArray, capOffset, cond) {
    while (true) {
      if (pc === 0) return;
      if (q.contains(pc)) return;
      const d = q.add(pc);
      const inst = this.prog.inst[pc];
      switch (inst.op) {
        case Inst.FAIL:
          return;
        case Inst.ALT:
        case Inst.ALT_MATCH:
          this.add(q, inst.out, pos, capArray, capOffset, cond);
          pc = inst.arg;
          continue;
        case Inst.EMPTY_WIDTH:
          if ((inst.arg & ~cond) === 0) {
            pc = inst.out;
            continue;
          }
          return;
        case Inst.NOP:
          pc = inst.out;
          continue;
        case Inst.CAPTURE:
          if (inst.arg < this.ncap) {
            const opos = capArray[capOffset + inst.arg];
            capArray[capOffset + inst.arg] = pos;
            this.add(q, inst.out, pos, capArray, capOffset, cond);
            capArray[capOffset + inst.arg] = opos;
            return;
          } else {
            pc = inst.out;
            continue;
          }
        case Inst.LB_WRITE:
          this.lbTable[Math.abs(inst.arg)] = pos;
          pc = inst.out;
          continue;
        case Inst.LB_CHECK:
          if (inst.arg > 0) {
            if (this.lbTable[inst.arg] === pos) {
              pc = inst.out;
              continue;
            }
          } else if (this.lbTable[-inst.arg] !== pos) {
            pc = inst.out;
            continue;
          }
          return;
        case Inst.MATCH:
        case Inst.RUNE:
        case Inst.RUNE1:
        case Inst.RUNE_ANY:
        case Inst.RUNE_ANY_NOT_NL:
          if (this.ncap > 0) {
            const destOffset = d * this.ncap;
            for (let c = 0; c < this.ncap; c++) q.denseCaps[destOffset + c] = capArray[capOffset + c];
          }
          return;
        default:
          throw new RE2JSInternalException("unhandled");
      }
    }
  }
};
var hashPCs = (pcs) => {
  let h = -2128831035;
  for (let i = 0; i < pcs.length; i++) {
    h ^= pcs[i];
    h = Math.imul(h, 16777619);
  }
  return h;
};
var arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};
var DFAState = class {
  constructor(nfaStates, isMatch, matchIDs = []) {
    this.nfaStates = nfaStates;
    this.isMatch = isMatch;
    this.matchIDs = matchIDs;
    this.nextLatin1 = new Array(Unicode.MAX_LATIN1 + 1).fill(null);
    this.nextLatin1Anchored = new Array(Unicode.MAX_LATIN1 + 1).fill(null);
    this.transKeys = [];
    this.transVals = [];
    this.lastSeen = 0;
  }
};
var DFA = class DFA2 {
  static MAX_CACHE_CLEARS = 5;
  static STATE_MEMORY_ESTIMATE = 838;
  constructor(prog, maxMem = 8388608) {
    this.prog = prog;
    this.stateCache = /* @__PURE__ */ new Map();
    this.stateCount = 0;
    this.startState = null;
    this.stateLimit = Math.max(1, Math.floor(maxMem / DFA2.STATE_MEMORY_ESTIMATE));
    this.cacheClears = 0;
    this.failed = false;
    this.clock = 0;
  }
  computeClosure(pcs) {
    const closure = /* @__PURE__ */ new Set();
    const stack = [...pcs];
    let isMatch = false;
    const matchIDs = [];
    while (stack.length > 0) {
      const pc = stack.pop();
      if (closure.has(pc)) continue;
      closure.add(pc);
      const inst = this.prog.getInst(pc);
      switch (inst.op) {
        case Inst.MATCH:
          isMatch = true;
          if (!matchIDs.includes(inst.arg)) matchIDs.push(inst.arg);
          break;
        case Inst.ALT:
        case Inst.ALT_MATCH:
          stack.push(inst.out);
          stack.push(inst.arg);
          break;
        case Inst.NOP:
        case Inst.CAPTURE:
          stack.push(inst.out);
          break;
        case Inst.EMPTY_WIDTH:
        case Inst.LB_WRITE:
        case Inst.LB_CHECK:
          return null;
      }
    }
    const sortedPCs = Int32Array.from(closure).sort();
    matchIDs.sort((a, b) => a - b);
    return {
      pcs: sortedPCs,
      isMatch,
      matchIDs
    };
  }
  getState(pcs) {
    const closureResult = this.computeClosure(pcs);
    if (!closureResult) return null;
    const sortedPCs = closureResult.pcs;
    const hash = hashPCs(sortedPCs);
    let bucket = this.stateCache.get(hash);
    if (bucket) for (let i = 0; i < bucket.length; i++) {
      const state2 = bucket[i];
      if (arraysEqual(state2.nfaStates, sortedPCs)) {
        state2.lastSeen = ++this.clock;
        return state2;
      }
    }
    else {
      bucket = [];
      this.stateCache.set(hash, bucket);
    }
    if (this.failed) return null;
    if (this.stateCount >= this.stateLimit) {
      this.cacheClears++;
      if (this.cacheClears >= DFA2.MAX_CACHE_CLEARS) {
        this.failed = true;
        this.stateCache.clear();
        this.stateCount = 0;
        this.startState = null;
        return null;
      }
      this.evictCache();
      bucket = this.stateCache.get(hash);
      if (!bucket) {
        bucket = [];
        this.stateCache.set(hash, bucket);
      }
    }
    const state = new DFAState(sortedPCs, closureResult.isMatch, closureResult.matchIDs);
    state.lastSeen = ++this.clock;
    bucket.push(state);
    this.stateCount++;
    return state;
  }
  evictCache() {
    const allStates = [];
    for (const bucket of this.stateCache.values()) for (let i = 0; i < bucket.length; i++) allStates.push(bucket[i]);
    allStates.sort((a, b) => a.lastSeen - b.lastSeen);
    const keepCount = Math.max(1, Math.floor(this.stateLimit / 2));
    const startIndex = allStates.length - keepCount;
    const survivorsArray = allStates.slice(startIndex);
    const survivors = new Set(survivorsArray);
    this.stateCache.clear();
    this.stateCount = 0;
    for (let i = 0; i < survivorsArray.length; i++) {
      const state = survivorsArray[i];
      state.nextLatin1.fill(null);
      state.nextLatin1Anchored.fill(null);
      state.transKeys.length = 0;
      state.transVals.length = 0;
      const hash = hashPCs(state.nfaStates);
      let bucket = this.stateCache.get(hash);
      if (!bucket) {
        bucket = [];
        this.stateCache.set(hash, bucket);
      }
      bucket.push(state);
      this.stateCount++;
    }
    if (this.startState && !survivors.has(this.startState)) this.startState = null;
  }
  step(state, charCode, anchor) {
    if (charCode <= Unicode.MAX_LATIN1) if (anchor === RE2Flags.UNANCHORED) {
      const next = state.nextLatin1[charCode];
      if (next !== null) return next;
    } else {
      const next = state.nextLatin1Anchored[charCode];
      if (next !== null) return next;
    }
    else {
      const key = charCode + (anchor === RE2Flags.UNANCHORED ? 0 : Unicode.MAX_RUNE + 1);
      const keys = state.transKeys;
      const len = keys.length;
      for (let i = 0; i < len; i++) if (keys[i] === key) return state.transVals[i];
    }
    const nextPCs = [];
    for (let i = 0; i < state.nfaStates.length; i++) {
      const pc = state.nfaStates[i];
      const inst = this.prog.getInst(pc);
      if (Inst.isRuneOp(inst.op) && inst.matchRune(charCode)) nextPCs.push(inst.out);
    }
    if (anchor === RE2Flags.UNANCHORED) nextPCs.push(this.prog.start);
    const nextState = this.getState(nextPCs);
    if (charCode <= Unicode.MAX_LATIN1) if (anchor === RE2Flags.UNANCHORED) state.nextLatin1[charCode] = nextState;
    else state.nextLatin1Anchored[charCode] = nextState;
    else {
      const key = charCode + (anchor === RE2Flags.UNANCHORED ? 0 : Unicode.MAX_RUNE + 1);
      state.transKeys.push(key);
      state.transVals.push(nextState);
    }
    return nextState;
  }
  match(input, pos, anchor) {
    if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && pos !== 0) return false;
    if (!this.startState) {
      this.startState = this.getState([this.prog.start]);
      if (!this.startState) return null;
    }
    let endPos = input.endPos();
    let currentState = this.startState;
    if (currentState.isMatch) if (anchor === RE2Flags.ANCHOR_BOTH) {
      if (pos === endPos) return true;
    } else return true;
    let i = pos;
    while (i < endPos) {
      const r = input.step(i);
      const rune = r >> 3;
      const width = r & 7;
      if (width === 0) break;
      currentState = anchor === RE2Flags.UNANCHORED && rune <= Unicode.MAX_LATIN1 && currentState.nextLatin1[rune] || this.step(currentState, rune, anchor);
      if (currentState === null) return null;
      currentState.lastSeen = ++this.clock;
      if (currentState.isMatch) if (anchor === RE2Flags.ANCHOR_BOTH) {
        if (i + width === endPos) return true;
      } else return true;
      if (currentState.nfaStates.length === 0) {
        if (anchor !== RE2Flags.UNANCHORED) return false;
      }
      i += width;
    }
    return false;
  }
  matchSet(input, pos, anchor) {
    if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && pos !== 0) return [];
    if (!this.startState) {
      this.startState = this.getState([this.prog.start]);
      if (!this.startState) return null;
    }
    let endPos = input.endPos();
    let currentState = this.startState;
    const matches = /* @__PURE__ */ new Set();
    const checkMatch = (state, currentPos) => {
      if (state.isMatch) if (anchor === RE2Flags.ANCHOR_BOTH) {
        if (currentPos === endPos) state.matchIDs.forEach((id) => matches.add(id));
      } else state.matchIDs.forEach((id) => matches.add(id));
    };
    checkMatch(currentState, pos);
    let i = pos;
    while (i < endPos) {
      const r = input.step(i);
      const rune = r >> 3;
      const width = r & 7;
      if (width === 0) break;
      currentState = anchor === RE2Flags.UNANCHORED && rune <= Unicode.MAX_LATIN1 && currentState.nextLatin1[rune] || this.step(currentState, rune, anchor);
      if (currentState === null) return null;
      currentState.lastSeen = ++this.clock;
      i += width;
      checkMatch(currentState, i);
      if (currentState.nfaStates.length === 0) {
        if (anchor !== RE2Flags.UNANCHORED) break;
      }
    }
    return Array.from(matches).sort((a, b) => a - b);
  }
};
var VISITED_BITS = 32;
var MAX_BACKTRACK_PROG = 500;
var INITIAL_JOB_CAPACITY = 256;
var MAX_BACKTRACK_VECTOR = 256 * 1024;
var BitState = class {
  constructor() {
    this.end = 0;
    this.cap = /* @__PURE__ */ new Int32Array(0);
    this.matchcap = /* @__PURE__ */ new Int32Array(0);
    this.ncap = 0;
    this.jobPc = new Int32Array(INITIAL_JOB_CAPACITY);
    this.jobArg = new Uint8Array(INITIAL_JOB_CAPACITY);
    this.jobPos = new Int32Array(INITIAL_JOB_CAPACITY);
    this.jobLen = 0;
    this.visited = /* @__PURE__ */ new Uint32Array(0);
  }
  reset(prog, end, ncap) {
    this.end = end;
    this.jobLen = 0;
    this.ncap = ncap;
    const visitedSize = prog.numInst() * (end + 1) + VISITED_BITS - 1 >>> 5;
    if (this.visited.length < visitedSize) this.visited = new Uint32Array(visitedSize);
    else this.visited.fill(0, 0, visitedSize);
    if (this.cap.length < ncap) this.cap = new Int32Array(ncap).fill(-1);
    else this.cap.fill(-1, 0, ncap);
    if (this.matchcap.length < ncap) this.matchcap = new Int32Array(ncap).fill(-1);
    else this.matchcap.fill(-1, 0, ncap);
  }
  shouldVisit(pc, pos) {
    const n = pc * (this.end + 1) + pos;
    const idx = n >>> 5;
    const mask = 1 << (n & 31);
    if ((this.visited[idx] & mask) !== 0) return false;
    this.visited[idx] |= mask;
    return true;
  }
  push(re2, pc, pos, arg) {
    if (re2.prog.getInst(pc).op !== Inst.FAIL && (arg || this.shouldVisit(pc, pos))) {
      if (this.jobLen >= this.jobPc.length) {
        const newSize = this.jobPc.length * 2;
        const newPc = new Int32Array(newSize);
        newPc.set(this.jobPc);
        this.jobPc = newPc;
        const newArg = new Uint8Array(newSize);
        newArg.set(this.jobArg);
        this.jobArg = newArg;
        const newPos = new Int32Array(newSize);
        newPos.set(this.jobPos);
        this.jobPos = newPos;
      }
      this.jobPc[this.jobLen] = pc;
      this.jobArg[this.jobLen] = arg ? 1 : 0;
      this.jobPos[this.jobLen] = pos;
      this.jobLen++;
    }
  }
  tryBacktrack(re2, input, pc, pos, anchor) {
    const longest = re2.longest;
    this.push(re2, pc, pos, false);
    while (this.jobLen > 0) {
      this.jobLen--;
      let currentPc = this.jobPc[this.jobLen];
      let arg = this.jobArg[this.jobLen] === 1;
      let currentPos = this.jobPos[this.jobLen];
      let skipShouldVisit = true;
      while (true) {
        if (!skipShouldVisit) {
          if (!this.shouldVisit(currentPc, currentPos)) break;
        }
        skipShouldVisit = false;
        const inst = re2.prog.getInst(currentPc);
        switch (inst.op) {
          case Inst.FAIL:
            throw new RE2JSInternalException("unexpected InstFail");
          case Inst.ALT:
            if (arg) {
              arg = false;
              currentPc = inst.arg;
              continue;
            } else {
              this.push(re2, currentPc, currentPos, true);
              currentPc = inst.out;
              continue;
            }
          case Inst.ALT_MATCH: {
            const outInst = re2.prog.getInst(inst.out);
            if (Inst.isRuneOp(outInst.op)) {
              this.push(re2, inst.arg, currentPos, false);
              currentPc = inst.arg;
              currentPos = this.end;
              continue;
            }
            this.push(re2, inst.out, this.end, false);
            currentPc = inst.out;
            continue;
          }
          case Inst.RUNE: {
            const r = input.step(currentPos);
            if (r === MachineInputBase.EOF()) break;
            if (!inst.matchRune(r >> 3)) break;
            currentPos += r & 7;
            currentPc = inst.out;
            continue;
          }
          case Inst.RUNE1: {
            const r = input.step(currentPos);
            if (r === MachineInputBase.EOF()) break;
            if (r >> 3 !== inst.runes[0]) break;
            currentPos += r & 7;
            currentPc = inst.out;
            continue;
          }
          case Inst.RUNE_ANY_NOT_NL: {
            const r = input.step(currentPos);
            if (r === MachineInputBase.EOF()) break;
            if (r >> 3 === 10) break;
            currentPos += r & 7;
            currentPc = inst.out;
            continue;
          }
          case Inst.RUNE_ANY: {
            const r = input.step(currentPos);
            if (r === MachineInputBase.EOF()) break;
            currentPos += r & 7;
            currentPc = inst.out;
            continue;
          }
          case Inst.CAPTURE:
            if (arg) {
              this.cap[inst.arg] = currentPos;
              break;
            } else {
              if (inst.arg < this.ncap) {
                this.push(re2, currentPc, this.cap[inst.arg], true);
                this.cap[inst.arg] = currentPos;
              }
              currentPc = inst.out;
              continue;
            }
          case Inst.EMPTY_WIDTH: {
            const flag = input.context(currentPos);
            if ((inst.arg & ~flag) !== 0) break;
            currentPc = inst.out;
            continue;
          }
          case Inst.NOP:
            currentPc = inst.out;
            continue;
          case Inst.MATCH: {
            if (anchor === RE2Flags.ANCHOR_BOTH && currentPos !== this.end) break;
            if (this.ncap === 0) return true;
            if (this.ncap > 1) this.cap[1] = currentPos;
            const old = this.matchcap[1];
            if (old === -1 || longest && currentPos > 0 && currentPos > old) this.matchcap.set(this.cap);
            if (!longest) return true;
            if (currentPos === this.end) return true;
            break;
          }
          case Inst.LB_WRITE:
          case Inst.LB_CHECK:
            throw new RE2JSInternalException("Backtracker cannot evaluate Lookbehind instructions");
          default:
            throw new RE2JSInternalException("bad inst");
        }
        break;
      }
    }
    return longest && this.matchcap.length > 1 && this.matchcap[1] >= 0;
  }
};
var bitStatePool = [];
var Backtracker = class Backtracker2 {
  static shouldBacktrack(prog) {
    return prog.numInst() <= MAX_BACKTRACK_PROG;
  }
  static maxBitStateLen(prog) {
    if (!Backtracker2.shouldBacktrack(prog)) return 0;
    return Math.floor(MAX_BACKTRACK_VECTOR / prog.numInst());
  }
  static execute(re2, input, pos, anchor, ncap) {
    const startCond = re2.cond;
    if (startCond === Utils.EMPTY_ALL) return null;
    if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && pos !== 0) return null;
    if ((startCond & Utils.EMPTY_BEGIN_TEXT) !== 0 && pos !== 0) return null;
    const b = bitStatePool.length > 0 ? bitStatePool.pop() : new BitState();
    const end = input.endPos();
    b.reset(re2.prog, end, ncap);
    let matched = false;
    if ((startCond & Utils.EMPTY_BEGIN_TEXT) !== 0 || anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) {
      if (b.ncap > 0) b.cap[0] = pos;
      if (b.tryBacktrack(re2, input, re2.prog.start, pos, anchor)) matched = true;
    } else {
      let width = -1;
      for (; pos <= end && width !== 0; pos += width) {
        if (re2.prefix.length > 0) {
          const advance = input.index(re2, pos);
          if (advance < 0) break;
          pos += advance;
        }
        if (b.ncap > 0) b.cap[0] = pos;
        if (b.tryBacktrack(re2, input, re2.prog.start, pos, anchor)) {
          matched = true;
          break;
        }
        const r = input.step(pos);
        width = r === MachineInputBase.EOF() ? 0 : r & 7;
      }
    }
    if (!matched) {
      bitStatePool.push(b);
      return null;
    }
    const result = ncap === 0 ? [] : Utils.toArray(b.matchcap.subarray(0, ncap));
    bitStatePool.push(b);
    return result;
  }
};
var QueueOnePass = class {
  constructor(size) {
    this.sparse = new Uint32Array(size);
    this.dense = new Uint32Array(size);
    this.size = 0;
    this.nextIndex = 0;
  }
  empty() {
    return this.nextIndex >= this.size;
  }
  next() {
    return this.dense[this.nextIndex++];
  }
  clear() {
    this.size = 0;
    this.nextIndex = 0;
  }
  contains(u) {
    return u < this.sparse.length && this.sparse[u] < this.size && this.dense[this.sparse[u]] === u;
  }
  insert(u) {
    if (!this.contains(u)) this.insertNew(u);
  }
  insertNew(u) {
    if (u >= this.sparse.length) return;
    this.sparse[u] = this.size;
    this.dense[this.size] = u;
    this.size++;
  }
};
var mergeRuneSets = (leftRunes, rightRunes, leftPC, rightPC) => {
  const leftLen = leftRunes.length;
  const rightLen = rightRunes.length;
  let lx = 0, rx = 0;
  const merged = [];
  const next = [];
  let ok = true;
  let ix = -1;
  const extend = (isLeft) => {
    const newArray = isLeft ? leftRunes : rightRunes;
    const low = isLeft ? lx : rx;
    const pc = isLeft ? leftPC : rightPC;
    if (ix > 0 && newArray[low] <= merged[ix]) return false;
    merged.push(newArray[low], newArray[low + 1]);
    if (isLeft) lx += 2;
    else rx += 2;
    ix += 2;
    next.push(pc);
    return true;
  };
  while (lx < leftLen || rx < rightLen) {
    if (rx >= rightLen) ok = extend(true);
    else if (lx >= leftLen) ok = extend(false);
    else if (rightRunes[rx] < leftRunes[lx]) ok = extend(false);
    else ok = extend(true);
    if (!ok) return null;
  }
  return {
    merged,
    next
  };
};
var OnePassProg = class {
  constructor(prog) {
    this.start = prog.start;
    this.numCap = prog.numCap;
    this.inst = new Array(prog.inst.length);
    for (let i = 0; i < prog.inst.length; i++) {
      const orig = prog.inst[i];
      const inst = new Inst(orig.op);
      inst.out = orig.out;
      inst.arg = orig.arg;
      inst.runes = orig.runes ? orig.runes.slice() : [];
      inst.next = null;
      this.inst[i] = inst;
    }
  }
};
var onePassCopy = (prog) => {
  const p = new OnePassProg(prog);
  for (let pc = 0; pc < p.inst.length; pc++) {
    const inst = p.inst[pc];
    if (inst.op !== Inst.ALT && inst.op !== Inst.ALT_MATCH) continue;
    let pAOther = "out";
    let pAAlt = "arg";
    let instAlt = p.inst[inst[pAAlt]];
    if (instAlt.op !== Inst.ALT && instAlt.op !== Inst.ALT_MATCH) {
      pAOther = "arg";
      pAAlt = "out";
      instAlt = p.inst[inst[pAAlt]];
      if (instAlt.op !== Inst.ALT && instAlt.op !== Inst.ALT_MATCH) continue;
    }
    const instOther = p.inst[inst[pAOther]];
    if (instOther.op === Inst.ALT || instOther.op === Inst.ALT_MATCH) continue;
    let pBAlt = "out";
    let pBOther = "arg";
    let patch = false;
    if (instAlt.out === pc) patch = true;
    else if (instAlt.arg === pc) {
      patch = true;
      pBAlt = "arg";
      pBOther = "out";
    }
    if (patch) instAlt[pBAlt] = inst[pAOther];
    if (inst[pAOther] === instAlt[pBAlt]) inst[pAAlt] = instAlt[pBOther];
  }
  return p;
};
var makeOnePass = (p) => {
  if (p.inst.length >= 1e3) return null;
  const instQueue = new QueueOnePass(p.inst.length);
  const visitQueue = new QueueOnePass(p.inst.length);
  const onePassRunes = new Array(p.inst.length);
  const m = new Array(p.inst.length).fill(false);
  const check = (pc) => {
    let ok = true;
    const inst = p.inst[pc];
    if (visitQueue.contains(pc)) return true;
    visitQueue.insert(pc);
    switch (inst.op) {
      case Inst.ALT:
      case Inst.ALT_MATCH: {
        ok = check(inst.out) && check(inst.arg);
        let matchOut = m[inst.out];
        let matchArg = m[inst.arg];
        if (matchOut && matchArg) return false;
        if (matchArg) {
          const tempOut = inst.out;
          inst.out = inst.arg;
          inst.arg = tempOut;
          const tempMatch = matchOut;
          matchOut = matchArg;
          matchArg = tempMatch;
        }
        if (matchOut) {
          m[pc] = true;
          inst.op = Inst.ALT_MATCH;
        }
        const leftRunes = onePassRunes[inst.out] || [];
        const rightRunes = onePassRunes[inst.arg] || [];
        const mergeRes = mergeRuneSets(leftRunes, rightRunes, inst.out, inst.arg);
        if (!mergeRes) return false;
        onePassRunes[pc] = mergeRes.merged;
        inst.next = new Uint32Array(mergeRes.next);
        break;
      }
      case Inst.CAPTURE:
      case Inst.EMPTY_WIDTH:
      case Inst.NOP:
        ok = check(inst.out);
        m[pc] = m[inst.out];
        onePassRunes[pc] = onePassRunes[inst.out] ? onePassRunes[inst.out].slice() : [];
        inst.next = new Uint32Array(Math.floor(onePassRunes[pc].length / 2) + 1).fill(inst.out);
        break;
      case Inst.MATCH:
      case Inst.FAIL:
        m[pc] = inst.op === Inst.MATCH;
        break;
      case Inst.RUNE: {
        m[pc] = false;
        if (inst.next && inst.next.length > 0) break;
        instQueue.insert(inst.out);
        if (!inst.runes || inst.runes.length === 0) {
          onePassRunes[pc] = [];
          inst.next = new Uint32Array([inst.out]);
          break;
        }
        let runes = [];
        if (inst.runes.length === 1 && (inst.arg & RE2Flags.FOLD_CASE) !== 0) {
          const r0 = inst.runes[0];
          runes.push(r0, r0);
          for (let r1 = Unicode.simpleFold(r0); r1 !== r0; r1 = Unicode.simpleFold(r1)) runes.push(r1, r1);
          runes.sort((a, b) => a - b);
        } else for (let j = 0; j < inst.runes.length; j++) runes.push(inst.runes[j]);
        onePassRunes[pc] = runes;
        inst.next = new Uint32Array(Math.floor(runes.length / 2) + 1).fill(inst.out);
        inst.op = Inst.RUNE;
        break;
      }
      case Inst.RUNE1: {
        m[pc] = false;
        if (inst.next && inst.next.length > 0) break;
        instQueue.insert(inst.out);
        let runes = [];
        if ((inst.arg & RE2Flags.FOLD_CASE) !== 0) {
          const r0 = inst.runes[0];
          runes.push(r0, r0);
          for (let r1 = Unicode.simpleFold(r0); r1 !== r0; r1 = Unicode.simpleFold(r1)) runes.push(r1, r1);
          runes.sort((a, b) => a - b);
        } else runes.push(inst.runes[0], inst.runes[0]);
        onePassRunes[pc] = runes;
        inst.next = new Uint32Array(Math.floor(runes.length / 2) + 1).fill(inst.out);
        inst.op = Inst.RUNE;
        break;
      }
      case Inst.RUNE_ANY:
        m[pc] = false;
        if (inst.next && inst.next.length > 0) break;
        instQueue.insert(inst.out);
        onePassRunes[pc] = [0, Unicode.MAX_RUNE];
        inst.next = new Uint32Array([inst.out]);
        break;
      case Inst.RUNE_ANY_NOT_NL:
        m[pc] = false;
        if (inst.next && inst.next.length > 0) break;
        instQueue.insert(inst.out);
        onePassRunes[pc] = [
          0,
          9,
          11,
          Unicode.MAX_RUNE
        ];
        inst.next = new Uint32Array(Math.floor(onePassRunes[pc].length / 2) + 1).fill(inst.out);
        break;
    }
    return ok;
  };
  instQueue.clear();
  instQueue.insert(p.start);
  while (!instQueue.empty()) {
    visitQueue.clear();
    if (!check(instQueue.next())) return null;
  }
  for (let i = 0; i < p.inst.length; i++) if (onePassRunes[i]) p.inst[i].runes = onePassRunes[i];
  return p;
};
var cleanupOnePass = (p, original) => {
  for (let ix = 0; ix < original.inst.length; ix++) {
    const instOriginal = original.inst[ix];
    switch (instOriginal.op) {
      case Inst.ALT:
      case Inst.ALT_MATCH:
      case Inst.RUNE:
        break;
      case Inst.CAPTURE:
      case Inst.EMPTY_WIDTH:
      case Inst.NOP:
      case Inst.MATCH:
      case Inst.FAIL:
        p.inst[ix].next = null;
        break;
      case Inst.RUNE1:
      case Inst.RUNE_ANY:
      case Inst.RUNE_ANY_NOT_NL:
        p.inst[ix].next = null;
        p.inst[ix].op = instOriginal.op;
        p.inst[ix].runes = instOriginal.runes ? instOriginal.runes.slice() : [];
        break;
    }
  }
};
var OnePass = class OnePass2 {
  static compile(prog) {
    if (prog.start === 0) return null;
    if (prog.numLb > 0) return null;
    const startInst = prog.inst[prog.start];
    if (startInst.op !== Inst.EMPTY_WIDTH || (startInst.arg & Utils.EMPTY_BEGIN_TEXT) === 0) return null;
    let hasAlt = false;
    for (let i = 0; i < prog.inst.length; i++) if (prog.inst[i].op === Inst.ALT || prog.inst[i].op === Inst.ALT_MATCH) {
      hasAlt = true;
      break;
    }
    for (let i = 0; i < prog.inst.length; i++) {
      const inst = prog.inst[i];
      const opOut = prog.inst[inst.out].op;
      switch (inst.op) {
        case Inst.ALT:
        case Inst.ALT_MATCH:
          if (opOut === Inst.MATCH || prog.inst[inst.arg].op === Inst.MATCH) return null;
          break;
        case Inst.EMPTY_WIDTH:
          if (opOut === Inst.MATCH) {
            if ((inst.arg & Utils.EMPTY_END_TEXT) === Utils.EMPTY_END_TEXT) continue;
            return null;
          }
          break;
        default:
          if (opOut === Inst.MATCH && hasAlt) return null;
          break;
      }
    }
    let p = onePassCopy(prog);
    p = makeOnePass(p);
    if (p !== null) cleanupOnePass(p, prog);
    return p;
  }
  static next(inst, r) {
    const nextIdx = inst.matchRunePos(r);
    if (nextIdx >= 0) return inst.next[nextIdx];
    if (inst.op === Inst.ALT_MATCH) return inst.out;
    return 0;
  }
  static execute(re2, input, pos, anchor, ncap) {
    const onepass = re2.onepass;
    if (!onepass) return null;
    const matchcap = new Int32Array(ncap).fill(-1);
    let matched = false;
    let r = input.step(pos);
    let rune = r >> 3;
    let width = r & 7;
    let r1 = MachineInputBase.EOF();
    let rune1 = -1;
    let width1 = 0;
    if (r !== MachineInputBase.EOF()) {
      r1 = input.step(pos + width);
      if (r1 !== MachineInputBase.EOF()) {
        rune1 = r1 >> 3;
        width1 = r1 & 7;
      }
    }
    let flag = pos === 0 ? Utils.emptyOpContext(-1, rune) : input.context(pos);
    let pc = onepass.start;
    let inst;
    while (true) {
      inst = onepass.inst[pc];
      pc = inst.out;
      switch (inst.op) {
        case Inst.MATCH:
          if (anchor === RE2Flags.ANCHOR_BOTH && pos !== input.endPos()) return null;
          matched = true;
          if (matchcap.length > 0) {
            matchcap[0] = 0;
            matchcap[1] = pos;
          }
          return ncap === 0 ? [] : Utils.toArray(matchcap);
        case Inst.RUNE:
          if (!inst.matchRune(rune)) return null;
          break;
        case Inst.RUNE1:
          if (rune !== inst.runes[0]) return null;
          break;
        case Inst.RUNE_ANY:
          break;
        case Inst.RUNE_ANY_NOT_NL:
          if (rune === 10) return null;
          break;
        case Inst.ALT:
        case Inst.ALT_MATCH:
          pc = OnePass2.next(inst, rune);
          continue;
        case Inst.FAIL:
          return null;
        case Inst.NOP:
          continue;
        case Inst.EMPTY_WIDTH:
          if ((inst.arg & ~flag) !== 0) return null;
          continue;
        case Inst.CAPTURE:
          if (inst.arg < matchcap.length) matchcap[inst.arg] = pos;
          continue;
        default:
          throw new RE2JSInternalException("bad inst");
      }
      if (width === 0) break;
      flag = Utils.emptyOpContext(rune, rune1);
      pos += width;
      rune = rune1;
      width = width1;
      if (rune !== -1) {
        r1 = input.step(pos + width);
        if (r1 !== MachineInputBase.EOF()) {
          rune1 = r1 >> 3;
          width1 = r1 & 7;
        } else {
          rune1 = -1;
          width1 = 0;
        }
      }
    }
    if (!matched) return null;
    return ncap === 0 ? [] : Utils.toArray(matchcap);
  }
};
var Regexp = class Regexp2 {
  static Op = createEnum([
    "NO_MATCH",
    "EMPTY_MATCH",
    "LITERAL",
    "CHAR_CLASS",
    "ANY_CHAR_NOT_NL",
    "ANY_CHAR",
    "BEGIN_LINE",
    "END_LINE",
    "BEGIN_TEXT",
    "END_TEXT",
    "WORD_BOUNDARY",
    "NO_WORD_BOUNDARY",
    "CAPTURE",
    "STAR",
    "PLUS",
    "QUEST",
    "REPEAT",
    "CONCAT",
    "ALTERNATE",
    "PLB",
    "NLB",
    "LEFT_PAREN",
    "VERTICAL_BAR"
  ]);
  static isPseudoOp(op) {
    return op >= Regexp2.Op.LEFT_PAREN;
  }
  static emptySubs() {
    return [];
  }
  static quoteIfHyphen(rune) {
    if (rune === Codepoint.CODES.get("-")) return "\\";
    return "";
  }
  static fromRegexp(re2) {
    const regex2 = new Regexp2(re2.op);
    regex2.flags = re2.flags;
    regex2.subs = re2.subs;
    regex2.runes = re2.runes;
    regex2.cap = re2.cap;
    regex2.min = re2.min;
    regex2.max = re2.max;
    regex2.name = re2.name;
    regex2.namedGroups = re2.namedGroups;
    regex2.lb = re2.lb;
    return regex2;
  }
  constructor(op) {
    this.op = op;
    this.flags = 0;
    this.subs = Regexp2.emptySubs();
    this.runes = [];
    this.min = 0;
    this.max = 0;
    this.cap = 0;
    this.name = null;
    this.namedGroups = /* @__PURE__ */ Object.create(null);
    this.lb = 0;
  }
  reinit() {
    this.flags = 0;
    this.subs = Regexp2.emptySubs();
    this.runes = [];
    this.cap = 0;
    this.min = 0;
    this.max = 0;
    this.name = null;
    this.namedGroups = /* @__PURE__ */ Object.create(null);
    this.lb = 0;
  }
  toString() {
    return this.appendTo();
  }
  appendTo() {
    let out = "";
    switch (this.op) {
      case Regexp2.Op.NO_MATCH:
        out += "[^\\x00-\\x{10FFFF}]";
        break;
      case Regexp2.Op.EMPTY_MATCH:
        out += "(?:)";
        break;
      case Regexp2.Op.STAR:
      case Regexp2.Op.PLUS:
      case Regexp2.Op.QUEST:
      case Regexp2.Op.REPEAT: {
        const sub = this.subs[0];
        if (sub.op > Regexp2.Op.CAPTURE || sub.op === Regexp2.Op.LITERAL && sub.runes.length > 1) out += `(?:${sub.appendTo()})`;
        else out += sub.appendTo();
        switch (this.op) {
          case Regexp2.Op.STAR:
            out += "*";
            break;
          case Regexp2.Op.PLUS:
            out += "+";
            break;
          case Regexp2.Op.QUEST:
            out += "?";
            break;
          case Regexp2.Op.REPEAT:
            out += `{${this.min}`;
            if (this.min !== this.max) {
              out += ",";
              if (this.max >= 0) out += this.max;
            }
            out += "}";
            break;
        }
        if ((this.flags & RE2Flags.NON_GREEDY) !== 0) out += "?";
        break;
      }
      case Regexp2.Op.CONCAT:
        for (let sub of this.subs) if (sub.op === Regexp2.Op.ALTERNATE) out += `(?:${sub.appendTo()})`;
        else out += sub.appendTo();
        break;
      case Regexp2.Op.ALTERNATE: {
        let sep = "";
        for (let sub of this.subs) {
          out += sep;
          sep = "|";
          out += sub.appendTo();
        }
        break;
      }
      case Regexp2.Op.LITERAL:
        if ((this.flags & RE2Flags.FOLD_CASE) !== 0) out += "(?i:";
        for (let rune of this.runes) out += Utils.escapeRune(rune);
        if ((this.flags & RE2Flags.FOLD_CASE) !== 0) out += ")";
        break;
      case Regexp2.Op.ANY_CHAR_NOT_NL:
        out += "(?-s:.)";
        break;
      case Regexp2.Op.ANY_CHAR:
        out += "(?s:.)";
        break;
      case Regexp2.Op.PLB:
        out += `(?<=${this.subs[0].appendTo()})`;
        break;
      case Regexp2.Op.NLB:
        out += `(?<!${this.subs[0].appendTo()})`;
        break;
      case Regexp2.Op.CAPTURE:
        if (this.name === null || this.name.length === 0) out += "(";
        else out += `(?P<${this.name}>`;
        if (this.subs[0].op !== Regexp2.Op.EMPTY_MATCH) out += this.subs[0].appendTo();
        out += ")";
        break;
      case Regexp2.Op.BEGIN_TEXT:
        out += "\\A";
        break;
      case Regexp2.Op.END_TEXT:
        if ((this.flags & RE2Flags.WAS_DOLLAR) !== 0) out += "(?-m:$)";
        else out += "\\z";
        break;
      case Regexp2.Op.BEGIN_LINE:
        out += "^";
        break;
      case Regexp2.Op.END_LINE:
        out += "$";
        break;
      case Regexp2.Op.WORD_BOUNDARY:
        out += "\\b";
        break;
      case Regexp2.Op.NO_WORD_BOUNDARY:
        out += "\\B";
        break;
      case Regexp2.Op.CHAR_CLASS:
        if (this.runes.length % 2 !== 0) {
          out += "[invalid char class]";
          break;
        }
        out += "[";
        if (this.runes.length === 0) out += "^\\x00-\\x{10FFFF}";
        else if (this.runes[0] === 0 && this.runes[this.runes.length - 1] === Unicode.MAX_RUNE) {
          out += "^";
          for (let i = 1; i < this.runes.length - 1; i += 2) {
            const lo = this.runes[i] + 1;
            const hi = this.runes[i + 1] - 1;
            out += Regexp2.quoteIfHyphen(lo);
            out += Utils.escapeRune(lo);
            if (lo !== hi) {
              out += "-";
              out += Regexp2.quoteIfHyphen(hi);
              out += Utils.escapeRune(hi);
            }
          }
        } else for (let i = 0; i < this.runes.length; i += 2) {
          const lo = this.runes[i];
          const hi = this.runes[i + 1];
          out += Regexp2.quoteIfHyphen(lo);
          out += Utils.escapeRune(lo);
          if (lo !== hi) {
            out += "-";
            out += Regexp2.quoteIfHyphen(hi);
            out += Utils.escapeRune(hi);
          }
        }
        out += "]";
        break;
      default:
        out += this.op;
        break;
    }
    return out;
  }
  maxCap() {
    let m = 0;
    if (this.op === Regexp2.Op.CAPTURE) m = this.cap;
    if (this.subs !== null) for (let sub of this.subs) {
      const n = sub.maxCap();
      if (m < n) m = n;
    }
    return m;
  }
  equals(that) {
    if (!(that !== null && that instanceof Regexp2)) return false;
    if (this.op !== that.op) return false;
    switch (this.op) {
      case Regexp2.Op.END_TEXT:
        if ((this.flags & RE2Flags.WAS_DOLLAR) !== (that.flags & RE2Flags.WAS_DOLLAR)) return false;
        break;
      case Regexp2.Op.LITERAL:
      case Regexp2.Op.CHAR_CLASS:
        if (this.runes === null && that.runes === null) break;
        if (this.runes === null || that.runes === null) return false;
        if (this.runes.length !== that.runes.length) return false;
        for (let i = 0; i < this.runes.length; i++) if (this.runes[i] !== that.runes[i]) return false;
        break;
      case Regexp2.Op.ALTERNATE:
      case Regexp2.Op.CONCAT:
        if (this.subs.length !== that.subs.length) return false;
        for (let i = 0; i < this.subs.length; ++i) if (!this.subs[i].equals(that.subs[i])) return false;
        break;
      case Regexp2.Op.STAR:
      case Regexp2.Op.PLUS:
      case Regexp2.Op.QUEST:
        if ((this.flags & RE2Flags.NON_GREEDY) !== (that.flags & RE2Flags.NON_GREEDY) || !this.subs[0].equals(that.subs[0])) return false;
        break;
      case Regexp2.Op.REPEAT:
        if ((this.flags & RE2Flags.NON_GREEDY) !== (that.flags & RE2Flags.NON_GREEDY) || this.min !== that.min || this.max !== that.max || !this.subs[0].equals(that.subs[0])) return false;
        break;
      case Regexp2.Op.CAPTURE:
        if (this.cap !== that.cap || (this.name === null ? that.name !== null : this.name !== that.name) || !this.subs[0].equals(that.subs[0])) return false;
        break;
      case Regexp2.Op.PLB:
      case Regexp2.Op.NLB:
        if (this.lb !== that.lb || !this.subs[0].equals(that.subs[0])) return false;
        break;
    }
    return true;
  }
};
var AhoCorasick = class {
  constructor(wordArrays) {
    this.next = [/* @__PURE__ */ Object.create(null)];
    this.fail = [0];
    this.match = [false];
    for (const word of wordArrays) {
      let node = 0;
      for (let i = 0; i < word.length; i++) {
        const val = word[i];
        if (!(val in this.next[node])) {
          this.next.push(/* @__PURE__ */ Object.create(null));
          this.fail.push(0);
          this.match.push(false);
          this.next[node][val] = this.next.length - 1;
        }
        node = this.next[node][val];
      }
      this.match[node] = true;
    }
    const queue = [];
    for (const val in this.next[0]) if (Object.prototype.hasOwnProperty.call(this.next[0], val)) {
      const child = this.next[0][val];
      this.fail[child] = 0;
      queue.push(child);
    }
    while (queue.length > 0) {
      const curr = queue.shift();
      for (const val in this.next[curr]) if (Object.prototype.hasOwnProperty.call(this.next[curr], val)) {
        const child = this.next[curr][val];
        let failNode = this.fail[curr];
        while (failNode !== 0 && !(val in this.next[failNode])) failNode = this.fail[failNode];
        if (val in this.next[failNode]) this.fail[child] = this.next[failNode][val];
        else this.fail[child] = 0;
        this.match[child] = this.match[child] || this.match[this.fail[child]];
        queue.push(child);
      }
    }
  }
  searchUTF16(charSeq, start, end) {
    let node = 0;
    for (let i = start; i < end; i++) {
      const val = charSeq.charCodeAt(i);
      while (node !== 0 && !(val in this.next[node])) node = this.fail[node];
      if (val in this.next[node]) node = this.next[node][val];
      if (this.match[node]) return true;
    }
    return false;
  }
  searchUTF8(bytes, start, end) {
    let node = 0;
    for (let i = start; i < end; i++) {
      const val = bytes[i];
      while (node !== 0 && !(val in this.next[node])) node = this.fail[node];
      if (val in this.next[node]) node = this.next[node][val];
      if (this.match[node]) return true;
    }
    return false;
  }
};
var Prefilter = class Prefilter2 {
  static Type = {
    NONE: 0,
    EXACT: 1,
    AND: 2,
    OR: 3
  };
  constructor(type) {
    this.type = type;
    this.subs = [];
    this.str = "";
    this.bytes = null;
    this.ac16 = null;
    this.ac8 = null;
  }
  eval(input, pos) {
    switch (this.type) {
      case Prefilter2.Type.NONE:
        return true;
      case Prefilter2.Type.EXACT:
        return input.hasString(this, pos);
      case Prefilter2.Type.AND:
        for (let i = 0; i < this.subs.length; i++) if (!this.subs[i].eval(input, pos)) return false;
        return true;
      case Prefilter2.Type.OR:
        if (this.ac16 && this.ac8) return input.hasAnyString(this, pos);
        for (let i = 0; i < this.subs.length; i++) if (this.subs[i].eval(input, pos)) return true;
        return false;
      default:
        return true;
    }
  }
};
var PrefilterTree = class PrefilterTree2 {
  static build(re2) {
    const pf = PrefilterTree2.fromRegexp(re2);
    return PrefilterTree2.simplify(pf);
  }
  static fromRegexp(re2) {
    if (!re2) return new Prefilter(Prefilter.Type.NONE);
    switch (re2.op) {
      case Regexp.Op.PLB:
      case Regexp.Op.NLB:
      case Regexp.Op.NO_MATCH:
      case Regexp.Op.EMPTY_MATCH:
      case Regexp.Op.BEGIN_LINE:
      case Regexp.Op.END_LINE:
      case Regexp.Op.BEGIN_TEXT:
      case Regexp.Op.END_TEXT:
      case Regexp.Op.WORD_BOUNDARY:
      case Regexp.Op.NO_WORD_BOUNDARY:
      case Regexp.Op.CHAR_CLASS:
      case Regexp.Op.ANY_CHAR_NOT_NL:
      case Regexp.Op.ANY_CHAR:
        return new Prefilter(Prefilter.Type.NONE);
      case Regexp.Op.LITERAL: {
        if (re2.runes.length === 0 || (re2.flags & RE2Flags.FOLD_CASE) !== 0) return new Prefilter(Prefilter.Type.NONE);
        const pf = new Prefilter(Prefilter.Type.EXACT);
        let str = "";
        for (let i = 0; i < re2.runes.length; i++) str += String.fromCodePoint(re2.runes[i]);
        pf.str = str;
        pf.bytes = Utils.stringToUtf8ByteArray(pf.str);
        return pf;
      }
      case Regexp.Op.CAPTURE:
      case Regexp.Op.PLUS:
        return PrefilterTree2.fromRegexp(re2.subs[0]);
      case Regexp.Op.REPEAT:
        if (re2.min >= 1) return PrefilterTree2.fromRegexp(re2.subs[0]);
        return new Prefilter(Prefilter.Type.NONE);
      case Regexp.Op.CONCAT: {
        const pf = new Prefilter(Prefilter.Type.AND);
        for (const sub of re2.subs) pf.subs.push(PrefilterTree2.fromRegexp(sub));
        return pf;
      }
      case Regexp.Op.ALTERNATE: {
        const pf = new Prefilter(Prefilter.Type.OR);
        for (const sub of re2.subs) pf.subs.push(PrefilterTree2.fromRegexp(sub));
        return pf;
      }
      default:
        return new Prefilter(Prefilter.Type.NONE);
    }
  }
  static simplify(pf) {
    if (pf.type === Prefilter.Type.EXACT || pf.type === Prefilter.Type.NONE) return pf;
    if (pf.type === Prefilter.Type.AND) {
      const newSubs = [];
      for (const sub of pf.subs) {
        const s = PrefilterTree2.simplify(sub);
        if (s.type !== Prefilter.Type.NONE) if (s.type === Prefilter.Type.AND) for (let j = 0; j < s.subs.length; j++) newSubs.push(s.subs[j]);
        else newSubs.push(s);
      }
      if (newSubs.length === 0) return new Prefilter(Prefilter.Type.NONE);
      if (newSubs.length === 1) return newSubs[0];
      pf.subs = newSubs;
      return pf;
    }
    if (pf.type === Prefilter.Type.OR) {
      const newSubs = [];
      for (const sub of pf.subs) {
        const s = PrefilterTree2.simplify(sub);
        if (s.type === Prefilter.Type.NONE) return new Prefilter(Prefilter.Type.NONE);
        if (s.type === Prefilter.Type.OR) for (let j = 0; j < s.subs.length; j++) newSubs.push(s.subs[j]);
        else newSubs.push(s);
      }
      if (newSubs.length === 0) return new Prefilter(Prefilter.Type.NONE);
      if (newSubs.length === 1) return newSubs[0];
      const seen = /* @__PURE__ */ new Set();
      const uniqueSubs = [];
      for (const sub of newSubs) if (sub.type === Prefilter.Type.EXACT) {
        if (!seen.has(sub.str)) {
          seen.add(sub.str);
          uniqueSubs.push(sub);
        }
      } else uniqueSubs.push(sub);
      pf.subs = uniqueSubs;
      let allExact = true;
      for (const sub of uniqueSubs) if (sub.type !== Prefilter.Type.EXACT) {
        allExact = false;
        break;
      }
      if (allExact && uniqueSubs.length > 1) {
        pf.ac16 = new AhoCorasick(uniqueSubs.map((s) => {
          const arr = [];
          for (let i = 0; i < s.str.length; i++) arr.push(s.str.charCodeAt(i));
          return arr;
        }));
        pf.ac8 = new AhoCorasick(uniqueSubs.map((s) => s.bytes));
      }
      return pf;
    }
    return pf;
  }
};
var PatchList = class {
  /**
  * @param {number} head - Encoded pointer to the start of the patch list.
  * @param {number} tail - Encoded pointer to the end of the patch list.
  */
  constructor(head = 0, tail = 0) {
    this.head = head;
    this.tail = tail;
  }
};
var Prog = class {
  constructor() {
    this.inst = [];
    this.start = 0;
    this.numCap = 2;
    this.lbStarts = [];
    this.numLb = 0;
  }
  getInst(pc) {
    return this.inst[pc];
  }
  numInst() {
    return this.inst.length;
  }
  addInst(op) {
    this.inst.push(new Inst(op));
  }
  skipNop(pc) {
    let i = this.inst[pc];
    while (i.op === Inst.NOP || i.op === Inst.CAPTURE) {
      i = this.inst[pc];
      pc = i.out;
    }
    return i;
  }
  prefix() {
    let prefix = "";
    let i = this.skipNop(this.start);
    if (!Inst.isRuneOp(i.op) || i.runes.length !== 1) return [i.op === Inst.MATCH, prefix];
    while (Inst.isRuneOp(i.op) && i.runes.length === 1 && (i.arg & RE2Flags.FOLD_CASE) === 0) {
      prefix += String.fromCodePoint(i.runes[0]);
      i = this.skipNop(i.out);
    }
    return [i.op === Inst.MATCH, prefix];
  }
  startCond() {
    let flag = 0;
    let pc = this.start;
    loop: for (; ; ) {
      const i = this.inst[pc];
      switch (i.op) {
        case Inst.EMPTY_WIDTH:
          flag |= i.arg;
          break;
        case Inst.FAIL:
          return -1;
        case Inst.CAPTURE:
        case Inst.NOP:
          break;
        default:
          break loop;
      }
      pc = i.out;
    }
    return flag;
  }
  patch(l, val) {
    let head = l.head;
    while (head !== 0) {
      const i = this.inst[head >> 1];
      if ((head & 1) === 0) {
        head = i.out;
        i.out = val;
      } else {
        head = i.arg;
        i.arg = val;
      }
    }
  }
  append(l1, l2) {
    if (l1.head === 0) return l2;
    if (l2.head === 0) return l1;
    const i = this.inst[l1.tail >> 1];
    if ((l1.tail & 1) === 0) i.out = l2.head;
    else i.arg = l2.head;
    return new PatchList(l1.head, l2.tail);
  }
  /**
  *
  * @returns {string}
  */
  toString() {
    let out = "";
    for (let pc = 0; pc < this.inst.length; pc++) {
      const len = out.length;
      out += pc;
      if (pc === this.start) out += "*";
      out += "        ".substring(out.length - len);
      out += this.inst[pc];
      out += "\n";
    }
    return out;
  }
};
var Frag = class {
  constructor(i = 0, out = new PatchList(), nullable = false) {
    this.i = i;
    this.out = out;
    this.nullable = nullable;
  }
};
var Compiler = class Compiler2 {
  static ANY_RUNE_NOT_NL() {
    return [
      0,
      Codepoint.CODES.get("\n") - 1,
      Codepoint.CODES.get("\n") + 1,
      Unicode.MAX_RUNE
    ];
  }
  static ANY_RUNE() {
    return [0, Unicode.MAX_RUNE];
  }
  static compileRegexp(re2) {
    const c = new Compiler2();
    const f = c.compile(re2);
    c.prog.patch(f.out, c.newInst(Inst.MATCH).i);
    c.prog.start = f.i;
    return c.prog;
  }
  static compileSet(regexps) {
    const c = new Compiler2();
    if (regexps.length === 0) {
      c.prog.start = c.newInst(Inst.FAIL).i;
      return c.prog;
    }
    let starts = [];
    for (let i = 0; i < regexps.length; i++) {
      const f = c.compile(regexps[i]);
      const m = c.newInst(Inst.MATCH);
      c.prog.getInst(m.i).arg = i;
      c.prog.patch(f.out, m.i);
      starts.push(f.i);
    }
    let start = starts[0];
    for (let i = 1; i < starts.length; i++) {
      const f = c.newInst(Inst.ALT);
      const inst = c.prog.getInst(f.i);
      inst.out = start;
      inst.arg = starts[i];
      start = f.i;
    }
    c.prog.start = start;
    return c.prog;
  }
  constructor() {
    this.prog = new Prog();
    this.newInst(Inst.FAIL);
  }
  newInst(op) {
    this.prog.addInst(op);
    return new Frag(this.prog.numInst() - 1, new PatchList(), true);
  }
  nop() {
    const f = this.newInst(Inst.NOP);
    f.out = new PatchList(f.i << 1, f.i << 1);
    return f;
  }
  fail() {
    return new Frag();
  }
  cap(arg) {
    const f = this.newInst(Inst.CAPTURE);
    f.out = new PatchList(f.i << 1, f.i << 1);
    this.prog.getInst(f.i).arg = arg;
    if (this.prog.numCap < arg + 1) this.prog.numCap = arg + 1;
    return f;
  }
  cat(f1, f2) {
    if (f1.i === 0 || f2.i === 0) return this.fail();
    this.prog.patch(f1.out, f2.i);
    return new Frag(f1.i, f2.out, f1.nullable && f2.nullable);
  }
  alt(f1, f2) {
    if (f1.i === 0) return f2;
    if (f2.i === 0) return f1;
    const f = this.newInst(Inst.ALT);
    const i = this.prog.getInst(f.i);
    i.out = f1.i;
    i.arg = f2.i;
    f.out = this.prog.append(f1.out, f2.out);
    f.nullable = f1.nullable || f2.nullable;
    return f;
  }
  loop(f1, nongreedy) {
    const f = this.newInst(Inst.ALT);
    const i = this.prog.getInst(f.i);
    if (nongreedy) {
      i.arg = f1.i;
      f.out = new PatchList(f.i << 1, f.i << 1);
    } else {
      i.out = f1.i;
      f.out = new PatchList(f.i << 1 | 1, f.i << 1 | 1);
    }
    this.prog.patch(f1.out, f.i);
    return f;
  }
  quest(f1, nongreedy) {
    const f = this.newInst(Inst.ALT);
    const i = this.prog.getInst(f.i);
    if (nongreedy) {
      i.arg = f1.i;
      f.out = new PatchList(f.i << 1, f.i << 1);
    } else {
      i.out = f1.i;
      f.out = new PatchList(f.i << 1 | 1, f.i << 1 | 1);
    }
    f.out = this.prog.append(f.out, f1.out);
    return f;
  }
  star(f1, nongreedy) {
    if (f1.nullable) return this.quest(this.plus(f1, nongreedy), nongreedy);
    return this.loop(f1, nongreedy);
  }
  plus(f1, nongreedy) {
    return new Frag(f1.i, this.loop(f1, nongreedy).out, f1.nullable);
  }
  empty(op) {
    const f = this.newInst(Inst.EMPTY_WIDTH);
    this.prog.getInst(f.i).arg = op;
    f.out = new PatchList(f.i << 1, f.i << 1);
    return f;
  }
  rune(runes, flags) {
    const f = this.newInst(Inst.RUNE);
    f.nullable = false;
    const i = this.prog.getInst(f.i);
    i.runes = runes;
    flags &= RE2Flags.FOLD_CASE;
    if (runes.length !== 1 || Unicode.simpleFold(runes[0]) === runes[0]) flags &= ~RE2Flags.FOLD_CASE;
    i.arg = flags;
    f.out = new PatchList(f.i << 1, f.i << 1);
    if ((flags & RE2Flags.FOLD_CASE) === 0 && runes.length === 1 || runes.length === 2 && runes[0] === runes[1]) i.op = Inst.RUNE1;
    else if (runes.length === 2 && runes[0] === 0 && runes[1] === Unicode.MAX_RUNE) i.op = Inst.RUNE_ANY;
    else if (runes.length === 4 && runes[0] === 0 && runes[1] === Codepoint.CODES.get("\n") - 1 && runes[2] === Codepoint.CODES.get("\n") + 1 && runes[3] === Unicode.MAX_RUNE) i.op = Inst.RUNE_ANY_NOT_NL;
    return f;
  }
  lookBehind(a, lb) {
    const id = this.newInst(Inst.LB_WRITE);
    this.prog.getInst(id.i).arg = lb;
    const any = this.rune(Compiler2.ANY_RUNE(), 0);
    const dotStar = this.star(any, true);
    const lbAutomaton = this.cat(dotStar, a);
    this.prog.patch(lbAutomaton.out, id.i);
    const checkId = this.newInst(Inst.LB_CHECK);
    this.prog.getInst(checkId.i).arg = lb;
    this.prog.lbStarts.push(lbAutomaton.i);
    if (Math.abs(lb) > this.prog.numLb) this.prog.numLb = Math.abs(lb);
    checkId.out = new PatchList(checkId.i << 1, checkId.i << 1);
    return checkId;
  }
  compile(re2) {
    switch (re2.op) {
      case Regexp.Op.NO_MATCH:
        return this.fail();
      case Regexp.Op.EMPTY_MATCH:
        return this.nop();
      case Regexp.Op.LITERAL:
        if (re2.runes.length === 0) return this.nop();
        else {
          let f = null;
          for (let r of re2.runes) {
            const f1 = this.rune([r], re2.flags);
            f = f === null ? f1 : this.cat(f, f1);
          }
          return f;
        }
      case Regexp.Op.CHAR_CLASS:
        return this.rune(re2.runes, re2.flags);
      case Regexp.Op.ANY_CHAR_NOT_NL:
        return this.rune(Compiler2.ANY_RUNE_NOT_NL(), 0);
      case Regexp.Op.ANY_CHAR:
        return this.rune(Compiler2.ANY_RUNE(), 0);
      case Regexp.Op.BEGIN_LINE:
        return this.empty(Utils.EMPTY_BEGIN_LINE);
      case Regexp.Op.END_LINE:
        return this.empty(Utils.EMPTY_END_LINE);
      case Regexp.Op.BEGIN_TEXT:
        return this.empty(Utils.EMPTY_BEGIN_TEXT);
      case Regexp.Op.END_TEXT:
        return this.empty(Utils.EMPTY_END_TEXT);
      case Regexp.Op.WORD_BOUNDARY:
        return this.empty(Utils.EMPTY_WORD_BOUNDARY);
      case Regexp.Op.NO_WORD_BOUNDARY:
        return this.empty(Utils.EMPTY_NO_WORD_BOUNDARY);
      case Regexp.Op.PLB:
      case Regexp.Op.NLB:
        return this.lookBehind(this.compile(re2.subs[0]), re2.lb);
      case Regexp.Op.CAPTURE: {
        const bra = this.cap(re2.cap << 1);
        const sub = this.compile(re2.subs[0]);
        const ket = this.cap(re2.cap << 1 | 1);
        return this.cat(this.cat(bra, sub), ket);
      }
      case Regexp.Op.STAR:
        return this.star(this.compile(re2.subs[0]), (re2.flags & RE2Flags.NON_GREEDY) !== 0);
      case Regexp.Op.PLUS:
        return this.plus(this.compile(re2.subs[0]), (re2.flags & RE2Flags.NON_GREEDY) !== 0);
      case Regexp.Op.QUEST:
        return this.quest(this.compile(re2.subs[0]), (re2.flags & RE2Flags.NON_GREEDY) !== 0);
      case Regexp.Op.CONCAT:
        if (re2.subs.length === 0) return this.nop();
        else {
          let f = null;
          for (let sub of re2.subs) {
            const f1 = this.compile(sub);
            f = f === null ? f1 : this.cat(f, f1);
          }
          return f;
        }
      case Regexp.Op.ALTERNATE:
        if (re2.subs.length === 0) return this.nop();
        else {
          let f = null;
          for (let sub of re2.subs) {
            const f1 = this.compile(sub);
            f = f === null ? f1 : this.alt(f, f1);
          }
          return f;
        }
      default:
        throw new RE2JSCompileException("regexp: unhandled case in compile");
    }
  }
};
var Simplify = class Simplify2 {
  static simplify(re2) {
    if (re2 === null) return null;
    switch (re2.op) {
      case Regexp.Op.PLB:
      case Regexp.Op.NLB:
      case Regexp.Op.CAPTURE: {
        const sub = Simplify2.simplify(re2.subs[0]);
        if (sub !== re2.subs[0]) {
          const nre = Regexp.fromRegexp(re2);
          nre.runes = [];
          nre.subs = [sub];
          return nre;
        }
        return re2;
      }
      case Regexp.Op.CONCAT:
      case Regexp.Op.ALTERNATE: {
        const newSubs = [];
        let changed = false;
        for (let i = 0; i < re2.subs.length; i++) {
          const sub = re2.subs[i];
          const nsub = Simplify2.simplify(sub);
          if (nsub !== sub) changed = true;
          if (re2.op === Regexp.Op.CONCAT) {
            if (nsub.op === Regexp.Op.NO_MATCH) return new Regexp(Regexp.Op.NO_MATCH);
            if (nsub.op === Regexp.Op.EMPTY_MATCH) {
              changed = true;
              continue;
            }
            if (nsub.op === Regexp.Op.CONCAT) {
              changed = true;
              for (let j = 0; j < nsub.subs.length; j++) newSubs.push(nsub.subs[j]);
              continue;
            }
          } else if (re2.op === Regexp.Op.ALTERNATE) {
            if (nsub.op === Regexp.Op.NO_MATCH) {
              changed = true;
              continue;
            }
            if (nsub.op === Regexp.Op.ALTERNATE) {
              changed = true;
              for (let j = 0; j < nsub.subs.length; j++) newSubs.push(nsub.subs[j]);
              continue;
            }
          }
          newSubs.push(nsub);
        }
        if (changed) {
          if (newSubs.length === 0) return new Regexp(re2.op === Regexp.Op.CONCAT ? Regexp.Op.EMPTY_MATCH : Regexp.Op.NO_MATCH);
          if (newSubs.length === 1) return newSubs[0];
          const nre = Regexp.fromRegexp(re2);
          nre.runes = [];
          nre.subs = newSubs;
          return nre;
        }
        return re2;
      }
      case Regexp.Op.CHAR_CLASS:
        if (re2.runes === null) return re2;
        if (re2.runes.length === 0) return new Regexp(Regexp.Op.NO_MATCH);
        if (re2.runes.length === 2 && re2.runes[0] === 0 && re2.runes[1] === Unicode.MAX_RUNE) return new Regexp(Regexp.Op.ANY_CHAR);
        if (re2.runes.length === 4 && re2.runes[0] === 0 && re2.runes[1] === Codepoint.CODES.get("\n") - 1 && re2.runes[2] === Codepoint.CODES.get("\n") + 1 && re2.runes[3] === Unicode.MAX_RUNE) return new Regexp(Regexp.Op.ANY_CHAR_NOT_NL);
        return re2;
      case Regexp.Op.STAR:
      case Regexp.Op.PLUS:
      case Regexp.Op.QUEST: {
        const sub = Simplify2.simplify(re2.subs[0]);
        return Simplify2.simplify1(re2.op, re2.flags, sub, re2);
      }
      case Regexp.Op.REPEAT: {
        if (re2.min === 0 && re2.max === 0) return new Regexp(Regexp.Op.EMPTY_MATCH);
        const sub = Simplify2.simplify(re2.subs[0]);
        if (re2.max === -1) {
          if (re2.min === 0) return Simplify2.simplify1(Regexp.Op.STAR, re2.flags, sub, null);
          if (re2.min === 1) return Simplify2.simplify1(Regexp.Op.PLUS, re2.flags, sub, null);
          const nre = new Regexp(Regexp.Op.CONCAT);
          const subs = [];
          for (let i = 0; i < re2.min - 1; i++) subs.push(sub);
          subs.push(Simplify2.simplify1(Regexp.Op.PLUS, re2.flags, sub, null));
          nre.subs = subs.slice(0);
          return Simplify2.simplify(nre);
        }
        if (re2.min === 1 && re2.max === 1) return sub;
        let prefixSubs = null;
        if (re2.min > 0) {
          prefixSubs = [];
          for (let i = 0; i < re2.min; i++) prefixSubs.push(sub);
        }
        if (re2.max > re2.min) {
          let suffix = Simplify2.simplify1(Regexp.Op.QUEST, re2.flags, sub, null);
          for (let i = re2.min + 1; i < re2.max; i++) {
            const nre2 = new Regexp(Regexp.Op.CONCAT);
            nre2.subs = [sub, suffix];
            suffix = Simplify2.simplify1(Regexp.Op.QUEST, re2.flags, nre2, null);
          }
          if (prefixSubs === null) return suffix;
          prefixSubs.push(suffix);
        }
        if (prefixSubs !== null) {
          const prefix = new Regexp(Regexp.Op.CONCAT);
          prefix.subs = prefixSubs.slice(0);
          return Simplify2.simplify(prefix);
        }
        return new Regexp(Regexp.Op.NO_MATCH);
      }
    }
    return re2;
  }
  static simplify1(op, flags, sub, re2) {
    if (sub.op === Regexp.Op.EMPTY_MATCH) return sub;
    if (sub.op === Regexp.Op.NO_MATCH) {
      if (op === Regexp.Op.PLUS) return sub;
      return new Regexp(Regexp.Op.EMPTY_MATCH);
    }
    if (op === sub.op && (flags & RE2Flags.NON_GREEDY) === (sub.flags & RE2Flags.NON_GREEDY)) return sub;
    if (re2 !== null && re2.op === op && (re2.flags & RE2Flags.NON_GREEDY) === (flags & RE2Flags.NON_GREEDY) && sub === re2.subs[0]) return re2;
    const nre = new Regexp(op);
    nre.flags = flags;
    nre.subs = [sub];
    return nre;
  }
};
var CharGroup = class {
  constructor(sign, cls) {
    this.sign = sign;
    this.cls = cls;
  }
};
var code1 = [48, 57];
var code2 = [
  9,
  10,
  12,
  13,
  32,
  32
];
var code3 = [
  48,
  57,
  65,
  90,
  95,
  95,
  97,
  122
];
var PERL_GROUPS = /* @__PURE__ */ new Map([
  ["\\d", new CharGroup(1, code1)],
  ["\\D", new CharGroup(-1, code1)],
  ["\\s", new CharGroup(1, code2)],
  ["\\S", new CharGroup(-1, code2)],
  ["\\w", new CharGroup(1, code3)],
  ["\\W", new CharGroup(-1, code3)]
]);
var code4 = [
  48,
  57,
  65,
  90,
  97,
  122
];
var code5 = [
  65,
  90,
  97,
  122
];
var code6 = [0, 127];
var code7 = [
  9,
  9,
  32,
  32
];
var code8 = [
  0,
  31,
  127,
  127
];
var code9 = [48, 57];
var code10 = [33, 126];
var code11 = [97, 122];
var code12 = [32, 126];
var code13 = [
  33,
  47,
  58,
  64,
  91,
  96,
  123,
  126
];
var code14 = [
  9,
  13,
  32,
  32
];
var code15 = [65, 90];
var code16 = [
  48,
  57,
  65,
  90,
  95,
  95,
  97,
  122
];
var code17 = [
  48,
  57,
  65,
  70,
  97,
  102
];
var POSIX_GROUPS = /* @__PURE__ */ new Map([
  ["[:alnum:]", new CharGroup(1, code4)],
  ["[:^alnum:]", new CharGroup(-1, code4)],
  ["[:alpha:]", new CharGroup(1, code5)],
  ["[:^alpha:]", new CharGroup(-1, code5)],
  ["[:ascii:]", new CharGroup(1, code6)],
  ["[:^ascii:]", new CharGroup(-1, code6)],
  ["[:blank:]", new CharGroup(1, code7)],
  ["[:^blank:]", new CharGroup(-1, code7)],
  ["[:cntrl:]", new CharGroup(1, code8)],
  ["[:^cntrl:]", new CharGroup(-1, code8)],
  ["[:digit:]", new CharGroup(1, code9)],
  ["[:^digit:]", new CharGroup(-1, code9)],
  ["[:graph:]", new CharGroup(1, code10)],
  ["[:^graph:]", new CharGroup(-1, code10)],
  ["[:lower:]", new CharGroup(1, code11)],
  ["[:^lower:]", new CharGroup(-1, code11)],
  ["[:print:]", new CharGroup(1, code12)],
  ["[:^print:]", new CharGroup(-1, code12)],
  ["[:punct:]", new CharGroup(1, code13)],
  ["[:^punct:]", new CharGroup(-1, code13)],
  ["[:space:]", new CharGroup(1, code14)],
  ["[:^space:]", new CharGroup(-1, code14)],
  ["[:upper:]", new CharGroup(1, code15)],
  ["[:^upper:]", new CharGroup(-1, code15)],
  ["[:word:]", new CharGroup(1, code16)],
  ["[:^word:]", new CharGroup(-1, code16)],
  ["[:xdigit:]", new CharGroup(1, code17)],
  ["[:^xdigit:]", new CharGroup(-1, code17)]
]);
var CharClass = class CharClass2 {
  static charClassToString(r, len) {
    let result = "[";
    for (let i = 0; i < len; i += 2) {
      if (i > 0) result += " ";
      const lo = r[i];
      const hi = r[i + 1];
      if (lo === hi) result += `0x${lo.toString(16)}`;
      else result += `0x${lo.toString(16)}-0x${hi.toString(16)}`;
    }
    result += "]";
    return result;
  }
  static cmp(array, i, pivotFrom, pivotTo) {
    const cmp = array[i] - pivotFrom;
    return cmp !== 0 ? cmp : pivotTo - array[i + 1];
  }
  static qsortIntPair(array, left, right) {
    const pivotIndex = ((left + right) / 2 | 0) & -2;
    const pivotFrom = array[pivotIndex];
    const pivotTo = array[pivotIndex + 1];
    let i = left;
    let j = right;
    while (i <= j) {
      while (i < right && CharClass2.cmp(array, i, pivotFrom, pivotTo) < 0) i += 2;
      while (j > left && CharClass2.cmp(array, j, pivotFrom, pivotTo) > 0) j -= 2;
      if (i <= j) {
        if (i !== j) {
          let temp = array[i];
          array[i] = array[j];
          array[j] = temp;
          temp = array[i + 1];
          array[i + 1] = array[j + 1];
          array[j + 1] = temp;
        }
        i += 2;
        j -= 2;
      }
    }
    if (left < j) CharClass2.qsortIntPair(array, left, j);
    if (i < right) CharClass2.qsortIntPair(array, i, right);
  }
  constructor(r = Utils.emptyInts()) {
    this.r = r;
    this.len = r.length;
  }
  toArray() {
    if (this.len === this.r.length) return this.r;
    else return this.r.slice(0, this.len);
  }
  cleanClass() {
    if (this.len < 4) return this;
    CharClass2.qsortIntPair(this.r, 0, this.len - 2);
    let w = 2;
    for (let i = 2; i < this.len; i += 2) {
      const lo = this.r[i];
      const hi = this.r[i + 1];
      if (lo <= this.r[w - 1] + 1) {
        if (hi > this.r[w - 1]) this.r[w - 1] = hi;
        continue;
      }
      this.r[w] = lo;
      this.r[w + 1] = hi;
      w += 2;
    }
    this.len = w;
    return this;
  }
  appendLiteral(x, flags) {
    return (flags & RE2Flags.FOLD_CASE) !== 0 ? this.appendFoldedRange(x, x) : this.appendRange(x, x);
  }
  appendRange(lo, hi) {
    if (this.len > 0) {
      for (let i = 2; i <= 4; i += 2) if (this.len >= i) {
        const rlo = this.r[this.len - i];
        const rhi = this.r[this.len - i + 1];
        if (lo <= rhi + 1 && rlo <= hi + 1) {
          if (lo < rlo) this.r[this.len - i] = lo;
          if (hi > rhi) this.r[this.len - i + 1] = hi;
          return this;
        }
      }
    }
    this.r[this.len++] = lo;
    this.r[this.len++] = hi;
    return this;
  }
  appendFoldedRange(lo, hi) {
    if (lo <= Unicode.MIN_FOLD && hi >= Unicode.MAX_FOLD) return this.appendRange(lo, hi);
    if (hi < Unicode.MIN_FOLD || lo > Unicode.MAX_FOLD) return this.appendRange(lo, hi);
    if (lo < Unicode.MIN_FOLD) {
      this.appendRange(lo, Unicode.MIN_FOLD - 1);
      lo = Unicode.MIN_FOLD;
    }
    if (hi > Unicode.MAX_FOLD) {
      this.appendRange(Unicode.MAX_FOLD + 1, hi);
      hi = Unicode.MAX_FOLD;
    }
    for (let c = lo; c <= hi; c++) {
      this.appendRange(c, c);
      for (let f = Unicode.simpleFold(c); f !== c; f = Unicode.simpleFold(f)) this.appendRange(f, f);
    }
    return this;
  }
  appendClass(x) {
    for (let i = 0; i < x.length; i += 2) this.appendRange(x[i], x[i + 1]);
    return this;
  }
  appendFoldedClass(x) {
    for (let i = 0; i < x.length; i += 2) this.appendFoldedRange(x[i], x[i + 1]);
    return this;
  }
  appendNegatedClass(x) {
    let nextLo = 0;
    for (let i = 0; i < x.length; i += 2) {
      const lo = x[i];
      const hi = x[i + 1];
      if (nextLo <= lo - 1) this.appendRange(nextLo, lo - 1);
      nextLo = hi + 1;
    }
    if (nextLo <= Unicode.MAX_RUNE) this.appendRange(nextLo, Unicode.MAX_RUNE);
    return this;
  }
  appendTable(table) {
    for (let i = 0; i < table.length; ++i) {
      const lo = table.getLo(i);
      const hi = table.getHi(i);
      const stride = table.getStride(i);
      if (stride === 1) {
        this.appendRange(lo, hi);
        continue;
      }
      for (let c = lo; c <= hi; c += stride) this.appendRange(c, c);
    }
    return this;
  }
  appendNegatedTable(table) {
    let nextLo = 0;
    for (let i = 0; i < table.length; ++i) {
      const lo = table.getLo(i);
      const hi = table.getHi(i);
      const stride = table.getStride(i);
      if (stride === 1) {
        if (nextLo <= lo - 1) this.appendRange(nextLo, lo - 1);
        nextLo = hi + 1;
        continue;
      }
      for (let c = lo; c <= hi; c += stride) {
        if (nextLo <= c - 1) this.appendRange(nextLo, c - 1);
        nextLo = c + 1;
      }
    }
    if (nextLo <= Unicode.MAX_RUNE) this.appendRange(nextLo, Unicode.MAX_RUNE);
    return this;
  }
  appendTableWithSign(table, sign) {
    return sign < 0 ? this.appendNegatedTable(table) : this.appendTable(table);
  }
  negateClass() {
    let nextLo = 0;
    let w = 0;
    for (let i = 0; i < this.len; i += 2) {
      const lo = this.r[i];
      const hi = this.r[i + 1];
      if (nextLo <= lo - 1) {
        this.r[w] = nextLo;
        this.r[w + 1] = lo - 1;
        w += 2;
      }
      nextLo = hi + 1;
    }
    this.len = w;
    if (nextLo <= Unicode.MAX_RUNE) {
      this.r[this.len++] = nextLo;
      this.r[this.len++] = Unicode.MAX_RUNE;
    }
    return this;
  }
  appendClassWithSign(x, sign) {
    return sign < 0 ? this.appendNegatedClass(x) : this.appendClass(x);
  }
  appendGroup(g, foldCase) {
    let cls = g.cls;
    if (foldCase) cls = new CharClass2().appendFoldedClass(cls).cleanClass().toArray();
    return this.appendClassWithSign(cls, g.sign);
  }
  toString() {
    return CharClass2.charClassToString(this.r, this.len);
  }
};
var StringIterator = class {
  constructor(str) {
    this.str = str;
    this.position = 0;
  }
  pos() {
    return this.position;
  }
  rewindTo(pos) {
    this.position = pos;
  }
  more() {
    return this.position < this.str.length;
  }
  peek() {
    return this.str.codePointAt(this.position);
  }
  skip(n) {
    this.position += n;
  }
  skipString(s) {
    this.position += s.length;
  }
  pop() {
    const r = this.str.codePointAt(this.position);
    this.position += Utils.charCount(r);
    return r;
  }
  lookingAt(s) {
    return this.str.startsWith(s, this.position);
  }
  rest() {
    return this.str.substring(this.position);
  }
  from(beforePos) {
    return this.str.substring(beforePos, this.position);
  }
  toString() {
    return this.rest();
  }
};
var Parser = class Parser2 {
  static ERR_INTERNAL_ERROR = "regexp/syntax: internal error";
  static ERR_INVALID_CHAR_RANGE = "invalid character class range";
  static ERR_INVALID_ESCAPE = "invalid escape sequence";
  static ERR_INVALID_NAMED_CAPTURE = "invalid named capture";
  static ERR_INVALID_PERL_OP = "invalid or unsupported Perl syntax";
  static ERR_INVALID_REPEAT_OP = "invalid nested repetition operator";
  static ERR_INVALID_REPEAT_SIZE = "invalid repeat count";
  static ERR_MISSING_BRACKET = "missing closing ]";
  static ERR_MISSING_PAREN = "missing closing )";
  static ERR_MISSING_REPEAT_ARGUMENT = "missing argument to repetition operator";
  static ERR_TRAILING_BACKSLASH = "trailing backslash at end of expression";
  static ERR_DUPLICATE_NAMED_CAPTURE = "duplicate capture group name";
  static ERR_UNEXPECTED_PAREN = "unexpected )";
  static ERR_NESTING_DEPTH = "expression nests too deeply";
  static ERR_LARGE = "expression too large";
  static ERR_INVALID_CAPTURE_IN_LOOKBEHIND = "invalid capture in lookbehind";
  static MAX_HEIGHT = 1e3;
  static MAX_SIZE = 3355443;
  static MAX_RUNES = 33554432;
  static ANY_TABLE = new UnicodeRangeTable(new Uint32Array([
    0,
    Unicode.MAX_RUNE,
    1
  ]));
  static ASCII_TABLE = new UnicodeRangeTable(new Uint32Array([
    0,
    127,
    1
  ]));
  static ASCII_FOLD_TABLE = new UnicodeRangeTable(new Uint32Array([
    0,
    127,
    1,
    383,
    383,
    1,
    8490,
    8490,
    1
  ]));
  static unicodeTable(name) {
    if (name === "Any") return {
      tab: Parser2.ANY_TABLE,
      fold: Parser2.ANY_TABLE,
      sign: 1
    };
    if (name === "Ascii") return {
      tab: Parser2.ASCII_TABLE,
      fold: Parser2.ASCII_FOLD_TABLE,
      sign: 1
    };
    if (name === "Assigned") return {
      tab: UnicodeTables.CATEGORIES.get("Cn"),
      fold: UnicodeTables.CATEGORIES.get("Cn"),
      sign: -1
    };
    if (name === "Lc") return {
      tab: UnicodeTables.CATEGORIES.get("LC"),
      fold: UnicodeTables.FOLD_CATEGORIES.get("LC"),
      sign: 1
    };
    if (UnicodeTables.CATEGORIES.has(name)) return {
      tab: UnicodeTables.CATEGORIES.get(name),
      fold: UnicodeTables.FOLD_CATEGORIES.get(name),
      sign: 1
    };
    if (UnicodeTables.SCRIPTS.has(name)) return {
      tab: UnicodeTables.SCRIPTS.get(name),
      fold: UnicodeTables.FOLD_SCRIPT.get(name),
      sign: 1
    };
    return null;
  }
  static minFoldRune(r) {
    if (r < Unicode.MIN_FOLD || r > Unicode.MAX_FOLD) return r;
    let min = r;
    const r0 = r;
    for (r = Unicode.simpleFold(r); r !== r0; r = Unicode.simpleFold(r)) if (min > r) min = r;
    return min;
  }
  static leadingRegexp(re2) {
    if (re2.op === Regexp.Op.EMPTY_MATCH) return null;
    if (re2.op === Regexp.Op.CONCAT && re2.subs.length > 0) {
      const sub = re2.subs[0];
      if (sub.op === Regexp.Op.EMPTY_MATCH) return null;
      return sub;
    }
    return re2;
  }
  static literalRegexp(s, flags) {
    const re2 = new Regexp(Regexp.Op.LITERAL);
    re2.flags = flags;
    re2.runes = Utils.stringToRunes(s);
    return re2;
  }
  /**
  * Parse regular expression pattern {@code pattern} with mode flags {@code flags}.
  * @param {string} pattern
  * @param {number} flags
  */
  static parse(pattern, flags) {
    return new Parser2(pattern, flags).parseInternal();
  }
  static parseRepeat(t) {
    const start = t.pos();
    if (!t.more() || !t.lookingAt("{")) return -1;
    t.skip(1);
    const min = Parser2.parseInt(t);
    if (min === -1) return -1;
    if (!t.more()) return -1;
    let max;
    if (!t.lookingAt(",")) max = min;
    else {
      t.skip(1);
      if (!t.more()) return -1;
      if (t.lookingAt("}")) max = -1;
      else if ((max = Parser2.parseInt(t)) === -1) return -1;
    }
    if (!t.more() || !t.lookingAt("}")) return -1;
    t.skip(1);
    if (min < 0 || min > 1e3 || max === -2 || max > 1e3 || max >= 0 && min > max) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_REPEAT_SIZE, t.from(start));
    return min << 16 | max & Unicode.MAX_BMP;
  }
  static isValidCaptureName(name) {
    if (name.length === 0) return false;
    for (let i = 0; i < name.length; i++) {
      const c = name.codePointAt(i);
      if (c !== Codepoint.CODES.get("_") && !Utils.isalnum(c)) return false;
    }
    return true;
  }
  static parseInt(t) {
    const start = t.pos();
    while (t.more() && t.peek() >= Codepoint.CODES.get("0") && t.peek() <= Codepoint.CODES.get("9")) t.skip(1);
    const n = t.from(start);
    if (n.length === 0 || n.length > 1 && n.codePointAt(0) === Codepoint.CODES.get("0")) return -1;
    if (n.length > 8) return -2;
    return parseInt(n, 10);
  }
  static isCharClass(re2) {
    return re2.op === Regexp.Op.LITERAL && re2.runes.length === 1 || re2.op === Regexp.Op.CHAR_CLASS || re2.op === Regexp.Op.ANY_CHAR_NOT_NL || re2.op === Regexp.Op.ANY_CHAR;
  }
  static matchRune(re2, r) {
    switch (re2.op) {
      case Regexp.Op.LITERAL:
        return re2.runes.length === 1 && re2.runes[0] === r;
      case Regexp.Op.CHAR_CLASS:
        for (let i = 0; i < re2.runes.length; i += 2) if (re2.runes[i] <= r && r <= re2.runes[i + 1]) return true;
        return false;
      case Regexp.Op.ANY_CHAR_NOT_NL:
        return r !== Codepoint.CODES.get("\n");
      case Regexp.Op.ANY_CHAR:
        return true;
    }
    return false;
  }
  static mergeCharClass(dst, src) {
    switch (dst.op) {
      case Regexp.Op.ANY_CHAR:
        break;
      case Regexp.Op.ANY_CHAR_NOT_NL:
        if (Parser2.matchRune(src, Codepoint.CODES.get("\n"))) dst.op = Regexp.Op.ANY_CHAR;
        break;
      case Regexp.Op.CHAR_CLASS:
        if (src.op === Regexp.Op.LITERAL) dst.runes = new CharClass(dst.runes).appendLiteral(src.runes[0], src.flags).toArray();
        else dst.runes = new CharClass(dst.runes).appendClass(src.runes).toArray();
        break;
      case Regexp.Op.LITERAL:
        if (src.runes[0] === dst.runes[0] && src.flags === dst.flags) break;
        dst.op = Regexp.Op.CHAR_CLASS;
        dst.runes = new CharClass().appendLiteral(dst.runes[0], dst.flags).appendLiteral(src.runes[0], src.flags).toArray();
        break;
    }
  }
  static parseEscape(t) {
    const startPos = t.pos();
    t.skip(1);
    if (!t.more()) throw new RE2JSSyntaxException(Parser2.ERR_TRAILING_BACKSLASH);
    let c = t.pop();
    bigswitch: switch (c) {
      case Codepoint.CODES.get("1"):
      case Codepoint.CODES.get("2"):
      case Codepoint.CODES.get("3"):
      case Codepoint.CODES.get("4"):
      case Codepoint.CODES.get("5"):
      case Codepoint.CODES.get("6"):
      case Codepoint.CODES.get("7"):
        if (!t.more() || t.peek() < Codepoint.CODES.get("0") || t.peek() > Codepoint.CODES.get("7")) break;
      case Codepoint.CODES.get("0"): {
        let r = c - Codepoint.CODES.get("0");
        for (let i = 1; i < 3; i++) {
          if (!t.more() || t.peek() < Codepoint.CODES.get("0") || t.peek() > Codepoint.CODES.get("7")) break;
          r = r * 8 + t.peek() - Codepoint.CODES.get("0");
          t.skip(1);
        }
        return r;
      }
      case Codepoint.CODES.get("x"): {
        if (!t.more()) break;
        c = t.pop();
        if (c === Codepoint.CODES.get("{")) {
          let nhex = 0;
          let r = 0;
          while (true) {
            if (!t.more()) break bigswitch;
            c = t.pop();
            if (c === Codepoint.CODES.get("}")) break;
            const v = Utils.unhex(c);
            if (v < 0) break bigswitch;
            r = r * 16 + v;
            if (r > Unicode.MAX_RUNE) break bigswitch;
            nhex++;
          }
          if (nhex === 0) break bigswitch;
          return r;
        }
        const x = Utils.unhex(c);
        if (!t.more()) break;
        c = t.pop();
        const y = Utils.unhex(c);
        if (x < 0 || y < 0) break;
        return x * 16 + y;
      }
      case Codepoint.CODES.get("a"):
        return Codepoint.CODES.get("\x07");
      case Codepoint.CODES.get("f"):
        return Codepoint.CODES.get("\f");
      case Codepoint.CODES.get("n"):
        return Codepoint.CODES.get("\n");
      case Codepoint.CODES.get("r"):
        return Codepoint.CODES.get("\r");
      case Codepoint.CODES.get("t"):
        return Codepoint.CODES.get("	");
      case Codepoint.CODES.get("v"):
        return Codepoint.CODES.get("\v");
      default:
        if (c <= Unicode.MAX_ASCII && !Utils.isalnum(c)) return c;
        break;
    }
    throw new RE2JSSyntaxException(Parser2.ERR_INVALID_ESCAPE, t.from(startPos));
  }
  static parseClassChar(t, wholeClassPos) {
    if (!t.more()) throw new RE2JSSyntaxException(Parser2.ERR_MISSING_BRACKET, t.from(wholeClassPos));
    if (t.lookingAt("\\")) return Parser2.parseEscape(t);
    return t.pop();
  }
  static concatRunes(x, y) {
    for (let i = 0; i < y.length; i++) x.push(y[i]);
    return x;
  }
  static hasCapture(re2) {
    if (re2 === null) return false;
    if (re2.op === Regexp.Op.CAPTURE) return true;
    if (re2.subs) {
      for (let sub of re2.subs) if (Parser2.hasCapture(sub)) return true;
    }
    return false;
  }
  constructor(wholeRegexp, flags = 0) {
    this.wholeRegexp = wholeRegexp;
    this.flags = flags;
    this.numCap = 0;
    this.namedGroups = /* @__PURE__ */ Object.create(null);
    this.stack = [];
    this.free = null;
    this.numRegexp = 0;
    this.numRunes = 0;
    this.repeats = 0;
    this.height = null;
    this.size = null;
    this.nlb = 0;
  }
  newRegexp(op) {
    let re2 = this.free;
    if (re2 !== null && re2.subs !== null && re2.subs.length > 0) {
      this.free = re2.subs[0];
      re2.reinit();
      re2.op = op;
    } else {
      re2 = new Regexp(op);
      this.numRegexp += 1;
    }
    return re2;
  }
  reuse(re2) {
    if (this.height !== null && this.height.has(re2)) this.height.delete(re2);
    if (re2.subs !== null && re2.subs.length > 0) re2.subs[0] = this.free;
    this.free = re2;
  }
  checkLimits(re2) {
    if (this.numRunes > Parser2.MAX_RUNES) throw new RE2JSSyntaxException(Parser2.ERR_LARGE);
    this.checkSize(re2);
    this.checkHeight(re2);
  }
  checkSize(re2) {
    if (this.size === null) {
      if (this.repeats === 0) this.repeats = 1;
      if (re2.op === Regexp.Op.REPEAT) {
        let n = re2.max;
        if (n === -1) n = re2.min;
        if (n <= 0) n = 1;
        if (n > Math.floor(Parser2.MAX_SIZE / this.repeats)) this.repeats = Parser2.MAX_SIZE;
        else this.repeats *= n;
      }
      if (this.numRegexp < Math.floor(Parser2.MAX_SIZE / this.repeats)) return;
      this.size = /* @__PURE__ */ new Map();
      for (let reEx of this.stack) this.checkSize(reEx);
    }
    if (this.calcSize(re2, true) > Parser2.MAX_SIZE) throw new RE2JSSyntaxException(Parser2.ERR_LARGE);
  }
  calcSize(re2, force = false) {
    if (!force && this.size !== null) {
      if (this.size.has(re2)) return this.size.get(re2);
    }
    let size = 0;
    switch (re2.op) {
      case Regexp.Op.LITERAL:
        size = re2.runes.length;
        break;
      case Regexp.Op.PLB:
      case Regexp.Op.NLB:
      case Regexp.Op.CAPTURE:
      case Regexp.Op.STAR:
        size = 2 + this.calcSize(re2.subs[0]);
        break;
      case Regexp.Op.PLUS:
      case Regexp.Op.QUEST:
        size = 1 + this.calcSize(re2.subs[0]);
        break;
      case Regexp.Op.CONCAT:
        for (let sub of re2.subs) size = size + this.calcSize(sub);
        break;
      case Regexp.Op.ALTERNATE:
        for (let sub of re2.subs) size = size + this.calcSize(sub);
        if (re2.subs.length > 1) size = size + re2.subs.length - 1;
        break;
      case Regexp.Op.REPEAT: {
        let sub = this.calcSize(re2.subs[0]);
        if (re2.max === -1) {
          if (re2.min === 0) size = 2 + sub;
          else size = 1 + re2.min * sub;
          break;
        }
        size = re2.max * sub + (re2.max - re2.min);
        break;
      }
    }
    size = Math.max(1, size);
    if (this.size === null) this.size = /* @__PURE__ */ new Map();
    this.size.set(re2, size);
    return size;
  }
  checkHeight(re2) {
    if (this.numRegexp < Parser2.MAX_HEIGHT) return;
    if (this.height === null) {
      this.height = /* @__PURE__ */ new Map();
      for (let reEx of this.stack) this.checkHeight(reEx);
    }
    if (this.calcHeight(re2, true) > Parser2.MAX_HEIGHT) throw new RE2JSSyntaxException(Parser2.ERR_NESTING_DEPTH);
  }
  calcHeight(re2, force = false) {
    if (!force && this.height !== null) {
      if (this.height.has(re2)) return this.height.get(re2);
    }
    let h = 1;
    for (let sub of re2.subs) {
      const hsub = this.calcHeight(sub);
      if (h < 1 + hsub) h = 1 + hsub;
    }
    if (this.height === null) this.height = /* @__PURE__ */ new Map();
    this.height.set(re2, h);
    return h;
  }
  pop() {
    return this.stack.pop();
  }
  popToPseudo() {
    const n = this.stack.length;
    let i = n;
    while (i > 0 && !Regexp.isPseudoOp(this.stack[i - 1].op)) i--;
    const r = this.stack.slice(i, n);
    this.stack = this.stack.slice(0, i);
    return r;
  }
  push(re2) {
    this.numRunes += re2.runes.length;
    if (re2.op === Regexp.Op.CHAR_CLASS && re2.runes.length === 2 && re2.runes[0] === re2.runes[1]) {
      if (this.maybeConcat(re2.runes[0], this.flags & ~RE2Flags.FOLD_CASE)) return null;
      re2.op = Regexp.Op.LITERAL;
      re2.runes = [re2.runes[0]];
      re2.flags = this.flags & ~RE2Flags.FOLD_CASE;
    } else if (re2.op === Regexp.Op.CHAR_CLASS && re2.runes.length === 4 && re2.runes[0] === re2.runes[1] && re2.runes[2] === re2.runes[3] && Unicode.simpleFold(re2.runes[0]) === re2.runes[2] && Unicode.simpleFold(re2.runes[2]) === re2.runes[0] || re2.op === Regexp.Op.CHAR_CLASS && re2.runes.length === 2 && re2.runes[0] + 1 === re2.runes[1] && Unicode.simpleFold(re2.runes[0]) === re2.runes[1] && Unicode.simpleFold(re2.runes[1]) === re2.runes[0]) {
      if (this.maybeConcat(re2.runes[0], this.flags | RE2Flags.FOLD_CASE)) return null;
      re2.op = Regexp.Op.LITERAL;
      re2.runes = [re2.runes[0]];
      re2.flags = this.flags | RE2Flags.FOLD_CASE;
    } else this.maybeConcat(-1, 0);
    this.stack.push(re2);
    this.checkLimits(re2);
    return re2;
  }
  maybeConcat(r, flags) {
    const n = this.stack.length;
    if (n < 2) return false;
    const re1 = this.stack[n - 1];
    const re2 = this.stack[n - 2];
    if (re1.op !== Regexp.Op.LITERAL || re2.op !== Regexp.Op.LITERAL || (re1.flags & RE2Flags.FOLD_CASE) !== (re2.flags & RE2Flags.FOLD_CASE)) return false;
    re2.runes = Parser2.concatRunes(re2.runes, re1.runes);
    if (r >= 0) {
      re1.runes = [r];
      re1.flags = flags;
      return true;
    }
    this.pop();
    this.reuse(re1);
    return false;
  }
  newLiteral(r, flags) {
    const re2 = this.newRegexp(Regexp.Op.LITERAL);
    re2.flags = flags;
    if ((flags & RE2Flags.FOLD_CASE) !== 0) r = Parser2.minFoldRune(r);
    re2.runes = [r];
    return re2;
  }
  literal(r) {
    this.push(this.newLiteral(r, this.flags));
  }
  op(op) {
    const re2 = this.newRegexp(op);
    re2.flags = this.flags;
    return this.push(re2);
  }
  repeat(op, min, max, beforePos, t, lastRepeatPos) {
    let flags = this.flags;
    if ((flags & RE2Flags.PERL_X) !== 0) {
      if (t.more() && t.lookingAt("?")) {
        t.skip(1);
        flags ^= RE2Flags.NON_GREEDY;
      }
      if (lastRepeatPos !== -1) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_REPEAT_OP, t.from(lastRepeatPos));
    }
    const n = this.stack.length;
    if (n === 0) throw new RE2JSSyntaxException(Parser2.ERR_MISSING_REPEAT_ARGUMENT, t.from(beforePos));
    const sub = this.stack[n - 1];
    if (Regexp.isPseudoOp(sub.op)) throw new RE2JSSyntaxException(Parser2.ERR_MISSING_REPEAT_ARGUMENT, t.from(beforePos));
    const re2 = this.newRegexp(op);
    re2.min = min;
    re2.max = max;
    re2.flags = flags;
    re2.subs = [sub];
    this.stack[n - 1] = re2;
    this.checkLimits(re2);
    if (op === Regexp.Op.REPEAT && (min >= 2 || max >= 2) && !this.repeatIsValid(re2, 1e3)) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_REPEAT_SIZE, t.from(beforePos));
  }
  repeatIsValid(re2, n) {
    if (re2.op === Regexp.Op.REPEAT) {
      let m = re2.max;
      if (m === 0) return true;
      if (m < 0) m = re2.min;
      if (m > n) return false;
      if (m > 0) n = Math.trunc(n / m);
    }
    for (let sub of re2.subs) if (!this.repeatIsValid(sub, n)) return false;
    return true;
  }
  concat() {
    this.maybeConcat(-1, 0);
    const subs = this.popToPseudo();
    if (subs.length === 0) return this.push(this.newRegexp(Regexp.Op.EMPTY_MATCH));
    return this.push(this.collapse(subs, Regexp.Op.CONCAT));
  }
  alternate() {
    const subs = this.popToPseudo();
    if (subs.length > 0) this.cleanAlt(subs[subs.length - 1]);
    if (subs.length === 0) return this.push(this.newRegexp(Regexp.Op.NO_MATCH));
    return this.push(this.collapse(subs, Regexp.Op.ALTERNATE));
  }
  cleanAlt(re2) {
    if (re2.op === Regexp.Op.CHAR_CLASS) {
      re2.runes = new CharClass(re2.runes).cleanClass().toArray();
      if (re2.runes.length === 2 && re2.runes[0] === 0 && re2.runes[1] === Unicode.MAX_RUNE) {
        re2.runes = [];
        re2.op = Regexp.Op.ANY_CHAR;
      } else if (re2.runes.length === 4 && re2.runes[0] === 0 && re2.runes[1] === Codepoint.CODES.get("\n") - 1 && re2.runes[2] === Codepoint.CODES.get("\n") + 1 && re2.runes[3] === Unicode.MAX_RUNE) {
        re2.runes = [];
        re2.op = Regexp.Op.ANY_CHAR_NOT_NL;
      }
    }
  }
  collapse(subs, op) {
    if (subs.length === 1) return subs[0];
    let len = 0;
    for (let sub of subs) len += sub.op === op ? sub.subs.length : 1;
    let newsubs = new Array(len).fill(null);
    let i = 0;
    for (let sub of subs) if (sub.op === op) {
      for (let j = 0; j < sub.subs.length; j++) newsubs[i++] = sub.subs[j];
      this.reuse(sub);
    } else newsubs[i++] = sub;
    let re2 = this.newRegexp(op);
    re2.subs = newsubs;
    if (op === Regexp.Op.ALTERNATE) {
      re2.subs = this.factor(re2.subs);
      if (re2.subs.length === 1) {
        const old = re2;
        re2 = re2.subs[0];
        this.reuse(old);
      }
    }
    return re2;
  }
  factor(array) {
    if (array.length < 2) return array;
    let s = 0;
    let lensub = array.length;
    let lenout = 0;
    let str = null;
    let strlen = 0;
    let strflags = 0;
    let start = 0;
    for (let i = 0; i <= lensub; i++) {
      let istr = null;
      let istrlen = 0;
      let iflags = 0;
      if (i < lensub) {
        let re2 = array[s + i];
        if (re2.op === Regexp.Op.CONCAT && re2.subs.length > 0) re2 = re2.subs[0];
        if (re2.op === Regexp.Op.LITERAL) {
          istr = re2.runes;
          istrlen = re2.runes.length;
          iflags = re2.flags & RE2Flags.FOLD_CASE;
        }
        if (iflags === strflags) {
          let same = 0;
          while (same < strlen && same < istrlen && str[same] === istr[same]) same++;
          if (same > 0) {
            strlen = same;
            continue;
          }
        }
      }
      if (i === start) {
      } else if (i === start + 1) array[lenout++] = array[s + start];
      else {
        const prefix = this.newRegexp(Regexp.Op.LITERAL);
        prefix.flags = strflags;
        prefix.runes = str.slice(0, strlen);
        for (let j = start; j < i; j++) {
          array[s + j] = this.removeLeadingString(array[s + j], strlen);
          this.checkLimits(array[s + j]);
        }
        const suffix = this.collapse(array.slice(s + start, s + i), Regexp.Op.ALTERNATE);
        const re2 = this.newRegexp(Regexp.Op.CONCAT);
        re2.subs = [prefix, suffix];
        array[lenout++] = re2;
      }
      start = i;
      str = istr;
      strlen = istrlen;
      strflags = iflags;
    }
    lensub = lenout;
    s = 0;
    start = 0;
    lenout = 0;
    let first = null;
    for (let i = 0; i <= lensub; i++) {
      let ifirst = null;
      if (i < lensub) {
        ifirst = Parser2.leadingRegexp(array[s + i]);
        if (first !== null && first.equals(ifirst) && (Parser2.isCharClass(first) || first.op === Regexp.Op.REPEAT && first.min === first.max && Parser2.isCharClass(first.subs[0]))) continue;
      }
      if (i === start) {
      } else if (i === start + 1) array[lenout++] = array[s + start];
      else {
        const prefix = first;
        for (let j = start; j < i; j++) {
          const reuse = j !== start;
          array[s + j] = this.removeLeadingRegexp(array[s + j], reuse);
          this.checkLimits(array[s + j]);
        }
        const suffix = this.collapse(array.slice(s + start, s + i), Regexp.Op.ALTERNATE);
        const re2 = this.newRegexp(Regexp.Op.CONCAT);
        re2.subs = [prefix, suffix];
        array[lenout++] = re2;
      }
      start = i;
      first = ifirst;
    }
    lensub = lenout;
    s = 0;
    start = 0;
    lenout = 0;
    for (let i = 0; i <= lensub; i++) {
      if (i < lensub && Parser2.isCharClass(array[s + i])) continue;
      if (i === start) {
      } else if (i === start + 1) array[lenout++] = array[s + start];
      else {
        let max = start;
        for (let j = start + 1; j < i; j++) {
          const subMax = array[s + max];
          const subJ = array[s + j];
          if (subMax.op < subJ.op || subMax.op === subJ.op && (subMax.runes !== null ? subMax.runes.length : 0) < (subJ.runes !== null ? subJ.runes.length : 0)) max = j;
        }
        const tmp = array[s + start];
        array[s + start] = array[s + max];
        array[s + max] = tmp;
        for (let j = start + 1; j < i; j++) {
          Parser2.mergeCharClass(array[s + start], array[s + j]);
          this.reuse(array[s + j]);
        }
        this.cleanAlt(array[s + start]);
        array[lenout++] = array[s + start];
      }
      if (i < lensub) array[lenout++] = array[s + i];
      start = i + 1;
    }
    lensub = lenout;
    s = 0;
    start = 0;
    lenout = 0;
    for (let i = 0; i < lensub; ++i) {
      if (i + 1 < lensub && array[s + i].op === Regexp.Op.EMPTY_MATCH && array[s + i + 1].op === Regexp.Op.EMPTY_MATCH) continue;
      array[lenout++] = array[s + i];
    }
    lensub = lenout;
    s = 0;
    return array.slice(s, lensub);
  }
  removeLeadingString(re2, n) {
    if (re2.op === Regexp.Op.CONCAT && re2.subs.length > 0) {
      const sub = this.removeLeadingString(re2.subs[0], n);
      re2.subs[0] = sub;
      if (sub.op === Regexp.Op.EMPTY_MATCH) {
        this.reuse(sub);
        switch (re2.subs.length) {
          case 0:
          case 1:
            re2.op = Regexp.Op.EMPTY_MATCH;
            re2.subs = Regexp.emptySubs();
            break;
          case 2: {
            const old = re2;
            re2 = re2.subs[1];
            this.reuse(old);
            break;
          }
          default:
            re2.subs = re2.subs.slice(1, re2.subs.length);
            break;
        }
      }
      return re2;
    }
    if (re2.op === Regexp.Op.LITERAL) {
      re2.runes = re2.runes.slice(n, re2.runes.length);
      if (re2.runes.length === 0) re2.op = Regexp.Op.EMPTY_MATCH;
    }
    return re2;
  }
  removeLeadingRegexp(re2, reuse) {
    if (re2.op === Regexp.Op.CONCAT && re2.subs.length > 0) {
      if (reuse) this.reuse(re2.subs[0]);
      re2.subs = re2.subs.slice(1, re2.subs.length);
      switch (re2.subs.length) {
        case 0:
          re2.op = Regexp.Op.EMPTY_MATCH;
          re2.subs = Regexp.emptySubs();
          break;
        case 1: {
          const old = re2;
          re2 = re2.subs[0];
          this.reuse(old);
          break;
        }
      }
      return re2;
    }
    if (reuse) this.reuse(re2);
    return this.newRegexp(Regexp.Op.EMPTY_MATCH);
  }
  parseInternal() {
    if ((this.flags & RE2Flags.LITERAL) !== 0) return Parser2.literalRegexp(this.wholeRegexp, this.flags);
    let lastRepeatPos = -1;
    let min = -1;
    let max = -1;
    const t = new StringIterator(this.wholeRegexp);
    while (t.more()) {
      let repeatPos = -1;
      bigswitch: switch (t.peek()) {
        case Codepoint.CODES.get("("):
          if ((this.flags & RE2Flags.LOOKBEHIND) !== 0) {
            if (t.lookingAt("(?<=")) {
              this.parsePosLookBehind();
              t.skip(4);
              break;
            }
            if (t.lookingAt("(?<!")) {
              this.parseNegLookBehind();
              t.skip(4);
              break;
            }
          }
          if ((this.flags & RE2Flags.PERL_X) !== 0 && t.lookingAt("(?")) {
            this.parsePerlFlags(t);
            break;
          }
          this.op(Regexp.Op.LEFT_PAREN).cap = ++this.numCap;
          t.skip(1);
          break;
        case Codepoint.CODES.get("|"):
          this.parseVerticalBar();
          t.skip(1);
          break;
        case Codepoint.CODES.get(")"):
          this.parseRightParen();
          t.skip(1);
          break;
        case Codepoint.CODES.get("^"):
          if ((this.flags & RE2Flags.ONE_LINE) !== 0) this.op(Regexp.Op.BEGIN_TEXT);
          else this.op(Regexp.Op.BEGIN_LINE);
          t.skip(1);
          break;
        case Codepoint.CODES.get("$"):
          if ((this.flags & RE2Flags.ONE_LINE) !== 0) this.op(Regexp.Op.END_TEXT).flags |= RE2Flags.WAS_DOLLAR;
          else this.op(Regexp.Op.END_LINE);
          t.skip(1);
          break;
        case Codepoint.CODES.get("."):
          if ((this.flags & RE2Flags.DOT_NL) !== 0) this.op(Regexp.Op.ANY_CHAR);
          else this.op(Regexp.Op.ANY_CHAR_NOT_NL);
          t.skip(1);
          break;
        case Codepoint.CODES.get("["):
          this.parseClass(t);
          break;
        case Codepoint.CODES.get("*"):
        case Codepoint.CODES.get("+"):
        case Codepoint.CODES.get("?"): {
          repeatPos = t.pos();
          let op = null;
          switch (t.pop()) {
            case Codepoint.CODES.get("*"):
              op = Regexp.Op.STAR;
              break;
            case Codepoint.CODES.get("+"):
              op = Regexp.Op.PLUS;
              break;
            case Codepoint.CODES.get("?"):
              op = Regexp.Op.QUEST;
              break;
          }
          this.repeat(op, min, max, repeatPos, t, lastRepeatPos);
          break;
        }
        case Codepoint.CODES.get("{"): {
          repeatPos = t.pos();
          const minMax = Parser2.parseRepeat(t);
          if (minMax < 0) {
            t.rewindTo(repeatPos);
            this.literal(t.pop());
            break;
          }
          min = minMax >> 16;
          max = (minMax & Unicode.MAX_BMP) << 16 >> 16;
          this.repeat(Regexp.Op.REPEAT, min, max, repeatPos, t, lastRepeatPos);
          break;
        }
        case Codepoint.CODES.get("\\"): {
          const savedPos = t.pos();
          t.skip(1);
          if ((this.flags & RE2Flags.PERL_X) !== 0 && t.more()) switch (t.pop()) {
            case Codepoint.CODES.get("A"):
              this.op(Regexp.Op.BEGIN_TEXT);
              break bigswitch;
            case Codepoint.CODES.get("b"):
              this.op(Regexp.Op.WORD_BOUNDARY);
              break bigswitch;
            case Codepoint.CODES.get("B"):
              this.op(Regexp.Op.NO_WORD_BOUNDARY);
              break bigswitch;
            case Codepoint.CODES.get("C"):
              throw new RE2JSSyntaxException(Parser2.ERR_INVALID_ESCAPE, "\\C");
            case Codepoint.CODES.get("Q"): {
              let lit = t.rest();
              const i = lit.indexOf("\\E");
              if (i >= 0) {
                lit = lit.substring(0, i);
                t.skipString(lit);
                t.skipString("\\E");
              } else t.skipString(lit);
              let j = 0;
              while (j < lit.length) {
                const codepoint = lit.codePointAt(j);
                this.literal(codepoint);
                j += Utils.charCount(codepoint);
              }
              break bigswitch;
            }
            case Codepoint.CODES.get("z"):
              this.op(Regexp.Op.END_TEXT);
              break bigswitch;
            default:
              t.rewindTo(savedPos);
              break;
          }
          else t.rewindTo(savedPos);
          const re2 = this.newRegexp(Regexp.Op.CHAR_CLASS);
          re2.flags = this.flags;
          if (t.lookingAt("\\p") || t.lookingAt("\\P")) {
            const cc2 = new CharClass();
            if (this.parseUnicodeClass(t, cc2)) {
              re2.runes = cc2.toArray();
              this.push(re2);
              break bigswitch;
            }
          }
          const cc = new CharClass();
          if (this.parsePerlClassEscape(t, cc)) {
            re2.runes = cc.toArray();
            this.push(re2);
            break bigswitch;
          }
          t.rewindTo(savedPos);
          this.reuse(re2);
          this.literal(Parser2.parseEscape(t));
          break;
        }
        default:
          this.literal(t.pop());
          break;
      }
      lastRepeatPos = repeatPos;
    }
    this.concat();
    if (this.swapVerticalBar()) this.pop();
    this.alternate();
    if (this.stack.length !== 1) throw new RE2JSSyntaxException(Parser2.ERR_MISSING_PAREN, this.wholeRegexp);
    this.stack[0].namedGroups = this.namedGroups;
    return this.stack[0];
  }
  parsePerlFlags(t) {
    const startPos = t.pos();
    const s = t.rest();
    if (s.startsWith("(?P<") || s.startsWith("(?<")) {
      const begin = s.charAt(2) === "P" ? 4 : 3;
      const end = s.indexOf(">");
      if (end < 0) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_NAMED_CAPTURE, s);
      const name = s.substring(begin, end);
      t.skipString(name);
      t.skip(begin + 1);
      if (!Parser2.isValidCaptureName(name)) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_NAMED_CAPTURE, s.substring(0, end + 1));
      const re2 = this.op(Regexp.Op.LEFT_PAREN);
      re2.cap = ++this.numCap;
      if (this.namedGroups[name]) throw new RE2JSSyntaxException(Parser2.ERR_DUPLICATE_NAMED_CAPTURE, name);
      this.namedGroups[name] = this.numCap;
      re2.name = name;
      return;
    }
    t.skip(2);
    let flags = this.flags;
    let sign = 1;
    let sawFlag = false;
    loop: while (t.more()) {
      const c = t.pop();
      switch (c) {
        case Codepoint.CODES.get("i"):
          flags |= RE2Flags.FOLD_CASE;
          sawFlag = true;
          break;
        case Codepoint.CODES.get("m"):
          flags &= ~RE2Flags.ONE_LINE;
          sawFlag = true;
          break;
        case Codepoint.CODES.get("s"):
          flags |= RE2Flags.DOT_NL;
          sawFlag = true;
          break;
        case Codepoint.CODES.get("U"):
          flags |= RE2Flags.NON_GREEDY;
          sawFlag = true;
          break;
        case Codepoint.CODES.get("-"):
          if (sign < 0) break loop;
          sign = -1;
          flags = ~flags;
          sawFlag = false;
          break;
        case Codepoint.CODES.get(":"):
        case Codepoint.CODES.get(")"):
          if (sign < 0) {
            if (!sawFlag) break loop;
            flags = ~flags;
          }
          if (c === Codepoint.CODES.get(":")) this.op(Regexp.Op.LEFT_PAREN);
          this.flags = flags;
          return;
        default:
          break loop;
      }
    }
    throw new RE2JSSyntaxException(Parser2.ERR_INVALID_PERL_OP, t.from(startPos));
  }
  parsePosLookBehind() {
    const re2 = this.newRegexp(Regexp.Op.LEFT_PAREN);
    re2.flags = this.flags;
    re2.lb = ++this.nlb;
    return this.push(re2);
  }
  parseNegLookBehind() {
    const re2 = this.newRegexp(Regexp.Op.LEFT_PAREN);
    re2.flags = this.flags;
    re2.lb = -++this.nlb;
    return this.push(re2);
  }
  parseVerticalBar() {
    this.concat();
    if (!this.swapVerticalBar()) this.op(Regexp.Op.VERTICAL_BAR);
  }
  swapVerticalBar() {
    const n = this.stack.length;
    if (n >= 3 && this.stack[n - 2].op === Regexp.Op.VERTICAL_BAR && Parser2.isCharClass(this.stack[n - 1]) && Parser2.isCharClass(this.stack[n - 3])) {
      let re1 = this.stack[n - 1];
      let re3 = this.stack[n - 3];
      if (re1.op > re3.op) {
        const tmp = re3;
        re3 = re1;
        re1 = tmp;
        this.stack[n - 3] = re3;
      }
      Parser2.mergeCharClass(re3, re1);
      this.reuse(re1);
      this.pop();
      return true;
    }
    if (n >= 2) {
      const re1 = this.stack[n - 1];
      const re2 = this.stack[n - 2];
      if (re2.op === Regexp.Op.VERTICAL_BAR) {
        if (n >= 3) this.cleanAlt(this.stack[n - 3]);
        this.stack[n - 2] = re1;
        this.stack[n - 1] = re2;
        return true;
      }
    }
    return false;
  }
  parseRightParen() {
    this.concat();
    if (this.swapVerticalBar()) this.pop();
    this.alternate();
    if (this.stack.length < 2) throw new RE2JSSyntaxException(Parser2.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
    const re1 = this.pop();
    const re2 = this.pop();
    if (re2.op !== Regexp.Op.LEFT_PAREN) throw new RE2JSSyntaxException(Parser2.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
    this.flags = re2.flags;
    if (re2.lb !== 0) {
      if (Parser2.hasCapture(re1)) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CAPTURE_IN_LOOKBEHIND, this.wholeRegexp);
      if (re2.lb > 0) re2.op = Regexp.Op.PLB;
      else re2.op = Regexp.Op.NLB;
      re2.subs = [re1];
      this.push(re2);
      return;
    }
    if (re2.cap === 0) this.push(re1);
    else {
      re2.op = Regexp.Op.CAPTURE;
      re2.subs = [re1];
      this.push(re2);
    }
  }
  parsePerlClassEscape(t, cc) {
    const beforePos = t.pos();
    if ((this.flags & RE2Flags.PERL_X) === 0 || !t.more() || t.pop() !== Codepoint.CODES.get("\\") || !t.more()) return false;
    t.pop();
    const p = t.from(beforePos);
    const g = PERL_GROUPS.has(p) ? PERL_GROUPS.get(p) : null;
    if (g === null) return false;
    cc.appendGroup(g, (this.flags & RE2Flags.FOLD_CASE) !== 0);
    return true;
  }
  parseNamedClass(t, cc) {
    const cls = t.rest();
    const i = cls.indexOf(":]");
    if (i < 0) return false;
    const name = cls.substring(0, i + 2);
    t.skipString(name);
    const g = POSIX_GROUPS.has(name) ? POSIX_GROUPS.get(name) : null;
    if (g === null) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CHAR_RANGE, name);
    cc.appendGroup(g, (this.flags & RE2Flags.FOLD_CASE) !== 0);
    return true;
  }
  parseUnicodeClass(t, cc) {
    const startPos = t.pos();
    if ((this.flags & RE2Flags.UNICODE_GROUPS) === 0 || !t.lookingAt("\\p") && !t.lookingAt("\\P")) return false;
    t.skip(1);
    let sign = 1;
    let c = t.pop();
    if (c === Codepoint.CODES.get("P")) sign = -1;
    if (!t.more()) {
      t.rewindTo(startPos);
      throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CHAR_RANGE, t.rest());
    }
    c = t.pop();
    let name;
    if (c !== Codepoint.CODES.get("{")) name = Utils.runeToString(c);
    else {
      const rest = t.rest();
      const end = rest.indexOf("}");
      if (end < 0) {
        t.rewindTo(startPos);
        throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CHAR_RANGE, t.rest());
      }
      name = rest.substring(0, end);
      t.skipString(name);
      t.skip(1);
    }
    if (!(name.length === 0) && name.codePointAt(0) === Codepoint.CODES.get("^")) {
      sign = 0 - sign;
      name = name.substring(1);
    }
    const pair = Parser2.unicodeTable(name);
    if (pair === null) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CHAR_RANGE, t.from(startPos));
    if (pair.sign < 0) sign = 0 - sign;
    const tab = pair.tab;
    const fold = pair.fold;
    if ((this.flags & RE2Flags.FOLD_CASE) === 0 || fold === null) cc.appendTableWithSign(tab, sign);
    else {
      const tmp = new CharClass().appendTable(tab).appendTable(fold).cleanClass().toArray();
      cc.appendClassWithSign(tmp, sign);
    }
    return true;
  }
  parseClass(t) {
    const startPos = t.pos();
    t.skip(1);
    const re2 = this.newRegexp(Regexp.Op.CHAR_CLASS);
    re2.flags = this.flags;
    const cc = new CharClass();
    let sign = 1;
    if (t.more() && t.lookingAt("^")) {
      sign = -1;
      t.skip(1);
      if ((this.flags & RE2Flags.CLASS_NL) === 0) cc.appendRange(Codepoint.CODES.get("\n"), Codepoint.CODES.get("\n"));
    }
    let first = true;
    while (!t.more() || t.peek() !== Codepoint.CODES.get("]") || first) {
      if (t.more() && t.lookingAt("-") && (this.flags & RE2Flags.PERL_X) === 0 && !first) {
        const s = t.rest();
        if (s === "-" || !s.startsWith("-]")) {
          t.rewindTo(startPos);
          throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CHAR_RANGE, t.rest());
        }
      }
      first = false;
      const beforePos = t.pos();
      if (t.lookingAt("[:")) {
        if (this.parseNamedClass(t, cc)) continue;
        t.rewindTo(beforePos);
      }
      if (this.parseUnicodeClass(t, cc)) continue;
      if (this.parsePerlClassEscape(t, cc)) continue;
      t.rewindTo(beforePos);
      const lo = Parser2.parseClassChar(t, startPos);
      let hi = lo;
      if (t.more() && t.lookingAt("-")) {
        t.skip(1);
        if (t.more() && t.lookingAt("]")) t.skip(-1);
        else {
          hi = Parser2.parseClassChar(t, startPos);
          if (hi < lo) throw new RE2JSSyntaxException(Parser2.ERR_INVALID_CHAR_RANGE, t.from(beforePos));
        }
      }
      if ((this.flags & RE2Flags.FOLD_CASE) === 0) cc.appendRange(lo, hi);
      else cc.appendFoldedRange(lo, hi);
    }
    t.skip(1);
    cc.cleanClass();
    if (sign < 0) cc.negateClass();
    re2.runes = cc.toArray();
    this.push(re2);
  }
};
var RE2 = class RE22 {
  static initTest(expr) {
    const re2 = RE22.compile(expr);
    const res = new RE22(re2.expr, re2.prog, re2.numSubexp, re2.longest);
    res.cond = re2.cond;
    res.prefix = re2.prefix;
    res.prefixUTF8 = re2.prefixUTF8;
    res.prefixComplete = re2.prefixComplete;
    res.prefixRune = re2.prefixRune;
    res.prefilter = re2.prefilter;
    return res;
  }
  /**
  * Parses a regular expression and returns, if successful, an {@code RE2} instance that can be
  * used to match against text.
  *
  * When matching against text, the regexp returns a match that begins as early as possible in the
  * input (leftmost), and among those it chooses the one that a backtracking search would have
  * found first. This so-called leftmost-first matching is the same semantics that Perl, Python,
  * and other implementations use, although this package implements it without the expense of
  * backtracking. For POSIX leftmost-longest matching, see {@link #compilePOSIX}.
  */
  static compile(expr) {
    return RE22.compileImpl(expr, RE2Flags.PERL, false);
  }
  /**
  * {@code compilePOSIX} is like {@link #compile} but restricts the regular expression to POSIX ERE
  * (egrep) syntax and changes the match semantics to leftmost-longest.
  *
  * That is, when matching against text, the regexp returns a match that begins as early as
  * possible in the input (leftmost), and among those it chooses a match that is as long as
  * possible. This so-called leftmost-longest matching is the same semantics that early regular
  * expression implementations used and that POSIX specifies.
  *
  * However, there can be multiple leftmost-longest matches, with different submatch choices, and
  * here this package diverges from POSIX. Among the possible leftmost-longest matches, this
  * package chooses the one that a backtracking search would have found first, while POSIX
  * specifies that the match be chosen to maximize the length of the first subexpression, then the
  * second, and so on from left to right. The POSIX rule is computationally prohibitive and not
  * even well-defined. See http://swtch.com/~rsc/regexp/regexp2.html#posix
  */
  static compilePOSIX(expr) {
    return RE22.compileImpl(expr, RE2Flags.POSIX, true);
  }
  static compileImpl(expr, mode, longest) {
    let re2 = Parser.parse(expr, mode);
    const maxCap = re2.maxCap();
    re2 = Simplify.simplify(re2);
    const prefilter = PrefilterTree.build(re2);
    const prog = Compiler.compileRegexp(re2);
    const re22 = new RE22(expr, prog, maxCap, longest);
    re22.prefilter = prefilter.type === Prefilter.Type.NONE ? null : prefilter;
    const [prefixCompl, prefixStr] = prog.prefix();
    re22.prefixComplete = prefixCompl;
    re22.prefix = prefixStr;
    re22.prefixUTF8 = Utils.stringToUtf8ByteArray(re22.prefix);
    if (re22.prefix.length > 0) re22.prefixRune = re22.prefix.codePointAt(0);
    re22.namedGroups = re2.namedGroups;
    return re22;
  }
  /**
  * Returns true iff textual regular expression {@code pattern} matches string {@code s}.
  *
  * More complicated queries need to use {@link #compile} and the full {@code RE2} interface.
  */
  static match(pattern, s) {
    return RE22.compile(pattern).match(s);
  }
  constructor(expr, prog, numSubexp = 0, longest = 0) {
    this.expr = expr;
    this.prog = prog;
    this.numSubexp = numSubexp;
    this.longest = longest;
    this.cond = prog.startCond();
    this.prefix = null;
    this.prefixUTF8 = null;
    this.prefixComplete = false;
    this.prefixRune = 0;
    this.machinePool = [];
    this.dfa = new DFA(this.prog);
    this.onepass = OnePass.compile(this.prog);
    this.prefilter = null;
  }
  matchPrefixComplete(input, pos, anchor, ncap) {
    if ((anchor === RE2Flags.ANCHOR_START || anchor === RE2Flags.ANCHOR_BOTH) && pos !== 0) return null;
    let matchStart = -1;
    let matchEnd = -1;
    const pLen = input.prefixLength(this);
    if (anchor === RE2Flags.UNANCHORED) {
      const idx = input.index(this, pos);
      if (idx < 0) return null;
      matchStart = pos + idx;
      matchEnd = matchStart + pLen;
    } else if (anchor === RE2Flags.ANCHOR_BOTH) {
      if (input.endPos() !== pLen) return null;
      if (input.index(this, 0) !== 0) return null;
      matchStart = 0;
      matchEnd = pLen;
    } else if (anchor === RE2Flags.ANCHOR_START) {
      if (input.index(this, 0) !== 0) return null;
      matchStart = 0;
      matchEnd = pLen;
    }
    if (matchStart < 0) return null;
    if (ncap > 0) {
      const matchcap = new Int32Array(ncap).fill(-1);
      matchcap[0] = matchStart;
      matchcap[1] = matchEnd;
      return Array.from(matchcap);
    }
    return [];
  }
  executeEngine(input, pos, anchor, ncap) {
    if (this.prefixComplete && (ncap === 0 || this.numSubexp === 0)) return this.matchPrefixComplete(input, pos, anchor, ncap);
    if (this.prefilter !== null && anchor === RE2Flags.UNANCHORED) {
      if (!this.prefilter.eval(input, pos)) return null;
    }
    if (this.onepass !== null) return OnePass.execute(this, input, pos, anchor, ncap);
    if (ncap > 0) {
      if (this.prog.numLb === 0 && input.endPos() <= Backtracker.maxBitStateLen(this.prog)) return Backtracker.execute(this, input, pos, anchor, ncap);
      return this.doExecuteNFA(input, pos, anchor, ncap);
    }
    if (this.prog.numLb === 0) {
      const dfaResult = this.dfa.match(input, pos, anchor);
      if (dfaResult !== null) return dfaResult ? [] : null;
      if (input.endPos() <= Backtracker.maxBitStateLen(this.prog)) return Backtracker.execute(this, input, pos, anchor, ncap);
    }
    return this.doExecuteNFA(input, pos, anchor, ncap);
  }
  /**
  * Returns the number of parenthesized subexpressions in this regular expression.
  */
  numberOfCapturingGroups() {
    return this.numSubexp;
  }
  /**
  * Returns the number of instructions in this compiled regular expression program.
  */
  numberOfInstructions() {
    return this.prog.numInst();
  }
  get() {
    return this.machinePool.length > 0 ? this.machinePool.pop() : null;
  }
  reset() {
    this.machinePool.length = 0;
  }
  put(m) {
    this.machinePool.push(m);
  }
  toString() {
    return this.expr;
  }
  doExecuteNFA(input, pos, anchor, ncap) {
    let m = this.get();
    if (!m) m = Machine.fromRE2(this);
    m.init(ncap);
    const cap = m.match(input, pos, anchor) ? m.submatches() : null;
    this.put(m);
    return cap;
  }
  match(s) {
    return this.executeEngine(MachineInput.fromUTF16(s), 0, RE2Flags.UNANCHORED, 0) !== null;
  }
  /**
  * Matches the regular expression against input starting at position start and ending at position
  * end, with the given anchoring. Records the submatch boundaries in group, which is [start, end)
  * pairs of byte offsets. The number of boundaries needed is inferred from the size of the group
  * array. It is most efficient not to ask for submatch boundaries.
  *
  * @param input the input byte array
  * @param start the beginning position in the input
  * @param end the end position in the input
  * @param anchor the anchoring flag (UNANCHORED, ANCHOR_START, ANCHOR_BOTH)
  * @param group the array to fill with submatch positions
  * @param ngroup the number of array pairs to fill in
  * @returns true if a match was found
  */
  matchWithGroup(input, start, end, anchor, ngroup) {
    if (!(input instanceof MatcherInputBase)) if (Utils.isByteArray(input)) input = MatcherInput.utf8(input);
    else input = MatcherInput.utf16(input);
    return this.matchMachineInput(input, start, end, anchor, ngroup);
  }
  matchMachineInput(input, start, end, anchor, ngroup) {
    if (start > end) return [false, null];
    const machineInput = input.isUTF16Encoding() ? MachineInput.fromUTF16(input.asCharSequence(), 0, end) : MachineInput.fromUTF8(input.asBytes(), 0, end);
    const groupMatch = this.executeEngine(machineInput, start, anchor, 2 * ngroup);
    if (groupMatch === null) return [false, null];
    return [true, groupMatch];
  }
  /**
  * Returns true iff this regexp matches the UTF-8 byte array {@code b}.
  */
  matchUTF8(b) {
    return this.executeEngine(MachineInput.fromUTF8(b), 0, RE2Flags.UNANCHORED, 0) !== null;
  }
  /**
  * Returns a copy of {@code src} in which all matches for this regexp have been replaced by
  * {@code repl}. No support is provided for expressions (e.g. {@code \1} or {@code $1}) in the
  * replacement string.
  */
  replaceAll(src, repl) {
    return this.replaceAllFunc(src, () => repl, 2 * src.length + 1);
  }
  /**
  * Returns a copy of {@code src} in which only the first match for this regexp has been replaced
  * by {@code repl}. No support is provided for expressions (e.g. {@code \1} or {@code $1}) in the
  * replacement string.
  */
  replaceFirst(src, repl) {
    return this.replaceAllFunc(src, () => repl, 1);
  }
  /**
  * Returns a copy of {@code src} in which at most {@code maxReplaces} matches for this regexp have
  * been replaced by the return value of of function {@code repl} (whose first argument is the
  * matched string). No support is provided for expressions (e.g. {@code \1} or {@code $1}) in the
  * replacement string.
  */
  replaceAllFunc(src, replFunc, maxReplaces) {
    let lastMatchEnd = 0;
    let searchPos = 0;
    let out = "";
    const input = MachineInput.fromUTF16(src);
    let numReplaces = 0;
    while (searchPos <= src.length) {
      const a = this.executeEngine(input, searchPos, RE2Flags.UNANCHORED, 2);
      if (a === null || a.length === 0) break;
      out += src.substring(lastMatchEnd, a[0]);
      if (a[1] > lastMatchEnd || a[0] === 0) {
        out += replFunc(src.substring(a[0], a[1]));
        numReplaces++;
      }
      lastMatchEnd = a[1];
      const width = input.step(searchPos) & 7;
      if (searchPos + width > a[1]) searchPos += width;
      else if (searchPos + 1 > a[1]) searchPos++;
      else searchPos = a[1];
      if (numReplaces >= maxReplaces) break;
    }
    out += src.substring(lastMatchEnd);
    return out;
  }
  pad(a) {
    if (a === null) return null;
    let n = (1 + this.numSubexp) * 2;
    if (a.length < n) {
      let a2 = new Array(n).fill(-1);
      for (let i = 0; i < a.length; i++) a2[i] = a[i];
      a = a2;
    }
    return a;
  }
  allMatches(input, n, deliverFun = (v) => v) {
    let result = [];
    const end = input.endPos();
    if (n < 0) n = end + 1;
    let pos = 0;
    let i = 0;
    let prevMatchEnd = -1;
    while (i < n && pos <= end) {
      const matches = this.executeEngine(input, pos, RE2Flags.UNANCHORED, this.prog.numCap);
      if (matches === null || matches.length === 0) break;
      let accept = true;
      if (matches[1] === pos) {
        if (matches[0] === prevMatchEnd) accept = false;
        const r = input.step(pos);
        if (r < 0) pos = end + 1;
        else pos += r & 7;
      } else pos = matches[1];
      prevMatchEnd = matches[1];
      if (accept) {
        result.push(deliverFun(this.pad(matches)));
        i++;
      }
    }
    return result;
  }
  /**
  * Returns an array holding the text of the leftmost match in {@code b} of this regular
  * expression.
  *
  * A return value of null indicates no match.
  */
  findUTF8(b) {
    const a = this.executeEngine(MachineInput.fromUTF8(b), 0, RE2Flags.UNANCHORED, 2);
    if (a === null) return null;
    return b.slice(a[0], a[1]);
  }
  /**
  * Returns a two-element array of integers defining the location of the leftmost match in
  * {@code b} of this regular expression. The match itself is at {@code b[loc[0]...loc[1]]}.
  *
  * A return value of null indicates no match.
  */
  findUTF8Index(b) {
    const a = this.executeEngine(MachineInput.fromUTF8(b), 0, RE2Flags.UNANCHORED, 2);
    if (a === null) return null;
    return a.slice(0, 2);
  }
  /**
  * Returns a string holding the text of the leftmost match in {@code s} of this regular
  * expression.
  *
  * If there is no match, the return value is an empty string, but it will also be empty if the
  * regular expression successfully matches an empty string. Use {@link #findIndex} or
  * {@link #findSubmatch} if it is necessary to distinguish these cases.
  */
  find(s) {
    const a = this.executeEngine(MachineInput.fromUTF16(s), 0, RE2Flags.UNANCHORED, 2);
    if (a === null) return "";
    return s.substring(a[0], a[1]);
  }
  /**
  * Returns a two-element array of integers defining the location of the leftmost match in
  * {@code s} of this regular expression. The match itself is at
  * {@code s.substring(loc[0], loc[1])}.
  *
  * A return value of null indicates no match.
  */
  findIndex(s) {
    return this.executeEngine(MachineInput.fromUTF16(s), 0, RE2Flags.UNANCHORED, 2);
  }
  /**
  * Returns an array of arrays the text of the leftmost match of the regular expression in
  * {@code b} and the matches, if any, of its subexpressions, as defined by the <a
  * href='#submatch'>Submatch</a> description above.
  *
  * A return value of null indicates no match.
  */
  findUTF8Submatch(b) {
    const a = this.executeEngine(MachineInput.fromUTF8(b), 0, RE2Flags.UNANCHORED, this.prog.numCap);
    if (a === null) return null;
    const ret = new Array(1 + this.numSubexp).fill(null);
    for (let i = 0; i < ret.length; i++) if (2 * i < a.length && a[2 * i] >= 0) ret[i] = b.slice(a[2 * i], a[2 * i + 1]);
    return ret;
  }
  /**
  * Returns an array holding the index pairs identifying the leftmost match of this regular
  * expression in {@code b} and the matches, if any, of its subexpressions, as defined by the the
  * <a href='#submatch'>Submatch</a> and <a href='#index'>Index</a> descriptions above.
  *
  * A return value of null indicates no match.
  */
  findUTF8SubmatchIndex(b) {
    return this.pad(this.executeEngine(MachineInput.fromUTF8(b), 0, RE2Flags.UNANCHORED, this.prog.numCap));
  }
  /**
  * Returns an array of strings holding the text of the leftmost match of the regular expression in
  * {@code s} and the matches, if any, of its subexpressions, as defined by the <a
  * href='#submatch'>Submatch</a> description above.
  *
  * A return value of null indicates no match.
  */
  findSubmatch(s) {
    const a = this.executeEngine(MachineInput.fromUTF16(s), 0, RE2Flags.UNANCHORED, this.prog.numCap);
    if (a === null) return null;
    const ret = new Array(1 + this.numSubexp).fill(null);
    for (let i = 0; i < ret.length; i++) if (2 * i < a.length && a[2 * i] >= 0) ret[i] = s.substring(a[2 * i], a[2 * i + 1]);
    return ret;
  }
  /**
  * Returns an array holding the index pairs identifying the leftmost match of this regular
  * expression in {@code s} and the matches, if any, of its subexpressions, as defined by the <a
  * href='#submatch'>Submatch</a> description above.
  *
  * A return value of null indicates no match.
  */
  findSubmatchIndex(s) {
    return this.pad(this.executeEngine(MachineInput.fromUTF16(s), 0, RE2Flags.UNANCHORED, this.prog.numCap));
  }
  /**
  * {@code findAllUTF8()} is the <a href='#all'>All</a> version of {@link #findUTF8}; it returns a
  * list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  *
  * TODO(adonovan): think about defining a byte slice view class, like a read-only Go slice backed
  * by |b|.
  */
  findAllUTF8(b, n) {
    const result = this.allMatches(MachineInput.fromUTF8(b), n, (match) => b.slice(match[0], match[1]));
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAllUTF8Index} is the <a href='#all'>All</a> version of {@link #findUTF8Index}; it
  * returns a list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllUTF8Index(b, n) {
    const result = this.allMatches(MachineInput.fromUTF8(b), n, (match) => match.slice(0, 2));
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAll} is the <a href='#all'>All</a> version of {@link #find}; it returns a list of up
  * to {@code n} successive matches of the expression, as defined by the <a href='#all'>All</a>
  * description above.
  *
  * A return value of null indicates no match.
  */
  findAll(s, n) {
    const result = this.allMatches(MachineInput.fromUTF16(s), n, (match) => s.substring(match[0], match[1]));
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAllIndex} is the <a href='#all'>All</a> version of {@link #findIndex}; it returns a
  * list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllIndex(s, n) {
    const result = this.allMatches(MachineInput.fromUTF16(s), n, (match) => match.slice(0, 2));
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAllUTF8Submatch} is the <a href='#all'>All</a> version of {@link #findUTF8Submatch};
  * it returns a list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllUTF8Submatch(b, n) {
    const result = this.allMatches(MachineInput.fromUTF8(b), n, (match) => {
      let slice = new Array(match.length / 2 | 0).fill(null);
      for (let j = 0; j < slice.length; j++) if (match[2 * j] >= 0) slice[j] = b.slice(match[2 * j], match[2 * j + 1]);
      return slice;
    });
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAllUTF8SubmatchIndex} is the <a href='#all'>All</a> version of
  * {@link #findUTF8SubmatchIndex}; it returns a list of up to {@code n} successive matches of the
  * expression, as defined by the <a href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllUTF8SubmatchIndex(b, n) {
    const result = this.allMatches(MachineInput.fromUTF8(b), n);
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAllSubmatch} is the <a href='#all'>All</a> version of {@link #findSubmatch}; it
  * returns a list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllSubmatch(s, n) {
    const result = this.allMatches(MachineInput.fromUTF16(s), n, (match) => {
      let slice = new Array(match.length / 2 | 0).fill(null);
      for (let j = 0; j < slice.length; j++) if (match[2 * j] >= 0) slice[j] = s.substring(match[2 * j], match[2 * j + 1]);
      return slice;
    });
    if (result.length === 0) return null;
    return result;
  }
  /**
  * {@code findAllSubmatchIndex} is the <a href='#all'>All</a> version of
  * {@link #findSubmatchIndex}; it returns a list of up to {@code n} successive matches of the
  * expression, as defined by the <a href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllSubmatchIndex(s, n) {
    const result = this.allMatches(MachineInput.fromUTF16(s), n);
    if (result.length === 0) return null;
    return result;
  }
};
var RE2Set = class RE2Set2 {
  /** @type {number} */
  static UNANCHORED = RE2Flags.UNANCHORED;
  /** @type {number} */
  static ANCHOR_START = RE2Flags.ANCHOR_START;
  /** @type {number} */
  static ANCHOR_BOTH = RE2Flags.ANCHOR_BOTH;
  /**
  * Constructs a new RE2Set with the specified anchor mode and flags.
  * @param {number} [anchor=RE2Set.UNANCHORED] - The anchoring mode (e.g., RE2Set.UNANCHORED).
  * @param {number} [flags=0] - The public flags to apply to all patterns in the set.
  * @param {number} [maxMem=8388608] - The maximum memory in bytes to use for the DFA (default 8MB).
  */
  constructor(anchor = RE2Set2.UNANCHORED, flags = 0, maxMem = 8388608) {
    this.anchor = anchor;
    this.jsFlags = flags;
    this.maxMem = maxMem;
    let re2Flags = RE2Flags.PERL;
    if ((flags & PublicFlags.DISABLE_UNICODE_GROUPS) !== 0) re2Flags &= ~RE2Flags.UNICODE_GROUPS;
    if ((flags & PublicFlags.LOOKBEHINDS) !== 0) re2Flags |= RE2Flags.LOOKBEHIND;
    this.re2Flags = re2Flags;
    this.regexps = [];
    this.prog = null;
    this.dfa = null;
    this.dummyRe2 = null;
  }
  /**
  * Adds a new regular expression pattern to the set.
  * Patterns cannot be added after the set has been compiled.
  * @param {string} pattern - The regular expression pattern to add.
  * @returns {number} The integer index assigned to the added pattern.
  * @throws {RE2JSCompileException} If patterns are added after compilation.
  */
  add(pattern) {
    if (this.prog) throw new RE2JSCompileException("Cannot add patterns after compile");
    let fregex = pattern;
    if ((this.jsFlags & PublicFlags.CASE_INSENSITIVE) !== 0) fregex = `(?i)${fregex}`;
    if ((this.jsFlags & PublicFlags.DOTALL) !== 0) fregex = `(?s)${fregex}`;
    if ((this.jsFlags & PublicFlags.MULTILINE) !== 0) fregex = `(?m)${fregex}`;
    const re2 = Parser.parse(fregex, this.re2Flags);
    this.regexps.push(Simplify.simplify(re2));
    return this.regexps.length - 1;
  }
  /**
  * Compiles the added patterns into a single state machine.
  * This is automatically called on the first match if not called explicitly.
  * @returns {void}
  */
  compile() {
    if (this.prog) return;
    this.prog = Compiler.compileSet(this.regexps);
    this.dfa = new DFA(this.prog, this.maxMem);
    this.dummyRe2 = {
      prog: this.prog,
      cond: this.prog.startCond(),
      prefix: "",
      prefixRune: 0,
      longest: false
    };
  }
  /**
  * Matches the input against the compiled set of regular expressions.
  * @param {string|number[]|Uint8Array} input - The input string or UTF-8 byte array to match against.
  * @returns {number[]} An array of indices representing the patterns that successfully matched the input.
  */
  match(input) {
    if (!this.prog) this.compile();
    const machineInput = Utils.isByteArray(input) ? MachineInput.fromUTF8(input) : MachineInput.fromUTF16(input);
    let internalAnchor = RE2Flags.UNANCHORED;
    if (this.anchor === RE2Set2.ANCHOR_START) internalAnchor = RE2Flags.ANCHOR_START;
    else if (this.anchor === RE2Set2.ANCHOR_BOTH) internalAnchor = RE2Flags.ANCHOR_BOTH;
    const dfaResult = this.dfa.matchSet(machineInput, 0, internalAnchor);
    if (dfaResult !== null) return dfaResult;
    const machine = Machine.fromRE2(this.dummyRe2);
    machine.init(0);
    return machine.matchSet(machineInput, 0, internalAnchor);
  }
};
var TranslateRegExpString = class TranslateRegExpString2 {
  static isHexadecimal(ch) {
    return "0" <= ch && ch <= "9" || "A" <= ch && ch <= "F" || "a" <= ch && ch <= "f";
  }
  static translate(data) {
    let prefixFlags = "";
    if (data instanceof RegExp) {
      if (data.ignoreCase) prefixFlags += "i";
      if (data.multiline) prefixFlags += "m";
      if (data.dotAll) prefixFlags += "s";
      data = data.source;
    }
    if (typeof data !== "string") return data;
    let result = "";
    let changed = false;
    let size = data.length;
    if (size === 0) {
      result = "(?:)";
      changed = true;
    }
    let inCharClass = false;
    let i = 0;
    while (i < size) {
      let ch = data[i];
      if (ch === "\\") {
        if (i + 1 < size) {
          ch = data[i + 1];
          switch (ch) {
            case "\\":
              result += "\\\\";
              i += 2;
              continue;
            case "c":
              if (i + 2 < size) {
                let code18 = data[i + 2].charCodeAt(0);
                if (code18 >= 65 && code18 <= 90 || code18 >= 97 && code18 <= 122) {
                  let val = code18 % 32;
                  result += "\\x";
                  result += (val >> 4).toString(16).toUpperCase();
                  result += (val & 15).toString(16).toUpperCase();
                  i += 3;
                  changed = true;
                  continue;
                }
              }
              result += "c";
              i += 2;
              changed = true;
              continue;
            case "u":
              if (i + 2 < size) {
                if (data[i + 2] === "{") {
                  let j = i + 3;
                  let hasHex = false;
                  let closed = false;
                  while (j < size) {
                    const hexChar = data[j];
                    if (hexChar === "}") {
                      closed = true;
                      break;
                    }
                    if (!TranslateRegExpString2.isHexadecimal(hexChar)) break;
                    hasHex = true;
                    j++;
                  }
                  if (closed && hasHex) {
                    result += "\\x";
                    i += 2;
                    changed = true;
                    continue;
                  }
                } else if (i + 5 < size) {
                  let isHex4 = true;
                  for (let j = 0; j < 4; j++) if (!TranslateRegExpString2.isHexadecimal(data[i + 2 + j])) {
                    isHex4 = false;
                    break;
                  }
                  if (isHex4) {
                    result += "\\x{" + data.substring(i + 2, i + 6) + "}";
                    i += 6;
                    changed = true;
                    continue;
                  }
                }
              }
              result += "u";
              i += 2;
              changed = true;
              continue;
            case "x": {
              let isValidHex = false;
              if (i + 2 < size && data[i + 2] === "{") {
                let j = i + 3;
                let hasHex = false;
                let closed = false;
                while (j < size) {
                  const hexChar = data[j];
                  if (hexChar === "}") {
                    closed = true;
                    break;
                  }
                  if (!TranslateRegExpString2.isHexadecimal(hexChar)) break;
                  hasHex = true;
                  j++;
                }
                if (closed && hasHex) isValidHex = true;
              } else if (i + 3 < size && TranslateRegExpString2.isHexadecimal(data[i + 2]) && TranslateRegExpString2.isHexadecimal(data[i + 3])) isValidHex = true;
              if (isValidHex) {
                result += "\\x";
                i += 2;
              } else {
                result += "x";
                i += 2;
                changed = true;
              }
              continue;
            }
            case "n":
            case "r":
            case "t":
            case "a":
            case "f":
            case "v":
            case "d":
            case "D":
            case "s":
            case "S":
            case "w":
            case "W":
            case "b":
            case "B":
            case "p":
            case "P":
            case "A":
            case "z":
            case "Q":
            case "E":
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
              result += "\\" + ch;
              i += 2;
              continue;
            default: {
              let cp2 = data.codePointAt(i + 1);
              if (cp2 >= 48 && cp2 <= 57 || cp2 >= 65 && cp2 <= 90 || cp2 >= 97 && cp2 <= 122) {
                let symSize2 = Utils.charCount(cp2);
                result += data.substring(i + 1, i + 1 + symSize2);
                i += symSize2 + 1;
                changed = true;
              } else {
                result += "\\";
                let symSize2 = Utils.charCount(cp2);
                result += data.substring(i + 1, i + 1 + symSize2);
                i += symSize2 + 1;
              }
              continue;
            }
          }
        }
      } else if (ch === "/") {
        result += "\\/";
        i += 1;
        changed = true;
        continue;
      } else if (ch === "[") inCharClass = true;
      else if (ch === "]") inCharClass = false;
      else if (!inCharClass && ch === "(" && i + 2 < size && data[i + 1] === "?" && data[i + 2] === "<") {
        if (i + 3 < size && !"=!>)".includes(data[i + 3])) {
          result += "(?P<";
          i += 3;
          changed = true;
          continue;
        }
      }
      let cp = data.codePointAt(i);
      let symSize = Utils.charCount(cp);
      result += data.substring(i, i + symSize);
      i += symSize;
    }
    const finalResult = changed ? result : data;
    if (prefixFlags.length > 0) return `(?${prefixFlags})${finalResult}`;
    return finalResult;
  }
};
var RE2JS = class RE2JS2 {
  /**
  * Flag: case insensitive matching.
  */
  static CASE_INSENSITIVE = PublicFlags.CASE_INSENSITIVE;
  /**
  * Flag: dot ({@code .}) matches all characters, including newline.
  */
  static DOTALL = PublicFlags.DOTALL;
  /**
  * Flag: multiline matching: {@code ^} and {@code $} match at beginning and end of line, not just
  * beginning and end of input.
  */
  static MULTILINE = PublicFlags.MULTILINE;
  /**
  * Flag: Unicode groups (e.g. {@code \p\ Greek\} ) will be syntax errors.
  */
  static DISABLE_UNICODE_GROUPS = PublicFlags.DISABLE_UNICODE_GROUPS;
  /**
  * Flag: matches longest possible string.
  */
  static LONGEST_MATCH = PublicFlags.LONGEST_MATCH;
  /**
  * Flag: enable linear-time captureless lookbehinds.
  */
  static LOOKBEHINDS = PublicFlags.LOOKBEHINDS;
  /**
  * Returns a literal pattern string for the specified string.
  *
  * This method produces a string that can be used to create a <code>RE2JS</code> that would
  * match the string <code>s</code> as if it were a literal pattern.
  *
  * Metacharacters or escape sequences in the input sequence will be given no special meaning.
  *
  * @param {string} str The string to be literalized
  * @returns {string} A literal string replacement
  */
  static quote(str) {
    return Utils.quoteMeta(str);
  }
  /**
  * Quotes '\' and '$' in {@code str}, so that the returned string could be used in
  * replacement methods as a literal replacement of {@code str}.
  *
  * This is a convenience delegation to {@link Matcher.quoteReplacement}.
  *
  * @param {string} str the string to be quoted
  * @param {boolean} [javaMode=false] whether the replacement will be used in javaMode
  * @returns {string} the quoted string
  */
  static quoteReplacement(str, javaMode = false) {
    return Matcher.quoteReplacement(str, javaMode);
  }
  /**
  * Translates a given regular expression string to ensure compatibility with RE2JS.
  *
  * This function preprocesses the input regex string by applying necessary transformations,
  * such as escaping special characters (e.g., `/`), converting named capture groups to
  * RE2JS-compatible syntax, and handling Unicode sequences properly. It ensures that the
  * resulting regex is safe and properly formatted before compilation.
  *
  * @param {string|RegExp} expr - The regular expression string to be translated.
  * @returns {string} - The transformed regular expression string, ready for compilation.
  */
  static translateRegExp(expr) {
    return TranslateRegExpString.translate(expr);
  }
  /**
  * Helper: create new RE2JS with given regex and flags. Flregex is the regex with flags applied.
  * @param {string} regex
  * @param {number} [flags=0]
  * @returns {RE2JS}
  */
  static compile(regex2, flags = 0) {
    let fregex = regex2;
    if ((flags & RE2JS2.CASE_INSENSITIVE) !== 0) fregex = `(?i)${fregex}`;
    if ((flags & RE2JS2.DOTALL) !== 0) fregex = `(?s)${fregex}`;
    if ((flags & RE2JS2.MULTILINE) !== 0) fregex = `(?m)${fregex}`;
    if ((flags & ~(RE2JS2.MULTILINE | RE2JS2.DOTALL | RE2JS2.CASE_INSENSITIVE | RE2JS2.DISABLE_UNICODE_GROUPS | RE2JS2.LONGEST_MATCH | RE2JS2.LOOKBEHINDS)) !== 0) throw new RE2JSFlagsException("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");
    let re2Flags = RE2Flags.PERL;
    if ((flags & RE2JS2.DISABLE_UNICODE_GROUPS) !== 0) re2Flags &= ~RE2Flags.UNICODE_GROUPS;
    if ((flags & RE2JS2.LOOKBEHINDS) !== 0) re2Flags |= RE2Flags.LOOKBEHIND;
    const p = new RE2JS2(regex2, flags);
    p.re2Input = RE2.compileImpl(fregex, re2Flags, (flags & RE2JS2.LONGEST_MATCH) !== 0);
    return p;
  }
  /**
  * Matches a string against a regular expression.
  *
  * @param {string} regex the regular expression
  * @param {string|number[]|Uint8Array} input the input
  * @returns {boolean} true if the regular expression matches the entire input
  * @throws RE2JSSyntaxException if the regular expression is malformed
  */
  static matches(regex2, input) {
    return RE2JS2.compile(regex2).testExact(input);
  }
  /**
  * This is visible for testing.
  * @private
  */
  static initTest(pattern, flags, re2) {
    if (pattern == null) throw new Error("pattern is null");
    if (re2 == null) throw new Error("re2 is null");
    const p = new RE2JS2(pattern, flags);
    p.re2Input = re2;
    return p;
  }
  /**
  *
  * @param {string} pattern
  * @param {number} flags
  */
  constructor(pattern, flags) {
    this.patternInput = pattern;
    this.flagsInput = flags;
    this.re2Input = null;
  }
  /**
  * Releases memory used by internal caches associated with this pattern. Does not change the
  * observable behaviour. Useful for tests that detect memory leaks via allocation tracking.
  */
  reset() {
    this.re2Input.reset();
  }
  /**
  * Returns the flags used in the constructor.
  * @returns {number}
  */
  flags() {
    return this.flagsInput;
  }
  /**
  * Returns the pattern used in the constructor.
  * @returns {string}
  */
  pattern() {
    return this.patternInput;
  }
  re2() {
    return this.re2Input;
  }
  /**
  * Matches a string against a regular expression.
  *
  * @param {string|number[]|Uint8Array} input the input
  * @returns {boolean} true if the regular expression matches the entire input
  */
  matches(input) {
    return this.testExact(input);
  }
  /**
  * Creates a new {@code Matcher} matching the pattern against the input.
  *
  * @param {string|number[]|Uint8Array|MatcherInputBase} input the input string
  * @returns {Matcher}
  */
  matcher(input) {
    if (Utils.isByteArray(input)) input = MatcherInput.utf8(input);
    return new Matcher(this, input);
  }
  /**
  * Tests whether the regular expression matches any part of the input string.
  * Performance Note: This method is highly optimized. Because it only returns
  * a boolean and does not extract capture groups, it bypasses the `Matcher` overhead
  * and guarantees execution on the high-speed DFA engine whenever possible.
  *
  * @param {string|number[]|Uint8Array} input - The input string or UTF-8 byte array to test against.
  * @returns {boolean} `true` if the pattern is found anywhere in the input, `false` otherwise.
  */
  test(input) {
    if (Utils.isByteArray(input)) return this.re2Input.matchUTF8(input);
    return this.re2Input.match(input);
  }
  /**
  * Tests whether the regular expression matches the ENTIRE input string.
  * * **Performance Note:** This operates identically to `.matches()`, but is significantly
  * faster because it does not request capture group data. By requesting 0 capture groups,
  * it securely routes execution through the DFA fast-path.
  *
  * @param {string|number[]|Uint8Array} input - The input string or UTF-8 byte array to test against.
  * @returns {boolean} `true` if the exact input string fully matches the pattern, `false` otherwise.
  */
  testExact(input) {
    const machineInput = Utils.isByteArray(input) ? MachineInput.fromUTF8(input) : MachineInput.fromUTF16(input);
    return this.re2Input.executeEngine(machineInput, 0, RE2Flags.ANCHOR_BOTH, 0) !== null;
  }
  /**
  * Executes a search for a match in a specified string.
  * Returns a result array, or null if no match is found.
  * The returned array perfectly mirrors standard JavaScript `RegExpExecArray`,
  * including `.index`, `.input`, and `.groups` properties.
  *
  * @param {string|number[]|Uint8Array} input the input string or byte array
  * @returns {Array|null} the match array with index, input, and groups properties, or null
  */
  exec(input) {
    const m = this.matcher(input);
    if (!m.find()) return null;
    const result = [m.group(0)];
    for (let i = 1; i <= m.groupCount(); i++) {
      const val = m.group(i);
      result.push(val === null ? void 0 : val);
    }
    result.index = m.start(0);
    result.input = input;
    const namedGroups = this.namedGroups();
    if (Object.keys(namedGroups).length > 0) {
      const parsedGroups = m.getNamedGroups();
      for (const key in parsedGroups) if (parsedGroups[key] === null) parsedGroups[key] = void 0;
      result.groups = parsedGroups;
    } else result.groups = void 0;
    return result;
  }
  /**
  * Splits input around instances of the regular expression. It returns an array giving the strings
  * that occur before, between, and after instances of the regular expression.
  *
  * If {@code limit <= 0}, there is no limit on the size of the returned array. If
  * {@code limit == 0}, empty strings that would occur at the end of the array are omitted. If
  * {@code limit > 0}, at most limit strings are returned. The final string contains the remainder
  * of the input, possibly including additional matches of the pattern.
  *
  * @param {string} input the input string to be split
  * @param {number} [limit=0] the limit
  * @returns {string[]} the split strings
  */
  split(input, limit = 0) {
    const m = this.matcher(input);
    const result = [];
    let emptiesSkipped = 0;
    let last = 0;
    while (m.find()) {
      if (last === 0 && m.end() === 0) {
        last = m.end();
        continue;
      }
      if (limit > 0 && result.length === limit - 1) break;
      if (last === m.start()) {
        if (limit === 0) {
          emptiesSkipped += 1;
          last = m.end();
          continue;
        }
      } else while (emptiesSkipped > 0) {
        result.push("");
        emptiesSkipped -= 1;
      }
      result.push(m.substring(last, m.start()));
      last = m.end();
    }
    if (limit === 0 && last !== m.inputLength()) {
      while (emptiesSkipped > 0) {
        result.push("");
        emptiesSkipped -= 1;
      }
      result.push(m.substring(last, m.inputLength()));
    }
    if (limit !== 0 || result.length === 0 && !(last === m.inputLength() && last > 0)) result.push(m.substring(last, m.inputLength()));
    return result;
  }
  /**
  * Returns an iterator of all results matching a string against the regular expression,
  * including capturing groups.
  *
  * @param {string|number[]|Uint8Array} input the input string or byte array
  * @returns {IterableIterator<RegExpMatchArray>}
  */
  *matchAll(input) {
    const m = this.matcher(input);
    while (m.find()) {
      const result = [m.group(0)];
      for (let i = 1; i <= m.groupCount(); i++) {
        const groupVal = m.group(i);
        result.push(groupVal === null ? void 0 : groupVal);
      }
      result.index = m.start(0);
      result.input = input;
      const namedGroups = this.namedGroups();
      if (Object.keys(namedGroups).length > 0) {
        const parsedGroups = m.getNamedGroups();
        for (const key in parsedGroups) if (parsedGroups[key] === null) parsedGroups[key] = void 0;
        result.groups = parsedGroups;
      } else result.groups = void 0;
      yield result;
    }
  }
  /**
  *
  * @returns {string}
  */
  toString() {
    return this.patternInput;
  }
  /**
  * Returns the program size of this pattern.
  *
  * <p>
  * Similar to the C++ implementation, the program size is a very approximate measure of a regexp's
  * "cost". Larger numbers are more expensive than smaller numbers.
  * </p>
  *
  * @returns {number} the program size of this pattern
  */
  programSize() {
    return this.re2Input.numberOfInstructions();
  }
  /**
  * Returns the number of capturing groups in this matcher's pattern. Group zero denotes the entire
  * pattern and is excluded from this count.
  *
  * @returns {number} the number of capturing groups in this pattern
  */
  groupCount() {
    return this.re2Input.numberOfCapturingGroups();
  }
  /**
  * Return a map of the capturing groups in this matcher's pattern, where key is the name and value
  * is the index of the group in the pattern.
  * @returns {Record<string, number>}
  */
  namedGroups() {
    return this.re2Input.namedGroups;
  }
  /**
  *
  * @param {*} other
  * @returns {boolean}
  */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.flagsInput === other.flagsInput && this.patternInput === other.patternInput;
  }
};
var re = (stringsOrFlags, ...values) => {
  if (Array.isArray(stringsOrFlags) && "raw" in stringsOrFlags) {
    const pattern = String.raw(stringsOrFlags, ...values);
    return RE2JS.compile(pattern);
  }
  const flags = typeof stringsOrFlags === "number" ? stringsOrFlags : 0;
  return (strings, ...tagValues) => {
    const pattern = String.raw(strings, ...tagValues);
    return RE2JS.compile(pattern, flags);
  };
};

// ../../node_modules/markdownlint/lib/cache.mjs
var import_helpers = __toESM(require_helpers(), 1);
var import_micromark_helpers = __toESM(require_micromark_helpers(), 1);
var map = /* @__PURE__ */ new Map();
var params = void 0;
function initialize(p) {
  map.clear();
  params = p;
}
function micromarkTokens() {
  return params?.parsers.micromark.tokens || [];
}
function getCached(name, getValue) {
  if (map.has(name)) {
    return map.get(name);
  }
  const value = getValue();
  map.set(name, value);
  return value;
}
function filterByTypesCached(types, htmlFlow2) {
  return getCached(
    // eslint-disable-next-line prefer-rest-params
    JSON.stringify(arguments),
    () => (0, import_micromark_helpers.filterByTypes)(micromarkTokens(), types, htmlFlow2)
  );
}
function getReferenceLinkImageData() {
  return getCached(
    getReferenceLinkImageData.name,
    () => (0, import_helpers.getReferenceLinkImageData)(micromarkTokens())
  );
}

// ../../node_modules/markdownlint/lib/constants.mjs
var homepage = "https://github.com/DavidAnson/markdownlint";
var version = "0.42.0";

// ../../node_modules/markdownlint/lib/markdownlint.mjs
var import_defer_require = __toESM(require_defer_require(), 1);
var import_resolve_module = __toESM(require_resolve_module(), 1);

// ../../node_modules/markdownlint/lib/md001.mjs
var import_helpers2 = __toESM(require_helpers(), 1);
var import_micromark_helpers2 = __toESM(require_micromark_helpers(), 1);
var md001_default = {
  "names": ["MD001", "heading-increment"],
  "description": "Heading levels should only increment by one level at a time",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD001(params2, onError) {
    const hasTitle = (0, import_helpers2.frontMatterHasTitle)(
      params2.frontMatterLines,
      params2.config.front_matter_title
    );
    let prevLevel = hasTitle ? 1 : Number.MAX_SAFE_INTEGER;
    for (const heading of filterByTypesCached(["atxHeading", "setextHeading"])) {
      const level = (0, import_micromark_helpers2.getHeadingLevel)(heading);
      if (level > prevLevel) {
        (0, import_helpers2.addErrorDetailIf)(
          onError,
          heading.startLine,
          `h${prevLevel + 1}`,
          `h${level}`
        );
      }
      prevLevel = level;
    }
  }
};

// ../../node_modules/markdownlint/lib/md003.mjs
var import_helpers3 = __toESM(require_helpers(), 1);
var import_micromark_helpers3 = __toESM(require_micromark_helpers(), 1);
var md003_default = {
  "names": ["MD003", "heading-style"],
  "description": "Heading style",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD003(params2, onError) {
    let style = String(params2.config.style || "consistent");
    for (const heading of filterByTypesCached(["atxHeading", "setextHeading"])) {
      const styleForToken = (0, import_micromark_helpers3.getHeadingStyle)(heading);
      if (style === "consistent") {
        style = styleForToken;
      }
      if (styleForToken !== style) {
        const h12 = (0, import_micromark_helpers3.getHeadingLevel)(heading) <= 2;
        const setextWithAtx = style === "setext_with_atx" && (h12 && styleForToken === "setext" || !h12 && styleForToken === "atx");
        const setextWithAtxClosed = style === "setext_with_atx_closed" && (h12 && styleForToken === "setext" || !h12 && styleForToken === "atx_closed");
        if (!setextWithAtx && !setextWithAtxClosed) {
          let expected = style;
          if (style === "setext_with_atx") {
            expected = h12 ? "setext" : "atx";
          } else if (style === "setext_with_atx_closed") {
            expected = h12 ? "setext" : "atx_closed";
          }
          (0, import_helpers3.addErrorDetailIf)(
            onError,
            heading.startLine,
            expected,
            styleForToken
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md004.mjs
var import_helpers4 = __toESM(require_helpers(), 1);
var import_micromark_helpers4 = __toESM(require_micromark_helpers(), 1);
var markerToStyle = (marker) => marker === "-" ? "dash" : marker === "+" ? "plus" : "asterisk";
var styleToMarker = (style) => style === "dash" ? "-" : style === "plus" ? "+" : "*";
var differentItemStyle = (style) => style === "dash" ? "plus" : style === "plus" ? "asterisk" : "dash";
var validStyles = /* @__PURE__ */ new Set([
  "asterisk",
  "consistent",
  "dash",
  "plus",
  "sublist"
]);
var md004_default = {
  "names": ["MD004", "ul-style"],
  "description": "Unordered list style",
  "tags": ["bullet", "ul"],
  "parser": "micromark",
  "function": function MD004(params2, onError) {
    const style = String(params2.config.style || "consistent");
    let expectedStyle = validStyles.has(style) ? style : "dash";
    const nestingStyles = [];
    for (const listUnordered of filterByTypesCached(["listUnordered"])) {
      let nesting = 0;
      if (style === "sublist") {
        let parent = listUnordered;
        while (parent = (0, import_micromark_helpers4.getParentOfType)(parent, ["listOrdered", "listUnordered"])) {
          nesting++;
        }
      }
      const listItemMarkers = (0, import_micromark_helpers4.getDescendantsByType)(listUnordered, ["listItemPrefix", "listItemMarker"]);
      for (const listItemMarker of listItemMarkers) {
        const itemStyle = markerToStyle(listItemMarker.text);
        if (style === "sublist") {
          if (!nestingStyles[nesting]) {
            nestingStyles[nesting] = itemStyle === nestingStyles[nesting - 1] ? differentItemStyle(itemStyle) : itemStyle;
          }
          expectedStyle = nestingStyles[nesting];
        } else if (expectedStyle === "consistent") {
          expectedStyle = itemStyle;
        }
        const column = listItemMarker.startColumn;
        const length = listItemMarker.endColumn - listItemMarker.startColumn;
        (0, import_helpers4.addErrorDetailIf)(
          onError,
          listItemMarker.startLine,
          expectedStyle,
          itemStyle,
          void 0,
          void 0,
          [column, length],
          {
            "editColumn": column,
            "deleteCount": length,
            "insertText": styleToMarker(expectedStyle)
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md005.mjs
var import_helpers5 = __toESM(require_helpers(), 1);
var md005_default = {
  "names": ["MD005", "list-indent"],
  "description": "Inconsistent indentation for list items at the same level",
  "tags": ["bullet", "ul", "indentation"],
  "parser": "micromark",
  "function": function MD005(params2, onError) {
    for (const list2 of filterByTypesCached(["listOrdered", "listUnordered"])) {
      const expectedIndent = list2.startColumn - 1;
      let expectedEnd = 0;
      let endMatching = false;
      const listItemPrefixes = list2.children.filter((token) => token.type === "listItemPrefix");
      for (const listItemPrefix of listItemPrefixes) {
        const lineNumber = listItemPrefix.startLine;
        const actualIndent = listItemPrefix.startColumn - 1;
        const range = [1, listItemPrefix.endColumn - 1];
        if (list2.type === "listUnordered") {
          (0, import_helpers5.addErrorDetailIf)(
            onError,
            lineNumber,
            expectedIndent,
            actualIndent,
            void 0,
            void 0,
            range
            // No fixInfo; MD007 handles this scenario better
          );
        } else {
          const markerLength = listItemPrefix.text.trim().length;
          const actualEnd = listItemPrefix.startColumn + markerLength - 1;
          expectedEnd ||= actualEnd;
          if (expectedIndent !== actualIndent || endMatching) {
            if (expectedEnd === actualEnd) {
              endMatching = true;
            } else {
              const detail = endMatching ? `Expected: (${expectedEnd}); Actual: (${actualEnd})` : `Expected: ${expectedIndent}; Actual: ${actualIndent}`;
              const expected = endMatching ? expectedEnd - markerLength : expectedIndent;
              const actual = endMatching ? actualEnd - markerLength : actualIndent;
              (0, import_helpers5.addError)(
                onError,
                lineNumber,
                detail,
                void 0,
                range,
                {
                  "editColumn": Math.min(actual, expected) + 1,
                  "deleteCount": Math.max(actual - expected, 0),
                  "insertText": "".padEnd(Math.max(expected - actual, 0))
                }
              );
            }
          }
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md007.mjs
var import_helpers6 = __toESM(require_helpers(), 1);
var import_micromark_helpers5 = __toESM(require_micromark_helpers(), 1);
var unorderedListTypes = ["blockQuotePrefix", "listItemPrefix", "listUnordered"];
var unorderedParentTypes = ["blockQuote", "listOrdered", "listUnordered"];
var md007_default = {
  "names": ["MD007", "ul-indent"],
  "description": "Unordered list indentation",
  "tags": ["bullet", "ul", "indentation"],
  "parser": "micromark",
  "function": function MD007(params2, onError) {
    const indent2 = Number(params2.config.indent ?? 2);
    const startIndented = !!params2.config.start_indented;
    const startIndent = Number(params2.config.start_indent ?? indent2);
    const unorderedListNesting = /* @__PURE__ */ new Map();
    let lastBlockQuotePrefix = null;
    const tokens = filterByTypesCached(unorderedListTypes);
    for (const token of tokens) {
      const { endColumn, parent, startColumn, startLine, type } = token;
      if (type === "blockQuotePrefix") {
        lastBlockQuotePrefix = token;
      } else if (type === "listUnordered") {
        let nesting = 0;
        let current = token;
        while (
          // @ts-ignore
          current = (0, import_micromark_helpers5.getParentOfType)(current, unorderedParentTypes)
        ) {
          if (current.type === "listUnordered") {
            nesting++;
            continue;
          } else if (current.type === "listOrdered") {
            nesting = -1;
          }
          break;
        }
        if (nesting >= 0) {
          unorderedListNesting.set(token, nesting);
        }
      } else {
        const nesting = unorderedListNesting.get(parent);
        if (nesting !== void 0) {
          const baseIndent = (0, import_micromark_helpers5.getParentOfType)(token, ["gfmFootnoteDefinition"]) ? 4 : 0;
          const expectedIndent = baseIndent + (startIndented ? startIndent : 0) + nesting * indent2;
          const blockQuoteAdjustment = lastBlockQuotePrefix?.endLine === startLine ? lastBlockQuotePrefix.endColumn - 1 : 0;
          const actualIndent = startColumn - 1 - blockQuoteAdjustment;
          const range = [1, endColumn - 1];
          const fixInfo = {
            "editColumn": startColumn - actualIndent,
            "deleteCount": Math.max(actualIndent - expectedIndent, 0),
            "insertText": "".padEnd(Math.max(expectedIndent - actualIndent, 0))
          };
          (0, import_helpers6.addErrorDetailIf)(
            onError,
            startLine,
            expectedIndent,
            actualIndent,
            void 0,
            void 0,
            range,
            fixInfo
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md009.mjs
var import_helpers7 = __toESM(require_helpers(), 1);
var import_micromark_helpers6 = __toESM(require_micromark_helpers(), 1);
var md009_default = {
  "names": ["MD009", "no-trailing-spaces"],
  "description": "Trailing spaces",
  "tags": ["whitespace"],
  "parser": "micromark",
  "function": function MD009(params2, onError) {
    const brSpaces = Number(params2.config.br_spaces ?? 2);
    const codeBlocks = params2.config.code_blocks;
    const includeCode = codeBlocks !== void 0 && !!codeBlocks;
    const listItemEmptyLines = !!params2.config.list_item_empty_lines;
    const strict = !!params2.config.strict;
    const codeBlockLineNumbers = /* @__PURE__ */ new Set();
    if (!includeCode) {
      for (const codeBlock of filterByTypesCached(["codeFenced"])) {
        (0, import_micromark_helpers6.addRangeToSet)(codeBlockLineNumbers, codeBlock.startLine + 1, codeBlock.endLine - 1);
      }
      for (const codeBlock of filterByTypesCached(["codeIndented"])) {
        (0, import_micromark_helpers6.addRangeToSet)(codeBlockLineNumbers, codeBlock.startLine, codeBlock.endLine);
      }
    }
    const listItemLineNumbers = /* @__PURE__ */ new Set();
    if (listItemEmptyLines) {
      for (const listBlock of filterByTypesCached(["listOrdered", "listUnordered"])) {
        (0, import_micromark_helpers6.addRangeToSet)(listItemLineNumbers, listBlock.startLine, listBlock.endLine);
        let trailingIndent = true;
        for (let i = listBlock.children.length - 1; i >= 0; i--) {
          const child = listBlock.children[i];
          switch (child.type) {
            case "content":
              trailingIndent = false;
              break;
            case "listItemIndent":
              if (trailingIndent) {
                listItemLineNumbers.delete(child.startLine);
              }
              break;
            case "listItemPrefix":
              trailingIndent = true;
              break;
            default:
              break;
          }
        }
      }
    }
    const paragraphLineNumbers = /* @__PURE__ */ new Set();
    const codeInlineLineNumbers = /* @__PURE__ */ new Set();
    if (strict) {
      for (const paragraph of filterByTypesCached(["paragraph"])) {
        (0, import_micromark_helpers6.addRangeToSet)(paragraphLineNumbers, paragraph.startLine, paragraph.endLine - 1);
      }
      for (const codeText2 of filterByTypesCached(["codeText"])) {
        (0, import_micromark_helpers6.addRangeToSet)(codeInlineLineNumbers, codeText2.startLine, codeText2.endLine - 1);
      }
    }
    const expected = brSpaces < 2 ? 0 : brSpaces;
    for (let lineIndex = 0; lineIndex < params2.lines.length; lineIndex++) {
      const line = params2.lines[lineIndex];
      const lineNumber = lineIndex + 1;
      const trailingSpaces = line.length - line.trimEnd().length;
      if (trailingSpaces && !codeBlockLineNumbers.has(lineNumber) && !listItemLineNumbers.has(lineNumber) && (expected !== trailingSpaces || strict && (!paragraphLineNumbers.has(lineNumber) || codeInlineLineNumbers.has(lineNumber)))) {
        const column = line.length - trailingSpaces + 1;
        (0, import_helpers7.addError)(
          onError,
          lineNumber,
          "Expected: " + (expected === 0 ? "" : "0 or ") + expected + "; Actual: " + trailingSpaces,
          void 0,
          [column, trailingSpaces],
          {
            "editColumn": column,
            "deleteCount": trailingSpaces
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md010.mjs
var import_helpers8 = __toESM(require_helpers(), 1);
var import_micromark_helpers7 = __toESM(require_micromark_helpers(), 1);
var tabRe = /\t+/g;
var md010_default = {
  "names": ["MD010", "no-hard-tabs"],
  "description": "Hard tabs",
  "tags": ["whitespace", "hard_tab"],
  "parser": "micromark",
  "function": function MD010(params2, onError) {
    const codeBlocks = params2.config.code_blocks;
    const includeCode = codeBlocks === void 0 || !!codeBlocks;
    const ignoreCodeLanguages = new Set(
      (params2.config.ignore_code_languages || []).map((language) => String(language).toLowerCase())
    );
    const spacesPerTab = params2.config.spaces_per_tab;
    const spaceMultiplier = spacesPerTab === void 0 ? 1 : Math.max(0, Number(spacesPerTab));
    const exclusionTypes = [];
    if (includeCode) {
      if (ignoreCodeLanguages.size > 0) {
        exclusionTypes.push("codeFenced");
      }
    } else {
      exclusionTypes.push("codeFenced", "codeIndented", "codeText");
    }
    const codeTokens = filterByTypesCached(exclusionTypes).filter((token) => {
      if (token.type === "codeFenced" && ignoreCodeLanguages.size > 0) {
        const fenceInfos = (0, import_micromark_helpers7.getDescendantsByType)(token, ["codeFencedFence", "codeFencedFenceInfo"]);
        return fenceInfos.every((fenceInfo) => ignoreCodeLanguages.has(fenceInfo.text.toLowerCase()));
      }
      return true;
    });
    const codeRanges = codeTokens.map((token) => {
      const { type, startLine, startColumn, endLine, endColumn } = token;
      const codeFenced2 = type === "codeFenced";
      return {
        "startLine": startLine + (codeFenced2 ? 1 : 0),
        "startColumn": codeFenced2 ? 0 : startColumn,
        "endLine": endLine - (codeFenced2 ? 1 : 0),
        "endColumn": codeFenced2 ? Number.MAX_SAFE_INTEGER : endColumn
      };
    });
    for (let lineIndex = 0; lineIndex < params2.lines.length; lineIndex++) {
      const line = params2.lines[lineIndex];
      let match = null;
      while ((match = tabRe.exec(line)) !== null) {
        const lineNumber = lineIndex + 1;
        const column = match.index + 1;
        const length = match[0].length;
        const range = { "startLine": lineNumber, "startColumn": column, "endLine": lineNumber, "endColumn": column + length - 1 };
        if (!codeRanges.some((codeRange) => (0, import_helpers8.hasOverlap)(codeRange, range))) {
          (0, import_helpers8.addError)(
            onError,
            lineNumber,
            "Column: " + column,
            void 0,
            [column, length],
            {
              "editColumn": column,
              "deleteCount": length,
              "insertText": "".padEnd(length * spaceMultiplier)
            }
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md011.mjs
var import_helpers9 = __toESM(require_helpers(), 1);
var import_micromark_helpers8 = __toESM(require_micromark_helpers(), 1);
var reversedLinkRe = re`(^|[^\\])\(([^()]+)\)\[([^\]^][^\]]*)\]`;
var md011_default = {
  "names": ["MD011", "no-reversed-links"],
  "description": "Reversed link syntax",
  "tags": ["links"],
  "parser": "micromark",
  "function": function MD011(params2, onError) {
    const ignoreBlockLineNumbers = /* @__PURE__ */ new Set();
    for (const ignoreBlock of filterByTypesCached(["codeFenced", "codeIndented", "htmlFlow", "mathFlow"])) {
      (0, import_micromark_helpers8.addRangeToSet)(ignoreBlockLineNumbers, ignoreBlock.startLine, ignoreBlock.endLine);
    }
    const ignoreTexts = filterByTypesCached(["codeText", "mathText"]);
    for (const [lineIndex, line] of params2.lines.entries()) {
      const lineNumber = lineIndex + 1;
      if (!ignoreBlockLineNumbers.has(lineNumber)) {
        for (const match of reversedLinkRe.matchAll(line)) {
          const [reversedLink, preChar, linkText, linkDestination] = match;
          const matchIndex = match.index ?? 0;
          const matchLength = match[0].length;
          if (line[matchIndex + matchLength] !== "(" && !linkText.endsWith("\\") && !linkDestination.endsWith("\\")) {
            const column = matchIndex + preChar.length + 1;
            const length = matchLength - preChar.length;
            const range = { "startLine": lineNumber, "startColumn": column, "endLine": lineNumber, "endColumn": column + length - 1 };
            if (!ignoreTexts.some((ignoreText) => (0, import_helpers9.hasOverlap)(ignoreText, range))) {
              (0, import_helpers9.addError)(
                onError,
                lineNumber,
                reversedLink.slice(preChar.length),
                void 0,
                [column, length],
                {
                  "editColumn": column,
                  "deleteCount": length,
                  "insertText": `[${linkText}](${linkDestination})`
                }
              );
            }
          }
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md012.mjs
var import_helpers10 = __toESM(require_helpers(), 1);
var import_micromark_helpers9 = __toESM(require_micromark_helpers(), 1);
var md012_default = {
  "names": ["MD012", "no-multiple-blanks"],
  "description": "Multiple consecutive blank lines",
  "tags": ["whitespace", "blank_lines"],
  "parser": "micromark",
  "function": function MD012(params2, onError) {
    const maximum = Number(params2.config.maximum ?? 1);
    const { lines } = params2;
    const codeBlockLineNumbers = /* @__PURE__ */ new Set();
    for (const codeBlock of filterByTypesCached(["codeFenced", "codeIndented"])) {
      (0, import_micromark_helpers9.addRangeToSet)(codeBlockLineNumbers, codeBlock.startLine, codeBlock.endLine);
    }
    let count = 0;
    for (const [lineIndex, line] of lines.entries()) {
      const inCode = codeBlockLineNumbers.has(lineIndex + 1);
      count = inCode || line.trim().length > 0 ? 0 : count + 1;
      if (maximum < count) {
        (0, import_helpers10.addErrorDetailIf)(
          onError,
          lineIndex + 1,
          maximum,
          count,
          void 0,
          void 0,
          void 0,
          {
            "deleteCount": -1
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md013.mjs
var import_helpers11 = __toESM(require_helpers(), 1);
var import_micromark_helpers10 = __toESM(require_micromark_helpers(), 1);
var notWrappableRe = /^(?:[#>\s]*\s)?\S*$/;
var lastRunRe = re`\S*$`;
var md013_default = {
  "names": ["MD013", "line-length"],
  "description": "Line length",
  "tags": ["line_length"],
  "parser": "micromark",
  "function": function MD013(params2, onError) {
    const lineLength = Number(params2.config.line_length ?? 80);
    const headingLineLength = Number(params2.config.heading_line_length ?? lineLength);
    const codeLineLength = Number(params2.config.code_block_line_length ?? lineLength);
    const strict = !!params2.config.strict;
    const stern = !!params2.config.stern;
    const codeBlocks = params2.config.code_blocks;
    const includeCodeBlocks = codeBlocks === void 0 || !!codeBlocks;
    const tables = params2.config.tables;
    const includeTables = tables === void 0 || !!tables;
    const headings = params2.config.headings;
    const includeHeadings = headings === void 0 || !!headings;
    const headingLineNumbers = /* @__PURE__ */ new Set();
    for (const heading of filterByTypesCached(["atxHeading", "setextHeading"])) {
      (0, import_micromark_helpers10.addRangeToSet)(headingLineNumbers, heading.startLine, heading.endLine);
    }
    const codeBlockLineNumbers = /* @__PURE__ */ new Set();
    for (const codeBlock of filterByTypesCached(["codeFenced", "codeIndented"])) {
      (0, import_micromark_helpers10.addRangeToSet)(codeBlockLineNumbers, codeBlock.startLine, codeBlock.endLine);
    }
    const tableLineNumbers = /* @__PURE__ */ new Set();
    for (const table of filterByTypesCached(["table"])) {
      (0, import_micromark_helpers10.addRangeToSet)(tableLineNumbers, table.startLine, table.endLine);
    }
    const linkLineNumbers = /* @__PURE__ */ new Set();
    for (const link of filterByTypesCached(["autolink", "image", "link", "literalAutolink"])) {
      (0, import_micromark_helpers10.addRangeToSet)(linkLineNumbers, link.startLine, link.endLine);
    }
    const paragraphDataLineNumbers = /* @__PURE__ */ new Set();
    for (const paragraph of filterByTypesCached(["paragraph"])) {
      for (const data of (0, import_micromark_helpers10.getDescendantsByType)(paragraph, ["data"])) {
        (0, import_micromark_helpers10.addRangeToSet)(paragraphDataLineNumbers, data.startLine, data.endLine);
      }
    }
    const linkOnlyLineNumbers = /* @__PURE__ */ new Set();
    for (const lineNumber of linkLineNumbers) {
      if (!paragraphDataLineNumbers.has(lineNumber)) {
        linkOnlyLineNumbers.add(lineNumber);
      }
    }
    const definitionLineIndices = new Set(getReferenceLinkImageData().definitionLineIndices);
    for (let lineIndex = 0; lineIndex < params2.lines.length; lineIndex++) {
      const line = params2.lines[lineIndex];
      const lineNumber = lineIndex + 1;
      const isHeading = headingLineNumbers.has(lineNumber);
      const inCode = codeBlockLineNumbers.has(lineNumber);
      const inTable = tableLineNumbers.has(lineNumber);
      const maxLength = inCode ? codeLineLength : isHeading ? headingLineLength : lineLength;
      const text4 = strict || stern ? line : lastRunRe.matcher(line).replaceFirst("#");
      if (maxLength > 0 && (includeCodeBlocks || !inCode) && (includeTables || !inTable) && (includeHeadings || !isHeading) && !definitionLineIndices.has(lineIndex) && (strict || !(stern && notWrappableRe.test(line)) && !linkOnlyLineNumbers.has(lineNumber)) && text4.length > maxLength) {
        (0, import_helpers11.addErrorDetailIf)(
          onError,
          lineNumber,
          maxLength,
          line.length,
          void 0,
          void 0,
          [maxLength + 1, line.length - maxLength]
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md014.mjs
var import_helpers12 = __toESM(require_helpers(), 1);
var dollarCommandRe = /^(\s*)(\$\s+)/;
var md014_default = {
  "names": ["MD014", "commands-show-output"],
  "description": "Dollar signs used before commands without showing output",
  "tags": ["code"],
  "parser": "micromark",
  "function": function MD014(params2, onError) {
    for (const codeBlock of filterByTypesCached(["codeFenced", "codeIndented"])) {
      const codeFlowValues = codeBlock.children.filter((child) => child.type === "codeFlowValue");
      const dollarMatches = codeFlowValues.map((codeFlowValue) => ({
        "result": codeFlowValue.text.match(dollarCommandRe),
        "startColumn": codeFlowValue.startColumn,
        "startLine": codeFlowValue.startLine,
        "text": codeFlowValue.text
      })).filter((dollarMatch) => dollarMatch.result);
      if (dollarMatches.length === codeFlowValues.length) {
        for (const dollarMatch of dollarMatches) {
          const column = dollarMatch.startColumn + dollarMatch.result[1].length;
          const length = dollarMatch.result[2].length;
          (0, import_helpers12.addErrorContext)(
            onError,
            dollarMatch.startLine,
            dollarMatch.text,
            void 0,
            void 0,
            [column, length],
            {
              "editColumn": column,
              "deleteCount": length
            }
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md018.mjs
var import_helpers13 = __toESM(require_helpers(), 1);
var import_micromark_helpers11 = __toESM(require_micromark_helpers(), 1);
var md018_default = {
  "names": ["MD018", "no-missing-space-atx"],
  "description": "No space after hash on atx style heading",
  "tags": ["headings", "atx", "spaces"],
  "parser": "micromark",
  "function": function MD018(params2, onError) {
    const { lines } = params2;
    const ignoreBlockLineNumbers = /* @__PURE__ */ new Set();
    for (const ignoreBlock of filterByTypesCached(["codeFenced", "codeIndented", "htmlFlow", "mathFlow"])) {
      (0, import_micromark_helpers11.addRangeToSet)(ignoreBlockLineNumbers, ignoreBlock.startLine, ignoreBlock.endLine);
    }
    for (const [lineIndex, line] of lines.entries()) {
      if (!ignoreBlockLineNumbers.has(lineIndex + 1) && /^#+[^# \t]/.test(line) && !/#\s*$/.test(line) && !line.startsWith("#\uFE0F\u20E3")) {
        const hashCount = /^#+/.exec(line)[0].length;
        (0, import_helpers13.addErrorContext)(
          onError,
          lineIndex + 1,
          line.trim(),
          void 0,
          void 0,
          [1, hashCount + 1],
          {
            "editColumn": hashCount + 1,
            "insertText": " "
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md019-md021.mjs
var import_helpers14 = __toESM(require_helpers(), 1);
var import_micromark_helpers12 = __toESM(require_micromark_helpers(), 1);
function validateHeadingSpaces(onError, heading, delta) {
  const { children, startLine, text: text4 } = heading;
  let index = delta > 0 ? 0 : children.length - 1;
  while (
    // eslint-disable-next-line unicorn/no-computed-property-existence-check
    children[index] && children[index].type !== "atxHeadingSequence"
  ) {
    index += delta;
  }
  const headingSequence = children[index];
  const whitespace = children[index + delta];
  if (headingSequence?.type === "atxHeadingSequence" && whitespace?.type === "whitespace" && whitespace.text.length > 1) {
    const column = whitespace.startColumn + 1;
    const length = whitespace.endColumn - column;
    (0, import_helpers14.addErrorContext)(
      onError,
      startLine,
      text4.trim(),
      delta > 0,
      delta < 0,
      [column, length],
      {
        "editColumn": column,
        "deleteCount": length
      }
    );
  }
}
var md019_md021_default = [
  {
    "names": ["MD019", "no-multiple-space-atx"],
    "description": "Multiple spaces after hash on atx style heading",
    "tags": ["headings", "atx", "spaces"],
    "parser": "micromark",
    "function": function MD019(params2, onError) {
      const atxHeadings = filterByTypesCached(["atxHeading"]).filter((heading) => (0, import_micromark_helpers12.getHeadingStyle)(heading) === "atx");
      for (const atxHeading of atxHeadings) {
        validateHeadingSpaces(onError, atxHeading, 1);
      }
    }
  },
  {
    "names": ["MD021", "no-multiple-space-closed-atx"],
    "description": "Multiple spaces inside hashes on closed atx style heading",
    "tags": ["headings", "atx_closed", "spaces"],
    "parser": "micromark",
    "function": function MD021(params2, onError) {
      const atxClosedHeadings = filterByTypesCached(["atxHeading"]).filter((heading) => (0, import_micromark_helpers12.getHeadingStyle)(heading) === "atx_closed");
      for (const atxClosedHeading of atxClosedHeadings) {
        validateHeadingSpaces(onError, atxClosedHeading, 1);
        validateHeadingSpaces(onError, atxClosedHeading, -1);
      }
    }
  }
];

// ../../node_modules/markdownlint/lib/md020.mjs
var import_helpers15 = __toESM(require_helpers(), 1);
var import_micromark_helpers13 = __toESM(require_micromark_helpers(), 1);
var md020_default = {
  "names": ["MD020", "no-missing-space-closed-atx"],
  "description": "No space inside hashes on closed atx style heading",
  "tags": ["headings", "atx_closed", "spaces"],
  "parser": "micromark",
  "function": function MD020(params2, onError) {
    const { lines } = params2;
    const ignoreBlockLineNumbers = /* @__PURE__ */ new Set();
    for (const ignoreBlock of filterByTypesCached(["codeFenced", "codeIndented", "htmlFlow", "mathFlow"])) {
      (0, import_micromark_helpers13.addRangeToSet)(ignoreBlockLineNumbers, ignoreBlock.startLine, ignoreBlock.endLine);
    }
    for (const [lineIndex, line] of lines.entries()) {
      if (!ignoreBlockLineNumbers.has(lineIndex + 1)) {
        const match = /^(#+)([ \t]*)([^# \t\\]|[^# \t][^#]*?[^# \t\\])([ \t]*)((?:\\#)?)(#+)(\s*)$/.exec(line);
        if (match) {
          const [
            ,
            leftHash,
            { "length": leftSpaceLength },
            content3,
            { "length": rightSpaceLength },
            rightEscape,
            rightHash,
            { "length": trailSpaceLength }
          ] = match;
          const leftHashLength = leftHash.length;
          const rightHashLength = rightHash.length;
          const left = !leftSpaceLength;
          const right = !rightSpaceLength || !!rightEscape;
          const rightEscapeReplacement = rightEscape ? `${rightEscape} ` : "";
          if (left || right) {
            const range = left ? [
              1,
              leftHashLength + 1
            ] : [
              line.length - trailSpaceLength - rightHashLength,
              rightHashLength + 1
            ];
            (0, import_helpers15.addErrorContext)(
              onError,
              lineIndex + 1,
              line.trim(),
              left,
              right,
              range,
              {
                "editColumn": 1,
                "deleteCount": line.length,
                "insertText": `${leftHash} ${content3} ${rightEscapeReplacement}${rightHash}`
              }
            );
          }
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md022.mjs
var import_helpers16 = __toESM(require_helpers(), 1);
var import_micromark_helpers14 = __toESM(require_micromark_helpers(), 1);
var defaultLines = 1;
var getLinesFunction = (linesParam) => {
  if (Array.isArray(linesParam)) {
    const linesArray = new Array(6).fill(defaultLines);
    for (const [index, value] of linesParam.slice(0, 6).entries()) {
      linesArray[index] = value;
    }
    return (heading) => linesArray[(0, import_micromark_helpers14.getHeadingLevel)(heading) - 1];
  }
  const lines = Number(linesParam ?? defaultLines);
  return () => lines;
};
var getLine = (lines, index, frontMatterLines, includeFrontMatter) => {
  if (index >= 0 && index < lines.length) {
    return lines[index];
  }
  return includeFrontMatter && frontMatterLines.length > 0 && index < 0 && index >= -frontMatterLines.length ? frontMatterLines[frontMatterLines.length + index] : "";
};
var md022_default = {
  "names": ["MD022", "blanks-around-headings"],
  "description": "Headings should be surrounded by blank lines",
  "tags": ["headings", "blank_lines"],
  "parser": "micromark",
  "function": function MD022(params2, onError) {
    const getLinesAbove = getLinesFunction(params2.config.lines_above);
    const getLinesBelow = getLinesFunction(params2.config.lines_below);
    const includeFrontMatter = !!params2.config.include_front_matter;
    const { lines, frontMatterLines } = params2;
    const blockQuotePrefixes = filterByTypesCached(["blockQuotePrefix", "linePrefix"]);
    for (const heading of filterByTypesCached(["atxHeading", "setextHeading"])) {
      const { startLine, endLine } = heading;
      const line = lines[startLine - 1].trim();
      const linesAbove = getLinesAbove(heading);
      if (linesAbove >= 0) {
        let actualAbove = 0;
        for (let i = 0; i < linesAbove && (0, import_helpers16.isBlankLine)(getLine(lines, startLine - 2 - i, frontMatterLines, includeFrontMatter)); i++) {
          actualAbove++;
        }
        (0, import_helpers16.addErrorDetailIf)(
          onError,
          startLine,
          linesAbove,
          actualAbove,
          "Above",
          line,
          void 0,
          {
            "insertText": (0, import_micromark_helpers14.getBlockQuotePrefixText)(
              blockQuotePrefixes,
              startLine - 1,
              linesAbove - actualAbove
            )
          }
        );
      }
      const linesBelow = getLinesBelow(heading);
      if (linesBelow >= 0) {
        let actualBelow = 0;
        for (let i = 0; i < linesBelow && (0, import_helpers16.isBlankLine)(getLine(lines, endLine + i, frontMatterLines, false)); i++) {
          actualBelow++;
        }
        (0, import_helpers16.addErrorDetailIf)(
          onError,
          startLine,
          linesBelow,
          actualBelow,
          "Below",
          line,
          void 0,
          {
            "lineNumber": endLine + 1,
            "insertText": (0, import_micromark_helpers14.getBlockQuotePrefixText)(
              blockQuotePrefixes,
              endLine + 1,
              linesBelow - actualBelow
            )
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md023.mjs
var import_helpers17 = __toESM(require_helpers(), 1);
var md023_default = {
  "names": ["MD023", "heading-start-left"],
  "description": "Headings must start at the beginning of the line",
  "tags": ["headings", "spaces"],
  "parser": "micromark",
  "function": function MD023(params2, onError) {
    const headings = filterByTypesCached(["atxHeading", "linePrefix", "setextHeading"]);
    for (let i = 0; i < headings.length - 1; i++) {
      if (headings[i].type === "linePrefix" && headings[i + 1].type !== "linePrefix" && headings[i].startLine === headings[i + 1].startLine) {
        const { endColumn, startColumn, startLine } = headings[i];
        const length = endColumn - startColumn;
        (0, import_helpers17.addErrorContext)(
          onError,
          startLine,
          params2.lines[startLine - 1],
          true,
          false,
          [startColumn, length],
          {
            "editColumn": startColumn,
            "deleteCount": length
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md024.mjs
var import_helpers18 = __toESM(require_helpers(), 1);
var import_micromark_helpers15 = __toESM(require_micromark_helpers(), 1);
var md024_default = {
  "names": ["MD024", "no-duplicate-heading"],
  "description": "Multiple headings with the same content",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD024(params2, onError) {
    const siblingsOnly = !!params2.config.siblings_only;
    const knownContents = [null, []];
    let lastLevel = 1;
    let knownContent = knownContents[lastLevel];
    for (const heading of filterByTypesCached(["atxHeading", "setextHeading"])) {
      const headingText = (0, import_micromark_helpers15.getHeadingText)(heading);
      if (siblingsOnly) {
        const newLevel = (0, import_micromark_helpers15.getHeadingLevel)(heading);
        while (lastLevel < newLevel) {
          lastLevel++;
          knownContents[lastLevel] = [];
        }
        while (lastLevel > newLevel) {
          knownContents[lastLevel] = [];
          lastLevel--;
        }
        knownContent = knownContents[newLevel];
      }
      if (knownContent.includes(headingText)) {
        (0, import_helpers18.addErrorContext)(
          onError,
          heading.startLine,
          headingText.trim()
        );
      } else {
        knownContent.push(headingText);
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md025.mjs
var import_helpers19 = __toESM(require_helpers(), 1);
var import_micromark_helpers16 = __toESM(require_micromark_helpers(), 1);
var md025_default = {
  "names": ["MD025", "single-title", "single-h1"],
  "description": "Multiple top-level headings in the same document",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD025(params2, onError) {
    const level = Number(params2.config.level ?? 1);
    const { tokens } = params2.parsers.micromark;
    const matchingHeadings = filterByTypesCached(["atxHeading", "setextHeading"]).filter((heading) => level === (0, import_micromark_helpers16.getHeadingLevel)(heading) && !(0, import_micromark_helpers16.isDocfxTab)(heading));
    if (matchingHeadings.length > 0) {
      const foundFrontMatterTitle = (0, import_helpers19.frontMatterHasTitle)(
        params2.frontMatterLines,
        params2.config.front_matter_title
      );
      let hasTopLevelHeading = foundFrontMatterTitle;
      if (!hasTopLevelHeading) {
        const previousTokens = tokens.slice(0, tokens.indexOf(matchingHeadings[0]));
        hasTopLevelHeading = previousTokens.every(
          (token) => import_micromark_helpers16.nonContentTokens.has(token.type) || (0, import_micromark_helpers16.isHtmlFlowComment)(token)
        );
      }
      if (hasTopLevelHeading) {
        for (const heading of matchingHeadings.slice(foundFrontMatterTitle ? 0 : 1)) {
          (0, import_helpers19.addErrorContext)(
            onError,
            heading.startLine,
            (0, import_micromark_helpers16.getHeadingText)(heading)
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md026.mjs
var import_helpers20 = __toESM(require_helpers(), 1);
var md026_default = {
  "names": ["MD026", "no-trailing-punctuation"],
  "description": "Trailing punctuation in heading",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD026(params2, onError) {
    let punctuation = params2.config.punctuation;
    punctuation = String(
      punctuation === void 0 ? import_helpers20.allPunctuationNoQuestion : punctuation
    );
    const trailingPunctuationRe = new RegExp("\\s*[" + (0, import_helpers20.escapeForRegExp)(punctuation) + "]+$");
    const headings = filterByTypesCached(["atxHeadingText", "setextHeadingText"]);
    for (const heading of headings) {
      const { endColumn, endLine, text: text4 } = heading;
      const match = trailingPunctuationRe.exec(text4);
      if (match && !import_helpers20.endOfLineHtmlEntityRe.test(text4) && !import_helpers20.endOfLineGemojiCodeRe.test(text4)) {
        const fullMatch = match[0];
        const length = fullMatch.length;
        const column = endColumn - length;
        (0, import_helpers20.addError)(
          onError,
          endLine,
          `Punctuation: '${fullMatch}'`,
          void 0,
          [column, length],
          {
            "editColumn": column,
            "deleteCount": length
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md027.mjs
var import_helpers21 = __toESM(require_helpers(), 1);
var import_micromark_helpers17 = __toESM(require_micromark_helpers(), 1);
var listTypes = ["listOrdered", "listUnordered"];
var md027_default = {
  "names": ["MD027", "no-multiple-space-blockquote"],
  "description": "Multiple spaces after blockquote symbol",
  "tags": ["blockquote", "whitespace", "indentation"],
  "parser": "micromark",
  "function": function MD027(params2, onError) {
    const listItems = params2.config.list_items;
    const includeListItems = listItems === void 0 || !!listItems;
    const { tokens } = params2.parsers.micromark;
    for (const token of filterByTypesCached(["linePrefix"])) {
      const parent = token.parent;
      const codeIndented2 = parent?.type === "codeIndented";
      const siblings = parent?.children || tokens;
      if (!codeIndented2 && siblings[siblings.indexOf(token) - 1]?.type === "blockQuotePrefix" && (includeListItems || !listTypes.includes(siblings[siblings.indexOf(token) + 1]?.type) && !(0, import_micromark_helpers17.getParentOfType)(token, listTypes))) {
        const { startColumn, startLine, text: text4 } = token;
        const { length } = text4;
        const line = params2.lines[startLine - 1];
        (0, import_helpers21.addErrorContext)(
          onError,
          startLine,
          line,
          void 0,
          void 0,
          [startColumn, length],
          {
            "editColumn": startColumn,
            "deleteCount": length
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md028.mjs
var import_helpers22 = __toESM(require_helpers(), 1);
var ignoreTypes = /* @__PURE__ */ new Set(["lineEnding", "listItemIndent", "linePrefix"]);
var md028_default = {
  "names": ["MD028", "no-blanks-blockquote"],
  "description": "Blank line inside blockquote",
  "tags": ["blockquote", "whitespace"],
  "parser": "micromark",
  "function": function MD028(params2, onError) {
    for (const token of filterByTypesCached(["blockQuote"])) {
      const errorLineNumbers = [];
      const siblings = token.parent?.children || params2.parsers.micromark.tokens;
      for (let i = siblings.indexOf(token) + 1; i < siblings.length; i++) {
        const { startLine, type } = siblings[i];
        if (type === "lineEndingBlank") {
          errorLineNumbers.push(startLine);
        } else if (ignoreTypes.has(type)) {
        } else if (type === "blockQuote") {
          for (const lineNumber of errorLineNumbers) {
            (0, import_helpers22.addError)(onError, lineNumber);
          }
          break;
        } else {
          break;
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md029.mjs
var import_helpers23 = __toESM(require_helpers(), 1);
var import_micromark_helpers18 = __toESM(require_micromark_helpers(), 1);
var listStyleExamples = {
  "one": "1/1/1",
  "ordered": "1/2/3",
  "zero": "0/0/0"
};
var listStyles = Object.keys(listStyleExamples);
function getOrderedListItemValue(listItemPrefix) {
  const { startColumn, endColumn, text: text4 } = (0, import_micromark_helpers18.getDescendantsByType)(listItemPrefix, ["listItemValue"])[0];
  return {
    startColumn,
    endColumn,
    text: text4,
    "number": Number(text4)
  };
}
var md029_default = {
  "names": ["MD029", "ol-prefix"],
  "description": "Ordered list item prefix",
  "tags": ["ol"],
  "parser": "micromark",
  "function": function MD029(params2, onError) {
    const style = String(params2.config.style);
    for (const listOrdered of filterByTypesCached(["listOrdered"])) {
      const listItemPrefixes = (0, import_micromark_helpers18.getDescendantsByType)(listOrdered, ["listItemPrefix"]);
      let expectedNumber = 1;
      let incrementing = false;
      let rightAligned = false;
      let zeroPrefixed = false;
      if (listItemPrefixes.length > 0) {
        const firstPrefixEndColumn = listItemPrefixes[0].endColumn;
        rightAligned = listItemPrefixes.every((prefix) => prefix.endColumn === firstPrefixEndColumn);
        if (listItemPrefixes.length > 1) {
          const firstValue = getOrderedListItemValue(listItemPrefixes[0]);
          const secondValue = getOrderedListItemValue(listItemPrefixes[1]);
          if (secondValue.number !== 1 || firstValue.number === 0) {
            incrementing = true;
            if (firstValue.number === 0) {
              expectedNumber = 0;
            }
          }
          zeroPrefixed = firstValue.text.startsWith("0");
        }
      }
      const listStyle = listStyles.includes(style) ? style : incrementing ? "ordered" : "one";
      if (listStyle === "zero") {
        expectedNumber = 0;
      } else if (listStyle === "one") {
        expectedNumber = 1;
      }
      for (const listItemPrefix of listItemPrefixes) {
        const expectedText = expectedNumber.toString();
        const { endColumn, startColumn, "number": actualNumber } = getOrderedListItemValue(listItemPrefix);
        const length = endColumn - startColumn;
        const fixInfo = {
          "editColumn": startColumn,
          "deleteCount": length,
          "insertText": rightAligned ? expectedText.padStart(length, zeroPrefixed ? "0" : " ") : expectedText
        };
        (0, import_helpers23.addErrorDetailIf)(
          onError,
          listItemPrefix.startLine,
          expectedNumber,
          actualNumber,
          // @ts-ignore
          "Style: " + listStyleExamples[listStyle],
          void 0,
          [listItemPrefix.startColumn, listItemPrefix.endColumn - listItemPrefix.startColumn],
          fixInfo
        );
        if (listStyle === "ordered") {
          expectedNumber++;
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md030.mjs
var import_helpers24 = __toESM(require_helpers(), 1);
var md030_default = {
  "names": ["MD030", "list-marker-space"],
  "description": "Spaces after list markers",
  "tags": ["ol", "ul", "whitespace"],
  "parser": "micromark",
  "function": function MD030(params2, onError) {
    const ulSingle = Number(params2.config.ul_single ?? 1);
    const olSingle = Number(params2.config.ol_single ?? 1);
    const ulMulti = Number(params2.config.ul_multi ?? 1);
    const olMulti = Number(params2.config.ol_multi ?? 1);
    for (const list2 of filterByTypesCached(["listOrdered", "listUnordered"])) {
      const ordered = list2.type === "listOrdered";
      const listItemPrefixes = list2.children.filter((token) => token.type === "listItemPrefix");
      const allSingleLine = list2.endLine - list2.startLine + 1 === listItemPrefixes.length;
      const expectedSpaces = ordered ? allSingleLine ? olSingle : olMulti : allSingleLine ? ulSingle : ulMulti;
      for (const listItemPrefix of listItemPrefixes) {
        const range = [
          listItemPrefix.startColumn,
          listItemPrefix.endColumn - listItemPrefix.startColumn
        ];
        const listItemPrefixWhitespaces = listItemPrefix.children.filter(
          (token) => token.type === "listItemPrefixWhitespace"
        );
        for (const listItemPrefixWhitespace of listItemPrefixWhitespaces) {
          const { endColumn, startColumn, startLine } = listItemPrefixWhitespace;
          const actualSpaces = endColumn - startColumn;
          const fixInfo = {
            "editColumn": startColumn,
            "deleteCount": actualSpaces,
            "insertText": "".padEnd(expectedSpaces)
          };
          (0, import_helpers24.addErrorDetailIf)(
            onError,
            startLine,
            expectedSpaces,
            actualSpaces,
            void 0,
            void 0,
            range,
            fixInfo
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md031.mjs
var import_helpers25 = __toESM(require_helpers(), 1);
var import_micromark_helpers19 = __toESM(require_micromark_helpers(), 1);
var codeFencePrefixRe = /^(.*?)[`~]/;
function addError7(onError, lines, lineNumber, top) {
  const line = lines[lineNumber - 1];
  const [, prefix] = line.match(codeFencePrefixRe) || [];
  const fixInfo = prefix === void 0 ? void 0 : {
    "lineNumber": lineNumber + (top ? 0 : 1),
    "insertText": `${prefix.replace(/[^>]/g, " ").trim()}
`
  };
  (0, import_helpers25.addErrorContext)(
    onError,
    lineNumber,
    line.trim(),
    void 0,
    void 0,
    void 0,
    fixInfo
  );
}
var md031_default = {
  "names": ["MD031", "blanks-around-fences"],
  "description": "Fenced code blocks should be surrounded by blank lines",
  "tags": ["code", "blank_lines"],
  "parser": "micromark",
  "function": function MD031(params2, onError) {
    const listItems = params2.config.list_items;
    const includeListItems = listItems === void 0 || !!listItems;
    const { lines } = params2;
    for (const codeBlock of filterByTypesCached(["codeFenced"])) {
      if (includeListItems || !(0, import_micromark_helpers19.getParentOfType)(codeBlock, ["listOrdered", "listUnordered"])) {
        if (!(0, import_helpers25.isBlankLine)(lines[codeBlock.startLine - 2])) {
          addError7(onError, lines, codeBlock.startLine, true);
        }
        if (!(0, import_helpers25.isBlankLine)(lines[codeBlock.endLine]) && !(0, import_helpers25.isBlankLine)(lines[codeBlock.endLine - 1])) {
          addError7(onError, lines, codeBlock.endLine, false);
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md032.mjs
var import_helpers26 = __toESM(require_helpers(), 1);
var import_micromark_helpers20 = __toESM(require_micromark_helpers(), 1);
var isList = (token) => token.type === "listOrdered" || token.type === "listUnordered";
var md032_default = {
  "names": ["MD032", "blanks-around-lists"],
  "description": "Lists should be surrounded by blank lines",
  "tags": ["bullet", "ul", "ol", "blank_lines"],
  "parser": "micromark",
  "function": function MD032(params2, onError) {
    const { lines, parsers } = params2;
    const blockQuotePrefixes = filterByTypesCached(["blockQuotePrefix", "linePrefix"]);
    const topLevelLists = (0, import_micromark_helpers20.filterByPredicate)(
      parsers.micromark.tokens,
      isList,
      (token) => isList(token) || token.type === "htmlFlow" ? [] : token.children
    );
    for (const list2 of topLevelLists) {
      const firstLineNumber = list2.startLine;
      if (!(0, import_helpers26.isBlankLine)(lines[firstLineNumber - 2])) {
        (0, import_helpers26.addErrorContext)(
          onError,
          firstLineNumber,
          lines[firstLineNumber - 1].trim(),
          void 0,
          void 0,
          void 0,
          {
            "insertText": (0, import_micromark_helpers20.getBlockQuotePrefixText)(blockQuotePrefixes, firstLineNumber)
          }
        );
      }
      const flattenedChildren = (0, import_micromark_helpers20.filterByPredicate)(
        list2.children,
        (token) => !import_micromark_helpers20.nonContentTokens.has(token.type),
        (token) => import_micromark_helpers20.nonContentTokens.has(token.type) ? [] : token.children
      );
      const endLine = (flattenedChildren.length > 0 ? flattenedChildren[flattenedChildren.length - 1] : list2).endLine;
      const lastLineNumber = endLine;
      if (!(0, import_helpers26.isBlankLine)(lines[lastLineNumber])) {
        (0, import_helpers26.addErrorContext)(
          onError,
          lastLineNumber,
          lines[lastLineNumber - 1].trim(),
          void 0,
          void 0,
          void 0,
          {
            "lineNumber": lastLineNumber + 1,
            "insertText": (0, import_micromark_helpers20.getBlockQuotePrefixText)(blockQuotePrefixes, lastLineNumber)
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md033.mjs
var import_helpers27 = __toESM(require_helpers(), 1);
var import_micromark_helpers21 = __toESM(require_micromark_helpers(), 1);
var toLowerCaseStringArray = (arr) => Array.isArray(arr) ? arr.map((elm) => String(elm).toLowerCase()) : [];
var md033_default = {
  "names": ["MD033", "no-inline-html"],
  "description": "Inline HTML",
  "tags": ["html"],
  "parser": "micromark",
  "function": function MD033(params2, onError) {
    const allowedElements = toLowerCaseStringArray(params2.config.allowed_elements);
    const tableAllowedElements = toLowerCaseStringArray(params2.config.table_allowed_elements || params2.config.allowed_elements);
    for (const token of filterByTypesCached(["htmlText"], true)) {
      const htmlTagInfo = (0, import_micromark_helpers21.getHtmlTagInfo)(token);
      if (htmlTagInfo && !htmlTagInfo.close) {
        const elementName = htmlTagInfo?.name.toLowerCase();
        const inTable = !!(0, import_micromark_helpers21.getParentOfType)(token, ["table"]);
        if ((inTable || !allowedElements.includes(elementName)) && (!inTable || !tableAllowedElements.includes(elementName))) {
          const range = [
            token.startColumn,
            token.text.replace(import_helpers27.nextLinesRe, "").length
          ];
          (0, import_helpers27.addError)(
            onError,
            token.startLine,
            "Element: " + htmlTagInfo.name,
            void 0,
            range
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md034.mjs
var import_helpers28 = __toESM(require_helpers(), 1);
var import_micromark_helpers22 = __toESM(require_micromark_helpers(), 1);
var md034_default = {
  "names": ["MD034", "no-bare-urls"],
  "description": "Bare URL used",
  "tags": ["links", "url"],
  "parser": "micromark",
  "function": function MD034(params2, onError) {
    const literalAutolinks = (tokens) => (0, import_micromark_helpers22.filterByPredicate)(
      tokens,
      (token) => {
        if (token.type === "literalAutolink" && !(0, import_micromark_helpers22.inHtmlFlow)(token)) {
          const siblings = token.parent?.children;
          const index = siblings?.indexOf(token);
          const prev = siblings?.at(index - 1);
          const next = siblings?.at(index + 1);
          return !(prev && next && prev.type === "data" && next.type === "data" && prev.text.endsWith("<") && next.text.startsWith(">"));
        }
        return false;
      },
      (token) => {
        const { children } = token;
        const result = [];
        for (let i = 0; i < children.length; i++) {
          const current = children[i];
          const openTagInfo = (0, import_micromark_helpers22.getHtmlTagInfo)(current);
          if (openTagInfo && !openTagInfo.close) {
            let count = 1;
            for (let j = i + 1; j < children.length; j++) {
              const candidate = children[j];
              const closeTagInfo = (0, import_micromark_helpers22.getHtmlTagInfo)(candidate);
              if (closeTagInfo && openTagInfo.name === closeTagInfo.name) {
                if (closeTagInfo.close) {
                  count--;
                  if (count === 0) {
                    i = j;
                    break;
                  }
                } else {
                  count++;
                }
              }
            }
          } else {
            result.push(current);
          }
        }
        return result;
      }
    );
    for (const token of literalAutolinks(params2.parsers.micromark.tokens)) {
      const range = [
        token.startColumn,
        token.endColumn - token.startColumn
      ];
      const fixInfo = {
        "editColumn": range[0],
        "deleteCount": range[1],
        "insertText": `<${token.text}>`
      };
      (0, import_helpers28.addErrorContext)(
        onError,
        token.startLine,
        token.text,
        void 0,
        void 0,
        range,
        fixInfo
      );
    }
  }
};

// ../../node_modules/markdownlint/lib/md035.mjs
var import_helpers29 = __toESM(require_helpers(), 1);
var md035_default = {
  "names": ["MD035", "hr-style"],
  "description": "Horizontal rule style",
  "tags": ["hr"],
  "parser": "micromark",
  "function": function MD035(params2, onError) {
    let style = String(params2.config.style || "consistent").trim();
    const thematicBreaks = filterByTypesCached(["thematicBreak"]);
    for (const token of thematicBreaks) {
      const { startLine, text: text4 } = token;
      if (style === "consistent") {
        style = text4;
      }
      (0, import_helpers29.addErrorDetailIf)(onError, startLine, style, text4);
    }
  }
};

// ../../node_modules/markdownlint/lib/md036.mjs
var import_helpers30 = __toESM(require_helpers(), 1);
var import_micromark_helpers23 = __toESM(require_micromark_helpers(), 1);
var emphasisTypes = [
  ["emphasis", "emphasisText"],
  ["strong", "strongText"]
];
var isParagraphChildMeaningful = (token) => !(token.type === "htmlText" || token.type === "data" && token.text.trim().length === 0);
var md036_default = {
  "names": ["MD036", "no-emphasis-as-heading"],
  "description": "Emphasis used instead of a heading",
  "tags": ["headings", "emphasis"],
  "parser": "micromark",
  "function": function MD036(params2, onError) {
    let punctuation = params2.config.punctuation;
    punctuation = String(punctuation === void 0 ? import_helpers30.allPunctuation : punctuation);
    const punctuationRe = new RegExp("[" + punctuation + "]$");
    const paragraphTokens = filterByTypesCached(["paragraph"], true).filter(
      (token) => token.parent?.type === "content" && (!token.parent?.parent || token.parent?.parent?.type === "htmlFlow" && !token.parent?.parent?.parent) && token.children.filter(isParagraphChildMeaningful).length === 1
    );
    for (const emphasisType of emphasisTypes) {
      const textTokens = (0, import_micromark_helpers23.getDescendantsByType)(paragraphTokens, emphasisType);
      for (const textToken of textTokens) {
        if (textToken.children.length === 1 && // eslint-disable-next-line unicorn/better-dom-traversing
        textToken.children[0].type === "data" && !punctuationRe.test(textToken.text)) {
          (0, import_helpers30.addErrorContext)(onError, textToken.startLine, textToken.text);
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md037.mjs
var import_helpers31 = __toESM(require_helpers(), 1);
var import_micromark_helpers24 = __toESM(require_micromark_helpers(), 1);
var md037_default = {
  "names": ["MD037", "no-space-in-emphasis"],
  "description": "Spaces inside emphasis markers",
  "tags": ["whitespace", "emphasis"],
  "parser": "micromark",
  "function": function MD037(params2, onError) {
    const { lines, parsers } = params2;
    const emphasisTokensByMarker = /* @__PURE__ */ new Map();
    for (const marker of ["_", "__", "___", "*", "**", "***"]) {
      emphasisTokensByMarker.set(marker, []);
    }
    const tokens = (0, import_micromark_helpers24.filterByPredicate)(
      parsers.micromark.tokens,
      (token) => token.children.some((child) => child.type === "data")
    );
    for (const token of tokens) {
      for (const emphasisTokens of emphasisTokensByMarker.values()) {
        emphasisTokens.length = 0;
      }
      for (const child of token.children) {
        const { text: text4, type } = child;
        if (type === "data" && text4.length <= 3) {
          const emphasisTokens = emphasisTokensByMarker.get(text4);
          if (emphasisTokens && !(0, import_micromark_helpers24.inHtmlFlow)(child)) {
            emphasisTokens.push(child);
          }
        }
      }
      for (const [marker, emphasisTokens] of emphasisTokensByMarker) {
        for (let i = 0; i + 1 < emphasisTokens.length; i += 2) {
          const startToken = emphasisTokens[i];
          const startLine = lines[startToken.startLine - 1];
          const startSlice = startLine.slice(startToken.endColumn - 1);
          const startMatch = startSlice.match(/^\s+\S/);
          if (startMatch) {
            const [startSpaceCharacter] = startMatch;
            const startContext = `${marker}${startSpaceCharacter}`;
            const column = startToken.endColumn;
            const count = startSpaceCharacter.length - 1;
            (0, import_helpers31.addError)(
              onError,
              startToken.startLine,
              void 0,
              startContext,
              [column, count],
              {
                "editColumn": column,
                "deleteCount": count
              }
            );
          }
          const endToken = emphasisTokens[i + 1];
          const endLine = lines[endToken.startLine - 1];
          const endSlice = endLine.slice(0, endToken.startColumn - 1);
          const endMatch = endSlice.match(/\S\s+$/);
          if (endMatch) {
            const [endSpaceCharacter] = endMatch;
            const endContext = `${endSpaceCharacter}${marker}`;
            const column = endToken.startColumn - (endSpaceCharacter.length - 1);
            const count = endSpaceCharacter.length - 1;
            (0, import_helpers31.addError)(
              onError,
              endToken.startLine,
              void 0,
              endContext,
              [column, count],
              {
                "editColumn": column,
                "deleteCount": count
              }
            );
          }
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md038.mjs
var import_helpers32 = __toESM(require_helpers(), 1);
var import_micromark_helpers25 = __toESM(require_micromark_helpers(), 1);
var md038_default = {
  "names": ["MD038", "no-space-in-code"],
  "description": "Spaces inside code span elements",
  "tags": ["whitespace", "code"],
  "parser": "micromark",
  "function": function MD038(params2, onError) {
    const codeTexts = filterByTypesCached(["codeText"]);
    for (const codeText2 of codeTexts) {
      const datas = (0, import_micromark_helpers25.getDescendantsByType)(codeText2, ["codeTextData"]);
      if (datas.length > 0) {
        const paddings = (0, import_micromark_helpers25.getDescendantsByType)(codeText2, ["codeTextPadding"]);
        const startPadding = paddings[0];
        const startData = datas[0];
        const startMatch = /^(\s+)(\S)/.exec(startData.text) || [null, "", ""];
        const startBacktick = startMatch[2] === "`";
        const startCount = startMatch[1].length - (startBacktick && !startPadding ? 1 : 0);
        const startSpaces = startCount > 0;
        const endPadding = paddings[paddings.length - 1];
        const endData = datas[datas.length - 1];
        const endMatch = /(\S)(\s+)$/.exec(endData.text) || [null, "", ""];
        const endBacktick = endMatch[1] === "`";
        const endCount = endMatch[2].length - (endBacktick && !endPadding ? 1 : 0);
        const endSpaces = endCount > 0;
        const removePadding = startSpaces && endSpaces && startPadding && endPadding && !startBacktick && !endBacktick;
        const context = codeText2.text;
        if (startSpaces) {
          const startColumn = (removePadding ? startPadding : startData).startColumn;
          const length = startCount + (removePadding ? startPadding.text.length : 0);
          (0, import_helpers32.addErrorContext)(
            onError,
            startData.startLine,
            context,
            true,
            false,
            [startColumn, length],
            {
              "editColumn": startColumn,
              "deleteCount": length
            }
          );
        }
        if (endSpaces) {
          const endColumn = (removePadding ? endPadding : endData).endColumn;
          const length = endCount + (removePadding ? endPadding.text.length : 0);
          (0, import_helpers32.addErrorContext)(
            onError,
            endData.endLine,
            context,
            false,
            true,
            [endColumn - length, length],
            {
              "editColumn": endColumn - length,
              "deleteCount": length
            }
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md039.mjs
var import_helpers33 = __toESM(require_helpers(), 1);
var startRe = re`^[^\S\r\n]+`;
var endRe = re`[^\S\r\n]+$`;
function addLabelSpaceError(onError, label4, labelText, isStart) {
  const match = (isStart ? startRe : endRe).exec(labelText.text);
  const range = match ? [
    isStart ? labelText.startColumn : labelText.endColumn - match[0].length,
    match[0].length
  ] : void 0;
  (0, import_helpers33.addErrorContext)(
    onError,
    isStart ? labelText.startLine + (match ? 0 : 1) : labelText.endLine - (match ? 0 : 1),
    label4.text.replace(/\s+/g, " "),
    isStart,
    !isStart,
    range,
    range ? {
      "editColumn": range[0],
      "deleteCount": range[1]
    } : void 0
  );
}
var md039_default = {
  "names": ["MD039", "no-space-in-links"],
  "description": "Spaces inside link text",
  "tags": ["whitespace", "links"],
  "parser": "micromark",
  "function": function MD039(params2, onError) {
    const labels = filterByTypesCached(["label"]).filter((label4) => label4.parent?.type === "link");
    for (const label4 of labels) {
      const labelTexts = label4.children.filter((child) => child.type === "labelText");
      for (const labelText of labelTexts) {
        if (labelText.text.trimStart().length !== labelText.text.length) {
          addLabelSpaceError(onError, label4, labelText, true);
        }
        if (labelText.text.trimEnd().length !== labelText.text.length) {
          addLabelSpaceError(onError, label4, labelText, false);
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md040.mjs
var import_helpers34 = __toESM(require_helpers(), 1);
var import_micromark_helpers26 = __toESM(require_micromark_helpers(), 1);
var md040_default = {
  "names": ["MD040", "fenced-code-language"],
  "description": "Fenced code blocks should have a language specified",
  "tags": ["code", "language"],
  "parser": "micromark",
  "function": function MD040(params2, onError) {
    let allowed = params2.config.allowed_languages;
    allowed = Array.isArray(allowed) ? allowed : [];
    const languageOnly = !!params2.config.language_only;
    const fencedCodes = filterByTypesCached(["codeFenced"]);
    for (const fencedCode of fencedCodes) {
      const openingFence = (0, import_micromark_helpers26.getDescendantsByType)(fencedCode, ["codeFencedFence"])[0];
      const { startLine, text: text4 } = openingFence;
      const info = (0, import_micromark_helpers26.getDescendantsByType)(openingFence, ["codeFencedFenceInfo"])[0]?.text;
      if (!info) {
        (0, import_helpers34.addErrorContext)(onError, startLine, text4);
      } else if (allowed.length > 0 && !allowed.includes(info)) {
        (0, import_helpers34.addError)(onError, startLine, `"${info}" is not allowed`);
      }
      if (languageOnly && (0, import_micromark_helpers26.getDescendantsByType)(openingFence, ["codeFencedFenceMeta"]).length > 0) {
        (0, import_helpers34.addError)(onError, startLine, `Info string contains more than language: "${text4}"`);
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md041.mjs
var import_helpers35 = __toESM(require_helpers(), 1);
var import_micromark_helpers27 = __toESM(require_micromark_helpers(), 1);
var headingTagNameRe = /^h[1-6]$/;
function getHtmlFlowTagName(token) {
  const { children, type } = token;
  if (type === "htmlFlow") {
    const htmlTexts = (0, import_micromark_helpers27.filterByTypes)(children, ["htmlText"], true);
    const tagInfo = htmlTexts.length > 0 && (0, import_micromark_helpers27.getHtmlTagInfo)(htmlTexts[0]);
    if (tagInfo) {
      return tagInfo.name.toLowerCase();
    }
  }
  return null;
}
var md041_default = {
  "names": ["MD041", "first-line-heading", "first-line-h1"],
  "description": "First line in a file should be a top-level heading",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD041(params2, onError) {
    const allowPreamble = !!params2.config.allow_preamble;
    const level = Number(params2.config.level ?? 1);
    const { tokens } = params2.parsers.micromark;
    if (!(0, import_helpers35.frontMatterHasTitle)(
      params2.frontMatterLines,
      params2.config.front_matter_title
    )) {
      let errorLineNumber = 0;
      for (const token of tokens) {
        const { startLine, type } = token;
        if (!import_micromark_helpers27.nonContentTokens.has(type) && !(0, import_micromark_helpers27.isHtmlFlowComment)(token)) {
          let tagName = null;
          if (type === "atxHeading" || type === "setextHeading") {
            if ((0, import_micromark_helpers27.getHeadingLevel)(token) !== level) {
              errorLineNumber = startLine;
            }
            break;
          } else if ((tagName = getHtmlFlowTagName(token)) && headingTagNameRe.test(tagName)) {
            if (tagName !== `h${level}`) {
              errorLineNumber = startLine;
            }
            break;
          } else if (!allowPreamble) {
            errorLineNumber = startLine;
            break;
          }
        }
      }
      if (errorLineNumber > 0) {
        (0, import_helpers35.addErrorContext)(onError, errorLineNumber, params2.lines[errorLineNumber - 1]);
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md042.mjs
var import_helpers36 = __toESM(require_helpers(), 1);
var import_micromark_helpers28 = __toESM(require_micromark_helpers(), 1);
var md042_default = {
  "names": ["MD042", "no-empty-links"],
  "description": "No empty links",
  "tags": ["links"],
  "parser": "micromark",
  "function": function MD042(params2, onError) {
    const { definitions } = getReferenceLinkImageData();
    const isReferenceDefinitionHash = (token) => {
      const definition2 = definitions.get(token.text.trim());
      return Boolean(definition2 && definition2[1] === "#");
    };
    const links = filterByTypesCached(["link"]);
    for (const link of links) {
      const labelText = (0, import_micromark_helpers28.getDescendantsByType)(link, ["label", "labelText"]);
      const reference = (0, import_micromark_helpers28.getDescendantsByType)(link, ["reference"]);
      const resource = (0, import_micromark_helpers28.getDescendantsByType)(link, ["resource"]);
      const referenceString = (0, import_micromark_helpers28.getDescendantsByType)(reference, ["referenceString"]);
      const resourceDestinationString = (0, import_micromark_helpers28.getDescendantsByType)(resource, ["resourceDestination", ["resourceDestinationLiteral", "resourceDestinationRaw"], "resourceDestinationString"]);
      const hasLabelText = labelText.length > 0;
      const hasReference = reference.length > 0;
      const hasResource = resource.length > 0;
      const hasReferenceString = referenceString.length > 0;
      const hasResourceDestinationString = resourceDestinationString.length > 0;
      let error = false;
      if (hasLabelText && (!hasReference && !hasResource || hasReference && !hasReferenceString)) {
        error = isReferenceDefinitionHash(labelText[0]);
      } else if (hasReferenceString && !hasResourceDestinationString) {
        error = isReferenceDefinitionHash(referenceString[0]);
      } else if (!hasReferenceString && hasResourceDestinationString) {
        error = resourceDestinationString[0].text.trim() === "#";
      } else if (!hasReferenceString && !hasResourceDestinationString) {
        error = true;
      }
      if (error) {
        (0, import_helpers36.addErrorContext)(
          onError,
          link.startLine,
          link.text,
          void 0,
          void 0,
          [link.startColumn, link.endColumn - link.startColumn]
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md043.mjs
var import_helpers37 = __toESM(require_helpers(), 1);
var import_micromark_helpers29 = __toESM(require_micromark_helpers(), 1);
var headingsItemsRe = /^(?:[*+?]|\^+|[#%]{1,6}\s+\S.*)$/u;
var prefixedHeadingPartsRe = /^([#%]{1,6})\s+(\S.*)$/u;
var loopHeadingRe = /^\^+$/u;
var canMatchNothingHeadingsRe = /^(?:\*|\^+)$/u;
var maximumLoopsAllowed = 1e3;
var headingIsExpected = (actual, expected, matchCase) => {
  if (expected.startsWith("%")) {
    const [, actualLevel, actualText] = prefixedHeadingPartsRe.exec(actual) || [];
    const [, expectedLevel, expectedText] = prefixedHeadingPartsRe.exec(expected) || [];
    return actualLevel.length === expectedLevel.length && // eslint-disable-next-line unicorn/no-unreadable-new-expression
    new RegExp(expectedText, `${matchCase ? "" : "i"}u`).test(actualText);
  }
  const actualLower = matchCase ? actual : actual.toLowerCase();
  const expectedLower = matchCase ? expected : expected.toLowerCase();
  return actualLower === expectedLower;
};
var md043_default = {
  "names": ["MD043", "required-headings"],
  "description": "Required heading structure",
  "tags": ["headings"],
  "parser": "micromark",
  "function": function MD043(params2, onError) {
    const headings = params2.config.headings;
    if (!headings) {
      return;
    }
    const requiredHeadings = headings.map((heading) => headingsItemsRe.test(heading) ? heading : "[Invalid syntax]");
    const matchCase = Boolean(params2.config.match_case);
    let i = 0;
    let remainingLoopsAllowed = maximumLoopsAllowed;
    let allowAnyMatchFallback = false;
    let hasError = false;
    const getExpected = (skipLoopHeadings) => {
      let expected = null;
      do {
        expected = requiredHeadings[i++] || "[No heading]";
      } while (skipLoopHeadings && loopHeadingRe.test(expected));
      return expected;
    };
    for (const heading of filterByTypesCached(["atxHeading", "setextHeading"])) {
      const headingText = (0, import_micromark_helpers29.getHeadingText)(heading);
      const headingLevel = (0, import_micromark_helpers29.getHeadingLevel)(heading);
      const actual = `${"".padEnd(headingLevel, "#")} ${headingText}`;
      let expected = getExpected(false);
      if (expected.startsWith("^")) {
        const current = i;
        const nextExpected = getExpected(true);
        if (headingIsExpected(actual, nextExpected, matchCase)) {
          expected = nextExpected;
        } else {
          remainingLoopsAllowed--;
          let j = current - 2;
          for (; j >= 0; j--) {
            if (requiredHeadings[j] === expected) {
              i = j + 1;
              expected = getExpected(false);
              break;
            }
          }
          if (j < 0) {
            expected = nextExpected;
          }
        }
      }
      if (remainingLoopsAllowed < 0) {
        (0, import_helpers37.addError)(onError, heading.startLine, "Too many loops", `Limit: ${maximumLoopsAllowed}`);
        hasError = true;
        break;
      } else if (expected === "*") {
        const nextExpected = getExpected(true);
        if (!headingIsExpected(actual, nextExpected, matchCase)) {
          allowAnyMatchFallback = true;
          i--;
        }
      } else if (expected === "+") {
        allowAnyMatchFallback = true;
      } else if (expected === "?") {
      } else if (headingIsExpected(actual, expected, matchCase)) {
        allowAnyMatchFallback = false;
      } else if (allowAnyMatchFallback) {
        i--;
      } else {
        (0, import_helpers37.addErrorDetailIf)(onError, heading.startLine, expected, actual);
        hasError = true;
        break;
      }
    }
    const remainingRequiredHeadings = requiredHeadings.slice(i).filter((heading) => !canMatchNothingHeadingsRe.test(heading));
    if (!hasError && remainingRequiredHeadings.length > 0) {
      (0, import_helpers37.addErrorDetailIf)(onError, params2.lines.length, remainingRequiredHeadings[0], "[End of file]");
    }
  }
};

// ../../node_modules/markdownlint/lib/md044.mjs
var import_helpers38 = __toESM(require_helpers(), 1);
var import_micromark_helpers31 = __toESM(require_micromark_helpers(), 1);

// ../../node_modules/micromark-util-character/index.js
var asciiAlpha = regexCheck(/[A-Za-z]/);
var asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
var asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
function asciiControl(code18) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    code18 !== null && (code18 < 32 || code18 === 127)
  );
}
var asciiDigit = regexCheck(/\d/);
var asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
var asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
function markdownLineEnding(code18) {
  return code18 !== null && code18 < -2;
}
function markdownLineEndingOrSpace(code18) {
  return code18 !== null && (code18 < 0 || code18 === 32);
}
function markdownSpace(code18) {
  return code18 === -2 || code18 === -1 || code18 === 32;
}
var unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
var unicodeWhitespace = regexCheck(/\s/);
function regexCheck(regex2) {
  return check;
  function check(code18) {
    return code18 !== null && code18 > -1 && regex2.test(String.fromCharCode(code18));
  }
}

// ../../node_modules/micromark-factory-space/index.js
function factorySpace(effects, ok, type, max) {
  const limit = max ? max - 1 : Infinity;
  let size = 0;
  return start;
  function start(code18) {
    if (markdownSpace(code18)) {
      effects.enter(type);
      return prefix(code18);
    }
    return ok(code18);
  }
  function prefix(code18) {
    if (markdownSpace(code18) && size++ < limit) {
      effects.consume(code18);
      return prefix;
    }
    effects.exit(type);
    return ok(code18);
  }
}
function factorySpaceMinMax(effects, ok, nok, type, min, max) {
  let size = 0;
  return start;
  function start(code18) {
    if (max > 0 && markdownSpace(code18)) {
      effects.enter(type);
      return prefix(code18);
    }
    return after(code18);
  }
  function prefix(code18) {
    if (markdownSpace(code18) && size < max) {
      effects.consume(code18);
      size++;
      return prefix;
    }
    effects.exit(type);
    return after(code18);
  }
  function after(code18) {
    return size >= min ? ok(code18) : nok(code18);
  }
}

// ../../node_modules/micromark-factory-whitespace/index.js
function factoryWhitespace(effects, ok) {
  let seen;
  return start;
  function start(code18) {
    if (markdownLineEnding(code18)) {
      effects.enter("lineEnding");
      effects.consume(code18);
      effects.exit("lineEnding");
      seen = true;
      return start;
    }
    if (markdownSpace(code18)) {
      return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code18);
    }
    return ok(code18);
  }
}

// ../../node_modules/micromark-extension-directive/lib/factory-attributes.js
function factoryAttributes(effects, ok, nok, attributesType, attributesMarkerType, attributeType, attributeIdType, attributeClassType, attributeNameType, attributeInitializerType, attributeValueLiteralType, attributeValueType, attributeValueMarker, attributeValueData, disallowEol) {
  let type;
  let marker;
  return start;
  function start(code18) {
    effects.enter(attributesType);
    effects.enter(attributesMarkerType);
    effects.consume(code18);
    effects.exit(attributesMarkerType);
    return between;
  }
  function between(code18) {
    if (code18 === 35) {
      type = attributeIdType;
      return shortcutStart(code18);
    }
    if (code18 === 46) {
      type = attributeClassType;
      return shortcutStart(code18);
    }
    if (disallowEol && markdownSpace(code18)) {
      return factorySpace(effects, between, "whitespace")(code18);
    }
    if (!disallowEol && markdownLineEndingOrSpace(code18)) {
      return factoryWhitespace(effects, between)(code18);
    }
    if (code18 === null || markdownLineEnding(code18) || unicodeWhitespace(code18) || unicodePunctuation(code18) && code18 !== 45 && code18 !== 95) {
      return end(code18);
    }
    effects.enter(attributeType);
    effects.enter(attributeNameType);
    effects.consume(code18);
    return name;
  }
  function shortcutStart(code18) {
    const markerType = (
      /** @type {TokenType} */
      type + "Marker"
    );
    effects.enter(attributeType);
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code18);
    effects.exit(markerType);
    return shortcutStartAfter;
  }
  function shortcutStartAfter(code18) {
    if (code18 === null || code18 === 34 || code18 === 35 || code18 === 39 || code18 === 46 || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96 || code18 === 125 || markdownLineEndingOrSpace(code18)) {
      return nok(code18);
    }
    const valueType = (
      /** @type {TokenType} */
      type + "Value"
    );
    effects.enter(valueType);
    effects.consume(code18);
    return shortcut;
  }
  function shortcut(code18) {
    if (code18 === null || code18 === 34 || code18 === 39 || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96) {
      return nok(code18);
    }
    if (code18 === 35 || code18 === 46 || code18 === 125 || markdownLineEndingOrSpace(code18)) {
      const valueType = (
        /** @type {TokenType} */
        type + "Value"
      );
      effects.exit(valueType);
      effects.exit(type);
      effects.exit(attributeType);
      return between(code18);
    }
    effects.consume(code18);
    return shortcut;
  }
  function name(code18) {
    if (code18 === null || markdownLineEnding(code18) || unicodeWhitespace(code18) || unicodePunctuation(code18) && code18 !== 45 && code18 !== 46 && code18 !== 58 && code18 !== 95) {
      effects.exit(attributeNameType);
      if (disallowEol && markdownSpace(code18)) {
        return factorySpace(effects, nameAfter, "whitespace")(code18);
      }
      if (!disallowEol && markdownLineEndingOrSpace(code18)) {
        return factoryWhitespace(effects, nameAfter)(code18);
      }
      return nameAfter(code18);
    }
    effects.consume(code18);
    return name;
  }
  function nameAfter(code18) {
    if (code18 === 61) {
      effects.enter(attributeInitializerType);
      effects.consume(code18);
      effects.exit(attributeInitializerType);
      return valueBefore;
    }
    effects.exit(attributeType);
    return between(code18);
  }
  function valueBefore(code18) {
    if (code18 === null || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96 || code18 === 125 || disallowEol && markdownLineEnding(code18)) {
      return nok(code18);
    }
    if (code18 === 34 || code18 === 39) {
      effects.enter(attributeValueLiteralType);
      effects.enter(attributeValueMarker);
      effects.consume(code18);
      effects.exit(attributeValueMarker);
      marker = code18;
      return valueQuotedStart;
    }
    if (disallowEol && markdownSpace(code18)) {
      return factorySpace(effects, valueBefore, "whitespace")(code18);
    }
    if (!disallowEol && markdownLineEndingOrSpace(code18)) {
      return factoryWhitespace(effects, valueBefore)(code18);
    }
    effects.enter(attributeValueType);
    effects.enter(attributeValueData);
    effects.consume(code18);
    marker = void 0;
    return valueUnquoted;
  }
  function valueUnquoted(code18) {
    if (code18 === null || code18 === 34 || code18 === 39 || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96) {
      return nok(code18);
    }
    if (code18 === 125 || markdownLineEndingOrSpace(code18)) {
      effects.exit(attributeValueData);
      effects.exit(attributeValueType);
      effects.exit(attributeType);
      return between(code18);
    }
    effects.consume(code18);
    return valueUnquoted;
  }
  function valueQuotedStart(code18) {
    if (code18 === marker) {
      effects.enter(attributeValueMarker);
      effects.consume(code18);
      effects.exit(attributeValueMarker);
      effects.exit(attributeValueLiteralType);
      effects.exit(attributeType);
      return valueQuotedAfter;
    }
    effects.enter(attributeValueType);
    return valueQuotedBetween(code18);
  }
  function valueQuotedBetween(code18) {
    if (code18 === marker) {
      effects.exit(attributeValueType);
      return valueQuotedStart(code18);
    }
    if (code18 === null) {
      return nok(code18);
    }
    if (markdownLineEnding(code18)) {
      return disallowEol ? nok(code18) : factoryWhitespace(effects, valueQuotedBetween)(code18);
    }
    effects.enter(attributeValueData);
    effects.consume(code18);
    return valueQuoted;
  }
  function valueQuoted(code18) {
    if (code18 === marker || code18 === null || markdownLineEnding(code18)) {
      effects.exit(attributeValueData);
      return valueQuotedBetween(code18);
    }
    effects.consume(code18);
    return valueQuoted;
  }
  function valueQuotedAfter(code18) {
    return code18 === 125 || markdownLineEndingOrSpace(code18) ? between(code18) : end(code18);
  }
  function end(code18) {
    if (code18 === 125) {
      effects.enter(attributesMarkerType);
      effects.consume(code18);
      effects.exit(attributesMarkerType);
      effects.exit(attributesType);
      return ok;
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-extension-directive/lib/factory-label.js
function factoryLabel(effects, ok, nok, type, markerType, stringType, disallowEol) {
  let size = 0;
  let balance = 0;
  let previous4;
  return start;
  function start(code18) {
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code18);
    effects.exit(markerType);
    return afterStart;
  }
  function afterStart(code18) {
    if (code18 === 93) {
      effects.enter(markerType);
      effects.consume(code18);
      effects.exit(markerType);
      effects.exit(type);
      return ok;
    }
    effects.enter(stringType);
    return lineStart(code18);
  }
  function lineStart(code18) {
    if (code18 === 93 && !balance) {
      return atClosingBrace(code18);
    }
    const token = effects.enter("chunkText", {
      _contentTypeTextTrailing: true,
      contentType: "text",
      previous: previous4
    });
    if (previous4) previous4.next = token;
    previous4 = token;
    return data(code18);
  }
  function data(code18) {
    if (code18 === null || size > 999) {
      return nok(code18);
    }
    if (code18 === 91 && ++balance > 32) {
      return nok(code18);
    }
    if (code18 === 93 && !balance--) {
      effects.exit("chunkText");
      return atClosingBrace(code18);
    }
    if (markdownLineEnding(code18)) {
      if (disallowEol) {
        return nok(code18);
      }
      effects.consume(code18);
      effects.exit("chunkText");
      return lineStart;
    }
    effects.consume(code18);
    return code18 === 92 ? dataEscape : data;
  }
  function dataEscape(code18) {
    if (code18 === 91 || code18 === 92 || code18 === 93) {
      effects.consume(code18);
      size++;
      return data;
    }
    return data(code18);
  }
  function atClosingBrace(code18) {
    effects.exit(stringType);
    effects.enter(markerType);
    effects.consume(code18);
    effects.exit(markerType);
    effects.exit(type);
    return ok;
  }
}

// ../../node_modules/micromark-extension-directive/lib/factory-name.js
function factoryName(effects, ok, nok, type) {
  const self = this;
  return start;
  function start(code18) {
    if (code18 === null || markdownLineEnding(code18) || unicodePunctuation(code18) || unicodeWhitespace(code18)) {
      return nok(code18);
    }
    effects.enter(type);
    effects.consume(code18);
    return name;
  }
  function name(code18) {
    if (code18 === null || markdownLineEnding(code18) || unicodeWhitespace(code18) || unicodePunctuation(code18) && code18 !== 45 && code18 !== 95) {
      effects.exit(type);
      return self.previous === 45 || self.previous === 95 ? nok(code18) : ok(code18);
    }
    effects.consume(code18);
    return name;
  }
}

// ../../node_modules/micromark-extension-directive/lib/directive-container.js
var directiveContainer = {
  tokenize: tokenizeDirectiveContainer,
  concrete: true
};
var label = {
  tokenize: tokenizeLabel,
  partial: true
};
var attributes = {
  tokenize: tokenizeAttributes,
  partial: true
};
var nonLazyLine = {
  tokenize: tokenizeNonLazyLine,
  partial: true
};
function tokenizeDirectiveContainer(effects, ok, nok) {
  const self = this;
  const tail = self.events[self.events.length - 1];
  const initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
  let sizeOpen = 0;
  let previous4;
  return start;
  function start(code18) {
    effects.enter("directiveContainer");
    effects.enter("directiveContainerFence");
    effects.enter("directiveContainerSequence");
    return sequenceOpen(code18);
  }
  function sequenceOpen(code18) {
    if (code18 === 58) {
      effects.consume(code18);
      sizeOpen++;
      return sequenceOpen;
    }
    if (sizeOpen < 3) {
      return nok(code18);
    }
    effects.exit("directiveContainerSequence");
    return factoryName.call(self, effects, afterName, nok, "directiveContainerName")(code18);
  }
  function afterName(code18) {
    return code18 === 91 ? effects.attempt(label, afterLabel, afterLabel)(code18) : afterLabel(code18);
  }
  function afterLabel(code18) {
    return code18 === 123 ? effects.attempt(attributes, afterAttributes, afterAttributes)(code18) : afterAttributes(code18);
  }
  function afterAttributes(code18) {
    return factorySpace(effects, openAfter, "whitespace")(code18);
  }
  function openAfter(code18) {
    effects.exit("directiveContainerFence");
    if (code18 === null) {
      return after(code18);
    }
    if (markdownLineEnding(code18)) {
      if (self.interrupt) {
        return ok(code18);
      }
      return effects.attempt(nonLazyLine, contentStart, after)(code18);
    }
    return nok(code18);
  }
  function contentStart(code18) {
    if (code18 === null) {
      return after(code18);
    }
    if (markdownLineEnding(code18)) {
      return effects.check(nonLazyLine, emptyContentNonLazyLineAfter, after)(code18);
    }
    effects.enter("directiveContainerContent");
    return lineStart(code18);
  }
  function lineStart(code18) {
    return effects.attempt({
      tokenize: tokenizeClosingFence,
      partial: true
    }, afterContent, initialSize ? factorySpace(effects, chunkStart, "linePrefix", initialSize + 1) : chunkStart)(code18);
  }
  function chunkStart(code18) {
    if (code18 === null) {
      return afterContent(code18);
    }
    if (markdownLineEnding(code18)) {
      return effects.check(nonLazyLine, chunkNonLazyStart, afterContent)(code18);
    }
    return chunkNonLazyStart(code18);
  }
  function contentContinue(code18) {
    if (code18 === null) {
      const t = effects.exit("chunkDocument");
      self.parser.lazy[t.start.line] = false;
      return afterContent(code18);
    }
    if (markdownLineEnding(code18)) {
      return effects.check(nonLazyLine, nonLazyLineAfter, lineAfter)(code18);
    }
    effects.consume(code18);
    return contentContinue;
  }
  function chunkNonLazyStart(code18) {
    const token = effects.enter("chunkDocument", {
      contentType: "document",
      previous: previous4
    });
    if (previous4) previous4.next = token;
    previous4 = token;
    return contentContinue(code18);
  }
  function emptyContentNonLazyLineAfter(code18) {
    effects.enter("directiveContainerContent");
    return lineStart(code18);
  }
  function nonLazyLineAfter(code18) {
    effects.consume(code18);
    const t = effects.exit("chunkDocument");
    self.parser.lazy[t.start.line] = false;
    return lineStart;
  }
  function lineAfter(code18) {
    const t = effects.exit("chunkDocument");
    self.parser.lazy[t.start.line] = false;
    return afterContent(code18);
  }
  function afterContent(code18) {
    effects.exit("directiveContainerContent");
    return after(code18);
  }
  function after(code18) {
    effects.exit("directiveContainer");
    return ok(code18);
  }
  function tokenizeClosingFence(effects2, ok2, nok2) {
    let size = 0;
    return factorySpace(effects2, closingPrefixAfter, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
    function closingPrefixAfter(code18) {
      effects2.enter("directiveContainerFence");
      effects2.enter("directiveContainerSequence");
      return closingSequence(code18);
    }
    function closingSequence(code18) {
      if (code18 === 58) {
        effects2.consume(code18);
        size++;
        return closingSequence;
      }
      if (size < sizeOpen) return nok2(code18);
      effects2.exit("directiveContainerSequence");
      return factorySpace(effects2, closingSequenceEnd, "whitespace")(code18);
    }
    function closingSequenceEnd(code18) {
      if (code18 === null || markdownLineEnding(code18)) {
        effects2.exit("directiveContainerFence");
        return ok2(code18);
      }
      return nok2(code18);
    }
  }
}
function tokenizeLabel(effects, ok, nok) {
  return factoryLabel(effects, ok, nok, "directiveContainerLabel", "directiveContainerLabelMarker", "directiveContainerLabelString", true);
}
function tokenizeAttributes(effects, ok, nok) {
  return factoryAttributes(effects, ok, nok, "directiveContainerAttributes", "directiveContainerAttributesMarker", "directiveContainerAttribute", "directiveContainerAttributeId", "directiveContainerAttributeClass", "directiveContainerAttributeName", "directiveContainerAttributeInitializerMarker", "directiveContainerAttributeValueLiteral", "directiveContainerAttributeValue", "directiveContainerAttributeValueMarker", "directiveContainerAttributeValueData", true);
}
function tokenizeNonLazyLine(effects, ok, nok) {
  const self = this;
  return start;
  function start(code18) {
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return lineStart;
  }
  function lineStart(code18) {
    return self.parser.lazy[self.now().line] ? nok(code18) : ok(code18);
  }
}

// ../../node_modules/micromark-extension-directive/lib/directive-leaf.js
var directiveLeaf = {
  tokenize: tokenizeDirectiveLeaf
};
var label2 = {
  tokenize: tokenizeLabel2,
  partial: true
};
var attributes2 = {
  tokenize: tokenizeAttributes2,
  partial: true
};
function tokenizeDirectiveLeaf(effects, ok, nok) {
  const self = this;
  return start;
  function start(code18) {
    effects.enter("directiveLeaf");
    effects.enter("directiveLeafSequence");
    effects.consume(code18);
    return inStart;
  }
  function inStart(code18) {
    if (code18 === 58) {
      effects.consume(code18);
      effects.exit("directiveLeafSequence");
      return factoryName.call(self, effects, afterName, nok, "directiveLeafName");
    }
    return nok(code18);
  }
  function afterName(code18) {
    return code18 === 91 ? effects.attempt(label2, afterLabel, afterLabel)(code18) : afterLabel(code18);
  }
  function afterLabel(code18) {
    return code18 === 123 ? effects.attempt(attributes2, afterAttributes, afterAttributes)(code18) : afterAttributes(code18);
  }
  function afterAttributes(code18) {
    return factorySpace(effects, end, "whitespace")(code18);
  }
  function end(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("directiveLeaf");
      return ok(code18);
    }
    return nok(code18);
  }
}
function tokenizeLabel2(effects, ok, nok) {
  return factoryLabel(effects, ok, nok, "directiveLeafLabel", "directiveLeafLabelMarker", "directiveLeafLabelString", true);
}
function tokenizeAttributes2(effects, ok, nok) {
  return factoryAttributes(effects, ok, nok, "directiveLeafAttributes", "directiveLeafAttributesMarker", "directiveLeafAttribute", "directiveLeafAttributeId", "directiveLeafAttributeClass", "directiveLeafAttributeName", "directiveLeafAttributeInitializerMarker", "directiveLeafAttributeValueLiteral", "directiveLeafAttributeValue", "directiveLeafAttributeValueMarker", "directiveLeafAttributeValueData", true);
}

// ../../node_modules/micromark-extension-directive/lib/directive-text.js
var directiveText = {
  tokenize: tokenizeDirectiveText,
  previous
};
var label3 = {
  tokenize: tokenizeLabel3,
  partial: true
};
var attributes3 = {
  tokenize: tokenizeAttributes3,
  partial: true
};
function previous(code18) {
  return code18 !== 58 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function tokenizeDirectiveText(effects, ok, nok) {
  const self = this;
  return start;
  function start(code18) {
    effects.enter("directiveText");
    effects.enter("directiveTextMarker");
    effects.consume(code18);
    effects.exit("directiveTextMarker");
    return factoryName.call(self, effects, afterName, nok, "directiveTextName");
  }
  function afterName(code18) {
    return code18 === 58 ? nok(code18) : code18 === 91 ? effects.attempt(label3, afterLabel, afterLabel)(code18) : afterLabel(code18);
  }
  function afterLabel(code18) {
    return code18 === 123 ? effects.attempt(attributes3, afterAttributes, afterAttributes)(code18) : afterAttributes(code18);
  }
  function afterAttributes(code18) {
    effects.exit("directiveText");
    return ok(code18);
  }
}
function tokenizeLabel3(effects, ok, nok) {
  return factoryLabel(effects, ok, nok, "directiveTextLabel", "directiveTextLabelMarker", "directiveTextLabelString");
}
function tokenizeAttributes3(effects, ok, nok) {
  return factoryAttributes(effects, ok, nok, "directiveTextAttributes", "directiveTextAttributesMarker", "directiveTextAttribute", "directiveTextAttributeId", "directiveTextAttributeClass", "directiveTextAttributeName", "directiveTextAttributeInitializerMarker", "directiveTextAttributeValueLiteral", "directiveTextAttributeValue", "directiveTextAttributeValueMarker", "directiveTextAttributeValueData");
}

// ../../node_modules/micromark-extension-directive/lib/syntax.js
function directive() {
  return {
    text: {
      [58]: directiveText
    },
    flow: {
      [58]: [directiveContainer, directiveLeaf]
    }
  };
}

// ../../node_modules/character-entities/index.js
var characterEntities = {
  AElig: "\xC6",
  AMP: "&",
  Aacute: "\xC1",
  Abreve: "\u0102",
  Acirc: "\xC2",
  Acy: "\u0410",
  Afr: "\u{1D504}",
  Agrave: "\xC0",
  Alpha: "\u0391",
  Amacr: "\u0100",
  And: "\u2A53",
  Aogon: "\u0104",
  Aopf: "\u{1D538}",
  ApplyFunction: "\u2061",
  Aring: "\xC5",
  Ascr: "\u{1D49C}",
  Assign: "\u2254",
  Atilde: "\xC3",
  Auml: "\xC4",
  Backslash: "\u2216",
  Barv: "\u2AE7",
  Barwed: "\u2306",
  Bcy: "\u0411",
  Because: "\u2235",
  Bernoullis: "\u212C",
  Beta: "\u0392",
  Bfr: "\u{1D505}",
  Bopf: "\u{1D539}",
  Breve: "\u02D8",
  Bscr: "\u212C",
  Bumpeq: "\u224E",
  CHcy: "\u0427",
  COPY: "\xA9",
  Cacute: "\u0106",
  Cap: "\u22D2",
  CapitalDifferentialD: "\u2145",
  Cayleys: "\u212D",
  Ccaron: "\u010C",
  Ccedil: "\xC7",
  Ccirc: "\u0108",
  Cconint: "\u2230",
  Cdot: "\u010A",
  Cedilla: "\xB8",
  CenterDot: "\xB7",
  Cfr: "\u212D",
  Chi: "\u03A7",
  CircleDot: "\u2299",
  CircleMinus: "\u2296",
  CirclePlus: "\u2295",
  CircleTimes: "\u2297",
  ClockwiseContourIntegral: "\u2232",
  CloseCurlyDoubleQuote: "\u201D",
  CloseCurlyQuote: "\u2019",
  Colon: "\u2237",
  Colone: "\u2A74",
  Congruent: "\u2261",
  Conint: "\u222F",
  ContourIntegral: "\u222E",
  Copf: "\u2102",
  Coproduct: "\u2210",
  CounterClockwiseContourIntegral: "\u2233",
  Cross: "\u2A2F",
  Cscr: "\u{1D49E}",
  Cup: "\u22D3",
  CupCap: "\u224D",
  DD: "\u2145",
  DDotrahd: "\u2911",
  DJcy: "\u0402",
  DScy: "\u0405",
  DZcy: "\u040F",
  Dagger: "\u2021",
  Darr: "\u21A1",
  Dashv: "\u2AE4",
  Dcaron: "\u010E",
  Dcy: "\u0414",
  Del: "\u2207",
  Delta: "\u0394",
  Dfr: "\u{1D507}",
  DiacriticalAcute: "\xB4",
  DiacriticalDot: "\u02D9",
  DiacriticalDoubleAcute: "\u02DD",
  DiacriticalGrave: "`",
  DiacriticalTilde: "\u02DC",
  Diamond: "\u22C4",
  DifferentialD: "\u2146",
  Dopf: "\u{1D53B}",
  Dot: "\xA8",
  DotDot: "\u20DC",
  DotEqual: "\u2250",
  DoubleContourIntegral: "\u222F",
  DoubleDot: "\xA8",
  DoubleDownArrow: "\u21D3",
  DoubleLeftArrow: "\u21D0",
  DoubleLeftRightArrow: "\u21D4",
  DoubleLeftTee: "\u2AE4",
  DoubleLongLeftArrow: "\u27F8",
  DoubleLongLeftRightArrow: "\u27FA",
  DoubleLongRightArrow: "\u27F9",
  DoubleRightArrow: "\u21D2",
  DoubleRightTee: "\u22A8",
  DoubleUpArrow: "\u21D1",
  DoubleUpDownArrow: "\u21D5",
  DoubleVerticalBar: "\u2225",
  DownArrow: "\u2193",
  DownArrowBar: "\u2913",
  DownArrowUpArrow: "\u21F5",
  DownBreve: "\u0311",
  DownLeftRightVector: "\u2950",
  DownLeftTeeVector: "\u295E",
  DownLeftVector: "\u21BD",
  DownLeftVectorBar: "\u2956",
  DownRightTeeVector: "\u295F",
  DownRightVector: "\u21C1",
  DownRightVectorBar: "\u2957",
  DownTee: "\u22A4",
  DownTeeArrow: "\u21A7",
  Downarrow: "\u21D3",
  Dscr: "\u{1D49F}",
  Dstrok: "\u0110",
  ENG: "\u014A",
  ETH: "\xD0",
  Eacute: "\xC9",
  Ecaron: "\u011A",
  Ecirc: "\xCA",
  Ecy: "\u042D",
  Edot: "\u0116",
  Efr: "\u{1D508}",
  Egrave: "\xC8",
  Element: "\u2208",
  Emacr: "\u0112",
  EmptySmallSquare: "\u25FB",
  EmptyVerySmallSquare: "\u25AB",
  Eogon: "\u0118",
  Eopf: "\u{1D53C}",
  Epsilon: "\u0395",
  Equal: "\u2A75",
  EqualTilde: "\u2242",
  Equilibrium: "\u21CC",
  Escr: "\u2130",
  Esim: "\u2A73",
  Eta: "\u0397",
  Euml: "\xCB",
  Exists: "\u2203",
  ExponentialE: "\u2147",
  Fcy: "\u0424",
  Ffr: "\u{1D509}",
  FilledSmallSquare: "\u25FC",
  FilledVerySmallSquare: "\u25AA",
  Fopf: "\u{1D53D}",
  ForAll: "\u2200",
  Fouriertrf: "\u2131",
  Fscr: "\u2131",
  GJcy: "\u0403",
  GT: ">",
  Gamma: "\u0393",
  Gammad: "\u03DC",
  Gbreve: "\u011E",
  Gcedil: "\u0122",
  Gcirc: "\u011C",
  Gcy: "\u0413",
  Gdot: "\u0120",
  Gfr: "\u{1D50A}",
  Gg: "\u22D9",
  Gopf: "\u{1D53E}",
  GreaterEqual: "\u2265",
  GreaterEqualLess: "\u22DB",
  GreaterFullEqual: "\u2267",
  GreaterGreater: "\u2AA2",
  GreaterLess: "\u2277",
  GreaterSlantEqual: "\u2A7E",
  GreaterTilde: "\u2273",
  Gscr: "\u{1D4A2}",
  Gt: "\u226B",
  HARDcy: "\u042A",
  Hacek: "\u02C7",
  Hat: "^",
  Hcirc: "\u0124",
  Hfr: "\u210C",
  HilbertSpace: "\u210B",
  Hopf: "\u210D",
  HorizontalLine: "\u2500",
  Hscr: "\u210B",
  Hstrok: "\u0126",
  HumpDownHump: "\u224E",
  HumpEqual: "\u224F",
  IEcy: "\u0415",
  IJlig: "\u0132",
  IOcy: "\u0401",
  Iacute: "\xCD",
  Icirc: "\xCE",
  Icy: "\u0418",
  Idot: "\u0130",
  Ifr: "\u2111",
  Igrave: "\xCC",
  Im: "\u2111",
  Imacr: "\u012A",
  ImaginaryI: "\u2148",
  Implies: "\u21D2",
  Int: "\u222C",
  Integral: "\u222B",
  Intersection: "\u22C2",
  InvisibleComma: "\u2063",
  InvisibleTimes: "\u2062",
  Iogon: "\u012E",
  Iopf: "\u{1D540}",
  Iota: "\u0399",
  Iscr: "\u2110",
  Itilde: "\u0128",
  Iukcy: "\u0406",
  Iuml: "\xCF",
  Jcirc: "\u0134",
  Jcy: "\u0419",
  Jfr: "\u{1D50D}",
  Jopf: "\u{1D541}",
  Jscr: "\u{1D4A5}",
  Jsercy: "\u0408",
  Jukcy: "\u0404",
  KHcy: "\u0425",
  KJcy: "\u040C",
  Kappa: "\u039A",
  Kcedil: "\u0136",
  Kcy: "\u041A",
  Kfr: "\u{1D50E}",
  Kopf: "\u{1D542}",
  Kscr: "\u{1D4A6}",
  LJcy: "\u0409",
  LT: "<",
  Lacute: "\u0139",
  Lambda: "\u039B",
  Lang: "\u27EA",
  Laplacetrf: "\u2112",
  Larr: "\u219E",
  Lcaron: "\u013D",
  Lcedil: "\u013B",
  Lcy: "\u041B",
  LeftAngleBracket: "\u27E8",
  LeftArrow: "\u2190",
  LeftArrowBar: "\u21E4",
  LeftArrowRightArrow: "\u21C6",
  LeftCeiling: "\u2308",
  LeftDoubleBracket: "\u27E6",
  LeftDownTeeVector: "\u2961",
  LeftDownVector: "\u21C3",
  LeftDownVectorBar: "\u2959",
  LeftFloor: "\u230A",
  LeftRightArrow: "\u2194",
  LeftRightVector: "\u294E",
  LeftTee: "\u22A3",
  LeftTeeArrow: "\u21A4",
  LeftTeeVector: "\u295A",
  LeftTriangle: "\u22B2",
  LeftTriangleBar: "\u29CF",
  LeftTriangleEqual: "\u22B4",
  LeftUpDownVector: "\u2951",
  LeftUpTeeVector: "\u2960",
  LeftUpVector: "\u21BF",
  LeftUpVectorBar: "\u2958",
  LeftVector: "\u21BC",
  LeftVectorBar: "\u2952",
  Leftarrow: "\u21D0",
  Leftrightarrow: "\u21D4",
  LessEqualGreater: "\u22DA",
  LessFullEqual: "\u2266",
  LessGreater: "\u2276",
  LessLess: "\u2AA1",
  LessSlantEqual: "\u2A7D",
  LessTilde: "\u2272",
  Lfr: "\u{1D50F}",
  Ll: "\u22D8",
  Lleftarrow: "\u21DA",
  Lmidot: "\u013F",
  LongLeftArrow: "\u27F5",
  LongLeftRightArrow: "\u27F7",
  LongRightArrow: "\u27F6",
  Longleftarrow: "\u27F8",
  Longleftrightarrow: "\u27FA",
  Longrightarrow: "\u27F9",
  Lopf: "\u{1D543}",
  LowerLeftArrow: "\u2199",
  LowerRightArrow: "\u2198",
  Lscr: "\u2112",
  Lsh: "\u21B0",
  Lstrok: "\u0141",
  Lt: "\u226A",
  Map: "\u2905",
  Mcy: "\u041C",
  MediumSpace: "\u205F",
  Mellintrf: "\u2133",
  Mfr: "\u{1D510}",
  MinusPlus: "\u2213",
  Mopf: "\u{1D544}",
  Mscr: "\u2133",
  Mu: "\u039C",
  NJcy: "\u040A",
  Nacute: "\u0143",
  Ncaron: "\u0147",
  Ncedil: "\u0145",
  Ncy: "\u041D",
  NegativeMediumSpace: "\u200B",
  NegativeThickSpace: "\u200B",
  NegativeThinSpace: "\u200B",
  NegativeVeryThinSpace: "\u200B",
  NestedGreaterGreater: "\u226B",
  NestedLessLess: "\u226A",
  NewLine: "\n",
  Nfr: "\u{1D511}",
  NoBreak: "\u2060",
  NonBreakingSpace: "\xA0",
  Nopf: "\u2115",
  Not: "\u2AEC",
  NotCongruent: "\u2262",
  NotCupCap: "\u226D",
  NotDoubleVerticalBar: "\u2226",
  NotElement: "\u2209",
  NotEqual: "\u2260",
  NotEqualTilde: "\u2242\u0338",
  NotExists: "\u2204",
  NotGreater: "\u226F",
  NotGreaterEqual: "\u2271",
  NotGreaterFullEqual: "\u2267\u0338",
  NotGreaterGreater: "\u226B\u0338",
  NotGreaterLess: "\u2279",
  NotGreaterSlantEqual: "\u2A7E\u0338",
  NotGreaterTilde: "\u2275",
  NotHumpDownHump: "\u224E\u0338",
  NotHumpEqual: "\u224F\u0338",
  NotLeftTriangle: "\u22EA",
  NotLeftTriangleBar: "\u29CF\u0338",
  NotLeftTriangleEqual: "\u22EC",
  NotLess: "\u226E",
  NotLessEqual: "\u2270",
  NotLessGreater: "\u2278",
  NotLessLess: "\u226A\u0338",
  NotLessSlantEqual: "\u2A7D\u0338",
  NotLessTilde: "\u2274",
  NotNestedGreaterGreater: "\u2AA2\u0338",
  NotNestedLessLess: "\u2AA1\u0338",
  NotPrecedes: "\u2280",
  NotPrecedesEqual: "\u2AAF\u0338",
  NotPrecedesSlantEqual: "\u22E0",
  NotReverseElement: "\u220C",
  NotRightTriangle: "\u22EB",
  NotRightTriangleBar: "\u29D0\u0338",
  NotRightTriangleEqual: "\u22ED",
  NotSquareSubset: "\u228F\u0338",
  NotSquareSubsetEqual: "\u22E2",
  NotSquareSuperset: "\u2290\u0338",
  NotSquareSupersetEqual: "\u22E3",
  NotSubset: "\u2282\u20D2",
  NotSubsetEqual: "\u2288",
  NotSucceeds: "\u2281",
  NotSucceedsEqual: "\u2AB0\u0338",
  NotSucceedsSlantEqual: "\u22E1",
  NotSucceedsTilde: "\u227F\u0338",
  NotSuperset: "\u2283\u20D2",
  NotSupersetEqual: "\u2289",
  NotTilde: "\u2241",
  NotTildeEqual: "\u2244",
  NotTildeFullEqual: "\u2247",
  NotTildeTilde: "\u2249",
  NotVerticalBar: "\u2224",
  Nscr: "\u{1D4A9}",
  Ntilde: "\xD1",
  Nu: "\u039D",
  OElig: "\u0152",
  Oacute: "\xD3",
  Ocirc: "\xD4",
  Ocy: "\u041E",
  Odblac: "\u0150",
  Ofr: "\u{1D512}",
  Ograve: "\xD2",
  Omacr: "\u014C",
  Omega: "\u03A9",
  Omicron: "\u039F",
  Oopf: "\u{1D546}",
  OpenCurlyDoubleQuote: "\u201C",
  OpenCurlyQuote: "\u2018",
  Or: "\u2A54",
  Oscr: "\u{1D4AA}",
  Oslash: "\xD8",
  Otilde: "\xD5",
  Otimes: "\u2A37",
  Ouml: "\xD6",
  OverBar: "\u203E",
  OverBrace: "\u23DE",
  OverBracket: "\u23B4",
  OverParenthesis: "\u23DC",
  PartialD: "\u2202",
  Pcy: "\u041F",
  Pfr: "\u{1D513}",
  Phi: "\u03A6",
  Pi: "\u03A0",
  PlusMinus: "\xB1",
  Poincareplane: "\u210C",
  Popf: "\u2119",
  Pr: "\u2ABB",
  Precedes: "\u227A",
  PrecedesEqual: "\u2AAF",
  PrecedesSlantEqual: "\u227C",
  PrecedesTilde: "\u227E",
  Prime: "\u2033",
  Product: "\u220F",
  Proportion: "\u2237",
  Proportional: "\u221D",
  Pscr: "\u{1D4AB}",
  Psi: "\u03A8",
  QUOT: '"',
  Qfr: "\u{1D514}",
  Qopf: "\u211A",
  Qscr: "\u{1D4AC}",
  RBarr: "\u2910",
  REG: "\xAE",
  Racute: "\u0154",
  Rang: "\u27EB",
  Rarr: "\u21A0",
  Rarrtl: "\u2916",
  Rcaron: "\u0158",
  Rcedil: "\u0156",
  Rcy: "\u0420",
  Re: "\u211C",
  ReverseElement: "\u220B",
  ReverseEquilibrium: "\u21CB",
  ReverseUpEquilibrium: "\u296F",
  Rfr: "\u211C",
  Rho: "\u03A1",
  RightAngleBracket: "\u27E9",
  RightArrow: "\u2192",
  RightArrowBar: "\u21E5",
  RightArrowLeftArrow: "\u21C4",
  RightCeiling: "\u2309",
  RightDoubleBracket: "\u27E7",
  RightDownTeeVector: "\u295D",
  RightDownVector: "\u21C2",
  RightDownVectorBar: "\u2955",
  RightFloor: "\u230B",
  RightTee: "\u22A2",
  RightTeeArrow: "\u21A6",
  RightTeeVector: "\u295B",
  RightTriangle: "\u22B3",
  RightTriangleBar: "\u29D0",
  RightTriangleEqual: "\u22B5",
  RightUpDownVector: "\u294F",
  RightUpTeeVector: "\u295C",
  RightUpVector: "\u21BE",
  RightUpVectorBar: "\u2954",
  RightVector: "\u21C0",
  RightVectorBar: "\u2953",
  Rightarrow: "\u21D2",
  Ropf: "\u211D",
  RoundImplies: "\u2970",
  Rrightarrow: "\u21DB",
  Rscr: "\u211B",
  Rsh: "\u21B1",
  RuleDelayed: "\u29F4",
  SHCHcy: "\u0429",
  SHcy: "\u0428",
  SOFTcy: "\u042C",
  Sacute: "\u015A",
  Sc: "\u2ABC",
  Scaron: "\u0160",
  Scedil: "\u015E",
  Scirc: "\u015C",
  Scy: "\u0421",
  Sfr: "\u{1D516}",
  ShortDownArrow: "\u2193",
  ShortLeftArrow: "\u2190",
  ShortRightArrow: "\u2192",
  ShortUpArrow: "\u2191",
  Sigma: "\u03A3",
  SmallCircle: "\u2218",
  Sopf: "\u{1D54A}",
  Sqrt: "\u221A",
  Square: "\u25A1",
  SquareIntersection: "\u2293",
  SquareSubset: "\u228F",
  SquareSubsetEqual: "\u2291",
  SquareSuperset: "\u2290",
  SquareSupersetEqual: "\u2292",
  SquareUnion: "\u2294",
  Sscr: "\u{1D4AE}",
  Star: "\u22C6",
  Sub: "\u22D0",
  Subset: "\u22D0",
  SubsetEqual: "\u2286",
  Succeeds: "\u227B",
  SucceedsEqual: "\u2AB0",
  SucceedsSlantEqual: "\u227D",
  SucceedsTilde: "\u227F",
  SuchThat: "\u220B",
  Sum: "\u2211",
  Sup: "\u22D1",
  Superset: "\u2283",
  SupersetEqual: "\u2287",
  Supset: "\u22D1",
  THORN: "\xDE",
  TRADE: "\u2122",
  TSHcy: "\u040B",
  TScy: "\u0426",
  Tab: "	",
  Tau: "\u03A4",
  Tcaron: "\u0164",
  Tcedil: "\u0162",
  Tcy: "\u0422",
  Tfr: "\u{1D517}",
  Therefore: "\u2234",
  Theta: "\u0398",
  ThickSpace: "\u205F\u200A",
  ThinSpace: "\u2009",
  Tilde: "\u223C",
  TildeEqual: "\u2243",
  TildeFullEqual: "\u2245",
  TildeTilde: "\u2248",
  Topf: "\u{1D54B}",
  TripleDot: "\u20DB",
  Tscr: "\u{1D4AF}",
  Tstrok: "\u0166",
  Uacute: "\xDA",
  Uarr: "\u219F",
  Uarrocir: "\u2949",
  Ubrcy: "\u040E",
  Ubreve: "\u016C",
  Ucirc: "\xDB",
  Ucy: "\u0423",
  Udblac: "\u0170",
  Ufr: "\u{1D518}",
  Ugrave: "\xD9",
  Umacr: "\u016A",
  UnderBar: "_",
  UnderBrace: "\u23DF",
  UnderBracket: "\u23B5",
  UnderParenthesis: "\u23DD",
  Union: "\u22C3",
  UnionPlus: "\u228E",
  Uogon: "\u0172",
  Uopf: "\u{1D54C}",
  UpArrow: "\u2191",
  UpArrowBar: "\u2912",
  UpArrowDownArrow: "\u21C5",
  UpDownArrow: "\u2195",
  UpEquilibrium: "\u296E",
  UpTee: "\u22A5",
  UpTeeArrow: "\u21A5",
  Uparrow: "\u21D1",
  Updownarrow: "\u21D5",
  UpperLeftArrow: "\u2196",
  UpperRightArrow: "\u2197",
  Upsi: "\u03D2",
  Upsilon: "\u03A5",
  Uring: "\u016E",
  Uscr: "\u{1D4B0}",
  Utilde: "\u0168",
  Uuml: "\xDC",
  VDash: "\u22AB",
  Vbar: "\u2AEB",
  Vcy: "\u0412",
  Vdash: "\u22A9",
  Vdashl: "\u2AE6",
  Vee: "\u22C1",
  Verbar: "\u2016",
  Vert: "\u2016",
  VerticalBar: "\u2223",
  VerticalLine: "|",
  VerticalSeparator: "\u2758",
  VerticalTilde: "\u2240",
  VeryThinSpace: "\u200A",
  Vfr: "\u{1D519}",
  Vopf: "\u{1D54D}",
  Vscr: "\u{1D4B1}",
  Vvdash: "\u22AA",
  Wcirc: "\u0174",
  Wedge: "\u22C0",
  Wfr: "\u{1D51A}",
  Wopf: "\u{1D54E}",
  Wscr: "\u{1D4B2}",
  Xfr: "\u{1D51B}",
  Xi: "\u039E",
  Xopf: "\u{1D54F}",
  Xscr: "\u{1D4B3}",
  YAcy: "\u042F",
  YIcy: "\u0407",
  YUcy: "\u042E",
  Yacute: "\xDD",
  Ycirc: "\u0176",
  Ycy: "\u042B",
  Yfr: "\u{1D51C}",
  Yopf: "\u{1D550}",
  Yscr: "\u{1D4B4}",
  Yuml: "\u0178",
  ZHcy: "\u0416",
  Zacute: "\u0179",
  Zcaron: "\u017D",
  Zcy: "\u0417",
  Zdot: "\u017B",
  ZeroWidthSpace: "\u200B",
  Zeta: "\u0396",
  Zfr: "\u2128",
  Zopf: "\u2124",
  Zscr: "\u{1D4B5}",
  aacute: "\xE1",
  abreve: "\u0103",
  ac: "\u223E",
  acE: "\u223E\u0333",
  acd: "\u223F",
  acirc: "\xE2",
  acute: "\xB4",
  acy: "\u0430",
  aelig: "\xE6",
  af: "\u2061",
  afr: "\u{1D51E}",
  agrave: "\xE0",
  alefsym: "\u2135",
  aleph: "\u2135",
  alpha: "\u03B1",
  amacr: "\u0101",
  amalg: "\u2A3F",
  amp: "&",
  and: "\u2227",
  andand: "\u2A55",
  andd: "\u2A5C",
  andslope: "\u2A58",
  andv: "\u2A5A",
  ang: "\u2220",
  ange: "\u29A4",
  angle: "\u2220",
  angmsd: "\u2221",
  angmsdaa: "\u29A8",
  angmsdab: "\u29A9",
  angmsdac: "\u29AA",
  angmsdad: "\u29AB",
  angmsdae: "\u29AC",
  angmsdaf: "\u29AD",
  angmsdag: "\u29AE",
  angmsdah: "\u29AF",
  angrt: "\u221F",
  angrtvb: "\u22BE",
  angrtvbd: "\u299D",
  angsph: "\u2222",
  angst: "\xC5",
  angzarr: "\u237C",
  aogon: "\u0105",
  aopf: "\u{1D552}",
  ap: "\u2248",
  apE: "\u2A70",
  apacir: "\u2A6F",
  ape: "\u224A",
  apid: "\u224B",
  apos: "'",
  approx: "\u2248",
  approxeq: "\u224A",
  aring: "\xE5",
  ascr: "\u{1D4B6}",
  ast: "*",
  asymp: "\u2248",
  asympeq: "\u224D",
  atilde: "\xE3",
  auml: "\xE4",
  awconint: "\u2233",
  awint: "\u2A11",
  bNot: "\u2AED",
  backcong: "\u224C",
  backepsilon: "\u03F6",
  backprime: "\u2035",
  backsim: "\u223D",
  backsimeq: "\u22CD",
  barvee: "\u22BD",
  barwed: "\u2305",
  barwedge: "\u2305",
  bbrk: "\u23B5",
  bbrktbrk: "\u23B6",
  bcong: "\u224C",
  bcy: "\u0431",
  bdquo: "\u201E",
  becaus: "\u2235",
  because: "\u2235",
  bemptyv: "\u29B0",
  bepsi: "\u03F6",
  bernou: "\u212C",
  beta: "\u03B2",
  beth: "\u2136",
  between: "\u226C",
  bfr: "\u{1D51F}",
  bigcap: "\u22C2",
  bigcirc: "\u25EF",
  bigcup: "\u22C3",
  bigodot: "\u2A00",
  bigoplus: "\u2A01",
  bigotimes: "\u2A02",
  bigsqcup: "\u2A06",
  bigstar: "\u2605",
  bigtriangledown: "\u25BD",
  bigtriangleup: "\u25B3",
  biguplus: "\u2A04",
  bigvee: "\u22C1",
  bigwedge: "\u22C0",
  bkarow: "\u290D",
  blacklozenge: "\u29EB",
  blacksquare: "\u25AA",
  blacktriangle: "\u25B4",
  blacktriangledown: "\u25BE",
  blacktriangleleft: "\u25C2",
  blacktriangleright: "\u25B8",
  blank: "\u2423",
  blk12: "\u2592",
  blk14: "\u2591",
  blk34: "\u2593",
  block: "\u2588",
  bne: "=\u20E5",
  bnequiv: "\u2261\u20E5",
  bnot: "\u2310",
  bopf: "\u{1D553}",
  bot: "\u22A5",
  bottom: "\u22A5",
  bowtie: "\u22C8",
  boxDL: "\u2557",
  boxDR: "\u2554",
  boxDl: "\u2556",
  boxDr: "\u2553",
  boxH: "\u2550",
  boxHD: "\u2566",
  boxHU: "\u2569",
  boxHd: "\u2564",
  boxHu: "\u2567",
  boxUL: "\u255D",
  boxUR: "\u255A",
  boxUl: "\u255C",
  boxUr: "\u2559",
  boxV: "\u2551",
  boxVH: "\u256C",
  boxVL: "\u2563",
  boxVR: "\u2560",
  boxVh: "\u256B",
  boxVl: "\u2562",
  boxVr: "\u255F",
  boxbox: "\u29C9",
  boxdL: "\u2555",
  boxdR: "\u2552",
  boxdl: "\u2510",
  boxdr: "\u250C",
  boxh: "\u2500",
  boxhD: "\u2565",
  boxhU: "\u2568",
  boxhd: "\u252C",
  boxhu: "\u2534",
  boxminus: "\u229F",
  boxplus: "\u229E",
  boxtimes: "\u22A0",
  boxuL: "\u255B",
  boxuR: "\u2558",
  boxul: "\u2518",
  boxur: "\u2514",
  boxv: "\u2502",
  boxvH: "\u256A",
  boxvL: "\u2561",
  boxvR: "\u255E",
  boxvh: "\u253C",
  boxvl: "\u2524",
  boxvr: "\u251C",
  bprime: "\u2035",
  breve: "\u02D8",
  brvbar: "\xA6",
  bscr: "\u{1D4B7}",
  bsemi: "\u204F",
  bsim: "\u223D",
  bsime: "\u22CD",
  bsol: "\\",
  bsolb: "\u29C5",
  bsolhsub: "\u27C8",
  bull: "\u2022",
  bullet: "\u2022",
  bump: "\u224E",
  bumpE: "\u2AAE",
  bumpe: "\u224F",
  bumpeq: "\u224F",
  cacute: "\u0107",
  cap: "\u2229",
  capand: "\u2A44",
  capbrcup: "\u2A49",
  capcap: "\u2A4B",
  capcup: "\u2A47",
  capdot: "\u2A40",
  caps: "\u2229\uFE00",
  caret: "\u2041",
  caron: "\u02C7",
  ccaps: "\u2A4D",
  ccaron: "\u010D",
  ccedil: "\xE7",
  ccirc: "\u0109",
  ccups: "\u2A4C",
  ccupssm: "\u2A50",
  cdot: "\u010B",
  cedil: "\xB8",
  cemptyv: "\u29B2",
  cent: "\xA2",
  centerdot: "\xB7",
  cfr: "\u{1D520}",
  chcy: "\u0447",
  check: "\u2713",
  checkmark: "\u2713",
  chi: "\u03C7",
  cir: "\u25CB",
  cirE: "\u29C3",
  circ: "\u02C6",
  circeq: "\u2257",
  circlearrowleft: "\u21BA",
  circlearrowright: "\u21BB",
  circledR: "\xAE",
  circledS: "\u24C8",
  circledast: "\u229B",
  circledcirc: "\u229A",
  circleddash: "\u229D",
  cire: "\u2257",
  cirfnint: "\u2A10",
  cirmid: "\u2AEF",
  cirscir: "\u29C2",
  clubs: "\u2663",
  clubsuit: "\u2663",
  colon: ":",
  colone: "\u2254",
  coloneq: "\u2254",
  comma: ",",
  commat: "@",
  comp: "\u2201",
  compfn: "\u2218",
  complement: "\u2201",
  complexes: "\u2102",
  cong: "\u2245",
  congdot: "\u2A6D",
  conint: "\u222E",
  copf: "\u{1D554}",
  coprod: "\u2210",
  copy: "\xA9",
  copysr: "\u2117",
  crarr: "\u21B5",
  cross: "\u2717",
  cscr: "\u{1D4B8}",
  csub: "\u2ACF",
  csube: "\u2AD1",
  csup: "\u2AD0",
  csupe: "\u2AD2",
  ctdot: "\u22EF",
  cudarrl: "\u2938",
  cudarrr: "\u2935",
  cuepr: "\u22DE",
  cuesc: "\u22DF",
  cularr: "\u21B6",
  cularrp: "\u293D",
  cup: "\u222A",
  cupbrcap: "\u2A48",
  cupcap: "\u2A46",
  cupcup: "\u2A4A",
  cupdot: "\u228D",
  cupor: "\u2A45",
  cups: "\u222A\uFE00",
  curarr: "\u21B7",
  curarrm: "\u293C",
  curlyeqprec: "\u22DE",
  curlyeqsucc: "\u22DF",
  curlyvee: "\u22CE",
  curlywedge: "\u22CF",
  curren: "\xA4",
  curvearrowleft: "\u21B6",
  curvearrowright: "\u21B7",
  cuvee: "\u22CE",
  cuwed: "\u22CF",
  cwconint: "\u2232",
  cwint: "\u2231",
  cylcty: "\u232D",
  dArr: "\u21D3",
  dHar: "\u2965",
  dagger: "\u2020",
  daleth: "\u2138",
  darr: "\u2193",
  dash: "\u2010",
  dashv: "\u22A3",
  dbkarow: "\u290F",
  dblac: "\u02DD",
  dcaron: "\u010F",
  dcy: "\u0434",
  dd: "\u2146",
  ddagger: "\u2021",
  ddarr: "\u21CA",
  ddotseq: "\u2A77",
  deg: "\xB0",
  delta: "\u03B4",
  demptyv: "\u29B1",
  dfisht: "\u297F",
  dfr: "\u{1D521}",
  dharl: "\u21C3",
  dharr: "\u21C2",
  diam: "\u22C4",
  diamond: "\u22C4",
  diamondsuit: "\u2666",
  diams: "\u2666",
  die: "\xA8",
  digamma: "\u03DD",
  disin: "\u22F2",
  div: "\xF7",
  divide: "\xF7",
  divideontimes: "\u22C7",
  divonx: "\u22C7",
  djcy: "\u0452",
  dlcorn: "\u231E",
  dlcrop: "\u230D",
  dollar: "$",
  dopf: "\u{1D555}",
  dot: "\u02D9",
  doteq: "\u2250",
  doteqdot: "\u2251",
  dotminus: "\u2238",
  dotplus: "\u2214",
  dotsquare: "\u22A1",
  doublebarwedge: "\u2306",
  downarrow: "\u2193",
  downdownarrows: "\u21CA",
  downharpoonleft: "\u21C3",
  downharpoonright: "\u21C2",
  drbkarow: "\u2910",
  drcorn: "\u231F",
  drcrop: "\u230C",
  dscr: "\u{1D4B9}",
  dscy: "\u0455",
  dsol: "\u29F6",
  dstrok: "\u0111",
  dtdot: "\u22F1",
  dtri: "\u25BF",
  dtrif: "\u25BE",
  duarr: "\u21F5",
  duhar: "\u296F",
  dwangle: "\u29A6",
  dzcy: "\u045F",
  dzigrarr: "\u27FF",
  eDDot: "\u2A77",
  eDot: "\u2251",
  eacute: "\xE9",
  easter: "\u2A6E",
  ecaron: "\u011B",
  ecir: "\u2256",
  ecirc: "\xEA",
  ecolon: "\u2255",
  ecy: "\u044D",
  edot: "\u0117",
  ee: "\u2147",
  efDot: "\u2252",
  efr: "\u{1D522}",
  eg: "\u2A9A",
  egrave: "\xE8",
  egs: "\u2A96",
  egsdot: "\u2A98",
  el: "\u2A99",
  elinters: "\u23E7",
  ell: "\u2113",
  els: "\u2A95",
  elsdot: "\u2A97",
  emacr: "\u0113",
  empty: "\u2205",
  emptyset: "\u2205",
  emptyv: "\u2205",
  emsp13: "\u2004",
  emsp14: "\u2005",
  emsp: "\u2003",
  eng: "\u014B",
  ensp: "\u2002",
  eogon: "\u0119",
  eopf: "\u{1D556}",
  epar: "\u22D5",
  eparsl: "\u29E3",
  eplus: "\u2A71",
  epsi: "\u03B5",
  epsilon: "\u03B5",
  epsiv: "\u03F5",
  eqcirc: "\u2256",
  eqcolon: "\u2255",
  eqsim: "\u2242",
  eqslantgtr: "\u2A96",
  eqslantless: "\u2A95",
  equals: "=",
  equest: "\u225F",
  equiv: "\u2261",
  equivDD: "\u2A78",
  eqvparsl: "\u29E5",
  erDot: "\u2253",
  erarr: "\u2971",
  escr: "\u212F",
  esdot: "\u2250",
  esim: "\u2242",
  eta: "\u03B7",
  eth: "\xF0",
  euml: "\xEB",
  euro: "\u20AC",
  excl: "!",
  exist: "\u2203",
  expectation: "\u2130",
  exponentiale: "\u2147",
  fallingdotseq: "\u2252",
  fcy: "\u0444",
  female: "\u2640",
  ffilig: "\uFB03",
  fflig: "\uFB00",
  ffllig: "\uFB04",
  ffr: "\u{1D523}",
  filig: "\uFB01",
  fjlig: "fj",
  flat: "\u266D",
  fllig: "\uFB02",
  fltns: "\u25B1",
  fnof: "\u0192",
  fopf: "\u{1D557}",
  forall: "\u2200",
  fork: "\u22D4",
  forkv: "\u2AD9",
  fpartint: "\u2A0D",
  frac12: "\xBD",
  frac13: "\u2153",
  frac14: "\xBC",
  frac15: "\u2155",
  frac16: "\u2159",
  frac18: "\u215B",
  frac23: "\u2154",
  frac25: "\u2156",
  frac34: "\xBE",
  frac35: "\u2157",
  frac38: "\u215C",
  frac45: "\u2158",
  frac56: "\u215A",
  frac58: "\u215D",
  frac78: "\u215E",
  frasl: "\u2044",
  frown: "\u2322",
  fscr: "\u{1D4BB}",
  gE: "\u2267",
  gEl: "\u2A8C",
  gacute: "\u01F5",
  gamma: "\u03B3",
  gammad: "\u03DD",
  gap: "\u2A86",
  gbreve: "\u011F",
  gcirc: "\u011D",
  gcy: "\u0433",
  gdot: "\u0121",
  ge: "\u2265",
  gel: "\u22DB",
  geq: "\u2265",
  geqq: "\u2267",
  geqslant: "\u2A7E",
  ges: "\u2A7E",
  gescc: "\u2AA9",
  gesdot: "\u2A80",
  gesdoto: "\u2A82",
  gesdotol: "\u2A84",
  gesl: "\u22DB\uFE00",
  gesles: "\u2A94",
  gfr: "\u{1D524}",
  gg: "\u226B",
  ggg: "\u22D9",
  gimel: "\u2137",
  gjcy: "\u0453",
  gl: "\u2277",
  glE: "\u2A92",
  gla: "\u2AA5",
  glj: "\u2AA4",
  gnE: "\u2269",
  gnap: "\u2A8A",
  gnapprox: "\u2A8A",
  gne: "\u2A88",
  gneq: "\u2A88",
  gneqq: "\u2269",
  gnsim: "\u22E7",
  gopf: "\u{1D558}",
  grave: "`",
  gscr: "\u210A",
  gsim: "\u2273",
  gsime: "\u2A8E",
  gsiml: "\u2A90",
  gt: ">",
  gtcc: "\u2AA7",
  gtcir: "\u2A7A",
  gtdot: "\u22D7",
  gtlPar: "\u2995",
  gtquest: "\u2A7C",
  gtrapprox: "\u2A86",
  gtrarr: "\u2978",
  gtrdot: "\u22D7",
  gtreqless: "\u22DB",
  gtreqqless: "\u2A8C",
  gtrless: "\u2277",
  gtrsim: "\u2273",
  gvertneqq: "\u2269\uFE00",
  gvnE: "\u2269\uFE00",
  hArr: "\u21D4",
  hairsp: "\u200A",
  half: "\xBD",
  hamilt: "\u210B",
  hardcy: "\u044A",
  harr: "\u2194",
  harrcir: "\u2948",
  harrw: "\u21AD",
  hbar: "\u210F",
  hcirc: "\u0125",
  hearts: "\u2665",
  heartsuit: "\u2665",
  hellip: "\u2026",
  hercon: "\u22B9",
  hfr: "\u{1D525}",
  hksearow: "\u2925",
  hkswarow: "\u2926",
  hoarr: "\u21FF",
  homtht: "\u223B",
  hookleftarrow: "\u21A9",
  hookrightarrow: "\u21AA",
  hopf: "\u{1D559}",
  horbar: "\u2015",
  hscr: "\u{1D4BD}",
  hslash: "\u210F",
  hstrok: "\u0127",
  hybull: "\u2043",
  hyphen: "\u2010",
  iacute: "\xED",
  ic: "\u2063",
  icirc: "\xEE",
  icy: "\u0438",
  iecy: "\u0435",
  iexcl: "\xA1",
  iff: "\u21D4",
  ifr: "\u{1D526}",
  igrave: "\xEC",
  ii: "\u2148",
  iiiint: "\u2A0C",
  iiint: "\u222D",
  iinfin: "\u29DC",
  iiota: "\u2129",
  ijlig: "\u0133",
  imacr: "\u012B",
  image: "\u2111",
  imagline: "\u2110",
  imagpart: "\u2111",
  imath: "\u0131",
  imof: "\u22B7",
  imped: "\u01B5",
  in: "\u2208",
  incare: "\u2105",
  infin: "\u221E",
  infintie: "\u29DD",
  inodot: "\u0131",
  int: "\u222B",
  intcal: "\u22BA",
  integers: "\u2124",
  intercal: "\u22BA",
  intlarhk: "\u2A17",
  intprod: "\u2A3C",
  iocy: "\u0451",
  iogon: "\u012F",
  iopf: "\u{1D55A}",
  iota: "\u03B9",
  iprod: "\u2A3C",
  iquest: "\xBF",
  iscr: "\u{1D4BE}",
  isin: "\u2208",
  isinE: "\u22F9",
  isindot: "\u22F5",
  isins: "\u22F4",
  isinsv: "\u22F3",
  isinv: "\u2208",
  it: "\u2062",
  itilde: "\u0129",
  iukcy: "\u0456",
  iuml: "\xEF",
  jcirc: "\u0135",
  jcy: "\u0439",
  jfr: "\u{1D527}",
  jmath: "\u0237",
  jopf: "\u{1D55B}",
  jscr: "\u{1D4BF}",
  jsercy: "\u0458",
  jukcy: "\u0454",
  kappa: "\u03BA",
  kappav: "\u03F0",
  kcedil: "\u0137",
  kcy: "\u043A",
  kfr: "\u{1D528}",
  kgreen: "\u0138",
  khcy: "\u0445",
  kjcy: "\u045C",
  kopf: "\u{1D55C}",
  kscr: "\u{1D4C0}",
  lAarr: "\u21DA",
  lArr: "\u21D0",
  lAtail: "\u291B",
  lBarr: "\u290E",
  lE: "\u2266",
  lEg: "\u2A8B",
  lHar: "\u2962",
  lacute: "\u013A",
  laemptyv: "\u29B4",
  lagran: "\u2112",
  lambda: "\u03BB",
  lang: "\u27E8",
  langd: "\u2991",
  langle: "\u27E8",
  lap: "\u2A85",
  laquo: "\xAB",
  larr: "\u2190",
  larrb: "\u21E4",
  larrbfs: "\u291F",
  larrfs: "\u291D",
  larrhk: "\u21A9",
  larrlp: "\u21AB",
  larrpl: "\u2939",
  larrsim: "\u2973",
  larrtl: "\u21A2",
  lat: "\u2AAB",
  latail: "\u2919",
  late: "\u2AAD",
  lates: "\u2AAD\uFE00",
  lbarr: "\u290C",
  lbbrk: "\u2772",
  lbrace: "{",
  lbrack: "[",
  lbrke: "\u298B",
  lbrksld: "\u298F",
  lbrkslu: "\u298D",
  lcaron: "\u013E",
  lcedil: "\u013C",
  lceil: "\u2308",
  lcub: "{",
  lcy: "\u043B",
  ldca: "\u2936",
  ldquo: "\u201C",
  ldquor: "\u201E",
  ldrdhar: "\u2967",
  ldrushar: "\u294B",
  ldsh: "\u21B2",
  le: "\u2264",
  leftarrow: "\u2190",
  leftarrowtail: "\u21A2",
  leftharpoondown: "\u21BD",
  leftharpoonup: "\u21BC",
  leftleftarrows: "\u21C7",
  leftrightarrow: "\u2194",
  leftrightarrows: "\u21C6",
  leftrightharpoons: "\u21CB",
  leftrightsquigarrow: "\u21AD",
  leftthreetimes: "\u22CB",
  leg: "\u22DA",
  leq: "\u2264",
  leqq: "\u2266",
  leqslant: "\u2A7D",
  les: "\u2A7D",
  lescc: "\u2AA8",
  lesdot: "\u2A7F",
  lesdoto: "\u2A81",
  lesdotor: "\u2A83",
  lesg: "\u22DA\uFE00",
  lesges: "\u2A93",
  lessapprox: "\u2A85",
  lessdot: "\u22D6",
  lesseqgtr: "\u22DA",
  lesseqqgtr: "\u2A8B",
  lessgtr: "\u2276",
  lesssim: "\u2272",
  lfisht: "\u297C",
  lfloor: "\u230A",
  lfr: "\u{1D529}",
  lg: "\u2276",
  lgE: "\u2A91",
  lhard: "\u21BD",
  lharu: "\u21BC",
  lharul: "\u296A",
  lhblk: "\u2584",
  ljcy: "\u0459",
  ll: "\u226A",
  llarr: "\u21C7",
  llcorner: "\u231E",
  llhard: "\u296B",
  lltri: "\u25FA",
  lmidot: "\u0140",
  lmoust: "\u23B0",
  lmoustache: "\u23B0",
  lnE: "\u2268",
  lnap: "\u2A89",
  lnapprox: "\u2A89",
  lne: "\u2A87",
  lneq: "\u2A87",
  lneqq: "\u2268",
  lnsim: "\u22E6",
  loang: "\u27EC",
  loarr: "\u21FD",
  lobrk: "\u27E6",
  longleftarrow: "\u27F5",
  longleftrightarrow: "\u27F7",
  longmapsto: "\u27FC",
  longrightarrow: "\u27F6",
  looparrowleft: "\u21AB",
  looparrowright: "\u21AC",
  lopar: "\u2985",
  lopf: "\u{1D55D}",
  loplus: "\u2A2D",
  lotimes: "\u2A34",
  lowast: "\u2217",
  lowbar: "_",
  loz: "\u25CA",
  lozenge: "\u25CA",
  lozf: "\u29EB",
  lpar: "(",
  lparlt: "\u2993",
  lrarr: "\u21C6",
  lrcorner: "\u231F",
  lrhar: "\u21CB",
  lrhard: "\u296D",
  lrm: "\u200E",
  lrtri: "\u22BF",
  lsaquo: "\u2039",
  lscr: "\u{1D4C1}",
  lsh: "\u21B0",
  lsim: "\u2272",
  lsime: "\u2A8D",
  lsimg: "\u2A8F",
  lsqb: "[",
  lsquo: "\u2018",
  lsquor: "\u201A",
  lstrok: "\u0142",
  lt: "<",
  ltcc: "\u2AA6",
  ltcir: "\u2A79",
  ltdot: "\u22D6",
  lthree: "\u22CB",
  ltimes: "\u22C9",
  ltlarr: "\u2976",
  ltquest: "\u2A7B",
  ltrPar: "\u2996",
  ltri: "\u25C3",
  ltrie: "\u22B4",
  ltrif: "\u25C2",
  lurdshar: "\u294A",
  luruhar: "\u2966",
  lvertneqq: "\u2268\uFE00",
  lvnE: "\u2268\uFE00",
  mDDot: "\u223A",
  macr: "\xAF",
  male: "\u2642",
  malt: "\u2720",
  maltese: "\u2720",
  map: "\u21A6",
  mapsto: "\u21A6",
  mapstodown: "\u21A7",
  mapstoleft: "\u21A4",
  mapstoup: "\u21A5",
  marker: "\u25AE",
  mcomma: "\u2A29",
  mcy: "\u043C",
  mdash: "\u2014",
  measuredangle: "\u2221",
  mfr: "\u{1D52A}",
  mho: "\u2127",
  micro: "\xB5",
  mid: "\u2223",
  midast: "*",
  midcir: "\u2AF0",
  middot: "\xB7",
  minus: "\u2212",
  minusb: "\u229F",
  minusd: "\u2238",
  minusdu: "\u2A2A",
  mlcp: "\u2ADB",
  mldr: "\u2026",
  mnplus: "\u2213",
  models: "\u22A7",
  mopf: "\u{1D55E}",
  mp: "\u2213",
  mscr: "\u{1D4C2}",
  mstpos: "\u223E",
  mu: "\u03BC",
  multimap: "\u22B8",
  mumap: "\u22B8",
  nGg: "\u22D9\u0338",
  nGt: "\u226B\u20D2",
  nGtv: "\u226B\u0338",
  nLeftarrow: "\u21CD",
  nLeftrightarrow: "\u21CE",
  nLl: "\u22D8\u0338",
  nLt: "\u226A\u20D2",
  nLtv: "\u226A\u0338",
  nRightarrow: "\u21CF",
  nVDash: "\u22AF",
  nVdash: "\u22AE",
  nabla: "\u2207",
  nacute: "\u0144",
  nang: "\u2220\u20D2",
  nap: "\u2249",
  napE: "\u2A70\u0338",
  napid: "\u224B\u0338",
  napos: "\u0149",
  napprox: "\u2249",
  natur: "\u266E",
  natural: "\u266E",
  naturals: "\u2115",
  nbsp: "\xA0",
  nbump: "\u224E\u0338",
  nbumpe: "\u224F\u0338",
  ncap: "\u2A43",
  ncaron: "\u0148",
  ncedil: "\u0146",
  ncong: "\u2247",
  ncongdot: "\u2A6D\u0338",
  ncup: "\u2A42",
  ncy: "\u043D",
  ndash: "\u2013",
  ne: "\u2260",
  neArr: "\u21D7",
  nearhk: "\u2924",
  nearr: "\u2197",
  nearrow: "\u2197",
  nedot: "\u2250\u0338",
  nequiv: "\u2262",
  nesear: "\u2928",
  nesim: "\u2242\u0338",
  nexist: "\u2204",
  nexists: "\u2204",
  nfr: "\u{1D52B}",
  ngE: "\u2267\u0338",
  nge: "\u2271",
  ngeq: "\u2271",
  ngeqq: "\u2267\u0338",
  ngeqslant: "\u2A7E\u0338",
  nges: "\u2A7E\u0338",
  ngsim: "\u2275",
  ngt: "\u226F",
  ngtr: "\u226F",
  nhArr: "\u21CE",
  nharr: "\u21AE",
  nhpar: "\u2AF2",
  ni: "\u220B",
  nis: "\u22FC",
  nisd: "\u22FA",
  niv: "\u220B",
  njcy: "\u045A",
  nlArr: "\u21CD",
  nlE: "\u2266\u0338",
  nlarr: "\u219A",
  nldr: "\u2025",
  nle: "\u2270",
  nleftarrow: "\u219A",
  nleftrightarrow: "\u21AE",
  nleq: "\u2270",
  nleqq: "\u2266\u0338",
  nleqslant: "\u2A7D\u0338",
  nles: "\u2A7D\u0338",
  nless: "\u226E",
  nlsim: "\u2274",
  nlt: "\u226E",
  nltri: "\u22EA",
  nltrie: "\u22EC",
  nmid: "\u2224",
  nopf: "\u{1D55F}",
  not: "\xAC",
  notin: "\u2209",
  notinE: "\u22F9\u0338",
  notindot: "\u22F5\u0338",
  notinva: "\u2209",
  notinvb: "\u22F7",
  notinvc: "\u22F6",
  notni: "\u220C",
  notniva: "\u220C",
  notnivb: "\u22FE",
  notnivc: "\u22FD",
  npar: "\u2226",
  nparallel: "\u2226",
  nparsl: "\u2AFD\u20E5",
  npart: "\u2202\u0338",
  npolint: "\u2A14",
  npr: "\u2280",
  nprcue: "\u22E0",
  npre: "\u2AAF\u0338",
  nprec: "\u2280",
  npreceq: "\u2AAF\u0338",
  nrArr: "\u21CF",
  nrarr: "\u219B",
  nrarrc: "\u2933\u0338",
  nrarrw: "\u219D\u0338",
  nrightarrow: "\u219B",
  nrtri: "\u22EB",
  nrtrie: "\u22ED",
  nsc: "\u2281",
  nsccue: "\u22E1",
  nsce: "\u2AB0\u0338",
  nscr: "\u{1D4C3}",
  nshortmid: "\u2224",
  nshortparallel: "\u2226",
  nsim: "\u2241",
  nsime: "\u2244",
  nsimeq: "\u2244",
  nsmid: "\u2224",
  nspar: "\u2226",
  nsqsube: "\u22E2",
  nsqsupe: "\u22E3",
  nsub: "\u2284",
  nsubE: "\u2AC5\u0338",
  nsube: "\u2288",
  nsubset: "\u2282\u20D2",
  nsubseteq: "\u2288",
  nsubseteqq: "\u2AC5\u0338",
  nsucc: "\u2281",
  nsucceq: "\u2AB0\u0338",
  nsup: "\u2285",
  nsupE: "\u2AC6\u0338",
  nsupe: "\u2289",
  nsupset: "\u2283\u20D2",
  nsupseteq: "\u2289",
  nsupseteqq: "\u2AC6\u0338",
  ntgl: "\u2279",
  ntilde: "\xF1",
  ntlg: "\u2278",
  ntriangleleft: "\u22EA",
  ntrianglelefteq: "\u22EC",
  ntriangleright: "\u22EB",
  ntrianglerighteq: "\u22ED",
  nu: "\u03BD",
  num: "#",
  numero: "\u2116",
  numsp: "\u2007",
  nvDash: "\u22AD",
  nvHarr: "\u2904",
  nvap: "\u224D\u20D2",
  nvdash: "\u22AC",
  nvge: "\u2265\u20D2",
  nvgt: ">\u20D2",
  nvinfin: "\u29DE",
  nvlArr: "\u2902",
  nvle: "\u2264\u20D2",
  nvlt: "<\u20D2",
  nvltrie: "\u22B4\u20D2",
  nvrArr: "\u2903",
  nvrtrie: "\u22B5\u20D2",
  nvsim: "\u223C\u20D2",
  nwArr: "\u21D6",
  nwarhk: "\u2923",
  nwarr: "\u2196",
  nwarrow: "\u2196",
  nwnear: "\u2927",
  oS: "\u24C8",
  oacute: "\xF3",
  oast: "\u229B",
  ocir: "\u229A",
  ocirc: "\xF4",
  ocy: "\u043E",
  odash: "\u229D",
  odblac: "\u0151",
  odiv: "\u2A38",
  odot: "\u2299",
  odsold: "\u29BC",
  oelig: "\u0153",
  ofcir: "\u29BF",
  ofr: "\u{1D52C}",
  ogon: "\u02DB",
  ograve: "\xF2",
  ogt: "\u29C1",
  ohbar: "\u29B5",
  ohm: "\u03A9",
  oint: "\u222E",
  olarr: "\u21BA",
  olcir: "\u29BE",
  olcross: "\u29BB",
  oline: "\u203E",
  olt: "\u29C0",
  omacr: "\u014D",
  omega: "\u03C9",
  omicron: "\u03BF",
  omid: "\u29B6",
  ominus: "\u2296",
  oopf: "\u{1D560}",
  opar: "\u29B7",
  operp: "\u29B9",
  oplus: "\u2295",
  or: "\u2228",
  orarr: "\u21BB",
  ord: "\u2A5D",
  order: "\u2134",
  orderof: "\u2134",
  ordf: "\xAA",
  ordm: "\xBA",
  origof: "\u22B6",
  oror: "\u2A56",
  orslope: "\u2A57",
  orv: "\u2A5B",
  oscr: "\u2134",
  oslash: "\xF8",
  osol: "\u2298",
  otilde: "\xF5",
  otimes: "\u2297",
  otimesas: "\u2A36",
  ouml: "\xF6",
  ovbar: "\u233D",
  par: "\u2225",
  para: "\xB6",
  parallel: "\u2225",
  parsim: "\u2AF3",
  parsl: "\u2AFD",
  part: "\u2202",
  pcy: "\u043F",
  percnt: "%",
  period: ".",
  permil: "\u2030",
  perp: "\u22A5",
  pertenk: "\u2031",
  pfr: "\u{1D52D}",
  phi: "\u03C6",
  phiv: "\u03D5",
  phmmat: "\u2133",
  phone: "\u260E",
  pi: "\u03C0",
  pitchfork: "\u22D4",
  piv: "\u03D6",
  planck: "\u210F",
  planckh: "\u210E",
  plankv: "\u210F",
  plus: "+",
  plusacir: "\u2A23",
  plusb: "\u229E",
  pluscir: "\u2A22",
  plusdo: "\u2214",
  plusdu: "\u2A25",
  pluse: "\u2A72",
  plusmn: "\xB1",
  plussim: "\u2A26",
  plustwo: "\u2A27",
  pm: "\xB1",
  pointint: "\u2A15",
  popf: "\u{1D561}",
  pound: "\xA3",
  pr: "\u227A",
  prE: "\u2AB3",
  prap: "\u2AB7",
  prcue: "\u227C",
  pre: "\u2AAF",
  prec: "\u227A",
  precapprox: "\u2AB7",
  preccurlyeq: "\u227C",
  preceq: "\u2AAF",
  precnapprox: "\u2AB9",
  precneqq: "\u2AB5",
  precnsim: "\u22E8",
  precsim: "\u227E",
  prime: "\u2032",
  primes: "\u2119",
  prnE: "\u2AB5",
  prnap: "\u2AB9",
  prnsim: "\u22E8",
  prod: "\u220F",
  profalar: "\u232E",
  profline: "\u2312",
  profsurf: "\u2313",
  prop: "\u221D",
  propto: "\u221D",
  prsim: "\u227E",
  prurel: "\u22B0",
  pscr: "\u{1D4C5}",
  psi: "\u03C8",
  puncsp: "\u2008",
  qfr: "\u{1D52E}",
  qint: "\u2A0C",
  qopf: "\u{1D562}",
  qprime: "\u2057",
  qscr: "\u{1D4C6}",
  quaternions: "\u210D",
  quatint: "\u2A16",
  quest: "?",
  questeq: "\u225F",
  quot: '"',
  rAarr: "\u21DB",
  rArr: "\u21D2",
  rAtail: "\u291C",
  rBarr: "\u290F",
  rHar: "\u2964",
  race: "\u223D\u0331",
  racute: "\u0155",
  radic: "\u221A",
  raemptyv: "\u29B3",
  rang: "\u27E9",
  rangd: "\u2992",
  range: "\u29A5",
  rangle: "\u27E9",
  raquo: "\xBB",
  rarr: "\u2192",
  rarrap: "\u2975",
  rarrb: "\u21E5",
  rarrbfs: "\u2920",
  rarrc: "\u2933",
  rarrfs: "\u291E",
  rarrhk: "\u21AA",
  rarrlp: "\u21AC",
  rarrpl: "\u2945",
  rarrsim: "\u2974",
  rarrtl: "\u21A3",
  rarrw: "\u219D",
  ratail: "\u291A",
  ratio: "\u2236",
  rationals: "\u211A",
  rbarr: "\u290D",
  rbbrk: "\u2773",
  rbrace: "}",
  rbrack: "]",
  rbrke: "\u298C",
  rbrksld: "\u298E",
  rbrkslu: "\u2990",
  rcaron: "\u0159",
  rcedil: "\u0157",
  rceil: "\u2309",
  rcub: "}",
  rcy: "\u0440",
  rdca: "\u2937",
  rdldhar: "\u2969",
  rdquo: "\u201D",
  rdquor: "\u201D",
  rdsh: "\u21B3",
  real: "\u211C",
  realine: "\u211B",
  realpart: "\u211C",
  reals: "\u211D",
  rect: "\u25AD",
  reg: "\xAE",
  rfisht: "\u297D",
  rfloor: "\u230B",
  rfr: "\u{1D52F}",
  rhard: "\u21C1",
  rharu: "\u21C0",
  rharul: "\u296C",
  rho: "\u03C1",
  rhov: "\u03F1",
  rightarrow: "\u2192",
  rightarrowtail: "\u21A3",
  rightharpoondown: "\u21C1",
  rightharpoonup: "\u21C0",
  rightleftarrows: "\u21C4",
  rightleftharpoons: "\u21CC",
  rightrightarrows: "\u21C9",
  rightsquigarrow: "\u219D",
  rightthreetimes: "\u22CC",
  ring: "\u02DA",
  risingdotseq: "\u2253",
  rlarr: "\u21C4",
  rlhar: "\u21CC",
  rlm: "\u200F",
  rmoust: "\u23B1",
  rmoustache: "\u23B1",
  rnmid: "\u2AEE",
  roang: "\u27ED",
  roarr: "\u21FE",
  robrk: "\u27E7",
  ropar: "\u2986",
  ropf: "\u{1D563}",
  roplus: "\u2A2E",
  rotimes: "\u2A35",
  rpar: ")",
  rpargt: "\u2994",
  rppolint: "\u2A12",
  rrarr: "\u21C9",
  rsaquo: "\u203A",
  rscr: "\u{1D4C7}",
  rsh: "\u21B1",
  rsqb: "]",
  rsquo: "\u2019",
  rsquor: "\u2019",
  rthree: "\u22CC",
  rtimes: "\u22CA",
  rtri: "\u25B9",
  rtrie: "\u22B5",
  rtrif: "\u25B8",
  rtriltri: "\u29CE",
  ruluhar: "\u2968",
  rx: "\u211E",
  sacute: "\u015B",
  sbquo: "\u201A",
  sc: "\u227B",
  scE: "\u2AB4",
  scap: "\u2AB8",
  scaron: "\u0161",
  sccue: "\u227D",
  sce: "\u2AB0",
  scedil: "\u015F",
  scirc: "\u015D",
  scnE: "\u2AB6",
  scnap: "\u2ABA",
  scnsim: "\u22E9",
  scpolint: "\u2A13",
  scsim: "\u227F",
  scy: "\u0441",
  sdot: "\u22C5",
  sdotb: "\u22A1",
  sdote: "\u2A66",
  seArr: "\u21D8",
  searhk: "\u2925",
  searr: "\u2198",
  searrow: "\u2198",
  sect: "\xA7",
  semi: ";",
  seswar: "\u2929",
  setminus: "\u2216",
  setmn: "\u2216",
  sext: "\u2736",
  sfr: "\u{1D530}",
  sfrown: "\u2322",
  sharp: "\u266F",
  shchcy: "\u0449",
  shcy: "\u0448",
  shortmid: "\u2223",
  shortparallel: "\u2225",
  shy: "\xAD",
  sigma: "\u03C3",
  sigmaf: "\u03C2",
  sigmav: "\u03C2",
  sim: "\u223C",
  simdot: "\u2A6A",
  sime: "\u2243",
  simeq: "\u2243",
  simg: "\u2A9E",
  simgE: "\u2AA0",
  siml: "\u2A9D",
  simlE: "\u2A9F",
  simne: "\u2246",
  simplus: "\u2A24",
  simrarr: "\u2972",
  slarr: "\u2190",
  smallsetminus: "\u2216",
  smashp: "\u2A33",
  smeparsl: "\u29E4",
  smid: "\u2223",
  smile: "\u2323",
  smt: "\u2AAA",
  smte: "\u2AAC",
  smtes: "\u2AAC\uFE00",
  softcy: "\u044C",
  sol: "/",
  solb: "\u29C4",
  solbar: "\u233F",
  sopf: "\u{1D564}",
  spades: "\u2660",
  spadesuit: "\u2660",
  spar: "\u2225",
  sqcap: "\u2293",
  sqcaps: "\u2293\uFE00",
  sqcup: "\u2294",
  sqcups: "\u2294\uFE00",
  sqsub: "\u228F",
  sqsube: "\u2291",
  sqsubset: "\u228F",
  sqsubseteq: "\u2291",
  sqsup: "\u2290",
  sqsupe: "\u2292",
  sqsupset: "\u2290",
  sqsupseteq: "\u2292",
  squ: "\u25A1",
  square: "\u25A1",
  squarf: "\u25AA",
  squf: "\u25AA",
  srarr: "\u2192",
  sscr: "\u{1D4C8}",
  ssetmn: "\u2216",
  ssmile: "\u2323",
  sstarf: "\u22C6",
  star: "\u2606",
  starf: "\u2605",
  straightepsilon: "\u03F5",
  straightphi: "\u03D5",
  strns: "\xAF",
  sub: "\u2282",
  subE: "\u2AC5",
  subdot: "\u2ABD",
  sube: "\u2286",
  subedot: "\u2AC3",
  submult: "\u2AC1",
  subnE: "\u2ACB",
  subne: "\u228A",
  subplus: "\u2ABF",
  subrarr: "\u2979",
  subset: "\u2282",
  subseteq: "\u2286",
  subseteqq: "\u2AC5",
  subsetneq: "\u228A",
  subsetneqq: "\u2ACB",
  subsim: "\u2AC7",
  subsub: "\u2AD5",
  subsup: "\u2AD3",
  succ: "\u227B",
  succapprox: "\u2AB8",
  succcurlyeq: "\u227D",
  succeq: "\u2AB0",
  succnapprox: "\u2ABA",
  succneqq: "\u2AB6",
  succnsim: "\u22E9",
  succsim: "\u227F",
  sum: "\u2211",
  sung: "\u266A",
  sup1: "\xB9",
  sup2: "\xB2",
  sup3: "\xB3",
  sup: "\u2283",
  supE: "\u2AC6",
  supdot: "\u2ABE",
  supdsub: "\u2AD8",
  supe: "\u2287",
  supedot: "\u2AC4",
  suphsol: "\u27C9",
  suphsub: "\u2AD7",
  suplarr: "\u297B",
  supmult: "\u2AC2",
  supnE: "\u2ACC",
  supne: "\u228B",
  supplus: "\u2AC0",
  supset: "\u2283",
  supseteq: "\u2287",
  supseteqq: "\u2AC6",
  supsetneq: "\u228B",
  supsetneqq: "\u2ACC",
  supsim: "\u2AC8",
  supsub: "\u2AD4",
  supsup: "\u2AD6",
  swArr: "\u21D9",
  swarhk: "\u2926",
  swarr: "\u2199",
  swarrow: "\u2199",
  swnwar: "\u292A",
  szlig: "\xDF",
  target: "\u2316",
  tau: "\u03C4",
  tbrk: "\u23B4",
  tcaron: "\u0165",
  tcedil: "\u0163",
  tcy: "\u0442",
  tdot: "\u20DB",
  telrec: "\u2315",
  tfr: "\u{1D531}",
  there4: "\u2234",
  therefore: "\u2234",
  theta: "\u03B8",
  thetasym: "\u03D1",
  thetav: "\u03D1",
  thickapprox: "\u2248",
  thicksim: "\u223C",
  thinsp: "\u2009",
  thkap: "\u2248",
  thksim: "\u223C",
  thorn: "\xFE",
  tilde: "\u02DC",
  times: "\xD7",
  timesb: "\u22A0",
  timesbar: "\u2A31",
  timesd: "\u2A30",
  tint: "\u222D",
  toea: "\u2928",
  top: "\u22A4",
  topbot: "\u2336",
  topcir: "\u2AF1",
  topf: "\u{1D565}",
  topfork: "\u2ADA",
  tosa: "\u2929",
  tprime: "\u2034",
  trade: "\u2122",
  triangle: "\u25B5",
  triangledown: "\u25BF",
  triangleleft: "\u25C3",
  trianglelefteq: "\u22B4",
  triangleq: "\u225C",
  triangleright: "\u25B9",
  trianglerighteq: "\u22B5",
  tridot: "\u25EC",
  trie: "\u225C",
  triminus: "\u2A3A",
  triplus: "\u2A39",
  trisb: "\u29CD",
  tritime: "\u2A3B",
  trpezium: "\u23E2",
  tscr: "\u{1D4C9}",
  tscy: "\u0446",
  tshcy: "\u045B",
  tstrok: "\u0167",
  twixt: "\u226C",
  twoheadleftarrow: "\u219E",
  twoheadrightarrow: "\u21A0",
  uArr: "\u21D1",
  uHar: "\u2963",
  uacute: "\xFA",
  uarr: "\u2191",
  ubrcy: "\u045E",
  ubreve: "\u016D",
  ucirc: "\xFB",
  ucy: "\u0443",
  udarr: "\u21C5",
  udblac: "\u0171",
  udhar: "\u296E",
  ufisht: "\u297E",
  ufr: "\u{1D532}",
  ugrave: "\xF9",
  uharl: "\u21BF",
  uharr: "\u21BE",
  uhblk: "\u2580",
  ulcorn: "\u231C",
  ulcorner: "\u231C",
  ulcrop: "\u230F",
  ultri: "\u25F8",
  umacr: "\u016B",
  uml: "\xA8",
  uogon: "\u0173",
  uopf: "\u{1D566}",
  uparrow: "\u2191",
  updownarrow: "\u2195",
  upharpoonleft: "\u21BF",
  upharpoonright: "\u21BE",
  uplus: "\u228E",
  upsi: "\u03C5",
  upsih: "\u03D2",
  upsilon: "\u03C5",
  upuparrows: "\u21C8",
  urcorn: "\u231D",
  urcorner: "\u231D",
  urcrop: "\u230E",
  uring: "\u016F",
  urtri: "\u25F9",
  uscr: "\u{1D4CA}",
  utdot: "\u22F0",
  utilde: "\u0169",
  utri: "\u25B5",
  utrif: "\u25B4",
  uuarr: "\u21C8",
  uuml: "\xFC",
  uwangle: "\u29A7",
  vArr: "\u21D5",
  vBar: "\u2AE8",
  vBarv: "\u2AE9",
  vDash: "\u22A8",
  vangrt: "\u299C",
  varepsilon: "\u03F5",
  varkappa: "\u03F0",
  varnothing: "\u2205",
  varphi: "\u03D5",
  varpi: "\u03D6",
  varpropto: "\u221D",
  varr: "\u2195",
  varrho: "\u03F1",
  varsigma: "\u03C2",
  varsubsetneq: "\u228A\uFE00",
  varsubsetneqq: "\u2ACB\uFE00",
  varsupsetneq: "\u228B\uFE00",
  varsupsetneqq: "\u2ACC\uFE00",
  vartheta: "\u03D1",
  vartriangleleft: "\u22B2",
  vartriangleright: "\u22B3",
  vcy: "\u0432",
  vdash: "\u22A2",
  vee: "\u2228",
  veebar: "\u22BB",
  veeeq: "\u225A",
  vellip: "\u22EE",
  verbar: "|",
  vert: "|",
  vfr: "\u{1D533}",
  vltri: "\u22B2",
  vnsub: "\u2282\u20D2",
  vnsup: "\u2283\u20D2",
  vopf: "\u{1D567}",
  vprop: "\u221D",
  vrtri: "\u22B3",
  vscr: "\u{1D4CB}",
  vsubnE: "\u2ACB\uFE00",
  vsubne: "\u228A\uFE00",
  vsupnE: "\u2ACC\uFE00",
  vsupne: "\u228B\uFE00",
  vzigzag: "\u299A",
  wcirc: "\u0175",
  wedbar: "\u2A5F",
  wedge: "\u2227",
  wedgeq: "\u2259",
  weierp: "\u2118",
  wfr: "\u{1D534}",
  wopf: "\u{1D568}",
  wp: "\u2118",
  wr: "\u2240",
  wreath: "\u2240",
  wscr: "\u{1D4CC}",
  xcap: "\u22C2",
  xcirc: "\u25EF",
  xcup: "\u22C3",
  xdtri: "\u25BD",
  xfr: "\u{1D535}",
  xhArr: "\u27FA",
  xharr: "\u27F7",
  xi: "\u03BE",
  xlArr: "\u27F8",
  xlarr: "\u27F5",
  xmap: "\u27FC",
  xnis: "\u22FB",
  xodot: "\u2A00",
  xopf: "\u{1D569}",
  xoplus: "\u2A01",
  xotime: "\u2A02",
  xrArr: "\u27F9",
  xrarr: "\u27F6",
  xscr: "\u{1D4CD}",
  xsqcup: "\u2A06",
  xuplus: "\u2A04",
  xutri: "\u25B3",
  xvee: "\u22C1",
  xwedge: "\u22C0",
  yacute: "\xFD",
  yacy: "\u044F",
  ycirc: "\u0177",
  ycy: "\u044B",
  yen: "\xA5",
  yfr: "\u{1D536}",
  yicy: "\u0457",
  yopf: "\u{1D56A}",
  yscr: "\u{1D4CE}",
  yucy: "\u044E",
  yuml: "\xFF",
  zacute: "\u017A",
  zcaron: "\u017E",
  zcy: "\u0437",
  zdot: "\u017C",
  zeetrf: "\u2128",
  zeta: "\u03B6",
  zfr: "\u{1D537}",
  zhcy: "\u0436",
  zigrarr: "\u21DD",
  zopf: "\u{1D56B}",
  zscr: "\u{1D4CF}",
  zwj: "\u200D",
  zwnj: "\u200C"
};

// ../../node_modules/decode-named-character-reference/index.js
var own = {}.hasOwnProperty;
function decodeNamedCharacterReference(value) {
  return own.call(characterEntities, value) ? characterEntities[value] : false;
}

// ../../node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
var wwwPrefix = {
  tokenize: tokenizeWwwPrefix,
  partial: true
};
var domain = {
  tokenize: tokenizeDomain,
  partial: true
};
var path = {
  tokenize: tokenizePath,
  partial: true
};
var trail = {
  tokenize: tokenizeTrail,
  partial: true
};
var emailDomainDotTrail = {
  tokenize: tokenizeEmailDomainDotTrail,
  partial: true
};
var wwwAutolink = {
  name: "wwwAutolink",
  tokenize: tokenizeWwwAutolink,
  previous: previousWww
};
var protocolAutolink = {
  name: "protocolAutolink",
  tokenize: tokenizeProtocolAutolink,
  previous: previousProtocol
};
var emailAutolink = {
  name: "emailAutolink",
  tokenize: tokenizeEmailAutolink,
  previous: previousEmail
};
var text = {};
function gfmAutolinkLiteral() {
  return {
    text
  };
}
var code = 48;
while (code < 123) {
  text[code] = emailAutolink;
  code++;
  if (code === 58) code = 65;
  else if (code === 91) code = 97;
}
text[43] = emailAutolink;
text[45] = emailAutolink;
text[46] = emailAutolink;
text[95] = emailAutolink;
text[72] = [emailAutolink, protocolAutolink];
text[104] = [emailAutolink, protocolAutolink];
text[87] = [emailAutolink, wwwAutolink];
text[119] = [emailAutolink, wwwAutolink];
function tokenizeEmailAutolink(effects, ok, nok) {
  const self = this;
  let dot;
  let data;
  return start;
  function start(code18) {
    if (!gfmAtext(code18) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) {
      return nok(code18);
    }
    effects.enter("literalAutolink");
    effects.enter("literalAutolinkEmail");
    return atext(code18);
  }
  function atext(code18) {
    if (gfmAtext(code18)) {
      effects.consume(code18);
      return atext;
    }
    if (code18 === 64) {
      effects.consume(code18);
      return emailDomain;
    }
    return nok(code18);
  }
  function emailDomain(code18) {
    if (code18 === 46) {
      return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code18);
    }
    if (code18 === 45 || code18 === 95 || asciiAlphanumeric(code18)) {
      data = true;
      effects.consume(code18);
      return emailDomain;
    }
    return emailDomainAfter(code18);
  }
  function emailDomainDot(code18) {
    effects.consume(code18);
    dot = true;
    return emailDomain;
  }
  function emailDomainAfter(code18) {
    if (data && dot && asciiAlpha(self.previous)) {
      effects.exit("literalAutolinkEmail");
      effects.exit("literalAutolink");
      return ok(code18);
    }
    return nok(code18);
  }
}
function tokenizeWwwAutolink(effects, ok, nok) {
  const self = this;
  return wwwStart;
  function wwwStart(code18) {
    if (code18 !== 87 && code18 !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) {
      return nok(code18);
    }
    effects.enter("literalAutolink");
    effects.enter("literalAutolinkWww");
    return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code18);
  }
  function wwwAfter(code18) {
    effects.exit("literalAutolinkWww");
    effects.exit("literalAutolink");
    return ok(code18);
  }
}
function tokenizeProtocolAutolink(effects, ok, nok) {
  const self = this;
  let buffer = "";
  let seen = false;
  return protocolStart;
  function protocolStart(code18) {
    if ((code18 === 72 || code18 === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
      effects.enter("literalAutolink");
      effects.enter("literalAutolinkHttp");
      buffer += String.fromCodePoint(code18);
      effects.consume(code18);
      return protocolPrefixInside;
    }
    return nok(code18);
  }
  function protocolPrefixInside(code18) {
    if (asciiAlpha(code18) && buffer.length < 5) {
      buffer += String.fromCodePoint(code18);
      effects.consume(code18);
      return protocolPrefixInside;
    }
    if (code18 === 58) {
      const protocol = buffer.toLowerCase();
      if (protocol === "http" || protocol === "https") {
        effects.consume(code18);
        return protocolSlashesInside;
      }
    }
    return nok(code18);
  }
  function protocolSlashesInside(code18) {
    if (code18 === 47) {
      effects.consume(code18);
      if (seen) {
        return afterProtocol;
      }
      seen = true;
      return protocolSlashesInside;
    }
    return nok(code18);
  }
  function afterProtocol(code18) {
    return code18 === null || asciiControl(code18) || markdownLineEndingOrSpace(code18) || unicodeWhitespace(code18) || unicodePunctuation(code18) ? nok(code18) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code18);
  }
  function protocolAfter(code18) {
    effects.exit("literalAutolinkHttp");
    effects.exit("literalAutolink");
    return ok(code18);
  }
}
function tokenizeWwwPrefix(effects, ok, nok) {
  let size = 0;
  return wwwPrefixInside;
  function wwwPrefixInside(code18) {
    if ((code18 === 87 || code18 === 119) && size < 3) {
      size++;
      effects.consume(code18);
      return wwwPrefixInside;
    }
    if (code18 === 46 && size === 3) {
      effects.consume(code18);
      return wwwPrefixAfter;
    }
    return nok(code18);
  }
  function wwwPrefixAfter(code18) {
    return code18 === null ? nok(code18) : ok(code18);
  }
}
function tokenizeDomain(effects, ok, nok) {
  let underscoreInLastSegment;
  let underscoreInLastLastSegment;
  let seen;
  return domainInside;
  function domainInside(code18) {
    if (code18 === 46 || code18 === 95) {
      return effects.check(trail, domainAfter, domainAtPunctuation)(code18);
    }
    if (code18 === null || markdownLineEndingOrSpace(code18) || unicodeWhitespace(code18) || code18 !== 45 && unicodePunctuation(code18)) {
      return domainAfter(code18);
    }
    seen = true;
    effects.consume(code18);
    return domainInside;
  }
  function domainAtPunctuation(code18) {
    if (code18 === 95) {
      underscoreInLastSegment = true;
    } else {
      underscoreInLastLastSegment = underscoreInLastSegment;
      underscoreInLastSegment = void 0;
    }
    effects.consume(code18);
    return domainInside;
  }
  function domainAfter(code18) {
    if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) {
      return nok(code18);
    }
    return ok(code18);
  }
}
function tokenizePath(effects, ok) {
  let sizeOpen = 0;
  let sizeClose = 0;
  return pathInside;
  function pathInside(code18) {
    if (code18 === 40) {
      sizeOpen++;
      effects.consume(code18);
      return pathInside;
    }
    if (code18 === 41 && sizeClose < sizeOpen) {
      return pathAtPunctuation(code18);
    }
    if (code18 === 33 || code18 === 34 || code18 === 38 || code18 === 39 || code18 === 41 || code18 === 42 || code18 === 44 || code18 === 46 || code18 === 58 || code18 === 59 || code18 === 60 || code18 === 63 || code18 === 93 || code18 === 95 || code18 === 126) {
      return effects.check(trail, ok, pathAtPunctuation)(code18);
    }
    if (code18 === null || markdownLineEndingOrSpace(code18) || unicodeWhitespace(code18)) {
      return ok(code18);
    }
    effects.consume(code18);
    return pathInside;
  }
  function pathAtPunctuation(code18) {
    if (code18 === 41) {
      sizeClose++;
    }
    effects.consume(code18);
    return pathInside;
  }
}
function tokenizeTrail(effects, ok, nok) {
  return trail2;
  function trail2(code18) {
    if (code18 === 33 || code18 === 34 || code18 === 39 || code18 === 41 || code18 === 42 || code18 === 44 || code18 === 46 || code18 === 58 || code18 === 59 || code18 === 63 || code18 === 95 || code18 === 126) {
      effects.consume(code18);
      return trail2;
    }
    if (code18 === 38) {
      effects.consume(code18);
      return trailCharacterReferenceStart;
    }
    if (code18 === 93) {
      effects.consume(code18);
      return trailBracketAfter;
    }
    if (
      // `<` is an end.
      code18 === 60 || // So is whitespace.
      code18 === null || markdownLineEndingOrSpace(code18) || unicodeWhitespace(code18)
    ) {
      return ok(code18);
    }
    return nok(code18);
  }
  function trailBracketAfter(code18) {
    if (code18 === null || code18 === 40 || code18 === 91 || markdownLineEndingOrSpace(code18) || unicodeWhitespace(code18)) {
      return ok(code18);
    }
    return trail2(code18);
  }
  function trailCharacterReferenceStart(code18) {
    return asciiAlpha(code18) ? trailCharacterReferenceInside(code18) : nok(code18);
  }
  function trailCharacterReferenceInside(code18) {
    if (code18 === 59) {
      effects.consume(code18);
      return trail2;
    }
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      return trailCharacterReferenceInside;
    }
    return nok(code18);
  }
}
function tokenizeEmailDomainDotTrail(effects, ok, nok) {
  return start;
  function start(code18) {
    effects.consume(code18);
    return after;
  }
  function after(code18) {
    return asciiAlphanumeric(code18) ? nok(code18) : ok(code18);
  }
}
function previousWww(code18) {
  return code18 === null || code18 === 40 || code18 === 42 || code18 === 95 || code18 === 91 || code18 === 93 || code18 === 126 || markdownLineEndingOrSpace(code18);
}
function previousProtocol(code18) {
  return !asciiAlpha(code18);
}
function previousEmail(code18) {
  return !(code18 === 47 || gfmAtext(code18));
}
function gfmAtext(code18) {
  return code18 === 43 || code18 === 45 || code18 === 46 || code18 === 95 || asciiAlphanumeric(code18);
}
function previousUnbalanced(events) {
  let index = events.length;
  let result = false;
  while (index--) {
    const token = events[index][1];
    if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
      result = true;
      break;
    }
    if (token._gfmAutolinkLiteralWalkedInto) {
      result = false;
      break;
    }
  }
  if (events.length > 0 && !result) {
    events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
  }
  return result;
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-util-chunked/index.js
function splice(list2, start, remove, items) {
  const end = list2.length;
  let chunkStart = 0;
  let parameters;
  if (start < 0) {
    start = -start > end ? 0 : end + start;
  } else {
    start = start > end ? end : start;
  }
  remove = remove > 0 ? remove : 0;
  if (items.length < 1e4) {
    parameters = Array.from(items);
    parameters.unshift(start, remove);
    list2.splice(...parameters);
  } else {
    if (remove) list2.splice(start, remove);
    while (chunkStart < items.length) {
      parameters = items.slice(chunkStart, chunkStart + 1e4);
      parameters.unshift(start, 0);
      list2.splice(...parameters);
      chunkStart += 1e4;
      start += 1e4;
    }
  }
}
function push(list2, items) {
  if (list2.length > 0) {
    splice(list2, list2.length, 0, items);
    return list2;
  }
  return items;
}

// ../../node_modules/micromark-util-classify-character/index.js
function classifyCharacter(code18) {
  if (code18 === null || markdownLineEndingOrSpace(code18) || unicodeWhitespace(code18)) {
    return 1;
  }
  if (unicodePunctuation(code18)) {
    return 2;
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-util-resolve-all/index.js
function resolveAll(constructs2, events, context) {
  const called = [];
  let index = -1;
  while (++index < constructs2.length) {
    const resolve = constructs2[index].resolveAll;
    if (resolve && !called.includes(resolve)) {
      events = resolve(events, context);
      called.push(resolve);
    }
  }
  return events;
}

// ../../node_modules/micromark-core-commonmark/lib/attention.js
var attention = {
  name: "attention",
  resolveAll: resolveAllAttention,
  tokenize: tokenizeAttention
};
function resolveAllAttention(events, context) {
  let index = -1;
  let nextEvents;
  while (++index < events.length) {
    if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
      let open = index;
      while (open--) {
        if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && // If the markers are the same:
        context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
          if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) {
            continue;
          }
          const use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
          const start = {
            ...events[open][1].end
          };
          const end = {
            ...events[index][1].start
          };
          movePoint(start, -use);
          movePoint(end, use);
          const openingSequence = {
            type: use > 1 ? "strongSequence" : "emphasisSequence",
            start,
            end: {
              ...events[open][1].end
            }
          };
          const closingSequence = {
            type: use > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...events[index][1].start
            },
            end
          };
          const text4 = {
            type: use > 1 ? "strongText" : "emphasisText",
            start: {
              ...events[open][1].end
            },
            end: {
              ...events[index][1].start
            }
          };
          const group = {
            type: use > 1 ? "strong" : "emphasis",
            start: {
              ...openingSequence.start
            },
            end: {
              ...closingSequence.end
            }
          };
          events[open][1].end = {
            ...openingSequence.start
          };
          events[index][1].start = {
            ...closingSequence.end
          };
          nextEvents = [];
          if (events[open][1].end.offset - events[open][1].start.offset) {
            nextEvents = push(nextEvents, [["enter", events[open][1], context], ["exit", events[open][1], context]]);
          }
          nextEvents = push(nextEvents, [["enter", group, context], ["enter", openingSequence, context], ["exit", openingSequence, context], ["enter", text4, context]]);
          nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
          nextEvents = push(nextEvents, [["exit", text4, context], ["enter", closingSequence, context], ["exit", closingSequence, context], ["exit", group, context]]);
          let offset = 0;
          if (events[index][1].end.offset - events[index][1].start.offset) {
            offset = 2;
            nextEvents = push(nextEvents, [["enter", events[index][1], context], ["exit", events[index][1], context]]);
          }
          splice(events, open - 1, index - open + 3, nextEvents);
          index = open + nextEvents.length - offset - 2;
          break;
        }
      }
    }
  }
  index = -1;
  while (++index < events.length) {
    if (events[index][1].type === "attentionSequence") {
      events[index][1].type = "data";
    }
  }
  return events;
}
function tokenizeAttention(effects, ok) {
  const attentionMarkers2 = this.parser.constructs.attentionMarkers.null;
  const previous4 = this.previous;
  const before = classifyCharacter(previous4);
  let marker;
  return start;
  function start(code18) {
    marker = code18;
    effects.enter("attentionSequence");
    return inside(code18);
  }
  function inside(code18) {
    if (code18 === marker) {
      effects.consume(code18);
      return inside;
    }
    const token = effects.exit("attentionSequence");
    const after = classifyCharacter(code18);
    const open = !after || after === 2 && before || attentionMarkers2.includes(code18) && code18 !== 42 && code18 !== 95;
    const close = !before || before === 2 && after || attentionMarkers2.includes(previous4) && previous4 !== 42 && previous4 !== 95;
    token._open = Boolean(marker === 42 ? open : open && (before || !close));
    token._close = Boolean(marker === 42 ? close : close && (after || !open));
    return ok(code18);
  }
}
function movePoint(point, offset) {
  point.column += offset;
  point.offset += offset;
  point._bufferIndex += offset;
}

// ../../node_modules/micromark-core-commonmark/lib/autolink.js
var autolink = {
  name: "autolink",
  tokenize: tokenizeAutolink
};
function tokenizeAutolink(effects, ok, nok) {
  let size = 0;
  return start;
  function start(code18) {
    effects.enter("autolink");
    effects.enter("autolinkMarker");
    effects.consume(code18);
    effects.exit("autolinkMarker");
    effects.enter("autolinkProtocol");
    return open;
  }
  function open(code18) {
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      return schemeOrEmailAtext;
    }
    if (code18 === 64) {
      return nok(code18);
    }
    return emailAtext(code18);
  }
  function schemeOrEmailAtext(code18) {
    if (code18 === 43 || code18 === 45 || code18 === 46 || asciiAlphanumeric(code18)) {
      size = 1;
      return schemeInsideOrEmailAtext(code18);
    }
    return emailAtext(code18);
  }
  function schemeInsideOrEmailAtext(code18) {
    if (code18 === 58) {
      effects.consume(code18);
      size = 0;
      return urlInside;
    }
    if ((code18 === 43 || code18 === 45 || code18 === 46 || asciiAlphanumeric(code18)) && size++ < 32) {
      effects.consume(code18);
      return schemeInsideOrEmailAtext;
    }
    size = 0;
    return emailAtext(code18);
  }
  function urlInside(code18) {
    if (code18 === 62) {
      effects.exit("autolinkProtocol");
      effects.enter("autolinkMarker");
      effects.consume(code18);
      effects.exit("autolinkMarker");
      effects.exit("autolink");
      return ok;
    }
    if (code18 === null || code18 === 32 || code18 === 60 || asciiControl(code18)) {
      return nok(code18);
    }
    effects.consume(code18);
    return urlInside;
  }
  function emailAtext(code18) {
    if (code18 === 64) {
      effects.consume(code18);
      return emailAtSignOrDot;
    }
    if (asciiAtext(code18)) {
      effects.consume(code18);
      return emailAtext;
    }
    return nok(code18);
  }
  function emailAtSignOrDot(code18) {
    return asciiAlphanumeric(code18) ? emailLabel(code18) : nok(code18);
  }
  function emailLabel(code18) {
    if (code18 === 46) {
      effects.consume(code18);
      size = 0;
      return emailAtSignOrDot;
    }
    if (code18 === 62) {
      effects.exit("autolinkProtocol").type = "autolinkEmail";
      effects.enter("autolinkMarker");
      effects.consume(code18);
      effects.exit("autolinkMarker");
      effects.exit("autolink");
      return ok;
    }
    return emailValue(code18);
  }
  function emailValue(code18) {
    if ((code18 === 45 || asciiAlphanumeric(code18)) && size++ < 63) {
      const next = code18 === 45 ? emailValue : emailLabel;
      effects.consume(code18);
      return next;
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/blank-line.js
var blankLine = {
  partial: true,
  tokenize: tokenizeBlankLine
};
function tokenizeBlankLine(effects, ok, nok) {
  return start;
  function start(code18) {
    return markdownSpace(code18) ? factorySpace(effects, after, "linePrefix")(code18) : after(code18);
  }
  function after(code18) {
    return code18 === null || markdownLineEnding(code18) ? ok(code18) : nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/block-quote.js
var blockQuote = {
  continuation: {
    tokenize: tokenizeBlockQuoteContinuation
  },
  exit,
  name: "blockQuote",
  tokenize: tokenizeBlockQuoteStart
};
function tokenizeBlockQuoteStart(effects, ok, nok) {
  const self = this;
  return start;
  function start(code18) {
    if (code18 === 62) {
      const state = self.containerState;
      if (!state.open) {
        effects.enter("blockQuote", {
          _container: true
        });
        state.open = true;
      }
      effects.enter("blockQuotePrefix");
      effects.enter("blockQuoteMarker");
      effects.consume(code18);
      effects.exit("blockQuoteMarker");
      return after;
    }
    return nok(code18);
  }
  function after(code18) {
    if (markdownSpace(code18)) {
      effects.enter("blockQuotePrefixWhitespace");
      effects.consume(code18);
      effects.exit("blockQuotePrefixWhitespace");
      effects.exit("blockQuotePrefix");
      return ok;
    }
    effects.exit("blockQuotePrefix");
    return ok(code18);
  }
}
function tokenizeBlockQuoteContinuation(effects, ok, nok) {
  const self = this;
  return contStart;
  function contStart(code18) {
    if (markdownSpace(code18)) {
      return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code18);
    }
    return contBefore(code18);
  }
  function contBefore(code18) {
    return effects.attempt(blockQuote, ok, nok)(code18);
  }
}
function exit(effects) {
  effects.exit("blockQuote");
}

// ../../node_modules/micromark-core-commonmark/lib/character-escape.js
var characterEscape = {
  name: "characterEscape",
  tokenize: tokenizeCharacterEscape
};
function tokenizeCharacterEscape(effects, ok, nok) {
  return start;
  function start(code18) {
    effects.enter("characterEscape");
    effects.enter("escapeMarker");
    effects.consume(code18);
    effects.exit("escapeMarker");
    return inside;
  }
  function inside(code18) {
    if (asciiPunctuation(code18)) {
      effects.enter("characterEscapeValue");
      effects.consume(code18);
      effects.exit("characterEscapeValue");
      effects.exit("characterEscape");
      return ok;
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/character-reference.js
var characterReference = {
  name: "characterReference",
  tokenize: tokenizeCharacterReference
};
function tokenizeCharacterReference(effects, ok, nok) {
  const self = this;
  let size = 0;
  let max;
  let test;
  return start;
  function start(code18) {
    effects.enter("characterReference");
    effects.enter("characterReferenceMarker");
    effects.consume(code18);
    effects.exit("characterReferenceMarker");
    return open;
  }
  function open(code18) {
    if (code18 === 35) {
      effects.enter("characterReferenceMarkerNumeric");
      effects.consume(code18);
      effects.exit("characterReferenceMarkerNumeric");
      return numeric;
    }
    effects.enter("characterReferenceValue");
    max = 31;
    test = asciiAlphanumeric;
    return value(code18);
  }
  function numeric(code18) {
    if (code18 === 88 || code18 === 120) {
      effects.enter("characterReferenceMarkerHexadecimal");
      effects.consume(code18);
      effects.exit("characterReferenceMarkerHexadecimal");
      effects.enter("characterReferenceValue");
      max = 6;
      test = asciiHexDigit;
      return value;
    }
    effects.enter("characterReferenceValue");
    max = 7;
    test = asciiDigit;
    return value(code18);
  }
  function value(code18) {
    if (code18 === 59 && size) {
      const token = effects.exit("characterReferenceValue");
      if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) {
        return nok(code18);
      }
      effects.enter("characterReferenceMarker");
      effects.consume(code18);
      effects.exit("characterReferenceMarker");
      effects.exit("characterReference");
      return ok;
    }
    if (test(code18) && size++ < max) {
      effects.consume(code18);
      return value;
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/partial-non-lazy-continuation.js
var nonLazyContinuation = {
  partial: true,
  tokenize: tokenizeNonLazyContinuation
};
function tokenizeNonLazyContinuation(effects, ok, nok) {
  const self = this;
  return start;
  function start(code18) {
    if (code18 === null) {
      return nok(code18);
    }
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return after;
  }
  function after(code18) {
    return self.parser.lazy[self.now().line] ? nok(code18) : ok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/code-fenced.js
var codeFenced = {
  concrete: true,
  name: "codeFenced",
  tokenize: tokenizeCodeFenced
};
function tokenizeCodeFenced(effects, ok, nok) {
  const self = this;
  const closeStart = {
    partial: true,
    tokenize: tokenizeCloseStart
  };
  let initialPrefix = 0;
  let sizeOpen = 0;
  let marker;
  return start;
  function start(code18) {
    return beforeSequenceOpen(code18);
  }
  function beforeSequenceOpen(code18) {
    const tail = self.events[self.events.length - 1];
    initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
    marker = code18;
    effects.enter("codeFenced");
    effects.enter("codeFencedFence");
    effects.enter("codeFencedFenceSequence");
    return sequenceOpen(code18);
  }
  function sequenceOpen(code18) {
    if (code18 === marker) {
      sizeOpen++;
      effects.consume(code18);
      return sequenceOpen;
    }
    if (sizeOpen < 3) {
      return nok(code18);
    }
    effects.exit("codeFencedFenceSequence");
    return markdownSpace(code18) ? factorySpace(effects, infoBefore, "whitespace")(code18) : infoBefore(code18);
  }
  function infoBefore(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("codeFencedFence");
      return self.interrupt ? ok(code18) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code18);
    }
    effects.enter("codeFencedFenceInfo");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return info(code18);
  }
  function info(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceInfo");
      return infoBefore(code18);
    }
    if (markdownSpace(code18)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceInfo");
      return factorySpace(effects, metaBefore, "whitespace")(code18);
    }
    if (code18 === 96 && code18 === marker) {
      return nok(code18);
    }
    effects.consume(code18);
    return info;
  }
  function metaBefore(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      return infoBefore(code18);
    }
    effects.enter("codeFencedFenceMeta");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return meta(code18);
  }
  function meta(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceMeta");
      return infoBefore(code18);
    }
    if (code18 === 96 && code18 === marker) {
      return nok(code18);
    }
    effects.consume(code18);
    return meta;
  }
  function atNonLazyBreak(code18) {
    return effects.attempt(closeStart, after, contentBefore)(code18);
  }
  function contentBefore(code18) {
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return contentStart;
  }
  function contentStart(code18) {
    return initialPrefix > 0 && markdownSpace(code18) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code18) : beforeContentChunk(code18);
  }
  function beforeContentChunk(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code18);
    }
    effects.enter("codeFlowValue");
    return contentChunk(code18);
  }
  function contentChunk(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("codeFlowValue");
      return beforeContentChunk(code18);
    }
    effects.consume(code18);
    return contentChunk;
  }
  function after(code18) {
    effects.exit("codeFenced");
    return ok(code18);
  }
  function tokenizeCloseStart(effects2, ok2, nok2) {
    let size = 0;
    return startBefore;
    function startBefore(code18) {
      effects2.enter("lineEnding");
      effects2.consume(code18);
      effects2.exit("lineEnding");
      return start2;
    }
    function start2(code18) {
      effects2.enter("codeFencedFence");
      return markdownSpace(code18) ? factorySpace(effects2, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code18) : beforeSequenceClose(code18);
    }
    function beforeSequenceClose(code18) {
      if (code18 === marker) {
        effects2.enter("codeFencedFenceSequence");
        return sequenceClose(code18);
      }
      return nok2(code18);
    }
    function sequenceClose(code18) {
      if (code18 === marker) {
        size++;
        effects2.consume(code18);
        return sequenceClose;
      }
      if (size >= sizeOpen) {
        effects2.exit("codeFencedFenceSequence");
        return markdownSpace(code18) ? factorySpace(effects2, sequenceCloseAfter, "whitespace")(code18) : sequenceCloseAfter(code18);
      }
      return nok2(code18);
    }
    function sequenceCloseAfter(code18) {
      if (code18 === null || markdownLineEnding(code18)) {
        effects2.exit("codeFencedFence");
        return ok2(code18);
      }
      return nok2(code18);
    }
  }
}

// ../../node_modules/micromark-core-commonmark/lib/code-indented.js
var codeIndented = {
  name: "codeIndented",
  tokenize: tokenizeCodeIndented
};
var furtherStart = {
  partial: true,
  tokenize: tokenizeFurtherStart
};
function tokenizeCodeIndented(effects, ok, nok) {
  return start;
  function start(code18) {
    effects.enter("codeIndented");
    return factorySpaceMinMax(effects, atBreak, nok, "linePrefix", 4, 4)(code18);
  }
  function atBreak(code18) {
    if (code18 === null) {
      return after(code18);
    }
    if (markdownLineEnding(code18)) {
      return effects.attempt(furtherStart, atBreak, after)(code18);
    }
    effects.enter("codeFlowValue");
    return inside(code18);
  }
  function inside(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("codeFlowValue");
      return atBreak(code18);
    }
    effects.consume(code18);
    return inside;
  }
  function after(code18) {
    effects.exit("codeIndented");
    return ok(code18);
  }
}
function tokenizeFurtherStart(effects, ok, nok) {
  const self = this;
  return furtherStart2;
  function furtherStart2(code18) {
    if (self.parser.lazy[self.now().line]) {
      return nok(code18);
    }
    if (markdownLineEnding(code18)) {
      effects.enter("lineEnding");
      effects.consume(code18);
      effects.exit("lineEnding");
      return furtherStart2;
    }
    return factorySpaceMinMax(effects, ok, onNotEnoughPrefix, "linePrefix", 4, 4)(code18);
  }
  function onNotEnoughPrefix(code18) {
    return markdownLineEnding(code18) ? furtherStart2(code18) : nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/code-text.js
var codeText = {
  name: "codeText",
  previous: previous2,
  resolve: resolveCodeText,
  tokenize: tokenizeCodeText
};
function resolveCodeText(events) {
  let tailExitIndex = events.length - 4;
  let headEnterIndex = 3;
  let index;
  let enter;
  if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
    index = headEnterIndex;
    while (++index < tailExitIndex) {
      if (events[index][1].type === "codeTextData") {
        events[headEnterIndex][1].type = "codeTextPadding";
        events[tailExitIndex][1].type = "codeTextPadding";
        headEnterIndex += 2;
        tailExitIndex -= 2;
        break;
      }
    }
  }
  index = headEnterIndex - 1;
  tailExitIndex++;
  while (++index <= tailExitIndex) {
    if (enter === void 0) {
      if (index !== tailExitIndex && events[index][1].type !== "lineEnding") {
        enter = index;
      }
    } else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
      events[enter][1].type = "codeTextData";
      if (index !== enter + 2) {
        events[enter][1].end = events[index - 1][1].end;
        events.splice(enter + 2, index - enter - 2);
        tailExitIndex -= index - enter - 2;
        index = enter + 2;
      }
      enter = void 0;
    }
  }
  return events;
}
function previous2(code18) {
  return code18 !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function tokenizeCodeText(effects, ok, nok) {
  const self = this;
  let sizeOpen = 0;
  let size;
  let token;
  return start;
  function start(code18) {
    effects.enter("codeText");
    effects.enter("codeTextSequence");
    return sequenceOpen(code18);
  }
  function sequenceOpen(code18) {
    if (code18 === 96) {
      effects.consume(code18);
      sizeOpen++;
      return sequenceOpen;
    }
    effects.exit("codeTextSequence");
    return between(code18);
  }
  function between(code18) {
    if (code18 === null) {
      return nok(code18);
    }
    if (code18 === 32) {
      effects.enter("space");
      effects.consume(code18);
      effects.exit("space");
      return between;
    }
    if (code18 === 96) {
      token = effects.enter("codeTextSequence");
      size = 0;
      return sequenceClose(code18);
    }
    if (markdownLineEnding(code18)) {
      effects.enter("lineEnding");
      effects.consume(code18);
      effects.exit("lineEnding");
      return between;
    }
    effects.enter("codeTextData");
    return data(code18);
  }
  function data(code18) {
    if (code18 === null || code18 === 32 || code18 === 96 || markdownLineEnding(code18)) {
      effects.exit("codeTextData");
      return between(code18);
    }
    effects.consume(code18);
    return data;
  }
  function sequenceClose(code18) {
    if (code18 === 96) {
      effects.consume(code18);
      size++;
      return sequenceClose;
    }
    if (size === sizeOpen) {
      effects.exit("codeTextSequence");
      effects.exit("codeText");
      return ok(code18);
    }
    token.type = "codeTextData";
    return data(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-util-subtokenize/lib/splice-buffer.js
var SpliceBuffer = class {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(initial) {
    this.left = initial ? [...initial] : [];
    this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(index) {
    if (index < 0 || index >= this.left.length + this.right.length) {
      throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    }
    if (index < this.left.length) return this.left[index];
    return this.right[this.right.length - index + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    this.setCursor(0);
    return this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(start, end) {
    const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
    if (stop < this.left.length) {
      return this.left.slice(start, stop);
    }
    if (start > this.left.length) {
      return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
    }
    return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(start, deleteCount, items) {
    const count = deleteCount || 0;
    this.setCursor(Math.trunc(start));
    const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
    if (items) chunkedPush(this.left, items);
    return removed.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    this.setCursor(Number.POSITIVE_INFINITY);
    return this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(item) {
    this.setCursor(Number.POSITIVE_INFINITY);
    this.left.push(item);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(items) {
    this.setCursor(Number.POSITIVE_INFINITY);
    chunkedPush(this.left, items);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(item) {
    this.setCursor(0);
    this.right.push(item);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(items) {
    this.setCursor(0);
    chunkedPush(this.right, items.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(n) {
    if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
    if (n < this.left.length) {
      const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
      chunkedPush(this.right, removed.reverse());
    } else {
      const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
      chunkedPush(this.left, removed.reverse());
    }
  }
};
function chunkedPush(list2, right) {
  let chunkStart = 0;
  if (right.length < 1e4) {
    list2.push(...right);
  } else {
    while (chunkStart < right.length) {
      list2.push(...right.slice(chunkStart, chunkStart + 1e4));
      chunkStart += 1e4;
    }
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-util-subtokenize/index.js
function subtokenize(eventsArray) {
  const jumps = {};
  let index = -1;
  let event;
  let lineIndex;
  let otherIndex;
  let otherEvent;
  let parameters;
  let subevents;
  let more;
  const events = new SpliceBuffer(eventsArray);
  while (++index < events.length) {
    while (index in jumps) {
      index = jumps[index];
    }
    event = events.get(index);
    if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
      subevents = event[1]._tokenizer.events;
      otherIndex = 0;
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") {
        otherIndex += 2;
      }
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") {
        while (++otherIndex < subevents.length) {
          if (subevents[otherIndex][1].type === "content") {
            break;
          }
          if (subevents[otherIndex][1].type === "chunkText") {
            subevents[otherIndex][1]._isInFirstContentOfListItem = true;
            otherIndex++;
          }
        }
      }
    }
    if (event[0] === "enter") {
      if (event[1].contentType) {
        Object.assign(jumps, subcontent(events, index));
        index = jumps[index];
        more = true;
      }
    } else if (event[1]._container) {
      otherIndex = index;
      lineIndex = void 0;
      while (otherIndex--) {
        otherEvent = events.get(otherIndex);
        if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
          if (otherEvent[0] === "enter") {
            if (lineIndex) {
              events.get(lineIndex)[1].type = "lineEndingBlank";
            }
            otherEvent[1].type = "lineEnding";
            lineIndex = otherIndex;
          }
        } else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {
        } else {
          break;
        }
      }
      if (lineIndex) {
        event[1].end = {
          ...events.get(lineIndex)[1].start
        };
        parameters = events.slice(lineIndex, index);
        parameters.unshift(event);
        events.splice(lineIndex, index - lineIndex + 1, parameters);
      }
    }
  }
  splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
  return !more;
}
function subcontent(events, eventIndex) {
  const token = events.get(eventIndex)[1];
  const context = events.get(eventIndex)[2];
  let startPosition = eventIndex - 1;
  const startPositions = [];
  let tokenizer = token._tokenizer;
  if (!tokenizer) {
    tokenizer = context.parser[token.contentType](token.start);
    if (token._contentTypeTextTrailing) {
      tokenizer._contentTypeTextTrailing = true;
    }
  }
  const childEvents = tokenizer.events;
  const jumps = [];
  const gaps = {};
  let stream;
  let previous4;
  let index = -1;
  let current = token;
  let adjust = 0;
  let start = 0;
  const breaks = [start];
  while (current) {
    while (events.get(++startPosition)[1] !== current) {
    }
    startPositions.push(startPosition);
    if (!current._tokenizer) {
      stream = context.sliceStream(current);
      if (!current.next) {
        stream.push(null);
      }
      if (previous4) {
        tokenizer.defineSkip(current.start);
      }
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = true;
      }
      tokenizer.write(stream);
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = void 0;
      }
    }
    previous4 = current;
    current = current.next;
  }
  current = token;
  while (++index < childEvents.length) {
    if (
      // Find a void token that includes a break.
      childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line
    ) {
      start = index + 1;
      breaks.push(start);
      current._tokenizer = void 0;
      current.previous = void 0;
      current = current.next;
    }
  }
  tokenizer.events = [];
  if (current) {
    current._tokenizer = void 0;
    current.previous = void 0;
  } else {
    breaks.pop();
  }
  index = breaks.length;
  while (index--) {
    const slice = childEvents.slice(breaks[index], breaks[index + 1]);
    const start2 = startPositions.pop();
    jumps.push([start2, start2 + slice.length - 1]);
    events.splice(start2, 2, slice);
  }
  jumps.reverse();
  index = -1;
  while (++index < jumps.length) {
    gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
    adjust += jumps[index][1] - jumps[index][0] - 1;
  }
  return gaps;
}

// ../../node_modules/micromark-core-commonmark/lib/content.js
var content = {
  resolve: resolveContent,
  tokenize: tokenizeContent
};
var continuationConstruct = {
  partial: true,
  tokenize: tokenizeContinuation
};
function resolveContent(events) {
  subtokenize(events);
  return events;
}
function tokenizeContent(effects, ok) {
  let previous4;
  return chunkStart;
  function chunkStart(code18) {
    effects.enter("content");
    previous4 = effects.enter("chunkContent", {
      contentType: "content"
    });
    return chunkInside(code18);
  }
  function chunkInside(code18) {
    if (code18 === null) {
      return contentEnd(code18);
    }
    if (markdownLineEnding(code18)) {
      return effects.check(continuationConstruct, contentContinue, contentEnd)(code18);
    }
    effects.consume(code18);
    return chunkInside;
  }
  function contentEnd(code18) {
    effects.exit("chunkContent");
    effects.exit("content");
    return ok(code18);
  }
  function contentContinue(code18) {
    effects.consume(code18);
    effects.exit("chunkContent");
    previous4.next = effects.enter("chunkContent", {
      contentType: "content",
      previous: previous4
    });
    previous4 = previous4.next;
    return chunkInside;
  }
}
function tokenizeContinuation(effects, ok, nok) {
  const self = this;
  return startLookahead;
  function startLookahead(code18) {
    effects.exit("chunkContent");
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return factorySpace(effects, prefixed, "linePrefix");
  }
  function prefixed(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      return nok(code18);
    }
    const tail = self.events[self.events.length - 1];
    if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) {
      return ok(code18);
    }
    return effects.interrupt(self.parser.constructs.flow, nok, ok)(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-factory-destination/index.js
function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
  const limit = max || Number.POSITIVE_INFINITY;
  let balance = 0;
  return start;
  function start(code18) {
    if (code18 === 60) {
      effects.enter(type);
      effects.enter(literalType);
      effects.enter(literalMarkerType);
      effects.consume(code18);
      effects.exit(literalMarkerType);
      return enclosedBefore;
    }
    if (code18 === null || code18 === 32 || code18 === 41 || asciiControl(code18)) {
      return nok(code18);
    }
    effects.enter(type);
    effects.enter(rawType);
    effects.enter(stringType);
    effects.enter("chunkString", {
      contentType: "string"
    });
    return raw(code18);
  }
  function enclosedBefore(code18) {
    if (code18 === 62) {
      effects.enter(literalMarkerType);
      effects.consume(code18);
      effects.exit(literalMarkerType);
      effects.exit(literalType);
      effects.exit(type);
      return ok;
    }
    effects.enter(stringType);
    effects.enter("chunkString", {
      contentType: "string"
    });
    return enclosed(code18);
  }
  function enclosed(code18) {
    if (code18 === 62) {
      effects.exit("chunkString");
      effects.exit(stringType);
      return enclosedBefore(code18);
    }
    if (code18 === null || code18 === 60 || markdownLineEnding(code18)) {
      return nok(code18);
    }
    effects.consume(code18);
    return code18 === 92 ? enclosedEscape : enclosed;
  }
  function enclosedEscape(code18) {
    if (code18 === 60 || code18 === 62 || code18 === 92) {
      effects.consume(code18);
      return enclosed;
    }
    return enclosed(code18);
  }
  function raw(code18) {
    if (!balance && (code18 === null || code18 === 41 || markdownLineEndingOrSpace(code18))) {
      effects.exit("chunkString");
      effects.exit(stringType);
      effects.exit(rawType);
      effects.exit(type);
      return ok(code18);
    }
    if (balance < limit && code18 === 40) {
      effects.consume(code18);
      balance++;
      return raw;
    }
    if (code18 === 41) {
      effects.consume(code18);
      balance--;
      return raw;
    }
    if (code18 === null || code18 === 32 || code18 === 40 || asciiControl(code18)) {
      return nok(code18);
    }
    effects.consume(code18);
    return code18 === 92 ? rawEscape : raw;
  }
  function rawEscape(code18) {
    if (code18 === 40 || code18 === 41 || code18 === 92) {
      effects.consume(code18);
      return raw;
    }
    return raw(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-factory-label/index.js
function factoryLabel2(effects, ok, nok, type, markerType, stringType) {
  const self = this;
  let size = 0;
  let seen;
  return start;
  function start(code18) {
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code18);
    effects.exit(markerType);
    effects.enter(stringType);
    return atBreak;
  }
  function atBreak(code18) {
    if (size > 999 || code18 === null || code18 === 91 || code18 === 93 && !seen || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    code18 === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) {
      return nok(code18);
    }
    if (code18 === 93) {
      effects.exit(stringType);
      effects.enter(markerType);
      effects.consume(code18);
      effects.exit(markerType);
      effects.exit(type);
      return ok;
    }
    if (markdownLineEnding(code18)) {
      effects.enter("lineEnding");
      effects.consume(code18);
      effects.exit("lineEnding");
      return atBreak;
    }
    effects.enter("chunkString", {
      contentType: "string"
    });
    return labelInside(code18);
  }
  function labelInside(code18) {
    if (code18 === null || code18 === 91 || code18 === 93 || markdownLineEnding(code18) || size++ > 999) {
      effects.exit("chunkString");
      return atBreak(code18);
    }
    effects.consume(code18);
    if (!seen) seen = !markdownSpace(code18);
    return code18 === 92 ? labelEscape : labelInside;
  }
  function labelEscape(code18) {
    if (code18 === 91 || code18 === 92 || code18 === 93) {
      effects.consume(code18);
      size++;
      return labelInside;
    }
    return labelInside(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-factory-title/index.js
function factoryTitle(effects, ok, nok, type, markerType, stringType) {
  let marker;
  return start;
  function start(code18) {
    if (code18 === 34 || code18 === 39 || code18 === 40) {
      effects.enter(type);
      effects.enter(markerType);
      effects.consume(code18);
      effects.exit(markerType);
      marker = code18 === 40 ? 41 : code18;
      return begin;
    }
    return nok(code18);
  }
  function begin(code18) {
    if (code18 === marker) {
      effects.enter(markerType);
      effects.consume(code18);
      effects.exit(markerType);
      effects.exit(type);
      return ok;
    }
    effects.enter(stringType);
    return atBreak(code18);
  }
  function atBreak(code18) {
    if (code18 === marker) {
      effects.exit(stringType);
      return begin(marker);
    }
    if (code18 === null) {
      return nok(code18);
    }
    if (markdownLineEnding(code18)) {
      effects.enter("lineEnding");
      effects.consume(code18);
      effects.exit("lineEnding");
      return factorySpace(effects, atBreak, "linePrefix");
    }
    effects.enter("chunkString", {
      contentType: "string"
    });
    return inside(code18);
  }
  function inside(code18) {
    if (code18 === marker || code18 === null || markdownLineEnding(code18)) {
      effects.exit("chunkString");
      return atBreak(code18);
    }
    effects.consume(code18);
    return code18 === 92 ? escape : inside;
  }
  function escape(code18) {
    if (code18 === marker || code18 === 92) {
      effects.consume(code18);
      return inside;
    }
    return inside(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/node_modules/micromark-util-normalize-identifier/index.js
function normalizeIdentifier(value) {
  return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}

// ../../node_modules/micromark-core-commonmark/lib/definition.js
var definition = {
  name: "definition",
  tokenize: tokenizeDefinition
};
var titleBefore = {
  partial: true,
  tokenize: tokenizeTitleBefore
};
function tokenizeDefinition(effects, ok, nok) {
  const self = this;
  let identifier;
  return start;
  function start(code18) {
    effects.enter("definition");
    return before(code18);
  }
  function before(code18) {
    return factoryLabel2.call(
      self,
      effects,
      labelAfter,
      // Note: we don’t need to reset the way `markdown-rs` does.
      nok,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(code18);
  }
  function labelAfter(code18) {
    identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
    if (code18 === 58) {
      effects.enter("definitionMarker");
      effects.consume(code18);
      effects.exit("definitionMarker");
      return markerAfter;
    }
    return nok(code18);
  }
  function markerAfter(code18) {
    return markdownLineEndingOrSpace(code18) ? factoryWhitespace(effects, destinationBefore)(code18) : destinationBefore(code18);
  }
  function destinationBefore(code18) {
    return factoryDestination(
      effects,
      destinationAfter,
      // Note: we don’t need to reset the way `markdown-rs` does.
      nok,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(code18);
  }
  function destinationAfter(code18) {
    return effects.attempt(titleBefore, after, after)(code18);
  }
  function after(code18) {
    return markdownSpace(code18) ? factorySpace(effects, afterWhitespace, "whitespace")(code18) : afterWhitespace(code18);
  }
  function afterWhitespace(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("definition");
      self.parser.defined.push(identifier);
      return ok(code18);
    }
    return nok(code18);
  }
}
function tokenizeTitleBefore(effects, ok, nok) {
  return titleBefore2;
  function titleBefore2(code18) {
    return markdownLineEndingOrSpace(code18) ? factoryWhitespace(effects, beforeMarker)(code18) : nok(code18);
  }
  function beforeMarker(code18) {
    return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code18);
  }
  function titleAfter(code18) {
    return markdownSpace(code18) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code18) : titleAfterOptionalWhitespace(code18);
  }
  function titleAfterOptionalWhitespace(code18) {
    return code18 === null || markdownLineEnding(code18) ? ok(code18) : nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/hard-break-escape.js
var hardBreakEscape = {
  name: "hardBreakEscape",
  tokenize: tokenizeHardBreakEscape
};
function tokenizeHardBreakEscape(effects, ok, nok) {
  return start;
  function start(code18) {
    effects.enter("hardBreakEscape");
    effects.consume(code18);
    return after;
  }
  function after(code18) {
    if (markdownLineEnding(code18)) {
      effects.exit("hardBreakEscape");
      return ok(code18);
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/heading-atx.js
var headingAtx = {
  name: "headingAtx",
  resolve: resolveHeadingAtx,
  tokenize: tokenizeHeadingAtx
};
function resolveHeadingAtx(events, context) {
  let contentEnd = events.length - 2;
  let contentStart = 3;
  if (events[contentStart][1].type === "whitespace") {
    contentStart += 2;
  }
  if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") {
    contentEnd -= 2;
  }
  if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) {
    contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
  }
  if (contentEnd > contentStart) {
    const content3 = {
      type: "atxHeadingText",
      start: events[contentStart][1].start,
      end: events[contentEnd][1].end
    };
    const text4 = {
      type: "chunkText",
      start: events[contentStart][1].start,
      end: events[contentEnd][1].end,
      contentType: "text"
    };
    splice(events, contentStart, contentEnd - contentStart + 1, [["enter", content3, context], ["enter", text4, context], ["exit", text4, context], ["exit", content3, context]]);
  }
  return events;
}
function tokenizeHeadingAtx(effects, ok, nok) {
  let size = 0;
  return start;
  function start(code18) {
    effects.enter("atxHeading");
    return before(code18);
  }
  function before(code18) {
    effects.enter("atxHeadingSequence");
    return sequenceOpen(code18);
  }
  function sequenceOpen(code18) {
    if (code18 === 35 && size++ < 6) {
      effects.consume(code18);
      return sequenceOpen;
    }
    if (code18 === null || markdownLineEndingOrSpace(code18)) {
      effects.exit("atxHeadingSequence");
      return atBreak(code18);
    }
    return nok(code18);
  }
  function atBreak(code18) {
    if (code18 === 35) {
      effects.enter("atxHeadingSequence");
      return sequenceFurther(code18);
    }
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("atxHeading");
      return ok(code18);
    }
    if (markdownSpace(code18)) {
      return factorySpace(effects, atBreak, "whitespace")(code18);
    }
    effects.enter("atxHeadingText");
    return data(code18);
  }
  function sequenceFurther(code18) {
    if (code18 === 35) {
      effects.consume(code18);
      return sequenceFurther;
    }
    effects.exit("atxHeadingSequence");
    return atBreak(code18);
  }
  function data(code18) {
    if (code18 === null || code18 === 35 || markdownLineEndingOrSpace(code18)) {
      effects.exit("atxHeadingText");
      return atBreak(code18);
    }
    effects.consume(code18);
    return data;
  }
}

// ../../node_modules/micromark-util-html-tag-name/index.js
var htmlBlockNames = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];
var htmlRawNames = ["pre", "script", "style", "textarea"];

// ../../node_modules/micromark-core-commonmark/lib/html-flow.js
var htmlFlow = {
  concrete: true,
  name: "htmlFlow",
  resolveTo: resolveToHtmlFlow,
  tokenize: tokenizeHtmlFlow
};
var blankLineBefore = {
  partial: true,
  tokenize: tokenizeBlankLineBefore
};
function resolveToHtmlFlow(events) {
  let index = events.length;
  while (index--) {
    if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") {
      break;
    }
  }
  if (index > 1 && events[index - 2][1].type === "linePrefix") {
    events[index][1].start = events[index - 2][1].start;
    events[index + 1][1].start = events[index - 2][1].start;
    events.splice(index - 2, 2);
  }
  return events;
}
function tokenizeHtmlFlow(effects, ok, nok) {
  const self = this;
  let marker;
  let closingTag;
  let buffer;
  let index;
  let markerB;
  return start;
  function start(code18) {
    return before(code18);
  }
  function before(code18) {
    effects.enter("htmlFlow");
    effects.enter("htmlFlowData");
    effects.consume(code18);
    return open;
  }
  function open(code18) {
    if (code18 === 33) {
      effects.consume(code18);
      return declarationOpen;
    }
    if (code18 === 47) {
      effects.consume(code18);
      closingTag = true;
      return tagCloseStart;
    }
    if (code18 === 63) {
      effects.consume(code18);
      marker = 3;
      return self.interrupt ? ok : continuationDeclarationInside;
    }
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      buffer = String.fromCharCode(code18);
      return tagName;
    }
    return nok(code18);
  }
  function declarationOpen(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      marker = 2;
      return commentOpenInside;
    }
    if (code18 === 91) {
      effects.consume(code18);
      marker = 5;
      index = 0;
      return cdataOpenInside;
    }
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      marker = 4;
      return self.interrupt ? ok : continuationDeclarationInside;
    }
    return nok(code18);
  }
  function commentOpenInside(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      return self.interrupt ? ok : continuationDeclarationInside;
    }
    return nok(code18);
  }
  function cdataOpenInside(code18) {
    const value = "CDATA[";
    if (code18 === value.charCodeAt(index++)) {
      effects.consume(code18);
      if (index === value.length) {
        return self.interrupt ? ok : continuation;
      }
      return cdataOpenInside;
    }
    return nok(code18);
  }
  function tagCloseStart(code18) {
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      buffer = String.fromCharCode(code18);
      return tagName;
    }
    return nok(code18);
  }
  function tagName(code18) {
    if (code18 === null || code18 === 47 || code18 === 62 || markdownLineEndingOrSpace(code18)) {
      const slash = code18 === 47;
      const name = buffer.toLowerCase();
      if (!slash && !closingTag && htmlRawNames.includes(name)) {
        marker = 1;
        return self.interrupt ? ok(code18) : continuation(code18);
      }
      if (htmlBlockNames.includes(buffer.toLowerCase())) {
        marker = 6;
        if (slash) {
          effects.consume(code18);
          return basicSelfClosing;
        }
        return self.interrupt ? ok(code18) : continuation(code18);
      }
      marker = 7;
      return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code18) : closingTag ? completeClosingTagAfter(code18) : completeAttributeNameBefore(code18);
    }
    if (code18 === 45 || asciiAlphanumeric(code18)) {
      effects.consume(code18);
      buffer += String.fromCharCode(code18);
      return tagName;
    }
    return nok(code18);
  }
  function basicSelfClosing(code18) {
    if (code18 === 62) {
      effects.consume(code18);
      return self.interrupt ? ok : continuation;
    }
    return nok(code18);
  }
  function completeClosingTagAfter(code18) {
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return completeClosingTagAfter;
    }
    return completeEnd(code18);
  }
  function completeAttributeNameBefore(code18) {
    if (code18 === 47) {
      effects.consume(code18);
      return completeEnd;
    }
    if (code18 === 58 || code18 === 95 || asciiAlpha(code18)) {
      effects.consume(code18);
      return completeAttributeName;
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return completeAttributeNameBefore;
    }
    return completeEnd(code18);
  }
  function completeAttributeName(code18) {
    if (code18 === 45 || code18 === 46 || code18 === 58 || code18 === 95 || asciiAlphanumeric(code18)) {
      effects.consume(code18);
      return completeAttributeName;
    }
    return completeAttributeNameAfter(code18);
  }
  function completeAttributeNameAfter(code18) {
    if (code18 === 61) {
      effects.consume(code18);
      return completeAttributeValueBefore;
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return completeAttributeNameAfter;
    }
    return completeAttributeNameBefore(code18);
  }
  function completeAttributeValueBefore(code18) {
    if (code18 === null || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96) {
      return nok(code18);
    }
    if (code18 === 34 || code18 === 39) {
      effects.consume(code18);
      markerB = code18;
      return completeAttributeValueQuoted;
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return completeAttributeValueBefore;
    }
    return completeAttributeValueUnquoted(code18);
  }
  function completeAttributeValueQuoted(code18) {
    if (code18 === markerB) {
      effects.consume(code18);
      markerB = null;
      return completeAttributeValueQuotedAfter;
    }
    if (code18 === null || markdownLineEnding(code18)) {
      return nok(code18);
    }
    effects.consume(code18);
    return completeAttributeValueQuoted;
  }
  function completeAttributeValueUnquoted(code18) {
    if (code18 === null || code18 === 34 || code18 === 39 || code18 === 47 || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96 || markdownLineEndingOrSpace(code18)) {
      return completeAttributeNameAfter(code18);
    }
    effects.consume(code18);
    return completeAttributeValueUnquoted;
  }
  function completeAttributeValueQuotedAfter(code18) {
    if (code18 === 47 || code18 === 62 || markdownSpace(code18)) {
      return completeAttributeNameBefore(code18);
    }
    return nok(code18);
  }
  function completeEnd(code18) {
    if (code18 === 62) {
      effects.consume(code18);
      return completeAfter;
    }
    return nok(code18);
  }
  function completeAfter(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      return continuation(code18);
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return completeAfter;
    }
    return nok(code18);
  }
  function continuation(code18) {
    if (code18 === 45 && marker === 2) {
      effects.consume(code18);
      return continuationCommentInside;
    }
    if (code18 === 60 && marker === 1) {
      effects.consume(code18);
      return continuationRawTagOpen;
    }
    if (code18 === 62 && marker === 4) {
      effects.consume(code18);
      return continuationClose;
    }
    if (code18 === 63 && marker === 3) {
      effects.consume(code18);
      return continuationDeclarationInside;
    }
    if (code18 === 93 && marker === 5) {
      effects.consume(code18);
      return continuationCdataInside;
    }
    if (markdownLineEnding(code18) && (marker === 6 || marker === 7)) {
      effects.exit("htmlFlowData");
      return effects.check(blankLineBefore, continuationAfter, continuationStart)(code18);
    }
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("htmlFlowData");
      return continuationStart(code18);
    }
    effects.consume(code18);
    return continuation;
  }
  function continuationStart(code18) {
    return effects.check(nonLazyContinuation, continuationStartNonLazy, continuationAfter)(code18);
  }
  function continuationStartNonLazy(code18) {
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return continuationBefore;
  }
  function continuationBefore(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      return continuationStart(code18);
    }
    effects.enter("htmlFlowData");
    return continuation(code18);
  }
  function continuationCommentInside(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      return continuationDeclarationInside;
    }
    return continuation(code18);
  }
  function continuationRawTagOpen(code18) {
    if (code18 === 47) {
      effects.consume(code18);
      buffer = "";
      return continuationRawEndTag;
    }
    return continuation(code18);
  }
  function continuationRawEndTag(code18) {
    if (code18 === 62) {
      const name = buffer.toLowerCase();
      if (htmlRawNames.includes(name)) {
        effects.consume(code18);
        return continuationClose;
      }
      return continuation(code18);
    }
    if (asciiAlpha(code18) && buffer.length < 8) {
      effects.consume(code18);
      buffer += String.fromCharCode(code18);
      return continuationRawEndTag;
    }
    return continuation(code18);
  }
  function continuationCdataInside(code18) {
    if (code18 === 93) {
      effects.consume(code18);
      return continuationDeclarationInside;
    }
    return continuation(code18);
  }
  function continuationDeclarationInside(code18) {
    if (code18 === 62) {
      effects.consume(code18);
      return continuationClose;
    }
    if (code18 === 45 && marker === 2) {
      effects.consume(code18);
      return continuationDeclarationInside;
    }
    return continuation(code18);
  }
  function continuationClose(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("htmlFlowData");
      return continuationAfter(code18);
    }
    effects.consume(code18);
    return continuationClose;
  }
  function continuationAfter(code18) {
    effects.exit("htmlFlow");
    return ok(code18);
  }
}
function tokenizeBlankLineBefore(effects, ok, nok) {
  return start;
  function start(code18) {
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return effects.attempt(blankLine, ok, nok);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/html-text.js
var htmlText = {
  name: "htmlText",
  tokenize: tokenizeHtmlText
};
function tokenizeHtmlText(effects, ok, nok) {
  const self = this;
  let marker;
  let index;
  let returnState;
  return start;
  function start(code18) {
    effects.enter("htmlText");
    effects.enter("htmlTextData");
    effects.consume(code18);
    return open;
  }
  function open(code18) {
    if (code18 === 33) {
      effects.consume(code18);
      return declarationOpen;
    }
    if (code18 === 47) {
      effects.consume(code18);
      return tagCloseStart;
    }
    if (code18 === 63) {
      effects.consume(code18);
      return instruction;
    }
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      return tagOpen;
    }
    return nok(code18);
  }
  function declarationOpen(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      return commentOpenInside;
    }
    if (code18 === 91) {
      effects.consume(code18);
      index = 0;
      return cdataOpenInside;
    }
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      return declaration;
    }
    return nok(code18);
  }
  function commentOpenInside(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      return commentEnd;
    }
    return nok(code18);
  }
  function comment(code18) {
    if (code18 === null) {
      return nok(code18);
    }
    if (code18 === 45) {
      effects.consume(code18);
      return commentClose;
    }
    if (markdownLineEnding(code18)) {
      returnState = comment;
      return lineEndingBefore(code18);
    }
    effects.consume(code18);
    return comment;
  }
  function commentClose(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      return commentEnd;
    }
    return comment(code18);
  }
  function commentEnd(code18) {
    return code18 === 62 ? end(code18) : code18 === 45 ? commentClose(code18) : comment(code18);
  }
  function cdataOpenInside(code18) {
    const value = "CDATA[";
    if (code18 === value.charCodeAt(index++)) {
      effects.consume(code18);
      return index === value.length ? cdata : cdataOpenInside;
    }
    return nok(code18);
  }
  function cdata(code18) {
    if (code18 === null) {
      return nok(code18);
    }
    if (code18 === 93) {
      effects.consume(code18);
      return cdataClose;
    }
    if (markdownLineEnding(code18)) {
      returnState = cdata;
      return lineEndingBefore(code18);
    }
    effects.consume(code18);
    return cdata;
  }
  function cdataClose(code18) {
    if (code18 === 93) {
      effects.consume(code18);
      return cdataEnd;
    }
    return cdata(code18);
  }
  function cdataEnd(code18) {
    if (code18 === 62) {
      return end(code18);
    }
    if (code18 === 93) {
      effects.consume(code18);
      return cdataEnd;
    }
    return cdata(code18);
  }
  function declaration(code18) {
    if (code18 === null || code18 === 62) {
      return end(code18);
    }
    if (markdownLineEnding(code18)) {
      returnState = declaration;
      return lineEndingBefore(code18);
    }
    effects.consume(code18);
    return declaration;
  }
  function instruction(code18) {
    if (code18 === null) {
      return nok(code18);
    }
    if (code18 === 63) {
      effects.consume(code18);
      return instructionClose;
    }
    if (markdownLineEnding(code18)) {
      returnState = instruction;
      return lineEndingBefore(code18);
    }
    effects.consume(code18);
    return instruction;
  }
  function instructionClose(code18) {
    return code18 === 62 ? end(code18) : instruction(code18);
  }
  function tagCloseStart(code18) {
    if (asciiAlpha(code18)) {
      effects.consume(code18);
      return tagClose;
    }
    return nok(code18);
  }
  function tagClose(code18) {
    if (code18 === 45 || asciiAlphanumeric(code18)) {
      effects.consume(code18);
      return tagClose;
    }
    return tagCloseBetween(code18);
  }
  function tagCloseBetween(code18) {
    if (markdownLineEnding(code18)) {
      returnState = tagCloseBetween;
      return lineEndingBefore(code18);
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return tagCloseBetween;
    }
    return end(code18);
  }
  function tagOpen(code18) {
    if (code18 === 45 || asciiAlphanumeric(code18)) {
      effects.consume(code18);
      return tagOpen;
    }
    if (code18 === 47 || code18 === 62 || markdownLineEndingOrSpace(code18)) {
      return tagOpenBetween(code18);
    }
    return nok(code18);
  }
  function tagOpenBetween(code18) {
    if (code18 === 47) {
      effects.consume(code18);
      return end;
    }
    if (code18 === 58 || code18 === 95 || asciiAlpha(code18)) {
      effects.consume(code18);
      return tagOpenAttributeName;
    }
    if (markdownLineEnding(code18)) {
      returnState = tagOpenBetween;
      return lineEndingBefore(code18);
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return tagOpenBetween;
    }
    return end(code18);
  }
  function tagOpenAttributeName(code18) {
    if (code18 === 45 || code18 === 46 || code18 === 58 || code18 === 95 || asciiAlphanumeric(code18)) {
      effects.consume(code18);
      return tagOpenAttributeName;
    }
    return tagOpenAttributeNameAfter(code18);
  }
  function tagOpenAttributeNameAfter(code18) {
    if (code18 === 61) {
      effects.consume(code18);
      return tagOpenAttributeValueBefore;
    }
    if (markdownLineEnding(code18)) {
      returnState = tagOpenAttributeNameAfter;
      return lineEndingBefore(code18);
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return tagOpenAttributeNameAfter;
    }
    return tagOpenBetween(code18);
  }
  function tagOpenAttributeValueBefore(code18) {
    if (code18 === null || code18 === 60 || code18 === 61 || code18 === 62 || code18 === 96) {
      return nok(code18);
    }
    if (code18 === 34 || code18 === 39) {
      effects.consume(code18);
      marker = code18;
      return tagOpenAttributeValueQuoted;
    }
    if (markdownLineEnding(code18)) {
      returnState = tagOpenAttributeValueBefore;
      return lineEndingBefore(code18);
    }
    if (markdownSpace(code18)) {
      effects.consume(code18);
      return tagOpenAttributeValueBefore;
    }
    effects.consume(code18);
    return tagOpenAttributeValueUnquoted;
  }
  function tagOpenAttributeValueQuoted(code18) {
    if (code18 === marker) {
      effects.consume(code18);
      marker = void 0;
      return tagOpenAttributeValueQuotedAfter;
    }
    if (code18 === null) {
      return nok(code18);
    }
    if (markdownLineEnding(code18)) {
      returnState = tagOpenAttributeValueQuoted;
      return lineEndingBefore(code18);
    }
    effects.consume(code18);
    return tagOpenAttributeValueQuoted;
  }
  function tagOpenAttributeValueUnquoted(code18) {
    if (code18 === null || code18 === 34 || code18 === 39 || code18 === 60 || code18 === 61 || code18 === 96) {
      return nok(code18);
    }
    if (code18 === 47 || code18 === 62 || markdownLineEndingOrSpace(code18)) {
      return tagOpenBetween(code18);
    }
    effects.consume(code18);
    return tagOpenAttributeValueUnquoted;
  }
  function tagOpenAttributeValueQuotedAfter(code18) {
    if (code18 === 47 || code18 === 62 || markdownLineEndingOrSpace(code18)) {
      return tagOpenBetween(code18);
    }
    return nok(code18);
  }
  function end(code18) {
    if (code18 === 62) {
      effects.consume(code18);
      effects.exit("htmlTextData");
      effects.exit("htmlText");
      return ok;
    }
    return nok(code18);
  }
  function lineEndingBefore(code18) {
    effects.exit("htmlTextData");
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return lineEndingAfter;
  }
  function lineEndingAfter(code18) {
    return markdownSpace(code18) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code18) : lineEndingAfterPrefix(code18);
  }
  function lineEndingAfterPrefix(code18) {
    effects.enter("htmlTextData");
    return returnState(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/label-end.js
var labelEnd = {
  name: "labelEnd",
  resolveAll: resolveAllLabelEnd,
  resolveTo: resolveToLabelEnd,
  tokenize: tokenizeLabelEnd
};
var resourceConstruct = {
  tokenize: tokenizeResource
};
var referenceFullConstruct = {
  tokenize: tokenizeReferenceFull
};
var referenceCollapsedConstruct = {
  tokenize: tokenizeReferenceCollapsed
};
function resolveAllLabelEnd(events) {
  let index = -1;
  const newEvents = [];
  while (++index < events.length) {
    const token = events[index][1];
    newEvents.push(events[index]);
    if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
      const offset = token.type === "labelImage" ? 4 : 2;
      token.type = "data";
      index += offset;
    }
  }
  if (events.length !== newEvents.length) {
    splice(events, 0, events.length, newEvents);
  }
  return events;
}
function resolveToLabelEnd(events, context) {
  let index = events.length;
  let offset = 0;
  let open;
  let close;
  let media;
  while (index--) {
    const token = events[index][1];
    if (open) {
      if (token.type === "link" || token.type === "labelLink" && token._inactive) {
        break;
      }
      if (events[index][0] === "enter" && token.type === "labelLink") {
        token._inactive = true;
      }
    } else if (close) {
      if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
        open = index;
        if (token.type !== "labelLink") {
          offset = 2;
          break;
        }
      }
    } else if (token.type === "labelEnd") {
      close = index;
    }
  }
  const group = {
    type: events[open][1].type === "labelLink" ? "link" : "image",
    start: {
      ...events[open][1].start
    },
    end: {
      ...events[events.length - 1][1].end
    }
  };
  const label4 = {
    type: "label",
    start: {
      ...events[open][1].start
    },
    end: {
      ...events[close][1].end
    }
  };
  const text4 = {
    type: "labelText",
    start: {
      ...events[open + offset + 2][1].end
    },
    end: {
      ...events[close - 2][1].start
    }
  };
  media = [["enter", group, context], ["enter", label4, context]];
  media = push(media, events.slice(open + 1, open + offset + 3));
  media = push(media, [["enter", text4, context]]);
  media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
  media = push(media, [["exit", text4, context], events[close - 2], events[close - 1], ["exit", label4, context]]);
  media = push(media, events.slice(close + 1));
  media = push(media, [["exit", group, context]]);
  splice(events, open, events.length, media);
  return events;
}
function tokenizeLabelEnd(effects, ok, nok) {
  const self = this;
  const labelStarts = self._labelStarts;
  let labelStart;
  let defined;
  if (labelStarts) {
    while (labelStarts.length > 0 && labelStarts[labelStarts.length - 1]._balanced) {
      labelStarts.pop();
    }
    labelStart = labelStarts[labelStarts.length - 1];
  }
  return start;
  function start(code18) {
    if (!labelStart) {
      return nok(code18);
    }
    if (labelStart._inactive) {
      return labelEndNok(code18);
    }
    defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
      start: labelStart.end,
      end: self.now()
    })));
    effects.enter("labelEnd");
    effects.enter("labelMarker");
    effects.consume(code18);
    effects.exit("labelMarker");
    effects.exit("labelEnd");
    return after;
  }
  function after(code18) {
    if (code18 === 40) {
      return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code18);
    }
    if (code18 === 91) {
      return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code18);
    }
    return defined ? labelEndOk(code18) : labelEndNok(code18);
  }
  function referenceNotFull(code18) {
    return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code18);
  }
  function labelEndOk(code18) {
    labelStarts.pop();
    return ok(code18);
  }
  function labelEndNok(code18) {
    labelStart._balanced = true;
    return nok(code18);
  }
}
function tokenizeResource(effects, ok, nok) {
  return resourceStart;
  function resourceStart(code18) {
    effects.enter("resource");
    effects.enter("resourceMarker");
    effects.consume(code18);
    effects.exit("resourceMarker");
    return resourceBefore;
  }
  function resourceBefore(code18) {
    return markdownLineEndingOrSpace(code18) ? factoryWhitespace(effects, resourceOpen)(code18) : resourceOpen(code18);
  }
  function resourceOpen(code18) {
    if (code18 === 41) {
      return resourceEnd(code18);
    }
    return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code18);
  }
  function resourceDestinationAfter(code18) {
    return markdownLineEndingOrSpace(code18) ? factoryWhitespace(effects, resourceBetween)(code18) : resourceEnd(code18);
  }
  function resourceDestinationMissing(code18) {
    return nok(code18);
  }
  function resourceBetween(code18) {
    if (code18 === 34 || code18 === 39 || code18 === 40) {
      return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code18);
    }
    return resourceEnd(code18);
  }
  function resourceTitleAfter(code18) {
    return markdownLineEndingOrSpace(code18) ? factoryWhitespace(effects, resourceEnd)(code18) : resourceEnd(code18);
  }
  function resourceEnd(code18) {
    if (code18 === 41) {
      effects.enter("resourceMarker");
      effects.consume(code18);
      effects.exit("resourceMarker");
      effects.exit("resource");
      return ok;
    }
    return nok(code18);
  }
}
function tokenizeReferenceFull(effects, ok, nok) {
  const self = this;
  return referenceFull;
  function referenceFull(code18) {
    return factoryLabel2.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code18);
  }
  function referenceFullAfter(code18) {
    return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code18) : nok(code18);
  }
  function referenceFullMissing(code18) {
    return nok(code18);
  }
}
function tokenizeReferenceCollapsed(effects, ok, nok) {
  return referenceCollapsedStart;
  function referenceCollapsedStart(code18) {
    effects.enter("reference");
    effects.enter("referenceMarker");
    effects.consume(code18);
    effects.exit("referenceMarker");
    return referenceCollapsedOpen;
  }
  function referenceCollapsedOpen(code18) {
    if (code18 === 93) {
      effects.enter("referenceMarker");
      effects.consume(code18);
      effects.exit("referenceMarker");
      effects.exit("reference");
      return ok;
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/label-start-image.js
var labelStartImage = {
  name: "labelStartImage",
  resolveAll: labelEnd.resolveAll,
  tokenize: tokenizeLabelStartImage
};
function tokenizeLabelStartImage(effects, ok, nok) {
  const self = this;
  let labelImage;
  return start;
  function start(code18) {
    effects.enter("labelImage");
    effects.enter("labelImageMarker");
    effects.consume(code18);
    effects.exit("labelImageMarker");
    return open;
  }
  function open(code18) {
    if (code18 === 91) {
      effects.enter("labelMarker");
      effects.consume(code18);
      effects.exit("labelMarker");
      labelImage = effects.exit("labelImage");
      return after;
    }
    return nok(code18);
  }
  function after(code18) {
    if (code18 === 94 && "_hiddenFootnoteSupport" in self.parser.constructs) {
      return nok(code18);
    }
    self._labelStarts = self._labelStarts || [];
    self._labelStarts.push(labelImage);
    return ok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/label-start-link.js
var labelStartLink = {
  name: "labelStartLink",
  resolveAll: labelEnd.resolveAll,
  tokenize: tokenizeLabelStartLink
};
function tokenizeLabelStartLink(effects, ok, nok) {
  const self = this;
  let labelLink;
  return start;
  function start(code18) {
    effects.enter("labelLink");
    effects.enter("labelMarker");
    effects.consume(code18);
    effects.exit("labelMarker");
    labelLink = effects.exit("labelLink");
    return after;
  }
  function after(code18) {
    if (code18 === 94 && "_hiddenFootnoteSupport" in self.parser.constructs) {
      return nok(code18);
    }
    self._labelStarts = self._labelStarts || [];
    self._labelStarts.push(labelLink);
    return ok(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/line-ending.js
var lineEnding = {
  name: "lineEnding",
  tokenize: tokenizeLineEnding
};
function tokenizeLineEnding(effects, ok) {
  return start;
  function start(code18) {
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return factorySpace(effects, ok, "linePrefix");
  }
}

// ../../node_modules/micromark-core-commonmark/lib/thematic-break.js
var thematicBreak = {
  name: "thematicBreak",
  tokenize: tokenizeThematicBreak
};
function tokenizeThematicBreak(effects, ok, nok) {
  let size = 0;
  let marker;
  return start;
  function start(code18) {
    effects.enter("thematicBreak");
    return before(code18);
  }
  function before(code18) {
    marker = code18;
    return atBreak(code18);
  }
  function atBreak(code18) {
    if (code18 === marker) {
      effects.enter("thematicBreakSequence");
      return sequence(code18);
    }
    if (size >= 3 && (code18 === null || markdownLineEnding(code18))) {
      effects.exit("thematicBreak");
      return ok(code18);
    }
    return nok(code18);
  }
  function sequence(code18) {
    if (code18 === marker) {
      effects.consume(code18);
      size++;
      return sequence;
    }
    effects.exit("thematicBreakSequence");
    return markdownSpace(code18) ? factorySpace(effects, atBreak, "whitespace")(code18) : atBreak(code18);
  }
}

// ../../node_modules/micromark-core-commonmark/lib/list.js
var list = {
  continuation: {
    tokenize: tokenizeListContinuation
  },
  exit: tokenizeListEnd,
  name: "list",
  tokenize: tokenizeListStart
};
var listItemPrefixWhitespaceConstruct = {
  partial: true,
  tokenize: tokenizeListItemPrefixWhitespace
};
var indentConstruct = {
  partial: true,
  tokenize: tokenizeIndent
};
function tokenizeListStart(effects, ok, nok) {
  const self = this;
  const tail = self.events[self.events.length - 1];
  let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
  let size = 0;
  return start;
  function start(code18) {
    const kind = self.containerState.type || (code18 === 42 || code18 === 43 || code18 === 45 ? "listUnordered" : "listOrdered");
    if (kind === "listUnordered" ? !self.containerState.marker || code18 === self.containerState.marker : asciiDigit(code18)) {
      if (!self.containerState.type) {
        self.containerState.type = kind;
        effects.enter(kind, {
          _container: true
        });
      }
      if (kind === "listUnordered") {
        effects.enter("listItemPrefix");
        return code18 === 42 || code18 === 45 ? effects.check(thematicBreak, nok, atMarker)(code18) : atMarker(code18);
      }
      if (!self.interrupt || code18 === 49) {
        effects.enter("listItemPrefix");
        effects.enter("listItemValue");
        return inside(code18);
      }
    }
    return nok(code18);
  }
  function inside(code18) {
    if (asciiDigit(code18) && ++size < 10) {
      effects.consume(code18);
      return inside;
    }
    if ((!self.interrupt || size < 2) && (self.containerState.marker ? code18 === self.containerState.marker : code18 === 41 || code18 === 46)) {
      effects.exit("listItemValue");
      return atMarker(code18);
    }
    return nok(code18);
  }
  function atMarker(code18) {
    effects.enter("listItemMarker");
    effects.consume(code18);
    effects.exit("listItemMarker");
    self.containerState.marker = self.containerState.marker || code18;
    return effects.check(
      blankLine,
      // Can’t be empty when interrupting.
      self.interrupt ? nok : onBlank,
      effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix)
    );
  }
  function onBlank(code18) {
    self.containerState.initialBlankLine = true;
    initialSize++;
    return endOfPrefix(code18);
  }
  function otherPrefix(code18) {
    if (markdownSpace(code18)) {
      effects.enter("listItemPrefixWhitespace");
      effects.consume(code18);
      effects.exit("listItemPrefixWhitespace");
      return endOfPrefix;
    }
    return nok(code18);
  }
  function endOfPrefix(code18) {
    self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
    return ok(code18);
  }
}
function tokenizeListContinuation(effects, ok, nok) {
  const self = this;
  self.containerState._closeFlow = void 0;
  return effects.check(blankLine, onBlank, notBlank);
  function onBlank(code18) {
    self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
    return factorySpace(effects, ok, "listItemIndent", self.containerState.size + 1)(code18);
  }
  function notBlank(code18) {
    if (self.containerState.furtherBlankLines || !markdownSpace(code18)) {
      self.containerState.furtherBlankLines = void 0;
      self.containerState.initialBlankLine = void 0;
      return notInCurrentItem(code18);
    }
    self.containerState.furtherBlankLines = void 0;
    self.containerState.initialBlankLine = void 0;
    return effects.attempt(indentConstruct, ok, notInCurrentItem)(code18);
  }
  function notInCurrentItem(code18) {
    self.containerState._closeFlow = true;
    self.interrupt = void 0;
    return factorySpace(effects, effects.attempt(list, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code18);
  }
}
function tokenizeIndent(effects, ok, nok) {
  const self = this;
  return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
  function afterPrefix(code18) {
    const tail = self.events[self.events.length - 1];
    return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code18) : nok(code18);
  }
}
function tokenizeListEnd(effects) {
  effects.exit(this.containerState.type);
}
function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
  const self = this;
  return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4 + 1);
  function afterPrefix(code18) {
    const tail = self.events[self.events.length - 1];
    return !markdownSpace(code18) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code18) : nok(code18);
  }
}

// ../../node_modules/micromark-util-edit-map/index.js
var EditMap = class {
  /**
   * Create a new edit map.
   *
   * @returns
   *   New instance.
   */
  constructor() {
    this.index = /* @__PURE__ */ new Map();
    this.map = [];
  }
  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   *   Index at which to apply the edit.
   * @param {number} remove
   *   Count of items to remove at the index.
   * @param {Array<Event>} add
   *   Items to add at the index.
   * @returns {undefined}
   *   Nothing.
   */
  add(index, remove, add) {
    addImplementation(this, index, remove, add, false);
  }
  /**
   * Create an edit: but insert `add` before existing additions, instead of
   * after them.
   *
   * @param {number} index
   *   Index at which to apply the edit.
   * @param {number} remove
   *   Count of items to remove at the index.
   * @param {Array<Event>} add
   *   Items to add at the index.
   * @returns {undefined}
   *   Nothing.
   */
  addBefore(index, remove, add) {
    addImplementation(this, index, remove, add, true);
  }
  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   *   List of events to apply the edits to.
   * @returns {undefined}
   *   Nothing.
   */
  consume(events) {
    this.map.sort(function(a, b) {
      return a[0] - b[0];
    });
    if (this.map.length === 0) {
      return;
    }
    let index = this.map.length;
    const vecs = [];
    while (index > 0) {
      index -= 1;
      vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
      events.length = this.map[index][0];
    }
    vecs.push(events.slice());
    events.length = 0;
    let slice = vecs.pop();
    while (slice) {
      for (const element of slice) {
        events.push(element);
      }
      slice = vecs.pop();
    }
    this.map.length = 0;
    this.index.clear();
  }
};
function addImplementation(editMap, at, remove, add, before) {
  if (remove === 0 && add.length === 0) {
    return;
  }
  const existing = editMap.index.get(at);
  if (existing) {
    existing[1] += remove;
    if (before) {
      add.push(...existing[2]);
      existing[2] = add;
    } else {
      existing[2].push(...add);
    }
    return;
  }
  const change = [at, remove, add];
  editMap.map.push(change);
  editMap.index.set(at, change);
}

// ../../node_modules/micromark-core-commonmark/lib/setext-underline.js
var setextUnderline = {
  name: "setextUnderline",
  resolveTo: resolveToSetextUnderline,
  tokenize: tokenizeSetextUnderline
};
function resolveToSetextUnderline(events, context) {
  const editMap = new EditMap();
  let index = events.length;
  let content3;
  let text4;
  let definition2;
  while (index--) {
    if (events[index][0] === "enter") {
      if (events[index][1].type === "content") {
        content3 = index;
        break;
      }
      if (events[index][1].type === "paragraph") {
        text4 = index;
      }
    } else {
      if (events[index][1].type === "content") {
        editMap.add(index, 1, []);
      }
      if (!definition2 && events[index][1].type === "definition") {
        definition2 = index;
      }
    }
  }
  const heading = {
    type: "setextHeading",
    start: {
      ...events[content3][1].start
    },
    end: {
      ...events[events.length - 1][1].end
    }
  };
  events[text4][1].type = "setextHeadingText";
  if (definition2) {
    editMap.add(text4, 0, [["enter", heading, context]]);
    editMap.add(definition2 + 1, 0, [["exit", events[content3][1], context]]);
    events[content3][1].end = {
      ...events[definition2][1].end
    };
  } else {
    events[content3][1] = heading;
  }
  editMap.add(events.length, 0, [["exit", heading, context]]);
  editMap.consume(events);
  return events;
}
function tokenizeSetextUnderline(effects, ok, nok) {
  const self = this;
  let marker;
  return start;
  function start(code18) {
    let index = self.events.length;
    let paragraph;
    while (index--) {
      if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
        paragraph = self.events[index][1].type === "paragraph";
        break;
      }
    }
    if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
      effects.enter("setextHeadingLine");
      marker = code18;
      return before(code18);
    }
    return nok(code18);
  }
  function before(code18) {
    effects.enter("setextHeadingLineSequence");
    return inside(code18);
  }
  function inside(code18) {
    if (code18 === marker) {
      effects.consume(code18);
      return inside;
    }
    effects.exit("setextHeadingLineSequence");
    return markdownSpace(code18) ? factorySpace(effects, after, "lineSuffix")(code18) : after(code18);
  }
  function after(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("setextHeadingLine");
      return ok(code18);
    }
    return nok(code18);
  }
}

// ../../node_modules/micromark-extension-gfm-footnote/node_modules/micromark-util-normalize-identifier/index.js
function normalizeIdentifier2(value) {
  return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}

// ../../node_modules/micromark-extension-gfm-footnote/lib/syntax.js
var indent = {
  tokenize: tokenizeIndent2,
  partial: true
};
function gfmFootnote() {
  return {
    document: {
      [91]: {
        name: "gfmFootnoteDefinition",
        tokenize: tokenizeDefinitionStart,
        continuation: {
          tokenize: tokenizeDefinitionContinuation
        },
        exit: gfmFootnoteDefinitionEnd
      }
    },
    text: {
      [91]: {
        name: "gfmFootnoteCall",
        tokenize: tokenizeGfmFootnoteCall
      },
      [93]: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: tokenizePotentialGfmFootnoteCall,
        resolveTo: resolveToPotentialGfmFootnoteCall
      }
    }
  };
}
function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
  const self = this;
  let index = self.events.length;
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
  let labelStart;
  while (index--) {
    const token = self.events[index][1];
    if (token.type === "labelImage") {
      labelStart = token;
      break;
    }
    if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") {
      break;
    }
  }
  return start;
  function start(code18) {
    if (!labelStart || !labelStart._balanced) {
      return nok(code18);
    }
    const id = normalizeIdentifier2(self.sliceSerialize({
      start: labelStart.end,
      end: self.now()
    }));
    if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) {
      return nok(code18);
    }
    effects.enter("gfmFootnoteCallLabelMarker");
    effects.consume(code18);
    effects.exit("gfmFootnoteCallLabelMarker");
    return ok(code18);
  }
}
function resolveToPotentialGfmFootnoteCall(events, context) {
  let index = events.length;
  let labelStart;
  while (index--) {
    if (events[index][1].type === "labelImage" && events[index][0] === "enter") {
      labelStart = events[index][1];
      break;
    }
  }
  events[index + 1][1].type = "data";
  events[index + 3][1].type = "gfmFootnoteCallLabelMarker";
  const call = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, events[index + 3][1].start),
    end: Object.assign({}, events[events.length - 1][1].end)
  };
  const marker = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, events[index + 3][1].end),
    end: Object.assign({}, events[index + 3][1].end)
  };
  marker.end.column++;
  marker.end.offset++;
  marker.end._bufferIndex++;
  const string3 = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, marker.end),
    end: Object.assign({}, events[events.length - 1][1].start)
  };
  const chunk = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, string3.start),
    end: Object.assign({}, string3.end)
  };
  const replacement = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    events[index + 1],
    events[index + 2],
    ["enter", call, context],
    // The `[`
    events[index + 3],
    events[index + 4],
    // The `^`.
    ["enter", marker, context],
    ["exit", marker, context],
    // Everything in between.
    ["enter", string3, context],
    ["enter", chunk, context],
    ["exit", chunk, context],
    ["exit", string3, context],
    // The ending (`]`, properly parsed and labelled).
    events[events.length - 2],
    events[events.length - 1],
    ["exit", call, context]
  ];
  events.splice(index, events.length - index + 1, ...replacement);
  return events;
}
function tokenizeGfmFootnoteCall(effects, ok, nok) {
  const self = this;
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
  let size = 0;
  let data;
  return start;
  function start(code18) {
    effects.enter("gfmFootnoteCall");
    effects.enter("gfmFootnoteCallLabelMarker");
    effects.consume(code18);
    effects.exit("gfmFootnoteCallLabelMarker");
    return callStart;
  }
  function callStart(code18) {
    if (code18 !== 94) return nok(code18);
    effects.enter("gfmFootnoteCallMarker");
    effects.consume(code18);
    effects.exit("gfmFootnoteCallMarker");
    effects.enter("gfmFootnoteCallString");
    effects.enter("chunkString").contentType = "string";
    return callData;
  }
  function callData(code18) {
    if (
      // Too long.
      size > 999 || // Closing brace with nothing.
      code18 === 93 && !data || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      code18 === null || code18 === 91 || markdownLineEndingOrSpace(code18)
    ) {
      return nok(code18);
    }
    if (code18 === 93) {
      effects.exit("chunkString");
      const token = effects.exit("gfmFootnoteCallString");
      if (!defined.includes(normalizeIdentifier2(self.sliceSerialize(token)))) {
        return nok(code18);
      }
      effects.enter("gfmFootnoteCallLabelMarker");
      effects.consume(code18);
      effects.exit("gfmFootnoteCallLabelMarker");
      effects.exit("gfmFootnoteCall");
      return ok;
    }
    if (!markdownLineEndingOrSpace(code18)) {
      data = true;
    }
    size++;
    effects.consume(code18);
    return code18 === 92 ? callEscape : callData;
  }
  function callEscape(code18) {
    if (code18 === 91 || code18 === 92 || code18 === 93) {
      effects.consume(code18);
      size++;
      return callData;
    }
    return callData(code18);
  }
}
function tokenizeDefinitionStart(effects, ok, nok) {
  const self = this;
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
  let identifier;
  let size = 0;
  let data;
  return start;
  function start(code18) {
    effects.enter("gfmFootnoteDefinition")._container = true;
    effects.enter("gfmFootnoteDefinitionLabel");
    effects.enter("gfmFootnoteDefinitionLabelMarker");
    effects.consume(code18);
    effects.exit("gfmFootnoteDefinitionLabelMarker");
    return labelAtMarker;
  }
  function labelAtMarker(code18) {
    if (code18 === 94) {
      effects.enter("gfmFootnoteDefinitionMarker");
      effects.consume(code18);
      effects.exit("gfmFootnoteDefinitionMarker");
      effects.enter("gfmFootnoteDefinitionLabelString");
      effects.enter("chunkString").contentType = "string";
      return labelInside;
    }
    return nok(code18);
  }
  function labelInside(code18) {
    if (
      // Too long.
      size > 999 || // Closing brace with nothing.
      code18 === 93 && !data || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      code18 === null || code18 === 91 || markdownLineEndingOrSpace(code18)
    ) {
      return nok(code18);
    }
    if (code18 === 93) {
      effects.exit("chunkString");
      const token = effects.exit("gfmFootnoteDefinitionLabelString");
      identifier = normalizeIdentifier2(self.sliceSerialize(token));
      effects.enter("gfmFootnoteDefinitionLabelMarker");
      effects.consume(code18);
      effects.exit("gfmFootnoteDefinitionLabelMarker");
      effects.exit("gfmFootnoteDefinitionLabel");
      return labelAfter;
    }
    if (!markdownLineEndingOrSpace(code18)) {
      data = true;
    }
    size++;
    effects.consume(code18);
    return code18 === 92 ? labelEscape : labelInside;
  }
  function labelEscape(code18) {
    if (code18 === 91 || code18 === 92 || code18 === 93) {
      effects.consume(code18);
      size++;
      return labelInside;
    }
    return labelInside(code18);
  }
  function labelAfter(code18) {
    if (code18 === 58) {
      effects.enter("definitionMarker");
      effects.consume(code18);
      effects.exit("definitionMarker");
      if (!defined.includes(identifier)) {
        defined.push(identifier);
      }
      return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
    }
    return nok(code18);
  }
  function whitespaceAfter(code18) {
    return ok(code18);
  }
}
function tokenizeDefinitionContinuation(effects, ok, nok) {
  return effects.check(blankLine, ok, effects.attempt(indent, ok, nok));
}
function gfmFootnoteDefinitionEnd(effects) {
  effects.exit("gfmFootnoteDefinition");
}
function tokenizeIndent2(effects, ok, nok) {
  const self = this;
  return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 4 + 1);
  function afterPrefix(code18) {
    const tail = self.events[self.events.length - 1];
    return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok(code18) : nok(code18);
  }
}

// ../../node_modules/micromark-extension-gfm-table/lib/edit-map.js
var EditMap2 = class {
  /**
   * Create a new edit map.
   */
  constructor() {
    this.map = [];
    this.index = /* @__PURE__ */ new Map();
  }
  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   *   Index at which to apply the edit.
   * @param {number} remove
   *   Count of items to remove at the index.
   * @param {Array<Event>} add
   *   Items to add at the index.
   * @returns {undefined}
   *   Nothing.
   */
  add(index, remove, add) {
    addImplementation2(this, index, remove, add);
  }
  // To do: add this when moving to `micromark`.
  // /**
  //  * Create an edit: but insert `add` before existing additions.
  //  *
  //  * @param {number} index
  //  * @param {number} remove
  //  * @param {Array<Event>} add
  //  * @returns {undefined}
  //  */
  // addBefore(index, remove, add) {
  //   addImplementation(this, index, remove, add, true)
  // }
  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   *   List of events to apply the edits to.
   * @returns {undefined}
   *   Nothing.
   */
  consume(events) {
    this.map.sort(function(a, b) {
      return a[0] - b[0];
    });
    if (this.map.length === 0) {
      return;
    }
    let index = this.map.length;
    const vecs = [];
    while (index > 0) {
      index -= 1;
      vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
      events.length = this.map[index][0];
    }
    vecs.push(events.slice());
    events.length = 0;
    let slice = vecs.pop();
    while (slice) {
      for (const element of slice) {
        events.push(element);
      }
      slice = vecs.pop();
    }
    this.map.length = 0;
    this.index.clear();
  }
};
function addImplementation2(editMap, at, remove, add) {
  if (remove === 0 && add.length === 0) {
    return;
  }
  const existing = editMap.index.get(at);
  if (existing) {
    existing[1] += remove;
    existing[2].push(...add);
    return;
  }
  const change = [at, remove, add];
  editMap.map.push(change);
  editMap.index.set(at, change);
}

// ../../node_modules/micromark-extension-gfm-table/lib/infer.js
function gfmTableAlign(events, index) {
  let inDelimiterRow = false;
  const align = [];
  while (index < events.length) {
    const event = events[index];
    if (inDelimiterRow) {
      if (event[0] === "enter") {
        if (event[1].type === "tableContent") {
          align.push(events[index + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
        }
      } else if (event[1].type === "tableContent") {
        if (events[index - 1][1].type === "tableDelimiterMarker") {
          const alignIndex = align.length - 1;
          align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
        }
      } else if (event[1].type === "tableDelimiterRow") {
        break;
      }
    } else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") {
      inDelimiterRow = true;
    }
    index += 1;
  }
  return align;
}

// ../../node_modules/micromark-extension-gfm-table/lib/syntax.js
function gfmTable() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: tokenizeTable,
        resolveAll: resolveTable
      }
    }
  };
}
function tokenizeTable(effects, ok, nok) {
  const self = this;
  let size = 0;
  let sizeB = 0;
  let seen;
  return start;
  function start(code18) {
    let index = self.events.length - 1;
    while (index > -1) {
      const {
        type
      } = self.events[index][1];
      if (type === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      type === "linePrefix") {
        index--;
      } else {
        break;
      }
    }
    const tail = index > -1 ? self.events[index][1].type : null;
    const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
    if (next === bodyRowStart && self.parser.lazy[self.now().line]) {
      return nok(code18);
    }
    return next(code18);
  }
  function headRowBefore(code18) {
    effects.enter("tableHead");
    effects.enter("tableRow");
    return headRowStart(code18);
  }
  function headRowStart(code18) {
    if (code18 === 124) {
      return headRowBreak(code18);
    }
    seen = true;
    sizeB += 1;
    return headRowBreak(code18);
  }
  function headRowBreak(code18) {
    if (code18 === null) {
      return nok(code18);
    }
    if (markdownLineEnding(code18)) {
      if (sizeB > 1) {
        sizeB = 0;
        self.interrupt = true;
        effects.exit("tableRow");
        effects.enter("lineEnding");
        effects.consume(code18);
        effects.exit("lineEnding");
        return headDelimiterStart;
      }
      return nok(code18);
    }
    if (markdownSpace(code18)) {
      return factorySpace(effects, headRowBreak, "whitespace")(code18);
    }
    sizeB += 1;
    if (seen) {
      seen = false;
      size += 1;
    }
    if (code18 === 124) {
      effects.enter("tableCellDivider");
      effects.consume(code18);
      effects.exit("tableCellDivider");
      seen = true;
      return headRowBreak;
    }
    effects.enter("data");
    return headRowData(code18);
  }
  function headRowData(code18) {
    if (code18 === null || code18 === 124 || markdownLineEndingOrSpace(code18)) {
      effects.exit("data");
      return headRowBreak(code18);
    }
    effects.consume(code18);
    return code18 === 92 ? headRowEscape : headRowData;
  }
  function headRowEscape(code18) {
    if (code18 === 92 || code18 === 124) {
      effects.consume(code18);
      return headRowData;
    }
    return headRowData(code18);
  }
  function headDelimiterStart(code18) {
    self.interrupt = false;
    if (self.parser.lazy[self.now().line]) {
      return nok(code18);
    }
    effects.enter("tableDelimiterRow");
    seen = false;
    if (markdownSpace(code18)) {
      return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code18);
    }
    return headDelimiterBefore(code18);
  }
  function headDelimiterBefore(code18) {
    if (code18 === 45 || code18 === 58) {
      return headDelimiterValueBefore(code18);
    }
    if (code18 === 124) {
      seen = true;
      effects.enter("tableCellDivider");
      effects.consume(code18);
      effects.exit("tableCellDivider");
      return headDelimiterCellBefore;
    }
    return headDelimiterNok(code18);
  }
  function headDelimiterCellBefore(code18) {
    if (markdownSpace(code18)) {
      return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code18);
    }
    return headDelimiterValueBefore(code18);
  }
  function headDelimiterValueBefore(code18) {
    if (code18 === 58) {
      sizeB += 1;
      seen = true;
      effects.enter("tableDelimiterMarker");
      effects.consume(code18);
      effects.exit("tableDelimiterMarker");
      return headDelimiterLeftAlignmentAfter;
    }
    if (code18 === 45) {
      sizeB += 1;
      return headDelimiterLeftAlignmentAfter(code18);
    }
    if (code18 === null || markdownLineEnding(code18)) {
      return headDelimiterCellAfter(code18);
    }
    return headDelimiterNok(code18);
  }
  function headDelimiterLeftAlignmentAfter(code18) {
    if (code18 === 45) {
      effects.enter("tableDelimiterFiller");
      return headDelimiterFiller(code18);
    }
    return headDelimiterNok(code18);
  }
  function headDelimiterFiller(code18) {
    if (code18 === 45) {
      effects.consume(code18);
      return headDelimiterFiller;
    }
    if (code18 === 58) {
      seen = true;
      effects.exit("tableDelimiterFiller");
      effects.enter("tableDelimiterMarker");
      effects.consume(code18);
      effects.exit("tableDelimiterMarker");
      return headDelimiterRightAlignmentAfter;
    }
    effects.exit("tableDelimiterFiller");
    return headDelimiterRightAlignmentAfter(code18);
  }
  function headDelimiterRightAlignmentAfter(code18) {
    if (markdownSpace(code18)) {
      return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code18);
    }
    return headDelimiterCellAfter(code18);
  }
  function headDelimiterCellAfter(code18) {
    if (code18 === 124) {
      return headDelimiterBefore(code18);
    }
    if (code18 === null || markdownLineEnding(code18)) {
      if (!seen || size !== sizeB) {
        return headDelimiterNok(code18);
      }
      effects.exit("tableDelimiterRow");
      effects.exit("tableHead");
      return ok(code18);
    }
    return headDelimiterNok(code18);
  }
  function headDelimiterNok(code18) {
    return nok(code18);
  }
  function bodyRowStart(code18) {
    effects.enter("tableRow");
    return bodyRowBreak(code18);
  }
  function bodyRowBreak(code18) {
    if (code18 === 124) {
      effects.enter("tableCellDivider");
      effects.consume(code18);
      effects.exit("tableCellDivider");
      return bodyRowBreak;
    }
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("tableRow");
      return ok(code18);
    }
    if (markdownSpace(code18)) {
      return factorySpace(effects, bodyRowBreak, "whitespace")(code18);
    }
    effects.enter("data");
    return bodyRowData(code18);
  }
  function bodyRowData(code18) {
    if (code18 === null || code18 === 124 || markdownLineEndingOrSpace(code18)) {
      effects.exit("data");
      return bodyRowBreak(code18);
    }
    effects.consume(code18);
    return code18 === 92 ? bodyRowEscape : bodyRowData;
  }
  function bodyRowEscape(code18) {
    if (code18 === 92 || code18 === 124) {
      effects.consume(code18);
      return bodyRowData;
    }
    return bodyRowData(code18);
  }
}
function resolveTable(events, context) {
  let index = -1;
  let inFirstCellAwaitingPipe = true;
  let rowKind = 0;
  let lastCell = [0, 0, 0, 0];
  let cell = [0, 0, 0, 0];
  let afterHeadAwaitingFirstBodyRow = false;
  let lastTableEnd = 0;
  let currentTable;
  let currentBody;
  let currentCell;
  const map2 = new EditMap2();
  while (++index < events.length) {
    const event = events[index];
    const token = event[1];
    if (event[0] === "enter") {
      if (token.type === "tableHead") {
        afterHeadAwaitingFirstBodyRow = false;
        if (lastTableEnd !== 0) {
          flushTableEnd(map2, context, lastTableEnd, currentTable, currentBody);
          currentBody = void 0;
          lastTableEnd = 0;
        }
        currentTable = {
          type: "table",
          start: Object.assign({}, token.start),
          // Note: correct end is set later.
          end: Object.assign({}, token.end)
        };
        map2.add(index, 0, [["enter", currentTable, context]]);
      } else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
        inFirstCellAwaitingPipe = true;
        currentCell = void 0;
        lastCell = [0, 0, 0, 0];
        cell = [0, index + 1, 0, 0];
        if (afterHeadAwaitingFirstBodyRow) {
          afterHeadAwaitingFirstBodyRow = false;
          currentBody = {
            type: "tableBody",
            start: Object.assign({}, token.start),
            // Note: correct end is set later.
            end: Object.assign({}, token.end)
          };
          map2.add(index, 0, [["enter", currentBody, context]]);
        }
        rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
      } else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
        inFirstCellAwaitingPipe = false;
        if (cell[2] === 0) {
          if (lastCell[1] !== 0) {
            cell[0] = cell[1];
            currentCell = flushCell(map2, context, lastCell, rowKind, void 0, currentCell);
            lastCell = [0, 0, 0, 0];
          }
          cell[2] = index;
        }
      } else if (token.type === "tableCellDivider") {
        if (inFirstCellAwaitingPipe) {
          inFirstCellAwaitingPipe = false;
        } else {
          if (lastCell[1] !== 0) {
            cell[0] = cell[1];
            currentCell = flushCell(map2, context, lastCell, rowKind, void 0, currentCell);
          }
          lastCell = cell;
          cell = [lastCell[1], index, 0, 0];
        }
      }
    } else if (token.type === "tableHead") {
      afterHeadAwaitingFirstBodyRow = true;
      lastTableEnd = index;
    } else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
      lastTableEnd = index;
      if (lastCell[1] !== 0) {
        cell[0] = cell[1];
        currentCell = flushCell(map2, context, lastCell, rowKind, index, currentCell);
      } else if (cell[1] !== 0) {
        currentCell = flushCell(map2, context, cell, rowKind, index, currentCell);
      }
      rowKind = 0;
    } else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
      cell[3] = index;
    }
  }
  if (lastTableEnd !== 0) {
    flushTableEnd(map2, context, lastTableEnd, currentTable, currentBody);
  }
  map2.consume(context.events);
  index = -1;
  while (++index < context.events.length) {
    const event = context.events[index];
    if (event[0] === "enter" && event[1].type === "table") {
      event[1]._align = gfmTableAlign(context.events, index);
    }
  }
  return events;
}
function flushCell(map2, context, range, rowKind, rowEnd, previousCell) {
  const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
  const valueName = "tableContent";
  if (range[0] !== 0) {
    previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
    map2.add(range[0], 0, [["exit", previousCell, context]]);
  }
  const now = getPoint(context.events, range[1]);
  previousCell = {
    type: groupName,
    start: Object.assign({}, now),
    // Note: correct end is set later.
    end: Object.assign({}, now)
  };
  map2.add(range[1], 0, [["enter", previousCell, context]]);
  if (range[2] !== 0) {
    const relatedStart = getPoint(context.events, range[2]);
    const relatedEnd = getPoint(context.events, range[3]);
    const valueToken = {
      type: valueName,
      start: Object.assign({}, relatedStart),
      end: Object.assign({}, relatedEnd)
    };
    map2.add(range[2], 0, [["enter", valueToken, context]]);
    if (rowKind !== 2) {
      const start = context.events[range[2]];
      const end = context.events[range[3]];
      start[1].end = Object.assign({}, end[1].end);
      start[1].type = "chunkText";
      start[1].contentType = "text";
      if (range[3] > range[2] + 1) {
        const a = range[2] + 1;
        const b = range[3] - range[2] - 1;
        map2.add(a, b, []);
      }
    }
    map2.add(range[3] + 1, 0, [["exit", valueToken, context]]);
  }
  if (rowEnd !== void 0) {
    previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
    map2.add(rowEnd, 0, [["exit", previousCell, context]]);
    previousCell = void 0;
  }
  return previousCell;
}
function flushTableEnd(map2, context, index, table, tableBody) {
  const exits = [];
  const related = getPoint(context.events, index);
  if (tableBody) {
    tableBody.end = Object.assign({}, related);
    exits.push(["exit", tableBody, context]);
  }
  table.end = Object.assign({}, related);
  exits.push(["exit", table, context]);
  map2.add(index + 1, 0, exits);
}
function getPoint(events, index) {
  const event = events[index];
  const side = event[0] === "enter" ? "start" : "end";
  return event[1][side];
}

// ../../node_modules/micromark-extension-math/lib/math-flow.js
var mathFlow = {
  tokenize: tokenizeMathFenced,
  concrete: true,
  name: "mathFlow"
};
var nonLazyContinuation2 = {
  tokenize: tokenizeNonLazyContinuation2,
  partial: true
};
function tokenizeMathFenced(effects, ok, nok) {
  const self = this;
  const tail = self.events[self.events.length - 1];
  const initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
  let sizeOpen = 0;
  return start;
  function start(code18) {
    effects.enter("mathFlow");
    effects.enter("mathFlowFence");
    effects.enter("mathFlowFenceSequence");
    return sequenceOpen(code18);
  }
  function sequenceOpen(code18) {
    if (code18 === 36) {
      effects.consume(code18);
      sizeOpen++;
      return sequenceOpen;
    }
    if (sizeOpen < 2) {
      return nok(code18);
    }
    effects.exit("mathFlowFenceSequence");
    return factorySpace(effects, metaBefore, "whitespace")(code18);
  }
  function metaBefore(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      return metaAfter(code18);
    }
    effects.enter("mathFlowFenceMeta");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return meta(code18);
  }
  function meta(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("chunkString");
      effects.exit("mathFlowFenceMeta");
      return metaAfter(code18);
    }
    if (code18 === 36) {
      return nok(code18);
    }
    effects.consume(code18);
    return meta;
  }
  function metaAfter(code18) {
    effects.exit("mathFlowFence");
    if (self.interrupt) {
      return ok(code18);
    }
    return effects.attempt(nonLazyContinuation2, beforeNonLazyContinuation, after)(code18);
  }
  function beforeNonLazyContinuation(code18) {
    return effects.attempt({
      tokenize: tokenizeClosingFence,
      partial: true
    }, after, contentStart)(code18);
  }
  function contentStart(code18) {
    return (initialSize ? factorySpace(effects, beforeContentChunk, "linePrefix", initialSize + 1) : beforeContentChunk)(code18);
  }
  function beforeContentChunk(code18) {
    if (code18 === null) {
      return after(code18);
    }
    if (markdownLineEnding(code18)) {
      return effects.attempt(nonLazyContinuation2, beforeNonLazyContinuation, after)(code18);
    }
    effects.enter("mathFlowValue");
    return contentChunk(code18);
  }
  function contentChunk(code18) {
    if (code18 === null || markdownLineEnding(code18)) {
      effects.exit("mathFlowValue");
      return beforeContentChunk(code18);
    }
    effects.consume(code18);
    return contentChunk;
  }
  function after(code18) {
    effects.exit("mathFlow");
    return ok(code18);
  }
  function tokenizeClosingFence(effects2, ok2, nok2) {
    let size = 0;
    return factorySpace(effects2, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
    function beforeSequenceClose(code18) {
      effects2.enter("mathFlowFence");
      effects2.enter("mathFlowFenceSequence");
      return sequenceClose(code18);
    }
    function sequenceClose(code18) {
      if (code18 === 36) {
        size++;
        effects2.consume(code18);
        return sequenceClose;
      }
      if (size < sizeOpen) {
        return nok2(code18);
      }
      effects2.exit("mathFlowFenceSequence");
      return factorySpace(effects2, afterSequenceClose, "whitespace")(code18);
    }
    function afterSequenceClose(code18) {
      if (code18 === null || markdownLineEnding(code18)) {
        effects2.exit("mathFlowFence");
        return ok2(code18);
      }
      return nok2(code18);
    }
  }
}
function tokenizeNonLazyContinuation2(effects, ok, nok) {
  const self = this;
  return start;
  function start(code18) {
    if (code18 === null) {
      return ok(code18);
    }
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return lineStart;
  }
  function lineStart(code18) {
    return self.parser.lazy[self.now().line] ? nok(code18) : ok(code18);
  }
}

// ../../node_modules/micromark-extension-math/lib/math-text.js
function mathText(options) {
  const options_ = options || {};
  let single = options_.singleDollarTextMath;
  if (single === null || single === void 0) {
    single = true;
  }
  return {
    tokenize: tokenizeMathText,
    resolve: resolveMathText,
    previous: previous3,
    name: "mathText"
  };
  function tokenizeMathText(effects, ok, nok) {
    const self = this;
    let sizeOpen = 0;
    let size;
    let token;
    return start;
    function start(code18) {
      effects.enter("mathText");
      effects.enter("mathTextSequence");
      return sequenceOpen(code18);
    }
    function sequenceOpen(code18) {
      if (code18 === 36) {
        effects.consume(code18);
        sizeOpen++;
        return sequenceOpen;
      }
      if (sizeOpen < 2 && !single) {
        return nok(code18);
      }
      effects.exit("mathTextSequence");
      return between(code18);
    }
    function between(code18) {
      if (code18 === null) {
        return nok(code18);
      }
      if (code18 === 36) {
        token = effects.enter("mathTextSequence");
        size = 0;
        return sequenceClose(code18);
      }
      if (code18 === 32) {
        effects.enter("space");
        effects.consume(code18);
        effects.exit("space");
        return between;
      }
      if (markdownLineEnding(code18)) {
        effects.enter("lineEnding");
        effects.consume(code18);
        effects.exit("lineEnding");
        return between;
      }
      effects.enter("mathTextData");
      return data(code18);
    }
    function data(code18) {
      if (code18 === null || code18 === 32 || code18 === 36 || markdownLineEnding(code18)) {
        effects.exit("mathTextData");
        return between(code18);
      }
      effects.consume(code18);
      return data;
    }
    function sequenceClose(code18) {
      if (code18 === 36) {
        effects.consume(code18);
        size++;
        return sequenceClose;
      }
      if (size === sizeOpen) {
        effects.exit("mathTextSequence");
        effects.exit("mathText");
        return ok(code18);
      }
      token.type = "mathTextData";
      return data(code18);
    }
  }
}
function resolveMathText(events) {
  let tailExitIndex = events.length - 4;
  let headEnterIndex = 3;
  let index;
  let enter;
  if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
    index = headEnterIndex;
    while (++index < tailExitIndex) {
      if (events[index][1].type === "mathTextData") {
        events[tailExitIndex][1].type = "mathTextPadding";
        events[headEnterIndex][1].type = "mathTextPadding";
        headEnterIndex += 2;
        tailExitIndex -= 2;
        break;
      }
    }
  }
  index = headEnterIndex - 1;
  tailExitIndex++;
  while (++index <= tailExitIndex) {
    if (enter === void 0) {
      if (index !== tailExitIndex && events[index][1].type !== "lineEnding") {
        enter = index;
      }
    } else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
      events[enter][1].type = "mathTextData";
      if (index !== enter + 2) {
        events[enter][1].end = events[index - 1][1].end;
        events.splice(enter + 2, index - enter - 2);
        tailExitIndex -= index - enter - 2;
        index = enter + 2;
      }
      enter = void 0;
    }
  }
  return events;
}
function previous3(code18) {
  return code18 !== 36 || this.events[this.events.length - 1][1].type === "characterEscape";
}

// ../../node_modules/micromark-extension-math/lib/syntax.js
function math(options) {
  return {
    flow: {
      [36]: mathFlow
    },
    text: {
      [36]: mathText(options)
    }
  };
}

// ../../node_modules/micromark/node_modules/micromark-util-chunked/index.js
function splice2(list2, start, remove, items) {
  const end = list2.length;
  let chunkStart = 0;
  let parameters;
  if (start < 0) {
    start = -start > end ? 0 : end + start;
  } else {
    start = start > end ? end : start;
  }
  remove = remove > 0 ? remove : 0;
  if (items.length < 1e4) {
    parameters = Array.from(items);
    parameters.unshift(start, remove);
    list2.splice(...parameters);
  } else {
    if (remove) list2.splice(start, remove);
    while (chunkStart < items.length) {
      parameters = items.slice(chunkStart, chunkStart + 1e4);
      parameters.unshift(start, 0);
      list2.splice(...parameters);
      chunkStart += 1e4;
      start += 1e4;
    }
  }
}
function push2(list2, items) {
  if (list2.length > 0) {
    splice2(list2, list2.length, 0, items);
    return list2;
  }
  return items;
}

// ../../node_modules/micromark/node_modules/micromark-util-combine-extensions/index.js
var hasOwnProperty = {}.hasOwnProperty;
function combineExtensions(extensions) {
  const all = {};
  let index = -1;
  while (++index < extensions.length) {
    syntaxExtension(all, extensions[index]);
  }
  return all;
}
function syntaxExtension(all, extension) {
  let hook;
  for (hook in extension) {
    const maybe = hasOwnProperty.call(all, hook) ? all[hook] : void 0;
    const left = maybe || (all[hook] = {});
    const right = extension[hook];
    let code18;
    if (right) {
      for (code18 in right) {
        if (!hasOwnProperty.call(left, code18)) left[code18] = [];
        const value = right[code18];
        constructs(
          // @ts-expect-error Looks like a list.
          left[code18],
          Array.isArray(value) ? value : value ? [value] : []
        );
      }
    }
  }
}
function constructs(existing, list2) {
  let index = -1;
  const before = [];
  while (++index < list2.length) {
    ;
    (list2[index].add === "after" ? existing : before).push(list2[index]);
  }
  splice2(existing, 0, 0, before);
}

// ../../node_modules/micromark/lib/initialize/content.js
var content2 = {
  tokenize: initializeContent
};
function initializeContent(effects) {
  const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
  let previous4;
  return contentStart;
  function afterContentStartConstruct(code18) {
    if (code18 === null) {
      effects.consume(code18);
      return;
    }
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    return factorySpace(effects, contentStart, "linePrefix");
  }
  function paragraphInitial(code18) {
    effects.enter("paragraph");
    return lineStart(code18);
  }
  function lineStart(code18) {
    const token = effects.enter("chunkText", {
      contentType: "text",
      previous: previous4
    });
    if (previous4) {
      previous4.next = token;
    }
    previous4 = token;
    return data(code18);
  }
  function data(code18) {
    if (code18 === null) {
      effects.exit("chunkText");
      effects.exit("paragraph");
      effects.consume(code18);
      return;
    }
    if (markdownLineEnding(code18)) {
      effects.consume(code18);
      effects.exit("chunkText");
      return lineStart;
    }
    effects.consume(code18);
    return data;
  }
}

// ../../node_modules/micromark/lib/initialize/document.js
var document = {
  tokenize: initializeDocument
};
var containerConstruct = {
  tokenize: tokenizeContainer
};
function initializeDocument(effects) {
  const self = this;
  const stack = [];
  let continued = 0;
  let childFlow;
  let childToken;
  let lineStartOffset;
  return start;
  function start(code18) {
    if (continued < stack.length) {
      const item = stack[continued];
      self.containerState = item[1];
      return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code18);
    }
    return checkNewContainers(code18);
  }
  function documentContinue(code18) {
    continued++;
    if (self.containerState._closeFlow) {
      self.containerState._closeFlow = void 0;
      if (childFlow) {
        closeFlow();
      }
      const indexBeforeExits = self.events.length;
      let indexBeforeFlow = indexBeforeExits;
      let point;
      while (indexBeforeFlow--) {
        if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
          point = self.events[indexBeforeFlow][1].end;
          break;
        }
      }
      exitContainers(continued);
      let index = indexBeforeExits;
      while (index < self.events.length) {
        self.events[index][1].end = {
          ...point
        };
        index++;
      }
      const editMap = new EditMap();
      editMap.add(indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
      editMap.add(indexBeforeExits, index - indexBeforeExits, []);
      editMap.consume(self.events);
      return checkNewContainers(code18);
    }
    return start(code18);
  }
  function checkNewContainers(code18) {
    if (continued === stack.length) {
      if (!childFlow) {
        return documentContinued(code18);
      }
      if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) {
        return flowStart(code18);
      }
      self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
    }
    self.containerState = {};
    return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code18);
  }
  function thereIsANewContainer(code18) {
    if (childFlow) {
      closeFlow();
    }
    exitContainers(continued);
    return documentContinued(code18);
  }
  function thereIsNoNewContainer(code18) {
    self.parser.lazy[self.now().line] = continued !== stack.length;
    lineStartOffset = self.now().offset;
    return flowStart(code18);
  }
  function documentContinued(code18) {
    self.containerState = {};
    return effects.attempt(containerConstruct, containerContinue, flowStart)(code18);
  }
  function containerContinue(code18) {
    continued++;
    stack.push([self.currentConstruct, self.containerState]);
    return documentContinued(code18);
  }
  function flowStart(code18) {
    if (code18 === null) {
      if (childFlow) {
        closeFlow();
      }
      exitContainers(0);
      effects.consume(code18);
      return;
    }
    childFlow = childFlow || self.parser.flow(self.now());
    effects.enter("chunkFlow", {
      _tokenizer: childFlow,
      contentType: "flow",
      previous: childToken
    });
    return flowContinue(code18);
  }
  function flowContinue(code18) {
    if (code18 === null) {
      writeToChild(effects.exit("chunkFlow"), true);
      exitContainers(0);
      effects.consume(code18);
      return;
    }
    if (markdownLineEnding(code18)) {
      effects.consume(code18);
      writeToChild(effects.exit("chunkFlow"));
      continued = 0;
      self.interrupt = void 0;
      return start;
    }
    effects.consume(code18);
    return flowContinue;
  }
  function writeToChild(token, endOfFile) {
    const stream = self.sliceStream(token);
    if (endOfFile) {
      stream.push(null);
    }
    token.previous = childToken;
    if (childToken) {
      childToken.next = token;
    }
    childToken = token;
    childFlow.defineSkip(token.start);
    childFlow.write(stream);
    if (self.parser.lazy[token.start.line]) {
      let index = childFlow.events.length;
      while (index--) {
        if (
          // The token starts before the line ending…
          childFlow.events[index][1].start.offset < lineStartOffset && // …and either is not ended yet…
          (!childFlow.events[index][1].end || // …or ends after it.
          childFlow.events[index][1].end.offset > lineStartOffset)
        ) {
          return;
        }
      }
      const indexBeforeExits = self.events.length;
      let indexBeforeFlow = indexBeforeExits;
      let seen;
      let point;
      while (indexBeforeFlow--) {
        if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
          if (seen) {
            point = self.events[indexBeforeFlow][1].end;
            break;
          }
          seen = true;
        }
      }
      exitContainers(continued);
      index = indexBeforeExits;
      while (index < self.events.length) {
        self.events[index][1].end = {
          ...point
        };
        index++;
      }
      const editMap = new EditMap();
      editMap.add(indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
      editMap.add(indexBeforeExits, index - indexBeforeExits, []);
      editMap.consume(self.events);
    }
  }
  function exitContainers(size) {
    let index = stack.length;
    while (index-- > size) {
      const entry = stack[index];
      self.containerState = entry[1];
      entry[0].exit.call(self, effects);
    }
    stack.length = size;
  }
  function closeFlow() {
    childFlow.write([null]);
    childToken = void 0;
    childFlow = void 0;
    self.containerState._closeFlow = void 0;
  }
}
function tokenizeContainer(effects, ok, nok) {
  return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}

// ../../node_modules/micromark/lib/initialize/flow.js
var flow = {
  tokenize: initializeFlow
};
function initializeFlow(effects) {
  const self = this;
  const initial = effects.attempt(
    // Try to parse a blank line.
    blankLine,
    atBlankEnding,
    // Try to parse initial flow (essentially, only code).
    effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix"))
  );
  return initial;
  function atBlankEnding(code18) {
    if (code18 === null) {
      effects.consume(code18);
      return;
    }
    effects.enter("lineEndingBlank");
    effects.consume(code18);
    effects.exit("lineEndingBlank");
    self.currentConstruct = void 0;
    return initial;
  }
  function afterConstruct(code18) {
    if (code18 === null) {
      effects.consume(code18);
      return;
    }
    effects.enter("lineEnding");
    effects.consume(code18);
    effects.exit("lineEnding");
    self.currentConstruct = void 0;
    return initial;
  }
}

// ../../node_modules/micromark/lib/initialize/text.js
var resolver = {
  resolveAll: createResolver()
};
var string = initializeFactory("string");
var text2 = initializeFactory("text");
function initializeFactory(field) {
  return {
    resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
    tokenize: initializeText
  };
  function initializeText(effects) {
    const self = this;
    const constructs2 = this.parser.constructs[field];
    const text4 = effects.attempt(constructs2, start, notText);
    return start;
    function start(code18) {
      return atBreak(code18) ? text4(code18) : notText(code18);
    }
    function notText(code18) {
      if (code18 === null) {
        effects.consume(code18);
        return;
      }
      effects.enter("data");
      effects.consume(code18);
      return data;
    }
    function data(code18) {
      if (atBreak(code18)) {
        effects.exit("data");
        return text4(code18);
      }
      effects.consume(code18);
      return data;
    }
    function atBreak(code18) {
      if (code18 === null) {
        return true;
      }
      const list2 = constructs2[code18];
      let index = -1;
      if (list2) {
        while (++index < list2.length) {
          const item = list2[index];
          if (!item.previous || item.previous.call(self, self.previous)) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
function createResolver(extraResolver) {
  return resolveAllText;
  function resolveAllText(events, context) {
    let index = -1;
    let enter;
    while (++index <= events.length) {
      if (enter === void 0) {
        if (events[index] && events[index][1].type === "data") {
          enter = index;
          index++;
        }
      } else if (!events[index] || events[index][1].type !== "data") {
        if (index !== enter + 2) {
          events[enter][1].end = events[index - 1][1].end;
          events.splice(enter + 2, index - enter - 2);
          index = enter + 2;
        }
        enter = void 0;
      }
    }
    return extraResolver ? extraResolver(events, context) : events;
  }
}
function resolveAllLineSuffixes(events, context) {
  const editMap = new EditMap();
  let eventIndex = 0;
  while (++eventIndex <= events.length) {
    if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
      const data = events[eventIndex - 1][1];
      const chunks = context.sliceStream(data);
      let index = chunks.length;
      let bufferIndex = -1;
      let size = 0;
      let tabs;
      while (index--) {
        const chunk = chunks[index];
        if (typeof chunk === "string") {
          bufferIndex = chunk.length;
          while (chunk.charCodeAt(bufferIndex - 1) === 32) {
            size++;
            bufferIndex--;
          }
          if (bufferIndex) {
            break;
          }
          bufferIndex = -1;
        } else if (chunk === -2) {
          tabs = true;
          size++;
        } else if (chunk === -1) {
        } else {
          index++;
          break;
        }
      }
      if (context._contentTypeTextTrailing && eventIndex === events.length) {
        size = 0;
      }
      if (size) {
        const token = {
          type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
            _index: data.start._index + index,
            line: data.end.line,
            column: data.end.column - size,
            offset: data.end.offset - size
          },
          end: {
            ...data.end
          }
        };
        data.end = {
          ...token.start
        };
        if (data.start.offset === data.end.offset) {
          Object.assign(data, token);
        } else {
          editMap.add(eventIndex, 0, [["enter", token, context], ["exit", token, context]]);
        }
      }
      eventIndex++;
    }
  }
  editMap.consume(events);
  return events;
}

// ../../node_modules/micromark/lib/constructs.js
var constructs_exports = {};
__export(constructs_exports, {
  attentionMarkers: () => attentionMarkers,
  contentInitial: () => contentInitial,
  disable: () => disable,
  document: () => document2,
  flow: () => flow2,
  flowInitial: () => flowInitial,
  insideSpan: () => insideSpan,
  string: () => string2,
  text: () => text3
});
var document2 = {
  [42]: list,
  [43]: list,
  [45]: list,
  [48]: list,
  [49]: list,
  [50]: list,
  [51]: list,
  [52]: list,
  [53]: list,
  [54]: list,
  [55]: list,
  [56]: list,
  [57]: list,
  [62]: blockQuote
};
var contentInitial = {
  [91]: definition
};
var flowInitial = {
  [-2]: codeIndented,
  [-1]: codeIndented,
  [32]: codeIndented
};
var flow2 = {
  [35]: headingAtx,
  [42]: thematicBreak,
  [45]: [setextUnderline, thematicBreak],
  [60]: htmlFlow,
  [61]: setextUnderline,
  [95]: thematicBreak,
  [96]: codeFenced,
  [126]: codeFenced
};
var string2 = {
  [38]: characterReference,
  [92]: characterEscape
};
var text3 = {
  [-5]: lineEnding,
  [-4]: lineEnding,
  [-3]: lineEnding,
  [33]: labelStartImage,
  [38]: characterReference,
  [42]: attention,
  [60]: [autolink, htmlText],
  [91]: labelStartLink,
  [92]: [hardBreakEscape, characterEscape],
  [93]: labelEnd,
  [95]: attention,
  [96]: codeText
};
var insideSpan = {
  null: [attention, resolver]
};
var attentionMarkers = {
  null: [42, 95]
};
var disable = {
  null: []
};

// ../../node_modules/micromark/node_modules/micromark-util-resolve-all/index.js
function resolveAll2(constructs2, events, context) {
  const called = [];
  let index = -1;
  while (++index < constructs2.length) {
    const resolve = constructs2[index].resolveAll;
    if (resolve && !called.includes(resolve)) {
      events = resolve(events, context);
      called.push(resolve);
    }
  }
  return events;
}

// ../../node_modules/micromark/lib/create-tokenizer.js
function createTokenizer(parser, initialize2, from) {
  let point = {
    _bufferIndex: -1,
    _index: 0,
    line: from && from.line || 1,
    column: from && from.column || 1,
    offset: from && from.offset || 0
  };
  const columnStart = {};
  const resolveAllConstructs = [];
  let chunks = [];
  let stack = [];
  let consumed = true;
  const effects = {
    attempt: constructFactory(onsuccessfulconstruct),
    check: constructFactory(onsuccessfulcheck),
    consume,
    enter,
    exit: exit2,
    interrupt: constructFactory(onsuccessfulcheck, {
      interrupt: true
    })
  };
  const context = {
    code: null,
    containerState: {},
    defineSkip,
    events: [],
    now,
    parser,
    previous: null,
    sliceSerialize,
    sliceStream,
    write
  };
  let state = initialize2.tokenize.call(context, effects);
  let expectedCode;
  if (initialize2.resolveAll) {
    resolveAllConstructs.push(initialize2);
  }
  return context;
  function write(slice) {
    chunks = push2(chunks, slice);
    main();
    if (chunks[chunks.length - 1] !== null) {
      return [];
    }
    addResult(initialize2, 0);
    context.events = resolveAll2(resolveAllConstructs, context.events, context);
    return context.events;
  }
  function sliceSerialize(token, expandTabs) {
    return serializeChunks(sliceStream(token), expandTabs);
  }
  function sliceStream(token) {
    return sliceChunks(chunks, token);
  }
  function now() {
    const {
      _bufferIndex,
      _index,
      line,
      column,
      offset
    } = point;
    return {
      _bufferIndex,
      _index,
      line,
      column,
      offset
    };
  }
  function defineSkip(value) {
    columnStart[value.line] = value.column;
    accountForPotentialSkip();
  }
  function main() {
    while (point._index < chunks.length) {
      const chunk = chunks[point._index];
      if (typeof chunk === "string") {
        const chunkIndex = point._index;
        if (point._bufferIndex < 0) {
          point._bufferIndex = 0;
        }
        while (point._index === chunkIndex && point._bufferIndex < chunk.length) {
          go(chunk.charCodeAt(point._bufferIndex));
        }
      } else {
        go(chunk);
      }
    }
  }
  function go(code18) {
    consumed = void 0;
    expectedCode = code18;
    state = state(code18);
  }
  function consume(code18) {
    if (markdownLineEnding(code18)) {
      point.line++;
      point.column = 1;
      point.offset += code18 === -3 ? 2 : 1;
      accountForPotentialSkip();
    } else if (code18 !== -1) {
      point.column++;
      point.offset++;
    }
    if (point._bufferIndex < 0) {
      point._index++;
    } else {
      point._bufferIndex++;
      if (point._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
      // strings.
      /** @type {string} */
      chunks[point._index].length) {
        point._bufferIndex = -1;
        point._index++;
      }
    }
    context.previous = code18;
    consumed = true;
  }
  function enter(type, fields) {
    const token = fields || {};
    token.type = type;
    token.start = now();
    context.events.push(["enter", token, context]);
    stack.push(token);
    return token;
  }
  function exit2(type) {
    const token = stack.pop();
    token.end = now();
    context.events.push(["exit", token, context]);
    return token;
  }
  function onsuccessfulconstruct(construct, info) {
    addResult(construct, info.from);
  }
  function onsuccessfulcheck(_, info) {
    info.restore();
  }
  function constructFactory(onreturn, fields) {
    return hook;
    function hook(constructs2, returnState, bogusState) {
      let listOfConstructs;
      let constructIndex;
      let currentConstruct;
      let info;
      return Array.isArray(constructs2) ? (
        /* c8 ignore next 1 */
        handleListOfConstructs(constructs2)
      ) : "tokenize" in constructs2 ? (
        // Looks like a construct.
        handleListOfConstructs([
          /** @type {Construct} */
          constructs2
        ])
      ) : handleMapOfConstructs(constructs2);
      function handleMapOfConstructs(map2) {
        return start;
        function start(code18) {
          const left = code18 !== null && map2[code18];
          const all = code18 !== null && map2.null;
          const list2 = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(left) ? left : left ? [left] : [],
            ...Array.isArray(all) ? all : all ? [all] : []
          ];
          return handleListOfConstructs(list2)(code18);
        }
      }
      function handleListOfConstructs(list2) {
        listOfConstructs = list2;
        constructIndex = 0;
        if (list2.length === 0) {
          return bogusState;
        }
        return handleConstruct(list2[constructIndex]);
      }
      function handleConstruct(construct) {
        return start;
        function start(code18) {
          info = store();
          currentConstruct = construct;
          if (!construct.partial) {
            context.currentConstruct = construct;
          }
          if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) {
            return nok(code18);
          }
          return construct.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            fields ? Object.assign(Object.create(context), fields) : context,
            effects,
            ok,
            nok
          )(code18);
        }
      }
      function ok(code18) {
        consumed = true;
        onreturn(currentConstruct, info);
        return returnState;
      }
      function nok(code18) {
        consumed = true;
        info.restore();
        if (++constructIndex < listOfConstructs.length) {
          return handleConstruct(listOfConstructs[constructIndex]);
        }
        return bogusState;
      }
    }
  }
  function addResult(construct, from2) {
    if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
      resolveAllConstructs.push(construct);
    }
    if (construct.resolve) {
      splice2(context.events, from2, context.events.length - from2, construct.resolve(context.events.slice(from2), context));
    }
    if (construct.resolveTo) {
      context.events = construct.resolveTo(context.events, context);
    }
  }
  function store() {
    const startPoint = now();
    const startPrevious = context.previous;
    const startCurrentConstruct = context.currentConstruct;
    const startEventsIndex = context.events.length;
    const startStack = Array.from(stack);
    return {
      from: startEventsIndex,
      restore
    };
    function restore() {
      point = startPoint;
      context.previous = startPrevious;
      context.currentConstruct = startCurrentConstruct;
      context.events.length = startEventsIndex;
      stack = startStack;
      accountForPotentialSkip();
    }
  }
  function accountForPotentialSkip() {
    if (point.line in columnStart && point.column < 2) {
      point.column = columnStart[point.line];
      point.offset += columnStart[point.line] - 1;
    }
  }
}
function sliceChunks(chunks, token) {
  const startIndex = token.start._index;
  const startBufferIndex = token.start._bufferIndex;
  const endIndex = token.end._index;
  const endBufferIndex = token.end._bufferIndex;
  let view;
  if (startIndex === endIndex) {
    view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
  } else {
    view = chunks.slice(startIndex, endIndex);
    if (startBufferIndex > -1) {
      const head = view[0];
      if (typeof head === "string") {
        view[0] = head.slice(startBufferIndex);
      } else {
        view.shift();
      }
    }
    if (endBufferIndex > 0) {
      view.push(chunks[endIndex].slice(0, endBufferIndex));
    }
  }
  return view;
}
function serializeChunks(chunks, expandTabs) {
  let index = -1;
  const result = [];
  let atTab;
  while (++index < chunks.length) {
    const chunk = chunks[index];
    let value;
    if (typeof chunk === "string") {
      value = chunk;
    } else {
      switch (chunk) {
        case -5: {
          value = "\r";
          break;
        }
        case -4: {
          value = "\n";
          break;
        }
        case -3: {
          value = "\r\n";
          break;
        }
        case -2: {
          value = expandTabs ? " " : "	";
          break;
        }
        case -1: {
          if (!expandTabs && atTab) {
            continue;
          }
          value = " ";
          break;
        }
        default: {
          value = String.fromCharCode(chunk);
        }
      }
    }
    atTab = chunk === -2;
    result.push(value);
  }
  return result.join("");
}

// ../../node_modules/micromark/lib/parse.js
function parse(options) {
  const settings = options || {};
  const constructs2 = (
    /** @type {FullNormalizedExtension} */
    combineExtensions([constructs_exports, ...settings.extensions || []])
  );
  const parser = {
    constructs: constructs2,
    content: create(content2),
    defined: [],
    document: create(document),
    flow: create(flow),
    lazy: {},
    string: create(string),
    text: create(text2)
  };
  return parser;
  function create(initial) {
    return creator;
    function creator(from) {
      return createTokenizer(parser, initial, from);
    }
  }
}

// ../../node_modules/micromark/node_modules/micromark-util-subtokenize/lib/splice-buffer.js
var SpliceBuffer2 = class {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(initial) {
    this.left = initial ? [...initial] : [];
    this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(index) {
    if (index < 0 || index >= this.left.length + this.right.length) {
      throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    }
    if (index < this.left.length) return this.left[index];
    return this.right[this.right.length - index + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    this.setCursor(0);
    return this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(start, end) {
    const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
    if (stop < this.left.length) {
      return this.left.slice(start, stop);
    }
    if (start > this.left.length) {
      return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
    }
    return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(start, deleteCount, items) {
    const count = deleteCount || 0;
    this.setCursor(Math.trunc(start));
    const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
    if (items) chunkedPush2(this.left, items);
    return removed.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    this.setCursor(Number.POSITIVE_INFINITY);
    return this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(item) {
    this.setCursor(Number.POSITIVE_INFINITY);
    this.left.push(item);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(items) {
    this.setCursor(Number.POSITIVE_INFINITY);
    chunkedPush2(this.left, items);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(item) {
    this.setCursor(0);
    this.right.push(item);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(items) {
    this.setCursor(0);
    chunkedPush2(this.right, items.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(n) {
    if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
    if (n < this.left.length) {
      const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
      chunkedPush2(this.right, removed.reverse());
    } else {
      const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
      chunkedPush2(this.left, removed.reverse());
    }
  }
};
function chunkedPush2(list2, right) {
  let chunkStart = 0;
  if (right.length < 1e4) {
    list2.push(...right);
  } else {
    while (chunkStart < right.length) {
      list2.push(...right.slice(chunkStart, chunkStart + 1e4));
      chunkStart += 1e4;
    }
  }
}

// ../../node_modules/micromark/node_modules/micromark-util-subtokenize/index.js
function subtokenize2(eventsArray) {
  const jumps = {};
  let index = -1;
  let event;
  let lineIndex;
  let otherIndex;
  let otherEvent;
  let parameters;
  let subevents;
  let more;
  const events = new SpliceBuffer2(eventsArray);
  while (++index < events.length) {
    while (index in jumps) {
      index = jumps[index];
    }
    event = events.get(index);
    if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
      subevents = event[1]._tokenizer.events;
      otherIndex = 0;
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") {
        otherIndex += 2;
      }
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") {
        while (++otherIndex < subevents.length) {
          if (subevents[otherIndex][1].type === "content") {
            break;
          }
          if (subevents[otherIndex][1].type === "chunkText") {
            subevents[otherIndex][1]._isInFirstContentOfListItem = true;
            otherIndex++;
          }
        }
      }
    }
    if (event[0] === "enter") {
      if (event[1].contentType) {
        Object.assign(jumps, subcontent2(events, index));
        index = jumps[index];
        more = true;
      }
    } else if (event[1]._container) {
      otherIndex = index;
      lineIndex = void 0;
      while (otherIndex--) {
        otherEvent = events.get(otherIndex);
        if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
          if (otherEvent[0] === "enter") {
            if (lineIndex) {
              events.get(lineIndex)[1].type = "lineEndingBlank";
            }
            otherEvent[1].type = "lineEnding";
            lineIndex = otherIndex;
          }
        } else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {
        } else {
          break;
        }
      }
      if (lineIndex) {
        event[1].end = {
          ...events.get(lineIndex)[1].start
        };
        parameters = events.slice(lineIndex, index);
        parameters.unshift(event);
        events.splice(lineIndex, index - lineIndex + 1, parameters);
      }
    }
  }
  splice2(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
  return !more;
}
function subcontent2(events, eventIndex) {
  const token = events.get(eventIndex)[1];
  const context = events.get(eventIndex)[2];
  let startPosition = eventIndex - 1;
  const startPositions = [];
  let tokenizer = token._tokenizer;
  if (!tokenizer) {
    tokenizer = context.parser[token.contentType](token.start);
    if (token._contentTypeTextTrailing) {
      tokenizer._contentTypeTextTrailing = true;
    }
  }
  const childEvents = tokenizer.events;
  const jumps = [];
  const gaps = {};
  let stream;
  let previous4;
  let index = -1;
  let current = token;
  let adjust = 0;
  let start = 0;
  const breaks = [start];
  while (current) {
    while (events.get(++startPosition)[1] !== current) {
    }
    startPositions.push(startPosition);
    if (!current._tokenizer) {
      stream = context.sliceStream(current);
      if (!current.next) {
        stream.push(null);
      }
      if (previous4) {
        tokenizer.defineSkip(current.start);
      }
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = true;
      }
      tokenizer.write(stream);
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = void 0;
      }
    }
    previous4 = current;
    current = current.next;
  }
  current = token;
  while (++index < childEvents.length) {
    if (
      // Find a void token that includes a break.
      childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line
    ) {
      start = index + 1;
      breaks.push(start);
      current._tokenizer = void 0;
      current.previous = void 0;
      current = current.next;
    }
  }
  tokenizer.events = [];
  if (current) {
    current._tokenizer = void 0;
    current.previous = void 0;
  } else {
    breaks.pop();
  }
  index = breaks.length;
  while (index--) {
    const slice = childEvents.slice(breaks[index], breaks[index + 1]);
    const start2 = startPositions.pop();
    jumps.push([start2, start2 + slice.length - 1]);
    events.splice(start2, 2, slice);
  }
  jumps.reverse();
  index = -1;
  while (++index < jumps.length) {
    gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
    adjust += jumps[index][1] - jumps[index][0] - 1;
  }
  return gaps;
}

// ../../node_modules/micromark/lib/postprocess.js
function postprocess(events) {
  while (!subtokenize2(events)) {
  }
  return events;
}

// ../../node_modules/micromark/lib/preprocess.js
var search = /[\0\t\n\r]/g;
function preprocess() {
  let column = 1;
  let buffer = "";
  let start = true;
  let atCarriageReturn;
  return preprocessor;
  function preprocessor(value, encoding, end) {
    value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
    const chunks = [];
    let startPosition = 0;
    buffer = "";
    if (start) {
      if (value.charCodeAt(0) === 65279) {
        startPosition++;
      }
      start = void 0;
    }
    while (startPosition < value.length) {
      search.lastIndex = startPosition;
      const match = search.exec(value);
      const endPosition = match && match.index !== void 0 ? match.index : value.length;
      const code18 = value.charCodeAt(endPosition);
      if (!match) {
        buffer = value.slice(startPosition);
        break;
      }
      if (code18 === 10 && startPosition === endPosition && atCarriageReturn) {
        chunks.push(-3);
        atCarriageReturn = void 0;
      } else {
        if (atCarriageReturn) {
          chunks.push(-5);
          atCarriageReturn = void 0;
        }
        if (startPosition < endPosition) {
          chunks.push(value.slice(startPosition, endPosition));
          column += endPosition - startPosition;
        }
        switch (code18) {
          case 0: {
            chunks.push(65533);
            column++;
            break;
          }
          case 9: {
            const next = Math.ceil(column / 4) * 4;
            chunks.push(-2);
            while (column++ < next) {
              chunks.push(-1);
            }
            break;
          }
          case 10: {
            chunks.push(-4);
            column = 1;
            break;
          }
          default: {
            atCarriageReturn = true;
            column = 1;
          }
        }
      }
      startPosition = endPosition + 1;
    }
    if (end) {
      if (atCarriageReturn) {
        chunks.push(-5);
      }
      if (buffer) {
        chunks.push(buffer);
      }
      chunks.push(null);
    }
    return chunks;
  }
}

// ../../node_modules/markdownlint/lib/micromark-parse.mjs
var import_micromark_helpers30 = __toESM(require_micromark_helpers(), 1);
var import_shared = __toESM(require_shared(), 1);
function directiveNoInline() {
  const extension = {
    ...directive()
  };
  delete extension.text;
  return extension;
}
function getText(markdown, token) {
  return markdown.slice(token.start.offset, token.end.offset);
}
function getEvents(markdown, micromarkParseOptions = {}) {
  const extensions = [
    directiveNoInline(),
    gfmAutolinkLiteral(),
    gfmFootnote(),
    gfmTable(),
    math(),
    ...micromarkParseOptions.extensions || []
  ];
  const artificialEventLists = [];
  const tokenizeOriginal = labelEnd.tokenize;
  function tokenizeShim(effects, okOriginal, nokOriginal) {
    const tokenizeContext = this;
    const events = tokenizeContext.events;
    const nokShim = (code18) => {
      let indexStart = events.length;
      while (--indexStart >= 0) {
        const event = events[indexStart];
        const [kind, token] = event;
        if (kind === "enter") {
          const { type } = token;
          if (type === "labelImage" || type === "labelLink") {
            break;
          }
        }
      }
      if (indexStart >= 0) {
        const eventStart = events[indexStart];
        const [, eventStartToken] = eventStart;
        const eventEnd = events[events.length - 1];
        const [, eventEndToken] = eventEnd;
        const undefinedReferenceType = {
          "type": "undefinedReferenceShortcut",
          "start": eventStartToken.start,
          "end": eventEndToken.end
        };
        const undefinedReference = {
          "type": "undefinedReference",
          "start": eventStartToken.start,
          "end": eventEndToken.end
        };
        const eventsToReplicate = events.slice(indexStart).filter((event) => {
          const [, eventToken] = event;
          const { type } = eventToken;
          return type === "data" || type === "lineEnding";
        });
        const previousUndefinedEvent = artificialEventLists.length > 0 && artificialEventLists[artificialEventLists.length - 1][0];
        const previousUndefinedToken = previousUndefinedEvent && previousUndefinedEvent[1];
        if (previousUndefinedToken && previousUndefinedToken.end.line === undefinedReferenceType.start.line && previousUndefinedToken.end.column === undefinedReferenceType.start.column) {
          if (eventsToReplicate.length === 0) {
            previousUndefinedToken.type = "undefinedReferenceCollapsed";
            previousUndefinedToken.end = eventEndToken.end;
          } else {
            undefinedReferenceType.type = "undefinedReferenceFull";
            undefinedReferenceType.start = previousUndefinedToken.start;
            artificialEventLists.pop();
          }
        }
        const text4 = eventsToReplicate.filter((event) => event[0] === "enter").map((event) => getText(markdown, event[1])).join("").trim();
        if (text4.length > 0 && !text4.includes("]")) {
          const artificialEvents = [
            ["enter", undefinedReferenceType, tokenizeContext],
            ["enter", undefinedReference, tokenizeContext]
          ];
          for (const event of eventsToReplicate) {
            const [kind, token] = event;
            artificialEvents.push([kind, { ...token }, tokenizeContext]);
          }
          artificialEvents.push(
            ["exit", undefinedReference, tokenizeContext],
            ["exit", undefinedReferenceType, tokenizeContext]
          );
          artificialEventLists.push(artificialEvents);
        }
      }
      return nokOriginal(code18);
    };
    return tokenizeOriginal.call(tokenizeContext, effects, okOriginal, nokShim);
  }
  try {
    labelEnd.tokenize = tokenizeShim;
    const encoding = void 0;
    const eol = true;
    const parseContext = parse({ ...micromarkParseOptions, extensions });
    const chunks = preprocess()(markdown, encoding, eol);
    const events = postprocess(parseContext.document().write(chunks));
    return events.concat(...artificialEventLists);
  } finally {
    labelEnd.tokenize = tokenizeOriginal;
  }
}
function parseInternal(markdown, parseOptions = {}, micromarkParseOptions = {}, lineDelta = 0, ancestor = void 0) {
  const freezeTokens = Boolean(parseOptions.freezeTokens);
  const events = getEvents(markdown, micromarkParseOptions);
  const document3 = [];
  let flatTokens = [];
  const root = {
    "type": "data",
    "startLine": -1,
    "startColumn": -1,
    "endLine": -1,
    "endColumn": -1,
    "text": "ROOT",
    "children": document3,
    "parent": null
  };
  const history = [root];
  let current = root;
  let reparseOptions = null;
  let lines = null;
  let skipHtmlFlowChildren = false;
  for (const event of events) {
    const [kind, token] = event;
    const { type, start, end } = token;
    const { "column": startColumn, "line": startLine } = start;
    const { "column": endColumn, "line": endLine } = end;
    const text4 = getText(markdown, token);
    if (kind === "enter" && !skipHtmlFlowChildren) {
      const previous4 = current;
      history.push(previous4);
      current = {
        type,
        "startLine": startLine + lineDelta,
        startColumn,
        "endLine": endLine + lineDelta,
        endColumn,
        text: text4,
        "children": [],
        "parent": previous4 === root ? ancestor || null : previous4
      };
      if (ancestor) {
        Object.defineProperty(current, import_shared.htmlFlowSymbol, { "value": true });
      }
      previous4.children.push(current);
      flatTokens.push(current);
      if (current.type === "htmlFlow" && !(0, import_micromark_helpers30.isHtmlFlowComment)(current)) {
        skipHtmlFlowChildren = true;
        if (!reparseOptions || !lines) {
          reparseOptions = {
            ...micromarkParseOptions,
            "extensions": [
              {
                "disable": {
                  "null": ["codeIndented", "htmlFlow"]
                }
              }
            ]
          };
          lines = markdown.split(import_shared.newlineRe);
        }
        const reparseMarkdown = lines.slice(current.startLine - 1, current.endLine).join("\n");
        const tokens = parseInternal(
          reparseMarkdown,
          parseOptions,
          reparseOptions,
          current.startLine - 1,
          current
        );
        current.children = tokens;
        flatTokens = flatTokens.concat(tokens[import_shared.flatTokensSymbol]);
      }
    } else if (kind === "exit") {
      if (type === "htmlFlow") {
        skipHtmlFlowChildren = false;
      }
      if (!skipHtmlFlowChildren) {
        if (freezeTokens) {
          Object.freeze(current.children);
          Object.freeze(current);
        }
        current = history.pop();
      }
    }
  }
  Object.defineProperty(document3, import_shared.flatTokensSymbol, { "value": flatTokens });
  if (freezeTokens) {
    Object.freeze(document3);
  }
  return document3;
}
function parse2(markdown, parseOptions) {
  return parseInternal(markdown, parseOptions);
}

// ../../node_modules/markdownlint/lib/md044.mjs
var ignoredChildTypes = /* @__PURE__ */ new Set(
  ["codeFencedFence", "definition", "reference", "resource"]
);
var md044_default = {
  "names": ["MD044", "proper-names"],
  "description": "Proper names should have the correct capitalization",
  "tags": ["spelling"],
  "parser": "micromark",
  "function": function MD044(params2, onError) {
    let names = params2.config.names;
    names = Array.isArray(names) ? names : [];
    names.sort((a, b) => b.length - a.length || a.localeCompare(b));
    if (names.length === 0) {
      return;
    }
    const codeBlocks = params2.config.code_blocks;
    const includeCodeBlocks = codeBlocks === void 0 || !!codeBlocks;
    const htmlElements = params2.config.html_elements;
    const includeHtmlElements = htmlElements === void 0 || !!htmlElements;
    const scannedTypes = /* @__PURE__ */ new Set(["data"]);
    if (includeCodeBlocks) {
      scannedTypes.add("codeFlowValue");
      scannedTypes.add("codeTextData");
    }
    if (includeHtmlElements) {
      scannedTypes.add("htmlFlowData");
      scannedTypes.add("htmlTextData");
    }
    const contentTokens = (0, import_micromark_helpers31.filterByPredicate)(
      params2.parsers.micromark.tokens,
      (token) => scannedTypes.has(token.type),
      (token) => token.children.filter((t) => !ignoredChildTypes.has(t.type))
    );
    const exclusions = [];
    const scannedTokens = /* @__PURE__ */ new Set();
    for (const name of names) {
      const escapedName = (0, import_helpers38.escapeForRegExp)(name);
      const startNamePattern = /^\W/.test(name) ? "" : "\\b_*";
      const endNamePattern = /\W$/.test(name) ? "" : "_*\\b";
      const namePattern = `(${startNamePattern})(${escapedName})${endNamePattern}`;
      const nameRe2 = new RegExp(namePattern, "gi");
      for (const token of contentTokens) {
        let match = null;
        while ((match = nameRe2.exec(token.text)) !== null) {
          const [, leftMatch, nameMatch] = match;
          const column = token.startColumn + match.index + leftMatch.length;
          const length = nameMatch.length;
          const lineNumber = token.startLine;
          const nameRange = {
            "startLine": lineNumber,
            "startColumn": column,
            "endLine": lineNumber,
            "endColumn": column + length - 1
          };
          if (!names.includes(nameMatch) && !exclusions.some((exclusion) => (0, import_helpers38.hasOverlap)(exclusion, nameRange))) {
            let autolinkRanges = [];
            if (!scannedTokens.has(token)) {
              autolinkRanges = (0, import_micromark_helpers31.filterByTypes)(parse2(token.text), ["literalAutolink"]).map((tok) => ({
                "startLine": lineNumber,
                "startColumn": token.startColumn + tok.startColumn - 1,
                "endLine": lineNumber,
                "endColumn": token.endColumn + tok.endColumn - 1
              }));
              exclusions.push(...autolinkRanges);
              scannedTokens.add(token);
            }
            if (!autolinkRanges.some((autolinkRange) => (0, import_helpers38.hasOverlap)(autolinkRange, nameRange))) {
              (0, import_helpers38.addErrorDetailIf)(
                onError,
                token.startLine,
                name,
                nameMatch,
                void 0,
                void 0,
                [column, length],
                {
                  "editColumn": column,
                  "deleteCount": length,
                  "insertText": name
                }
              );
            }
          }
          exclusions.push(nameRange);
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md045.mjs
var import_helpers39 = __toESM(require_helpers(), 1);
var import_micromark_helpers32 = __toESM(require_micromark_helpers(), 1);
var altRe = (0, import_helpers39.getHtmlAttributeRe)("alt");
var ariaHiddenRe = (0, import_helpers39.getHtmlAttributeRe)("aria-hidden");
var md045_default = {
  "names": ["MD045", "no-alt-text"],
  "description": "Images should have alternate text (alt text)",
  "tags": ["accessibility", "images"],
  "parser": "micromark",
  "function": function MD045(params2, onError) {
    const images = filterByTypesCached(["image"]);
    for (const image of images) {
      const labelTexts = (0, import_micromark_helpers32.getDescendantsByType)(image, ["label", "labelText"]);
      if (labelTexts.some((labelText) => labelText.text.length === 0)) {
        const range = image.startLine === image.endLine ? [image.startColumn, image.endColumn - image.startColumn] : void 0;
        (0, import_helpers39.addError)(
          onError,
          image.startLine,
          void 0,
          void 0,
          range
        );
      }
    }
    const htmlTexts = filterByTypesCached(["htmlText"], true);
    for (const htmlText2 of htmlTexts) {
      const { startColumn, startLine, text: text4 } = htmlText2;
      const htmlTagInfo = (0, import_micromark_helpers32.getHtmlTagInfo)(htmlText2);
      if (htmlTagInfo && !htmlTagInfo.close && htmlTagInfo.name.toLowerCase() === "img" && !altRe.test(text4) && ariaHiddenRe.exec(text4)?.[1].toLowerCase() !== "true") {
        const range = [
          startColumn,
          text4.replace(import_helpers39.nextLinesRe, "").length
        ];
        (0, import_helpers39.addError)(
          onError,
          startLine,
          void 0,
          void 0,
          range
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md046.mjs
var import_helpers40 = __toESM(require_helpers(), 1);
var tokenTypeToStyle = (tokenType) => tokenType === "codeFenced" ? "fenced" : "indented";
var md046_default = {
  "names": ["MD046", "code-block-style"],
  "description": "Code block style",
  "tags": ["code"],
  "parser": "micromark",
  "function": function MD046(params2, onError) {
    let expectedStyle = String(params2.config.style || "consistent");
    for (const token of filterByTypesCached(["codeFenced", "codeIndented"])) {
      const { startLine, type } = token;
      if (expectedStyle === "consistent") {
        expectedStyle = tokenTypeToStyle(type);
      }
      (0, import_helpers40.addErrorDetailIf)(
        onError,
        startLine,
        expectedStyle,
        tokenTypeToStyle(type)
      );
    }
  }
};

// ../../node_modules/markdownlint/lib/md047.mjs
var import_helpers41 = __toESM(require_helpers(), 1);
var md047_default = {
  "names": ["MD047", "single-trailing-newline"],
  "description": "Files should end with a single newline character",
  "tags": ["blank_lines"],
  "parser": "none",
  "function": function MD047(params2, onError) {
    const lastLineNumber = params2.lines.length;
    const lastLine = params2.lines[lastLineNumber - 1];
    if (!(0, import_helpers41.isBlankLine)(lastLine)) {
      (0, import_helpers41.addError)(
        onError,
        lastLineNumber,
        void 0,
        void 0,
        [lastLine.length, 1],
        {
          "insertText": "\n",
          "editColumn": lastLine.length + 1
        }
      );
    }
  }
};

// ../../node_modules/markdownlint/lib/md048.mjs
var import_helpers42 = __toESM(require_helpers(), 1);
var import_micromark_helpers33 = __toESM(require_micromark_helpers(), 1);
function fencedCodeBlockStyleFor(markup) {
  switch (markup[0]) {
    case "~":
      return "tilde";
    default:
      return "backtick";
  }
}
var md048_default = {
  "names": ["MD048", "code-fence-style"],
  "description": "Code fence style",
  "tags": ["code"],
  "parser": "micromark",
  "function": function MD048(params2, onError) {
    const style = String(params2.config.style || "consistent");
    let expectedStyle = style;
    const codeFenceds = filterByTypesCached(["codeFenced"]);
    for (const codeFenced2 of codeFenceds) {
      const { startLine, text: text4 } = (0, import_micromark_helpers33.getDescendantsByType)(codeFenced2, ["codeFencedFence", "codeFencedFenceSequence"])[0];
      if (expectedStyle === "consistent") {
        expectedStyle = fencedCodeBlockStyleFor(text4);
      }
      (0, import_helpers42.addErrorDetailIf)(
        onError,
        startLine,
        expectedStyle,
        fencedCodeBlockStyleFor(text4)
      );
    }
  }
};

// ../../node_modules/markdownlint/lib/md049-md050.mjs
var import_helpers43 = __toESM(require_helpers(), 1);
var import_micromark_helpers34 = __toESM(require_micromark_helpers(), 1);
var intrawordRe = /^\w$/;
function emphasisOrStrongStyleFor(markup) {
  switch (markup[0]) {
    case "*":
      return "asterisk";
    default:
      return "underscore";
  }
}
var impl = (params2, onError, type, typeSequence, asterisk, underline, style = "consistent") => {
  const { lines, parsers } = params2;
  const emphasisTokens = (0, import_micromark_helpers34.filterByPredicate)(
    parsers.micromark.tokens,
    (token) => token.type === type,
    (token) => token.type === "htmlFlow" ? [] : token.children
  );
  for (const token of emphasisTokens) {
    const sequences = (0, import_micromark_helpers34.getDescendantsByType)(token, [typeSequence]);
    const startSequence = sequences[0];
    const endSequence = sequences[sequences.length - 1];
    if (startSequence && endSequence) {
      const markupStyle = emphasisOrStrongStyleFor(startSequence.text);
      if (style === "consistent") {
        style = markupStyle;
      }
      if (style !== markupStyle) {
        const underscoreIntraword = style === "underscore" && (intrawordRe.test(
          lines[startSequence.startLine - 1][startSequence.startColumn - 2]
        ) || intrawordRe.test(
          lines[endSequence.endLine - 1][endSequence.endColumn - 1]
        ));
        if (!underscoreIntraword) {
          for (const sequence of [startSequence, endSequence]) {
            (0, import_helpers43.addError)(
              onError,
              sequence.startLine,
              `Expected: ${style}; Actual: ${markupStyle}`,
              void 0,
              [sequence.startColumn, sequence.text.length],
              {
                "editColumn": sequence.startColumn,
                "deleteCount": sequence.text.length,
                "insertText": style === "asterisk" ? asterisk : underline
              }
            );
          }
        }
      }
    }
  }
};
var md049_md050_default = [
  {
    "names": ["MD049", "emphasis-style"],
    "description": "Emphasis style",
    "tags": ["emphasis"],
    "parser": "micromark",
    "function": function MD049(params2, onError) {
      return impl(
        params2,
        onError,
        "emphasis",
        "emphasisSequence",
        "*",
        "_",
        params2.config.style || void 0
      );
    }
  },
  {
    "names": ["MD050", "strong-style"],
    "description": "Strong style",
    "tags": ["emphasis"],
    "parser": "micromark",
    "function": function MD050(params2, onError) {
      return impl(
        params2,
        onError,
        "strong",
        "strongSequence",
        "**",
        "__",
        params2.config.style || void 0
      );
    }
  }
];

// ../../node_modules/markdownlint/lib/md051.mjs
var import_helpers44 = __toESM(require_helpers(), 1);
var import_micromark_helpers35 = __toESM(require_micromark_helpers(), 1);
var idRe = (0, import_helpers44.getHtmlAttributeRe)("id");
var nameRe = (0, import_helpers44.getHtmlAttributeRe)("name");
var anchorRe = /\{(#[a-z\d]+(?:[-_]+[a-z\d]+)*)\}/gu;
var lineFragmentRe = /^#(?:L\d+(?:C\d+)?-L\d+(?:C\d+)?|L\d+)$/;
var childrenExclude = /* @__PURE__ */ new Set(["image", "reference", "resource"]);
var tokensInclude = /* @__PURE__ */ new Set(
  ["characterEscapeValue", "codeTextData", "data", "mathTextData"]
);
function convertHeadingToHTMLFragment(headingText) {
  const inlineText = (0, import_micromark_helpers35.filterByPredicate)(
    headingText.children,
    (token) => tokensInclude.has(token.type),
    (token) => childrenExclude.has(token.type) ? [] : token.children
  ).map((token) => token.text).join("");
  return "#" + encodeURIComponent(
    inlineText.toLowerCase().replace(
      /[^\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}\- ]/gu,
      ""
    ).replace(/ /gu, "-").toWellFormed()
  );
}
function unescapeStringTokenText(token) {
  return (0, import_micromark_helpers35.filterByTypes)(token.children, ["characterEscapeValue", "data"]).map((child) => child.text).join("");
}
var md051_default = {
  "names": ["MD051", "link-fragments"],
  "description": "Link fragments should be valid",
  "tags": ["links"],
  "parser": "micromark",
  "function": function MD051(params2, onError) {
    const ignoreCase = params2.config.ignore_case || false;
    const ignoredPattern = params2.config.ignored_pattern || "";
    const ignoredPatternRe = new RegExp(ignoredPattern || "^$");
    const fragments = /* @__PURE__ */ new Map([["#top", 0]]);
    const headingTexts = filterByTypesCached(["atxHeadingText", "setextHeadingText"]);
    for (const headingText of headingTexts) {
      const fragment = convertHeadingToHTMLFragment(headingText);
      if (fragment !== "#") {
        const count = fragments.get(fragment) || 0;
        if (count) {
          fragments.set(`${fragment}-${count}`, 0);
        }
        fragments.set(fragment, count + 1);
        let match = null;
        while ((match = anchorRe.exec(headingText.text)) !== null) {
          const [, anchor] = match;
          if (!fragments.has(anchor)) {
            fragments.set(anchor, 1);
          }
        }
      }
    }
    for (const token of filterByTypesCached(["htmlText"], true)) {
      const htmlTagInfo = (0, import_micromark_helpers35.getHtmlTagInfo)(token);
      if (htmlTagInfo && !htmlTagInfo.close) {
        const anchorMatch = idRe.exec(token.text) || htmlTagInfo.name.toLowerCase() === "a" && nameRe.exec(token.text);
        if (anchorMatch && anchorMatch.length > 0) {
          fragments.set(`#${anchorMatch[1]}`, 0);
        }
      }
    }
    const parentChilds = [
      ["link", "resourceDestinationString"],
      ["definition", "definitionDestinationString"]
    ];
    for (const [parentType, definitionType] of parentChilds) {
      const links = filterByTypesCached([parentType]).filter(
        (link) => !(link.parent?.type === "atxHeadingText" && (0, import_micromark_helpers35.isDocfxTab)(link.parent.parent))
      );
      for (const link of links) {
        const definitions = (0, import_micromark_helpers35.filterByTypes)(link.children, [definitionType]);
        for (const definition2 of definitions) {
          const { endColumn, startColumn } = definition2;
          const text4 = unescapeStringTokenText(definition2);
          const textSliceOne = text4.slice(1);
          const encodedText = `#${encodeURIComponent(textSliceOne.toWellFormed())}`;
          if (text4.length > 1 && text4.startsWith("#") && !fragments.has(encodedText) && !lineFragmentRe.test(encodedText) && !ignoredPatternRe.test(textSliceOne)) {
            let context = void 0;
            let range = void 0;
            let fixInfo = void 0;
            if (link.startLine === link.endLine) {
              context = link.text;
              range = [link.startColumn, link.endColumn - link.startColumn];
              fixInfo = {
                "editColumn": startColumn,
                "deleteCount": endColumn - startColumn
              };
            }
            const textLower = text4.toLowerCase();
            const mixedCaseKey = [...fragments.keys()].find((key) => textLower === key.toLowerCase());
            if (mixedCaseKey) {
              (fixInfo || {}).insertText = mixedCaseKey;
              if (!ignoreCase && mixedCaseKey !== text4) {
                (0, import_helpers44.addError)(
                  onError,
                  link.startLine,
                  `Expected: ${mixedCaseKey}; Actual: ${text4}`,
                  context,
                  range,
                  fixInfo
                );
              }
            } else {
              (0, import_helpers44.addError)(
                onError,
                link.startLine,
                void 0,
                context,
                range
              );
            }
          }
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md052.mjs
var import_helpers45 = __toESM(require_helpers(), 1);
var md052_default = {
  "names": ["MD052", "reference-links-images"],
  "description": "Reference links and images should use a label that is defined",
  "tags": ["images", "links"],
  "parser": "none",
  "function": function MD052(params2, onError) {
    const { config, lines } = params2;
    const shortcutSyntax = config.shortcut_syntax || false;
    const ignoredLabels = new Set(config.ignored_labels || ["x"]);
    const { definitions, references, shortcuts } = getReferenceLinkImageData();
    const entries = shortcutSyntax ? [...references.entries(), ...shortcuts.entries()] : references.entries();
    for (const reference of entries) {
      const [label4, datas] = reference;
      if (!definitions.has(label4) && !ignoredLabels.has(label4)) {
        for (const data of datas) {
          const [lineIndex, index, length] = data;
          const context = lines[lineIndex].slice(index, index + length);
          (0, import_helpers45.addError)(
            onError,
            lineIndex + 1,
            `Missing link or image reference definition: "${label4}"`,
            context,
            [index + 1, context.length]
          );
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md053.mjs
var import_helpers46 = __toESM(require_helpers(), 1);
var linkReferenceDefinitionRe = /^ {0,3}\[([^\]]*[^\\])\]:/;
var md053_default = {
  "names": ["MD053", "link-image-reference-definitions"],
  "description": "Link and image reference definitions should be needed",
  "tags": ["images", "links"],
  "parser": "none",
  "function": function MD053(params2, onError) {
    const ignored = new Set(params2.config.ignored_definitions || ["//"]);
    const lines = params2.lines;
    const { references, shortcuts, definitions, duplicateDefinitions } = getReferenceLinkImageData();
    const singleLineDefinition = (line) => line.replace(linkReferenceDefinitionRe, "").trim().length > 0;
    const deleteFixInfo = {
      "deleteCount": -1
    };
    for (const definition2 of definitions.entries()) {
      const [label4, [lineIndex]] = definition2;
      if (!ignored.has(label4) && !references.has(label4) && !shortcuts.has(label4)) {
        const line = lines[lineIndex];
        (0, import_helpers46.addError)(
          onError,
          lineIndex + 1,
          `Unused link or image reference definition: "${label4}"`,
          (0, import_helpers46.ellipsify)(line),
          [1, line.length],
          singleLineDefinition(line) ? deleteFixInfo : void 0
        );
      }
    }
    for (const duplicateDefinition of duplicateDefinitions) {
      const [label4, lineIndex] = duplicateDefinition;
      if (!ignored.has(label4)) {
        const line = lines[lineIndex];
        (0, import_helpers46.addError)(
          onError,
          lineIndex + 1,
          `Duplicate link or image reference definition: "${label4}"`,
          (0, import_helpers46.ellipsify)(line),
          [1, line.length],
          singleLineDefinition(line) ? deleteFixInfo : void 0
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md054.mjs
var import_helpers47 = __toESM(require_helpers(), 1);
var import_micromark_helpers36 = __toESM(require_micromark_helpers(), 1);
var backslashEscapeRe = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
var removeBackslashEscapes = (text4) => text4.replace(backslashEscapeRe, "$1");
var autolinkDisallowedRe = /[ <>]/;
var autolinkAble = (destination) => {
  try {
    new URL(destination);
  } catch {
    return false;
  }
  return !autolinkDisallowedRe.test(destination);
};
var md054_default = {
  "names": ["MD054", "link-image-style"],
  "description": "Link and image style",
  "tags": ["images", "links"],
  "parser": "micromark",
  "function": (params2, onError) => {
    const config = params2.config;
    const autolink2 = config.autolink === void 0 || !!config.autolink;
    const inline = config.inline === void 0 || !!config.inline;
    const full = config.full === void 0 || !!config.full;
    const collapsed = config.collapsed === void 0 || !!config.collapsed;
    const shortcut = config.shortcut === void 0 || !!config.shortcut;
    const urlInline = config.url_inline === void 0 || !!config.url_inline;
    if (autolink2 && inline && full && collapsed && shortcut && urlInline) {
      return;
    }
    const { definitions } = getReferenceLinkImageData();
    const links = filterByTypesCached(["autolink", "image", "link"]);
    for (const link of links) {
      let label4 = null;
      let destination = null;
      const {
        endColumn,
        endLine,
        startColumn,
        startLine,
        text: text4,
        type
      } = link;
      const image = type === "image";
      let isError = false;
      if (type === "autolink") {
        destination = (0, import_micromark_helpers36.getDescendantsByType)(link, [["autolinkEmail", "autolinkProtocol"]])[0]?.text;
        label4 = destination;
        isError = !autolink2 && Boolean(destination);
      } else {
        label4 = (0, import_micromark_helpers36.getDescendantsByType)(link, ["label", "labelText"])[0].text;
        destination = (0, import_micromark_helpers36.getDescendantsByType)(link, ["resource", "resourceDestination", ["resourceDestinationLiteral", "resourceDestinationRaw"], "resourceDestinationString"])[0]?.text;
        if (destination) {
          const title = (0, import_micromark_helpers36.getDescendantsByType)(link, ["resource", "resourceTitle", "resourceTitleString"])[0]?.text;
          isError = !inline || !urlInline && autolink2 && !image && !title && label4 === destination && autolinkAble(destination);
        } else {
          const isShortcut = (0, import_micromark_helpers36.getDescendantsByType)(link, ["reference"]).length === 0;
          const referenceString = (0, import_micromark_helpers36.getDescendantsByType)(link, ["reference", "referenceString"])[0]?.text;
          const isCollapsed = referenceString === void 0;
          const definition2 = definitions.get(referenceString || label4);
          destination = definition2 && definition2[1] || "";
          isError = Boolean(
            destination && (isShortcut ? !shortcut : isCollapsed ? !collapsed : !full)
          );
        }
      }
      if (isError) {
        let range = void 0;
        let fixInfo = void 0;
        if (startLine === endLine) {
          range = [startColumn, endColumn - startColumn];
          let insertText = null;
          const canInline = inline && label4;
          const canAutolink = autolink2 && !image && autolinkAble(destination);
          if (canInline && (urlInline || !canAutolink)) {
            const prefix = image ? "!" : "";
            const escapedLabel = label4.replace(/[[\]]/g, "\\$&");
            const escapedDestination = destination.replace(/[()]/g, "\\$&");
            insertText = `${prefix}[${escapedLabel}](${escapedDestination})`;
          } else if (canAutolink) {
            insertText = `<${removeBackslashEscapes(destination)}>`;
          }
          if (insertText) {
            fixInfo = {
              "editColumn": range[0],
              insertText,
              "deleteCount": range[1]
            };
          }
        }
        (0, import_helpers47.addErrorContext)(
          onError,
          startLine,
          text4.replace(import_helpers47.nextLinesRe, ""),
          void 0,
          void 0,
          range,
          fixInfo
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md055.mjs
var import_helpers48 = __toESM(require_helpers(), 1);
var import_micromark_helpers37 = __toESM(require_micromark_helpers(), 1);
var whitespaceTypes = /* @__PURE__ */ new Set(["linePrefix", "whitespace"]);
var ignoreWhitespace = (tokens) => tokens.filter(
  (token) => !whitespaceTypes.has(token.type)
);
var firstOrNothing = (items) => items[0];
var lastOrNothing = (items) => items[items.length - 1];
var makeRange = (start, end) => [start, end - start + 1];
var md055_default = {
  "names": ["MD055", "table-pipe-style"],
  "description": "Table pipe style",
  "tags": ["table"],
  "parser": "micromark",
  "function": function MD055(params2, onError) {
    const style = String(params2.config.style || "consistent");
    let expectedStyle = style;
    let expectedLeadingPipe = expectedStyle !== "no_leading_or_trailing" && expectedStyle !== "trailing_only";
    let expectedTrailingPipe = expectedStyle !== "no_leading_or_trailing" && expectedStyle !== "leading_only";
    let currentTable = null;
    const rows = filterByTypesCached(["tableDelimiterRow", "tableRow"]);
    for (const row of rows) {
      if (style === "per_table") {
        const rowTable = (0, import_micromark_helpers37.getParentOfType)(row, ["table"]);
        if (rowTable !== currentTable) {
          expectedStyle = "consistent";
          currentTable = rowTable;
        }
      }
      const firstCell = firstOrNothing(row.children);
      const leadingToken = firstOrNothing(ignoreWhitespace(firstCell.children));
      const actualLeadingPipe = leadingToken.type === "tableCellDivider";
      const lastCell = lastOrNothing(row.children);
      const trailingToken = lastOrNothing(ignoreWhitespace(lastCell.children));
      const actualTrailingPipe = trailingToken.type === "tableCellDivider";
      const actualStyle = actualLeadingPipe ? actualTrailingPipe ? "leading_and_trailing" : "leading_only" : actualTrailingPipe ? "trailing_only" : "no_leading_or_trailing";
      if (expectedStyle === "consistent") {
        expectedStyle = actualStyle;
        expectedLeadingPipe = actualLeadingPipe;
        expectedTrailingPipe = actualTrailingPipe;
      }
      if (actualLeadingPipe !== expectedLeadingPipe) {
        (0, import_helpers48.addErrorDetailIf)(
          onError,
          firstCell.startLine,
          expectedStyle,
          actualStyle,
          `${expectedLeadingPipe ? "Missing" : "Unexpected"} leading pipe`,
          void 0,
          makeRange(row.startColumn, firstCell.startColumn)
        );
      }
      if (actualTrailingPipe !== expectedTrailingPipe) {
        (0, import_helpers48.addErrorDetailIf)(
          onError,
          lastCell.endLine,
          expectedStyle,
          actualStyle,
          `${expectedTrailingPipe ? "Missing" : "Unexpected"} trailing pipe`,
          void 0,
          makeRange(lastCell.endColumn - 1, row.endColumn - 1)
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md056.mjs
var import_helpers49 = __toESM(require_helpers(), 1);
var import_micromark_helpers38 = __toESM(require_micromark_helpers(), 1);
var makeRange2 = (start, end) => [start, end - start + 1];
var md056_default = {
  "names": ["MD056", "table-column-count"],
  "description": "Table column count",
  "tags": ["table"],
  "parser": "micromark",
  "function": function MD056(params2, onError) {
    const rows = filterByTypesCached(["tableDelimiterRow", "tableRow"]);
    let expectedCount = 0;
    let currentTable = null;
    for (const row of rows) {
      const table = (0, import_micromark_helpers38.getParentOfType)(row, ["table"]);
      if (currentTable !== table) {
        expectedCount = 0;
        currentTable = table;
      }
      const cells = row.children.filter((child) => ["tableData", "tableDelimiter", "tableHeader"].includes(child.type));
      const actualCount = cells.length;
      expectedCount ||= actualCount;
      let detail = void 0;
      let range = void 0;
      if (actualCount < expectedCount) {
        detail = "Too few cells, row will be missing data";
        range = [row.endColumn - 1, 1];
      } else if (expectedCount < actualCount) {
        detail = "Too many cells, extra data will be missing";
        range = makeRange2(cells[expectedCount].startColumn, row.endColumn - 1);
      }
      (0, import_helpers49.addErrorDetailIf)(
        onError,
        row.endLine,
        expectedCount,
        actualCount,
        detail,
        void 0,
        range
      );
    }
  }
};

// ../../node_modules/markdownlint/lib/md058.mjs
var import_helpers50 = __toESM(require_helpers(), 1);
var import_micromark_helpers39 = __toESM(require_micromark_helpers(), 1);
var md058_default = {
  "names": ["MD058", "blanks-around-tables"],
  "description": "Tables should be surrounded by blank lines",
  "tags": ["table"],
  "parser": "micromark",
  "function": function MD058(params2, onError) {
    const { lines } = params2;
    const blockQuotePrefixes = filterByTypesCached(["blockQuotePrefix", "linePrefix"]);
    const tables = filterByTypesCached(["table"]);
    for (const table of tables) {
      const firstLineNumber = table.startLine;
      if (!(0, import_helpers50.isBlankLine)(lines[firstLineNumber - 2])) {
        (0, import_helpers50.addErrorContext)(
          onError,
          firstLineNumber,
          lines[firstLineNumber - 1].trim(),
          void 0,
          void 0,
          void 0,
          {
            "insertText": (0, import_micromark_helpers39.getBlockQuotePrefixText)(blockQuotePrefixes, firstLineNumber)
          }
        );
      }
      const lastLineNumber = table.endLine;
      if (!(0, import_helpers50.isBlankLine)(lines[lastLineNumber])) {
        (0, import_helpers50.addErrorContext)(
          onError,
          lastLineNumber,
          lines[lastLineNumber - 1].trim(),
          void 0,
          void 0,
          void 0,
          {
            "lineNumber": lastLineNumber + 1,
            "insertText": (0, import_micromark_helpers39.getBlockQuotePrefixText)(blockQuotePrefixes, lastLineNumber)
          }
        );
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md059.mjs
var import_helpers51 = __toESM(require_helpers(), 1);
var import_micromark_helpers40 = __toESM(require_micromark_helpers(), 1);
var allowedChildrenTypes = /* @__PURE__ */ new Set([
  "codeText",
  "htmlText"
]);
var defaultProhibitedTexts = [
  "click here",
  "here",
  "link",
  "more"
];
function normalize(str) {
  return str.replace(/[\W_]+/g, " ").replace(/\s+/g, " ").toLowerCase().trim();
}
var md059_default = {
  "names": ["MD059", "descriptive-link-text"],
  "description": "Link text should be descriptive",
  "tags": ["accessibility", "links"],
  "parser": "micromark",
  "function": function MD059(params2, onError) {
    const prohibitedTexts = new Set(
      (params2.config.prohibited_texts || defaultProhibitedTexts).map(normalize)
    );
    if (prohibitedTexts.size > 0) {
      const links = filterByTypesCached(["link"]);
      for (const link of links) {
        const labelTexts = (0, import_micromark_helpers40.getDescendantsByType)(link, ["label", "labelText"]);
        for (const labelText of labelTexts) {
          const { children, endColumn, endLine, parent, startColumn, startLine, text: text4 } = labelText;
          if (!children.some((child) => allowedChildrenTypes.has(child.type)) && prohibitedTexts.has(normalize(text4))) {
            const range = startLine === endLine ? [startColumn, endColumn - startColumn] : void 0;
            (0, import_helpers51.addErrorContext)(
              onError,
              startLine,
              // @ts-ignore
              parent.text,
              void 0,
              void 0,
              range
            );
          }
        }
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/md060.mjs
var import_micromark_helpers41 = __toESM(require_micromark_helpers(), 1);

// ../../node_modules/ansi-regex/index.js
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const osc = `(?:(?:\\u001B\\]|\\u009D)[^\\u0007\\u001B\\u009C\\u009D]*${ST})`;
  const csi = "[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";
  const pattern = `${osc}|${csi}`;
  return new RegExp(pattern, onlyFirst ? void 0 : "g");
}

// ../../node_modules/markdownlint/node_modules/strip-ansi/index.js
var regex = ansiRegex();
function stripAnsi(string3) {
  if (typeof string3 !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string3}\``);
  }
  if (!string3.includes("\x1B") && !string3.includes("\x9B")) {
    return string3;
  }
  return string3.replace(regex, "");
}

// ../../node_modules/get-east-asian-width/lookup-data.js
var ambiguousMinimalCodePoint = 161;
var ambiguousMaximumCodePoint = 1114109;
var ambiguousRanges = [161, 161, 164, 164, 167, 168, 170, 170, 173, 174, 176, 180, 182, 186, 188, 191, 198, 198, 208, 208, 215, 216, 222, 225, 230, 230, 232, 234, 236, 237, 240, 240, 242, 243, 247, 250, 252, 252, 254, 254, 257, 257, 273, 273, 275, 275, 283, 283, 294, 295, 299, 299, 305, 307, 312, 312, 319, 322, 324, 324, 328, 331, 333, 333, 338, 339, 358, 359, 363, 363, 462, 462, 464, 464, 466, 466, 468, 468, 470, 470, 472, 472, 474, 474, 476, 476, 593, 593, 609, 609, 708, 708, 711, 711, 713, 715, 717, 717, 720, 720, 728, 731, 733, 733, 735, 735, 768, 879, 913, 929, 931, 937, 945, 961, 963, 969, 1025, 1025, 1040, 1103, 1105, 1105, 8208, 8208, 8211, 8214, 8216, 8217, 8220, 8221, 8224, 8226, 8228, 8231, 8240, 8240, 8242, 8243, 8245, 8245, 8251, 8251, 8254, 8254, 8308, 8308, 8319, 8319, 8321, 8324, 8364, 8364, 8451, 8451, 8453, 8453, 8457, 8457, 8467, 8467, 8470, 8470, 8481, 8482, 8486, 8486, 8491, 8491, 8531, 8532, 8539, 8542, 8544, 8555, 8560, 8569, 8585, 8585, 8592, 8601, 8632, 8633, 8658, 8658, 8660, 8660, 8679, 8679, 8704, 8704, 8706, 8707, 8711, 8712, 8715, 8715, 8719, 8719, 8721, 8721, 8725, 8725, 8730, 8730, 8733, 8736, 8739, 8739, 8741, 8741, 8743, 8748, 8750, 8750, 8756, 8759, 8764, 8765, 8776, 8776, 8780, 8780, 8786, 8786, 8800, 8801, 8804, 8807, 8810, 8811, 8814, 8815, 8834, 8835, 8838, 8839, 8853, 8853, 8857, 8857, 8869, 8869, 8895, 8895, 8978, 8978, 9312, 9449, 9451, 9547, 9552, 9587, 9600, 9615, 9618, 9621, 9632, 9633, 9635, 9641, 9650, 9651, 9654, 9655, 9660, 9661, 9664, 9665, 9670, 9672, 9675, 9675, 9678, 9681, 9698, 9701, 9711, 9711, 9733, 9734, 9737, 9737, 9742, 9743, 9756, 9756, 9758, 9758, 9792, 9792, 9794, 9794, 9824, 9825, 9827, 9829, 9831, 9834, 9836, 9837, 9839, 9839, 9886, 9887, 9919, 9919, 9926, 9933, 9935, 9939, 9941, 9953, 9955, 9955, 9960, 9961, 9963, 9969, 9972, 9972, 9974, 9977, 9979, 9980, 9982, 9983, 10045, 10045, 10102, 10111, 11094, 11097, 12872, 12879, 57344, 63743, 65024, 65039, 65533, 65533, 127232, 127242, 127248, 127277, 127280, 127337, 127344, 127373, 127375, 127376, 127387, 127404, 917760, 917999, 983040, 1048573, 1048576, 1114109];
var fullwidthMinimalCodePoint = 12288;
var fullwidthMaximumCodePoint = 65510;
var fullwidthRanges = [12288, 12288, 65281, 65376, 65504, 65510];
var wideMinimalCodePoint = 4352;
var wideMaximumCodePoint = 262141;
var wideRanges = [4352, 4447, 8986, 8987, 9001, 9002, 9193, 9196, 9200, 9200, 9203, 9203, 9725, 9726, 9748, 9749, 9776, 9783, 9800, 9811, 9855, 9855, 9866, 9871, 9875, 9875, 9889, 9889, 9898, 9899, 9917, 9918, 9924, 9925, 9934, 9934, 9940, 9940, 9962, 9962, 9970, 9971, 9973, 9973, 9978, 9978, 9981, 9981, 9989, 9989, 9994, 9995, 10024, 10024, 10060, 10060, 10062, 10062, 10067, 10069, 10071, 10071, 10133, 10135, 10160, 10160, 10175, 10175, 11035, 11036, 11088, 11088, 11093, 11093, 11904, 11929, 11931, 12019, 12032, 12245, 12272, 12287, 12289, 12350, 12353, 12438, 12441, 12543, 12549, 12591, 12593, 12686, 12688, 12773, 12783, 12830, 12832, 12871, 12880, 42124, 42128, 42182, 43360, 43388, 44032, 55203, 63744, 64255, 65040, 65049, 65072, 65106, 65108, 65126, 65128, 65131, 94176, 94180, 94192, 94198, 94208, 101594, 101631, 101664, 101760, 101874, 101888, 102801, 102816, 102866, 110576, 110579, 110581, 110587, 110589, 110590, 110592, 110888, 110898, 110898, 110928, 110930, 110933, 110933, 110948, 110952, 110960, 111355, 119552, 119638, 119648, 119670, 126980, 126980, 127183, 127183, 127374, 127374, 127377, 127386, 127406, 127406, 127488, 127490, 127504, 127547, 127552, 127560, 127568, 127569, 127584, 127589, 127744, 127776, 127789, 127797, 127799, 127868, 127870, 127891, 127904, 127946, 127951, 127955, 127968, 127984, 127988, 127988, 127992, 128062, 128064, 128064, 128066, 128252, 128255, 128317, 128331, 128334, 128336, 128359, 128378, 128378, 128405, 128406, 128420, 128420, 128507, 128591, 128640, 128709, 128716, 128716, 128720, 128722, 128725, 128729, 128732, 128735, 128747, 128748, 128756, 128764, 128986, 128986, 128992, 129003, 129008, 129008, 129292, 129338, 129340, 129349, 129351, 129535, 129648, 129660, 129664, 129734, 129736, 129736, 129740, 129757, 129759, 129771, 129775, 129786, 131072, 196605, 196608, 262141];

// ../../node_modules/get-east-asian-width/utilities.js
var isInRange = (ranges, codePoint) => {
  let low = 0;
  let high = Math.floor(ranges.length / 2) - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const i = mid * 2;
    if (codePoint < ranges[i]) {
      high = mid - 1;
    } else if (codePoint > ranges[i + 1]) {
      low = mid + 1;
    } else {
      return true;
    }
  }
  return false;
};

// ../../node_modules/get-east-asian-width/lookup.js
var commonCjkCodePoint = 19968;
var [wideFastPathStart, wideFastPathEnd] = /* @__PURE__ */ findWideFastPathRange(wideRanges);
function findWideFastPathRange(ranges) {
  let fastPathStart = ranges[0];
  let fastPathEnd = ranges[1];
  for (let index = 0; index < ranges.length; index += 2) {
    const start = ranges[index];
    const end = ranges[index + 1];
    if (commonCjkCodePoint >= start && commonCjkCodePoint <= end) {
      return [start, end];
    }
    if (end - start > fastPathEnd - fastPathStart) {
      fastPathStart = start;
      fastPathEnd = end;
    }
  }
  return [fastPathStart, fastPathEnd];
}
var isAmbiguous = (codePoint) => {
  if (codePoint < ambiguousMinimalCodePoint || codePoint > ambiguousMaximumCodePoint) {
    return false;
  }
  return isInRange(ambiguousRanges, codePoint);
};
var isFullwidth = (codePoint) => {
  if (codePoint < fullwidthMinimalCodePoint || codePoint > fullwidthMaximumCodePoint) {
    return false;
  }
  return isInRange(fullwidthRanges, codePoint);
};
var isWide = (codePoint) => {
  if (codePoint >= wideFastPathStart && codePoint <= wideFastPathEnd) {
    return true;
  }
  if (codePoint < wideMinimalCodePoint || codePoint > wideMaximumCodePoint) {
    return false;
  }
  return isInRange(wideRanges, codePoint);
};

// ../../node_modules/get-east-asian-width/index.js
function validate(codePoint) {
  if (!Number.isSafeInteger(codePoint)) {
    throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
  }
}
function eastAsianWidth(codePoint, { ambiguousAsWide = false } = {}) {
  validate(codePoint);
  if (isFullwidth(codePoint) || isWide(codePoint) || ambiguousAsWide && isAmbiguous(codePoint)) {
    return 2;
  }
  return 1;
}

// ../../node_modules/markdownlint/node_modules/string-width/index.js
var segmenter = new Intl.Segmenter();
var visibleCharacterRegex = new RegExp("[^\\p{Default_Ignorable_Code_Point}\\p{Control}\\p{Format}\\p{Nonspacing_Mark}\\p{Enclosing_Mark}\\p{Surrogate}]", "v");
var spacingMarkRegex = new RegExp("\\p{Spacing_Mark}", "v");
var rgiEmojiRegex = new RegExp("^\\p{RGI_Emoji}$", "v");
var unqualifiedKeycapRegex = /^[\d#*]\u20E3$/;
var extendedPictographicRegex = /\p{Extended_Pictographic}/gu;
function isDoubleWidthNonRgiEmojiSequence(segment) {
  if (segment.length > 50) {
    return false;
  }
  if (unqualifiedKeycapRegex.test(segment)) {
    return true;
  }
  if (segment.includes("\u200D")) {
    const pictographics = segment.match(extendedPictographicRegex);
    return pictographics !== null && pictographics.length >= 2;
  }
  return false;
}
function baseVisible(segment) {
  const index = segment.search(visibleCharacterRegex);
  return index === -1 ? void 0 : segment.slice(index);
}
function isHangulLeadingJamo(codePoint) {
  return codePoint >= 4352 && codePoint <= 4447 || codePoint >= 43360 && codePoint <= 43388;
}
function isHangulVowelJamo(codePoint) {
  return codePoint >= 4448 && codePoint <= 4519 || codePoint >= 55216 && codePoint <= 55238;
}
function isHangulTrailingJamo(codePoint) {
  return codePoint >= 4520 && codePoint <= 4607 || codePoint >= 55243 && codePoint <= 55291;
}
function isHangulJamo(codePoint) {
  return isHangulLeadingJamo(codePoint) || isHangulVowelJamo(codePoint) || isHangulTrailingJamo(codePoint);
}
function hangulClusterWidth(visibleSegment, eastAsianWidthOptions) {
  const codePoints = [];
  for (const character of visibleSegment) {
    if (!visibleCharacterRegex.test(character)) {
      continue;
    }
    codePoints.push(character.codePointAt(0));
  }
  if (codePoints.length === 0) {
    return void 0;
  }
  let width = 0;
  for (let index = 0; index < codePoints.length; index++) {
    const codePoint = codePoints[index];
    if (!isHangulJamo(codePoint)) {
      if (width === 0) {
        return void 0;
      }
      for (let remaining = index; remaining < codePoints.length; remaining++) {
        width += eastAsianWidth(codePoints[remaining], eastAsianWidthOptions);
      }
      return width;
    }
    if (isHangulLeadingJamo(codePoint) && isHangulVowelJamo(codePoints[index + 1])) {
      width += 2;
      index += isHangulTrailingJamo(codePoints[index + 2]) ? 2 : 1;
      continue;
    }
    width += eastAsianWidth(codePoint, eastAsianWidthOptions);
  }
  return width;
}
function trailingWidth(visibleSegment, eastAsianWidthOptions) {
  let extra = 0;
  let first = true;
  for (const character of visibleSegment) {
    if (first) {
      first = false;
      continue;
    }
    if (spacingMarkRegex.test(character) || character >= "\uFF00" && character <= "\uFFEF") {
      extra += eastAsianWidth(character.codePointAt(0), eastAsianWidthOptions);
    }
  }
  return extra;
}
function stringWidth(input, options = {}) {
  if (typeof input !== "string" || input.length === 0) {
    return 0;
  }
  const {
    ambiguousIsNarrow = true,
    countAnsiEscapeCodes = false
  } = options;
  let string3 = input;
  if (!countAnsiEscapeCodes && (string3.includes("\x1B") || string3.includes("\x9B"))) {
    string3 = stripAnsi(string3);
  }
  if (string3.length === 0) {
    return 0;
  }
  if (/^[\u0020-\u007E]*$/.test(string3)) {
    return string3.length;
  }
  let width = 0;
  const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow };
  for (const { segment } of segmenter.segment(string3)) {
    const visibleSegment = baseVisible(segment);
    if (visibleSegment === void 0) {
      continue;
    }
    if (rgiEmojiRegex.test(segment) || isDoubleWidthNonRgiEmojiSequence(segment)) {
      width += 2;
      continue;
    }
    const hangulWidth = hangulClusterWidth(visibleSegment, eastAsianWidthOptions);
    if (hangulWidth !== void 0) {
      width += hangulWidth;
      continue;
    }
    const codePoint = visibleSegment.codePointAt(0);
    width += eastAsianWidth(codePoint, eastAsianWidthOptions);
    width += trailingWidth(visibleSegment, eastAsianWidthOptions);
  }
  return width;
}

// ../../node_modules/markdownlint/lib/md060.mjs
var unorderedListPrefix = /^[>\s]*[-+*]$/;
function addError18(errors, lines, lineNumber, column, detail, fixInfo) {
  if (fixInfo && fixInfo.insertText === " " && fixInfo.editColumn && unorderedListPrefix.test(lines[lineNumber - 1].slice(0, fixInfo.editColumn - 1))) {
    fixInfo = void 0;
  }
  errors.push({
    lineNumber,
    detail,
    "range": [column, 1],
    fixInfo
  });
}
function getTableDividerColumns(lines, row) {
  return (0, import_micromark_helpers41.filterByTypes)(
    row.children,
    ["tableCellDivider"]
  ).map(
    (divider) => ({
      "actual": divider.startColumn,
      "effective": stringWidth(lines[row.startLine - 1].slice(0, divider.startColumn - 1))
    })
  );
}
function checkStyleAligned(lines, rows, detail) {
  const errorInfos = [];
  const headerRow = rows[0];
  const headerDividerColumns = getTableDividerColumns(lines, headerRow);
  for (const row of rows.slice(1)) {
    const remainingHeaderDividerColumns = new Set(headerDividerColumns.map((column) => column.effective));
    const rowDividerColumns = getTableDividerColumns(lines, row);
    for (const dividerColumn of rowDividerColumns) {
      if (remainingHeaderDividerColumns.size > 0 && !remainingHeaderDividerColumns.delete(dividerColumn.effective)) {
        addError18(errorInfos, lines, row.startLine, dividerColumn.actual, detail);
      }
    }
  }
  return errorInfos;
}
var md060_default = {
  "names": ["MD060", "table-column-style"],
  "description": "Table column style",
  "tags": ["table"],
  "parser": "micromark",
  "function": function MD060(params2, onError) {
    const style = String(params2.config.style || "any");
    const styleAlignedAllowed = style === "any" || style === "aligned";
    const styleCompactAllowed = style === "any" || style === "compact";
    const styleTightAllowed = style === "any" || style === "tight";
    const alignedDelimiter = !!params2.config.aligned_delimiter;
    const lines = params2.lines;
    const tables = filterByTypesCached(["table"]);
    for (const table of tables) {
      const rows = (0, import_micromark_helpers41.filterByTypes)(table.children, ["tableDelimiterRow", "tableRow"]);
      const errorsIfAligned = [];
      if (styleAlignedAllowed) {
        errorsIfAligned.push(...checkStyleAligned(lines, rows, 'Table pipe does not align with header for style "aligned"'));
      }
      const errorsIfCompact = [];
      const errorsIfTight = [];
      if ((styleCompactAllowed || styleTightAllowed) && !(styleAlignedAllowed && errorsIfAligned.length === 0)) {
        if (alignedDelimiter) {
          const errorInfos2 = checkStyleAligned(lines, rows.slice(0, 2), 'Table pipe does not align with header for option "aligned_delimiter"');
          errorsIfCompact.push(...errorInfos2);
          errorsIfTight.push(...errorInfos2);
        }
        for (const row of rows) {
          const tokensOfInterest = (0, import_micromark_helpers41.filterByTypes)(row.children, ["tableCellDivider", "tableContent", "whitespace"]);
          for (let i = 0; i < tokensOfInterest.length; i++) {
            const { startColumn, startLine, type } = tokensOfInterest[i];
            if (type === "tableCellDivider") {
              const previous4 = tokensOfInterest[i - 1];
              if (previous4) {
                if (previous4.type === "whitespace") {
                  if (previous4.text.length !== 1) {
                    addError18(
                      errorsIfCompact,
                      lines,
                      startLine,
                      startColumn,
                      'Table pipe has extra space to the left for style "compact"',
                      { "editColumn": previous4.startColumn, "deleteCount": previous4.text.length - 1 }
                    );
                  }
                  addError18(
                    errorsIfTight,
                    lines,
                    startLine,
                    startColumn,
                    'Table pipe has space to the left for style "tight"',
                    { "editColumn": previous4.startColumn, "deleteCount": previous4.text.length }
                  );
                } else {
                  addError18(
                    errorsIfCompact,
                    lines,
                    startLine,
                    startColumn,
                    'Table pipe is missing space to the left for style "compact"',
                    { "editColumn": previous4.endColumn, "insertText": " " }
                  );
                }
              }
              const next = tokensOfInterest[i + 1];
              if (next) {
                if (next.type === "whitespace") {
                  if (next.endColumn !== row.endColumn) {
                    if (next.text.length !== 1) {
                      addError18(
                        errorsIfCompact,
                        lines,
                        startLine,
                        startColumn,
                        'Table pipe has extra space to the right for style "compact"',
                        { "editColumn": next.startColumn, "deleteCount": next.text.length - 1 }
                      );
                    }
                    addError18(
                      errorsIfTight,
                      lines,
                      startLine,
                      startColumn,
                      'Table pipe has space to the right for style "tight"',
                      { "editColumn": next.startColumn, "deleteCount": next.text.length }
                    );
                  }
                } else {
                  addError18(
                    errorsIfCompact,
                    lines,
                    startLine,
                    startColumn,
                    'Table pipe is missing space to the right for style "compact"',
                    { "editColumn": next.startColumn, "insertText": " " }
                  );
                }
              }
            }
          }
        }
      }
      let errorInfos = errorsIfAligned;
      if (styleCompactAllowed && (!styleAlignedAllowed || errorsIfCompact.length < errorInfos.length)) {
        errorInfos = errorsIfCompact;
      }
      if (styleTightAllowed && (errorsIfTight.length < errorInfos.length || !styleAlignedAllowed && !styleCompactAllowed)) {
        errorInfos = errorsIfTight;
      }
      for (const errorInfo of errorInfos) {
        onError(errorInfo);
      }
    }
  }
};

// ../../node_modules/markdownlint/lib/rules.mjs
var [md019, md021] = md019_md021_default;
var [md049, md050] = md049_md050_default;
var rules = [
  md001_default,
  // md002: Deprecated and removed
  md003_default,
  md004_default,
  md005_default,
  // md006: Deprecated and removed
  md007_default,
  md009_default,
  md010_default,
  md011_default,
  md012_default,
  md013_default,
  md014_default,
  md018_default,
  md019,
  md020_default,
  md021,
  md022_default,
  md023_default,
  md024_default,
  md025_default,
  md026_default,
  md027_default,
  md028_default,
  md029_default,
  md030_default,
  md031_default,
  md032_default,
  md033_default,
  md034_default,
  md035_default,
  md036_default,
  md037_default,
  md038_default,
  md039_default,
  md040_default,
  md041_default,
  md042_default,
  md043_default,
  md044_default,
  md045_default,
  md046_default,
  md047_default,
  md048_default,
  md049,
  md050,
  md051_default,
  md052_default,
  md053_default,
  md054_default,
  md055_default,
  md056_default,
  // md057: See https://github.com/markdownlint/markdownlint
  md058_default,
  md059_default,
  md060_default
];
for (const rule of rules) {
  const name = rule.names[0].toLowerCase();
  rule["information"] = new URL(`${homepage}/blob/v${version}/doc/${name}.md`);
}
var rules_default = rules;

// ../../node_modules/markdownlint/lib/parse-configuration.mjs
function parseConfiguration(name, content3, parsers) {
  let config = null;
  let message = null;
  const errors = [];
  let index = 0;
  const failed = (parsers || [JSON.parse]).every((parser) => {
    try {
      const result = parser(content3);
      config = result && typeof result === "object" && !Array.isArray(result) ? result : {};
      return false;
    } catch (error) {
      errors.push(`Parser ${index++}: ${error?.message}`);
    }
    return true;
  });
  if (failed) {
    errors.unshift(`Unable to parse '${name}'`);
    message = errors.join("; ");
  }
  return {
    config,
    message
  };
}

// ../../node_modules/markdownlint/lib/markdownlint.mjs
var helpers = __toESM(require_helpers(), 1);
function validateRuleList(ruleList, synchronous) {
  let result = null;
  if (ruleList.length === rules_default.length) {
    return result;
  }
  const allIds = {};
  for (const [index, rule] of ruleList.entries()) {
    let newError = function(property, value) {
      return new Error(
        `Property '${property}' of custom rule at index ${customIndex} is incorrect: '${value}'.`
      );
    };
    const customIndex = index - rules_default.length;
    for (const property of ["names", "tags"]) {
      const value = rule[property];
      if (!result && (!value || !Array.isArray(value) || value.length === 0 || !value.every(helpers.isString) || value.some(helpers.isEmptyString))) {
        result = newError(property, value);
      }
    }
    for (const propertyInfo of [
      ["description", "string"],
      ["function", "function"]
    ]) {
      const property = propertyInfo[0];
      const value = rule[property];
      if (!result && (!value || typeof value !== propertyInfo[1])) {
        result = newError(property, value);
      }
    }
    if (!result && rule.parser !== void 0 && rule.parser !== "markdownit" && rule.parser !== "micromark" && rule.parser !== "none") {
      result = newError("parser", rule.parser);
    }
    if (!result && rule.information && !helpers.isUrl(rule.information)) {
      result = newError("information", rule.information);
    }
    if (!result && rule.asynchronous !== void 0 && typeof rule.asynchronous !== "boolean") {
      result = newError("asynchronous", rule.asynchronous);
    }
    if (!result && synchronous && rule.asynchronous) {
      result = new Error(
        "Custom rule " + rule.names.join("/") + " at index " + customIndex + " is asynchronous and can not be used in a synchronous context."
      );
    }
    if (!result) {
      for (const name of rule.names) {
        const nameUpper = name.toUpperCase();
        if (!result && allIds[nameUpper] !== void 0) {
          result = new Error("Name '" + name + "' of custom rule at index " + customIndex + " is already used as a name or tag.");
        }
        allIds[nameUpper] = true;
      }
      for (const tag of rule.tags) {
        const tagUpper = tag.toUpperCase();
        if (!result && allIds[tagUpper]) {
          result = new Error("Tag '" + tag + "' of custom rule at index " + customIndex + " is already used as a name.");
        }
        allIds[tagUpper] = false;
      }
    }
  }
  return result;
}
function removeFrontMatter(content3, frontMatterRe2) {
  let frontMatterLines = [];
  if (frontMatterRe2) {
    const frontMatterMatch = frontMatterRe2.exec(content3);
    if (frontMatterMatch && !frontMatterMatch.index) {
      const contentMatched = frontMatterMatch[0];
      content3 = content3.slice(contentMatched.length);
      frontMatterLines = contentMatched.split(helpers.newLineRe);
      if (frontMatterLines.length > 0 && frontMatterLines[frontMatterLines.length - 1] === "") {
        frontMatterLines.length--;
      }
    }
  }
  return {
    "content": content3,
    "frontMatterLines": frontMatterLines
  };
}
function mapAliasToRuleNames(ruleList) {
  const aliasToRuleNames = {};
  for (const rule of ruleList) {
    const ruleName = rule.names[0].toUpperCase();
    for (const name of rule.names) {
      const nameUpper = name.toUpperCase();
      aliasToRuleNames[nameUpper] = [ruleName];
    }
    for (const tag of rule.tags) {
      const tagUpper = tag.toUpperCase();
      const ruleNames = aliasToRuleNames[tagUpper] || [];
      ruleNames.push(ruleName);
      aliasToRuleNames[tagUpper] = ruleNames;
    }
  }
  return aliasToRuleNames;
}
function getEffectiveConfig(ruleList, config, aliasToRuleNames) {
  let ruleDefaultEnable = true;
  let ruleDefaultSeverity = "error";
  Object.entries(config).every(([key, value]) => {
    if (key.toUpperCase() === "DEFAULT") {
      ruleDefaultEnable = !!value;
      if (value === "warning") {
        ruleDefaultSeverity = "warning";
      }
      return false;
    }
    return true;
  });
  const effectiveConfig = {};
  const rulesEnabled = /* @__PURE__ */ new Map();
  const rulesSeverity = /* @__PURE__ */ new Map();
  const emptyObject = Object.freeze({});
  for (const ruleName of ruleList.map((rule) => rule.names[0].toUpperCase())) {
    effectiveConfig[ruleName] = emptyObject;
    rulesEnabled.set(ruleName, ruleDefaultEnable);
    rulesSeverity.set(ruleName, ruleDefaultSeverity);
  }
  for (const [key, value] of Object.entries(config)) {
    const keyUpper = key.toUpperCase();
    let enabled = false;
    let severity = "error";
    let effectiveValue = {};
    if (value) {
      if (value instanceof Object) {
        const valueObject = value;
        enabled = valueObject.enabled === void 0 || !!valueObject.enabled;
        severity = valueObject.severity === "warning" ? "warning" : "error";
        effectiveValue = Object.fromEntries(
          Object.entries(value).filter(
            ([k]) => k !== "enabled" && k !== "severity"
          )
        );
      } else {
        enabled = true;
        severity = value === "warning" ? "warning" : "error";
      }
    }
    for (const ruleName of aliasToRuleNames[keyUpper] || []) {
      Object.freeze(effectiveValue);
      effectiveConfig[ruleName] = effectiveValue;
      rulesEnabled.set(ruleName, enabled);
      rulesSeverity.set(ruleName, severity);
    }
  }
  return {
    effectiveConfig,
    rulesEnabled,
    rulesSeverity
  };
}
function getEnabledRulesPerLineNumber(ruleList, lines, noInlineConfig, config, configParsers, aliasToRuleNames) {
  let enabledRules = /* @__PURE__ */ new Map();
  let capturedRules = enabledRules;
  const enabledRulesPerLineNumber = new Array(1);
  function handleInlineConfig(input, forEachMatch, forEachLine = void 0) {
    for (const [lineIndex, line] of input.entries()) {
      if (!noInlineConfig) {
        let match = null;
        while (match = helpers.inlineCommentStartRe.exec(line)) {
          const action = match[2].toUpperCase();
          const startIndex = match.index + match[1].length;
          const endIndex = line.indexOf("-->", startIndex);
          if (endIndex === -1) {
            break;
          }
          const parameter = line.slice(startIndex, endIndex);
          forEachMatch(action, parameter, lineIndex + 1);
        }
      }
      if (forEachLine) {
        forEachLine();
      }
    }
  }
  function configureFile(action, parameter) {
    if (action === "CONFIGURE-FILE") {
      const { "config": parsed } = parseConfiguration(
        "CONFIGURE-FILE",
        parameter,
        configParsers
      );
      if (parsed) {
        config = {
          ...config,
          ...parsed
        };
      }
    }
  }
  function applyEnableDisable(action, parameter, state) {
    state = new Map(state);
    const enabled = action.startsWith("ENABLE");
    const trimmed = parameter && parameter.trim();
    const items = trimmed ? trimmed.toUpperCase().split(/\s+/) : allRuleNames;
    for (const nameUpper of items) {
      for (const ruleName of aliasToRuleNames[nameUpper] || []) {
        state.set(ruleName, enabled);
      }
    }
    return state;
  }
  function enableDisableFile(action, parameter) {
    if (action === "ENABLE-FILE" || action === "DISABLE-FILE") {
      enabledRules = applyEnableDisable(action, parameter, enabledRules);
    }
  }
  function captureRestoreEnableDisable(action, parameter) {
    if (action === "CAPTURE") {
      capturedRules = enabledRules;
    } else if (action === "RESTORE") {
      enabledRules = capturedRules;
    } else if (action === "ENABLE" || action === "DISABLE") {
      enabledRules = applyEnableDisable(action, parameter, enabledRules);
    }
  }
  function updateLineState() {
    enabledRulesPerLineNumber.push(enabledRules);
  }
  function disableLineNextLine(action, parameter, lineNumber) {
    const disableLine = action === "DISABLE-LINE";
    const disableNextLine = action === "DISABLE-NEXT-LINE";
    if (disableLine || disableNextLine) {
      const nextLineNumber = lineNumber + (disableNextLine ? 1 : 0);
      enabledRulesPerLineNumber[nextLineNumber] = applyEnableDisable(
        action,
        parameter,
        enabledRulesPerLineNumber[nextLineNumber]
      );
    }
  }
  handleInlineConfig([lines.join("\n")], configureFile);
  const { effectiveConfig, rulesEnabled, rulesSeverity } = getEffectiveConfig(ruleList, config, aliasToRuleNames);
  const allRuleNames = [...rulesEnabled.keys()];
  enabledRules = new Map(rulesEnabled);
  capturedRules = enabledRules;
  handleInlineConfig(lines, enableDisableFile);
  handleInlineConfig(lines, captureRestoreEnableDisable, updateLineState);
  handleInlineConfig(lines, disableLineNextLine);
  const enabledRuleList = ruleList.filter((rule) => {
    const ruleName = rule.names[0].toUpperCase();
    return enabledRulesPerLineNumber.some((enabledRulesForLine) => enabledRulesForLine.get(ruleName));
  });
  return {
    effectiveConfig,
    enabledRulesPerLineNumber,
    enabledRuleList,
    rulesSeverity
  };
}
function lintContent(ruleList, aliasToRuleNames, name, content3, markdownItFactory, config, configParsers, frontMatterRe2, handleRuleFailures, noInlineConfig, synchronous, callback) {
  const callbackError = (error) => callback(error instanceof Error ? error : new Error(error));
  const fullContent = content3.replace(/^\uFEFF/, "");
  const fullContentLines = fullContent.split(helpers.newLineRe);
  const fullContentNormalized = fullContentLines.join("\n");
  const { "content": markdownContentNormalized, frontMatterLines } = removeFrontMatter(fullContentNormalized, frontMatterRe2);
  const { effectiveConfig, enabledRulesPerLineNumber, enabledRuleList, rulesSeverity } = getEnabledRulesPerLineNumber(
    ruleList,
    fullContentLines,
    noInlineConfig,
    config,
    configParsers,
    aliasToRuleNames
  );
  const needMarkdownItTokens = enabledRuleList.some(
    (rule) => rule.parser === "markdownit" || rule.parser === void 0
  );
  const needMicromarkTokens = enabledRuleList.some(
    (rule) => rule.parser === "micromark"
  );
  const customRulesPresent = ruleList.length !== rules_default.length;
  const micromarkTokens2 = needMicromarkTokens ? parse2(markdownContentNormalized, { "freezeTokens": customRulesPresent }) : [];
  const markdownContentNormalizedSanitized = helpers.clearHtmlCommentText(markdownContentNormalized);
  const lines = markdownContentNormalizedSanitized.split(helpers.newLineRe);
  const lintContentInternal = (markdownitTokens) => {
    const parsersMarkdownIt = Object.freeze({
      "markdownit": Object.freeze({
        "tokens": markdownitTokens
      })
    });
    const parsersMicromark = Object.freeze({
      "micromark": Object.freeze({
        "tokens": micromarkTokens2
      })
    });
    const parsersNone = Object.freeze({});
    const paramsBase = {
      name,
      version,
      "lines": Object.freeze(lines),
      "frontMatterLines": Object.freeze(frontMatterLines)
    };
    initialize({
      ...paramsBase,
      "parsers": parsersMicromark,
      "config": {}
    });
    const results = [];
    const forRule = (rule) => {
      const ruleName = rule.names[0].toUpperCase();
      const tokens = {};
      let parsers = parsersNone;
      if (rule.parser === void 0) {
        tokens.tokens = markdownitTokens;
        parsers = parsersMarkdownIt;
      } else if (rule.parser === "markdownit") {
        parsers = parsersMarkdownIt;
      } else if (rule.parser === "micromark") {
        parsers = parsersMicromark;
      }
      const params2 = Object.freeze({
        ...paramsBase,
        ...tokens,
        parsers,
        /** @type {RuleConfiguration} */
        // @ts-ignore
        "config": effectiveConfig[ruleName]
      });
      function throwError(property) {
        throw new Error(
          `Value of '${property}' passed to onError by '${ruleName}' is incorrect for '${name}'.`
        );
      }
      function onError(errorInfo) {
        if (!errorInfo) {
          throwError("onErrorInfo");
        }
        if (errorInfo.frontMatter !== void 0 && !helpers.isBoolean(errorInfo.frontMatter)) {
          throwError("frontMatter");
        }
        const useFrontMatter = Boolean(errorInfo.frontMatter);
        const contentLines = useFrontMatter ? frontMatterLines : lines;
        const lineOffset = useFrontMatter ? 0 : frontMatterLines.length;
        if (!helpers.isNumber(errorInfo.lineNumber) || errorInfo.lineNumber < 1 || errorInfo.lineNumber > contentLines.length) {
          throwError("lineNumber");
        }
        const lineNumber = errorInfo.lineNumber + lineOffset;
        if (!enabledRulesPerLineNumber[lineNumber].get(ruleName)) {
          return;
        }
        if (errorInfo.detail !== void 0 && !helpers.isString(errorInfo.detail)) {
          throwError("detail");
        }
        if (errorInfo.context !== void 0 && !helpers.isString(errorInfo.context)) {
          throwError("context");
        }
        if (errorInfo.information !== void 0 && !helpers.isUrl(errorInfo.information)) {
          throwError("information");
        }
        if (errorInfo.range !== void 0 && (!Array.isArray(errorInfo.range) || errorInfo.range.length !== 2 || !helpers.isNumber(errorInfo.range[0]) || errorInfo.range[0] < 1 || !helpers.isNumber(errorInfo.range[1]) || errorInfo.range[1] < 1 || errorInfo.range[0] + errorInfo.range[1] - 1 > contentLines[errorInfo.lineNumber - 1].length)) {
          throwError("range");
        }
        const fixInfo = errorInfo.fixInfo;
        const cleanFixInfo = {};
        if (fixInfo) {
          if (!helpers.isObject(fixInfo)) {
            throwError("fixInfo");
          }
          if (fixInfo.lineNumber !== void 0) {
            if (!helpers.isNumber(fixInfo.lineNumber) || fixInfo.lineNumber < 1 || fixInfo.lineNumber > contentLines.length) {
              throwError("fixInfo.lineNumber");
            }
            cleanFixInfo.lineNumber = fixInfo.lineNumber + lineOffset;
          }
          const effectiveLineNumber = fixInfo.lineNumber || errorInfo.lineNumber;
          if (fixInfo.editColumn !== void 0) {
            if (!helpers.isNumber(fixInfo.editColumn) || fixInfo.editColumn < 1 || fixInfo.editColumn > contentLines[effectiveLineNumber - 1].length + 1) {
              throwError("fixInfo.editColumn");
            }
            cleanFixInfo.editColumn = fixInfo.editColumn;
          }
          if (fixInfo.deleteCount !== void 0) {
            if (!helpers.isNumber(fixInfo.deleteCount) || fixInfo.deleteCount < -1 || (fixInfo.editColumn ?? 1) + fixInfo.deleteCount - 1 > contentLines[effectiveLineNumber - 1].length) {
              throwError("fixInfo.deleteCount");
            }
            cleanFixInfo.deleteCount = fixInfo.deleteCount;
          }
          if (fixInfo.insertText !== void 0) {
            if (!helpers.isString(fixInfo.insertText)) {
              throwError("fixInfo.insertText");
            }
            cleanFixInfo.insertText = fixInfo.insertText;
          }
        }
        const information = errorInfo.information || rule.information;
        results.push({
          lineNumber,
          "ruleNames": rule.names,
          "ruleDescription": rule.description,
          "ruleInformation": information ? information.href : null,
          "errorDetail": errorInfo.detail?.replace(helpers.newLineRe, " ") || null,
          "errorContext": errorInfo.context?.replace(helpers.newLineRe, " ") || null,
          "errorRange": errorInfo.range ? [...errorInfo.range] : null,
          "fixInfo": fixInfo ? cleanFixInfo : null,
          // @ts-ignore
          "severity": rulesSeverity.get(ruleName)
        });
      }
      const catchCallsOnError = (error) => onError({
        "lineNumber": 1,
        "detail": `This rule threw an exception: ${error.message || error}`
      });
      const invokeRuleFunction = () => rule.function(params2, onError);
      if (rule.asynchronous) {
        const ruleFunctionPromise = Promise.resolve().then(invokeRuleFunction);
        return handleRuleFailures ? ruleFunctionPromise.catch(catchCallsOnError) : ruleFunctionPromise;
      }
      try {
        invokeRuleFunction();
      } catch (error) {
        if (handleRuleFailures) {
          catchCallsOnError(error);
        } else {
          throw error;
        }
      }
      return null;
    };
    const formatResults = () => {
      results.sort((a, b) => a.ruleNames[0].localeCompare(b.ruleNames[0]) || a.lineNumber - b.lineNumber);
      return results;
    };
    const ruleListAsync = enabledRuleList.filter((rule) => rule.asynchronous);
    const ruleListSync = enabledRuleList.filter((rule) => !rule.asynchronous);
    const ruleListAsyncFirst = [
      ...ruleListAsync,
      ...ruleListSync
    ];
    const callbackSuccess = () => callback(null, formatResults());
    try {
      const ruleResults = ruleListAsyncFirst.map(forRule);
      if (ruleListAsync.length > 0) {
        Promise.all(ruleResults.slice(0, ruleListAsync.length)).then(callbackSuccess).catch(callbackError);
      } else {
        callbackSuccess();
      }
    } catch (error) {
      callbackError(error);
    } finally {
      initialize();
    }
  };
  if (!needMarkdownItTokens || synchronous) {
    const markdownItTokens = needMarkdownItTokens ? (0, import_defer_require.requireMarkdownItCjs)().getMarkdownItTokens(markdownItFactory(), markdownContentNormalized, lines) : [];
    lintContentInternal(markdownItTokens);
  } else {
    Promise.all([
      // eslint-disable-next-line no-inline-comments
      Promise.resolve().then(() => __toESM(require_markdownit(), 1)),
      // eslint-disable-next-line no-promise-executor-return
      new Promise((resolve) => resolve(markdownItFactory()))
    ]).then(([markdownitCjs, markdownIt]) => {
      const markdownItTokens = markdownitCjs.getMarkdownItTokens(markdownIt, markdownContentNormalized, lines);
      lintContentInternal(markdownItTokens);
    }).catch(callbackError);
  }
}
function lintFile(ruleList, aliasToRuleNames, file, markdownItFactory, config, configParsers, frontMatterRe2, handleRuleFailures, noInlineConfig, fs2, synchronous, callback) {
  function lintContentWrapper(err, content3) {
    return err ? callback(err) : lintContent(
      ruleList,
      aliasToRuleNames,
      file,
      content3,
      markdownItFactory,
      config,
      configParsers,
      frontMatterRe2,
      handleRuleFailures,
      noInlineConfig,
      synchronous,
      callback
    );
  }
  if (synchronous) {
    lintContentWrapper(null, fs2.readFileSync(file, "utf8"));
  } else {
    fs2.readFile(file, "utf8", lintContentWrapper);
  }
}
function lintInput(options, synchronous, callback) {
  options ||= {};
  callback ||= () => {
  };
  const customRuleList = [options.customRules || []].flat().map((rule) => ({
    "names": helpers.cloneIfArray(rule.names),
    "description": rule.description,
    "information": helpers.cloneIfUrl(rule.information),
    "tags": helpers.cloneIfArray(rule.tags),
    "parser": rule.parser,
    "asynchronous": rule.asynchronous,
    "function": rule.function
  }));
  const ruleList = rules_default.concat(customRuleList);
  const ruleErr = validateRuleList(ruleList, synchronous);
  if (ruleErr) {
    callback(ruleErr);
    return;
  }
  let files = [];
  if (Array.isArray(options.files)) {
    files = [...options.files];
  } else if (options.files) {
    files = [String(options.files)];
  }
  const strings = options.strings || {};
  const stringsKeys = Object.keys(strings);
  const config = options.config || { "default": true };
  const configParsers = options.configParsers || void 0;
  const frontMatterRe2 = options.frontMatter === void 0 ? helpers.frontMatterRe : options.frontMatter;
  const frontMatterRe22 = frontMatterRe2 && RE2JS.compile(RE2JS.translateRegExp(frontMatterRe2));
  const handleRuleFailures = !!options.handleRuleFailures;
  const noInlineConfig = !!options.noInlineConfig;
  const markdownItFactory = options.markdownItFactory || (() => {
    throw new Error("The option 'markdownItFactory' was required (due to the option 'customRules' including a rule requiring the 'markdown-it' parser), but 'markdownItFactory' was not set.");
  });
  const fs2 = options.fs || fs;
  const aliasToRuleNames = mapAliasToRuleNames(ruleList);
  const results = {};
  let done = false;
  let concurrency = 0;
  function lintWorker() {
    let currentItem = void 0;
    function lintWorkerCallback(err, result) {
      concurrency--;
      if (err) {
        done = true;
        return callback(err);
      }
      results[currentItem] = result;
      if (!synchronous) {
        lintWorker();
      }
      return null;
    }
    if (done) {
    } else if (currentItem = files.shift()) {
      concurrency++;
      lintFile(
        ruleList,
        aliasToRuleNames,
        currentItem,
        markdownItFactory,
        config,
        configParsers,
        frontMatterRe22,
        handleRuleFailures,
        noInlineConfig,
        fs2,
        synchronous,
        lintWorkerCallback
      );
    } else if (currentItem = stringsKeys.shift()) {
      concurrency++;
      lintContent(
        ruleList,
        aliasToRuleNames,
        currentItem,
        strings[currentItem] || "",
        markdownItFactory,
        config,
        configParsers,
        frontMatterRe22,
        handleRuleFailures,
        noInlineConfig,
        synchronous,
        lintWorkerCallback
      );
    } else if (concurrency === 0) {
      done = true;
      const sortedEntries = Object.entries(results);
      sortedEntries.sort(([a], [b]) => a.localeCompare(b));
      const sortedResults = Object.fromEntries(sortedEntries);
      return callback(null, sortedResults);
    }
    return null;
  }
  if (synchronous) {
    while (!done) {
      lintWorker();
    }
  } else {
    lintWorker();
    lintWorker();
    lintWorker();
    lintWorker();
    lintWorker();
    lintWorker();
    lintWorker();
    lintWorker();
  }
}
function lintSync(options) {
  let results = null;
  lintInput(options, true, function callback(error, res) {
    if (error) {
      throw error;
    }
    results = res;
  });
  return results;
}
function normalizeFixInfo(fixInfo, lineNumber = 0) {
  return {
    "lineNumber": fixInfo.lineNumber || lineNumber,
    "editColumn": fixInfo.editColumn || 1,
    "deleteCount": fixInfo.deleteCount || 0,
    "insertText": fixInfo.insertText || ""
  };
}
function applyFix(line, fixInfo, lineEnding2 = "\n") {
  const { editColumn, deleteCount, insertText } = normalizeFixInfo(fixInfo);
  const editIndex = editColumn - 1;
  return deleteCount === -1 ? null : (
    // eslint-disable-next-line unicorn/no-unsafe-string-replacement
    line.slice(0, editIndex) + insertText.replace(/\n/g, lineEnding2) + line.slice(editIndex + deleteCount)
  );
}
function applyFixes(input, errors) {
  const lineEnding2 = helpers.getPreferredLineEnding(input, os);
  const lines = input.split(helpers.newLineRe);
  let fixInfos = errors.filter((error) => error.fixInfo).map((error) => normalizeFixInfo(error.fixInfo, error.lineNumber));
  fixInfos.sort((a, b) => {
    const aDeletingLine = a.deleteCount === -1;
    const bDeletingLine = b.deleteCount === -1;
    return b.lineNumber - a.lineNumber || (aDeletingLine ? 1 : bDeletingLine ? -1 : 0) || b.editColumn - a.editColumn || b.insertText.length - a.insertText.length;
  });
  let lastFixInfo = {};
  fixInfos = fixInfos.filter((fixInfo) => {
    const unique = fixInfo.lineNumber !== lastFixInfo.lineNumber || fixInfo.editColumn !== lastFixInfo.editColumn || fixInfo.deleteCount !== lastFixInfo.deleteCount || fixInfo.insertText !== lastFixInfo.insertText;
    lastFixInfo = fixInfo;
    return unique;
  });
  lastFixInfo = {
    "lineNumber": -1
  };
  for (const fixInfo of fixInfos) {
    if (fixInfo.lineNumber === lastFixInfo.lineNumber && fixInfo.editColumn === lastFixInfo.editColumn && !fixInfo.insertText && fixInfo.deleteCount > 0 && lastFixInfo.insertText && !lastFixInfo.deleteCount) {
      fixInfo.insertText = lastFixInfo.insertText;
      lastFixInfo.lineNumber = 0;
    }
    lastFixInfo = fixInfo;
  }
  fixInfos = fixInfos.filter((fixInfo) => fixInfo.lineNumber);
  let lastLineIndex = -1;
  let lastEditIndex = -1;
  for (const fixInfo of fixInfos) {
    const { lineNumber, editColumn, deleteCount } = fixInfo;
    const lineIndex = lineNumber - 1;
    const editIndex = editColumn - 1;
    if (lineIndex !== lastLineIndex || deleteCount === -1 || editIndex + deleteCount <= lastEditIndex - (deleteCount > 0 ? 0 : 1)) {
      lines[lineIndex] = applyFix(lines[lineIndex], fixInfo, lineEnding2);
    }
    lastLineIndex = lineIndex;
    lastEditIndex = editIndex;
  }
  return lines.filter((line) => line !== null).join(lineEnding2);
}

// ../../node_modules/markdownlint/lib/exports.mjs
var import_resolve_module2 = __toESM(require_resolve_module(), 1);
export {
  applyFixes,
  lintSync as lint
};
