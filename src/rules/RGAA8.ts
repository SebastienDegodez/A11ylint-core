import type { LogMessageParams, Mode } from '../types.js';
import { isValidLangCode } from '../utils/lang.js';

export type LangVirtualElement = {
  type: 'lang';
  lang?: string | null;
  xmlLang?: string | null;
  outerHTML: string;
};

export class RGAA8 {
  private mode: Mode;

  constructor(mode: Mode = 'dom') {
    this.mode = mode;
  }

  public RGAA81(documents: Array<Document>) {
    const wrongElement: Array<LogMessageParams> = [];
    // check doctype is present
    documents.forEach(doc => {
      const { doctype } = doc;
      if (!doctype) {
        wrongElement.push({
          element: doc.baseURI,
          rule: 'RGAA - 8.1.1',
          ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.1',
          message: 'Document (Page) should have a doctype',
        });
      }

      // RGAA 8.1.3 Doctype should be first
      const doctypeIndex = doc.firstChild?.nodeType === doc.DOCUMENT_TYPE_NODE;
      if (doctypeIndex) {
        wrongElement.push({
          element: doc.baseURI,
          rule: 'RGAA - 8.1.3',
          ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.1.3',
          message: 'Document (Page) doctype should be first',
        });
      }
    });
    return wrongElement;
  }

  public RGAA83(documents: Array<Document>) {
    const wrongElement: Array<LogMessageParams> = [];
    // check lang in html tag
    documents.forEach(doc => {
      const { lang } = doc.documentElement;
      if (!lang || lang.length <= 0) {
        wrongElement.push({
          element: doc.baseURI,
          rule: 'RGAA - 8.3',
          ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.3',
          message: 'Document (Page) should have a lang attribute',
        });
      }
    });
    return wrongElement;
  }

  public RGAA84(documents: Array<Document>) {
    const wrongElement: Array<LogMessageParams> = [];
    // RGAA 8.4.1 default language code (lang / xml:lang on html) must be valid; a missing lang is RGAA 8.3
    documents.forEach(doc => {
      const { documentElement } = doc;
      const codes = [documentElement?.lang, documentElement?.getAttribute?.('xml:lang')];
      codes
        .filter((code): code is string => typeof code === 'string' && code.trim().length > 0)
        .forEach(code => {
          if (!isValidLangCode(code)) {
            wrongElement.push({
              element: doc.baseURI,
              rule: 'RGAA - 8.4.1',
              ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.4.1',
              message: `Le code de langue par défaut de la page (« ${code} ») n'est pas valide`,
            });
          }
        });
    });
    return wrongElement;
  }

  RGAA88(elements: Array<LangVirtualElement>): LogMessageParams[];

  RGAA88(elements: Array<HTMLElement | Element>): LogMessageParams[];

  RGAA88(elements: Array<LangVirtualElement | HTMLElement | Element>): LogMessageParams[];

  public RGAA88(elements: Array<LangVirtualElement | HTMLElement | Element>): LogMessageParams[] {
    switch (this.mode) {
      case 'dom':
        return this.checkLangChanges(
          (elements as Array<HTMLElement | Element>).map(el => ({
            codes: [el.getAttribute('lang'), el.getAttribute('xml:lang')],
            outerHTML: el.outerHTML,
          })),
        );
      case 'virtual':
        return this.checkLangChanges(
          (elements as Array<LangVirtualElement>).map(el => ({
            codes: [el.lang, el.xmlLang],
            outerHTML: el.outerHTML,
          })),
        );
      default:
        throw new Error(`Unknown mode: ${this.mode}`);
    }
  }

  // RGAA 8.8.1 every language change (lang / xml:lang below html) must have a valid code
  private checkLangChanges(
    elements: Array<{ codes: Array<string | null | undefined>; outerHTML: string }>,
  ): LogMessageParams[] {
    const wrongElement: Array<LogMessageParams> = [];
    elements.forEach(({ codes, outerHTML }) => {
      codes
        .filter((code): code is string => typeof code === 'string')
        .forEach(code => {
          if (!isValidLangCode(code)) {
            wrongElement.push({
              element: outerHTML,
              rule: 'RGAA - 8.8.1',
              ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.8.1',
              message: `Le code de langue du changement de langue (« ${code} ») n'est pas valide`,
            });
          }
        });
    });
    return wrongElement;
  }

  public RGAA85(documents: Array<Document>) {
    const wrongElement: Array<LogMessageParams> = [];
    documents.forEach(doc => {
      if (doc.title.length <= 0) {
        wrongElement.push({
          element: doc.baseURI,
          rule: 'RGAA - 8.5',
          ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.5',
          message: 'Document (Page) should have a title',
        });
      }
    });

    return wrongElement;
  }
}
