import { describe, expect, it } from 'vitest';
import { LangVirtualElement, RGAA8 } from '../../src/rules/RGAA8';

const core = new RGAA8();
const doctype = document.implementation.createDocumentType('html', '', '');
const customDocument = document.implementation.createHTMLDocument();
const correctDocument = {
  ...customDocument,
  title: 'Document with title',
  doctype,
  firstChild: {
    nodeType: document.DOCUMENT_TYPE_NODE,
  },
  documentElement: {
    ...customDocument.documentElement,
    lang: 'en',
  },
};
const incorrectDocument: Document[] = [
  {
    ...customDocument,
    title: '',
    baseURI: 'https://example.com',
    doctype: null,
    documentElement: {
      ...customDocument.documentElement,
      lang: '',
    },
  },
];

it('RGAA8.1 - Document should have a doctype', () => {
  expect(core.RGAA81([correctDocument as Document])).toHaveLength(0);
  expect(core.RGAA81([...incorrectDocument])).toStrictEqual([
    {
      element: 'https://example.com',
      message: 'Document (Page) should have a doctype',
      rule: 'RGAA - 8.1.1',
      ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.1',
    },
    {
      element: 'https://example.com',
      message: 'Document (Page) doctype should be first',
      rule: 'RGAA - 8.1.3',
      ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.1.3',
    },
  ]);
});

it('RGAA8.3 - Page should have a lang attribute', () => {
  expect(core.RGAA83([correctDocument as Document])).toHaveLength(0);
  expect(core.RGAA83([...incorrectDocument])).toStrictEqual([
    {
      element: 'https://example.com',
      message: 'Document (Page) should have a lang attribute',
      rule: 'RGAA - 8.3',
      ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.3',
    },
  ]);
});

it('RGAA8.5 - Page should have a title', () => {
  expect(core.RGAA85([correctDocument as Document])).toHaveLength(0);
  expect(core.RGAA85([...incorrectDocument])).toStrictEqual([
    {
      element: 'https://example.com',
      message: 'Document (Page) should have a title',
      rule: 'RGAA - 8.5',
      ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.5',
    },
  ]);
});

const htmlDocument = (html: string, baseURI = 'https://example.com') => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  Object.defineProperty(doc, 'baseURI', { value: baseURI });
  return doc;
};

const langChanges = (doc: Document) => Array.from(doc.querySelectorAll('body [lang], body [xml\\:lang]'));

describe('RGAA8.4 - Default language code should be valid', () => {
  it('accepts valid codes', () => {
    expect(core.RGAA84([htmlDocument('<html lang="fr"></html>')])).toHaveLength(0);
    expect(core.RGAA84([htmlDocument('<html lang="fr-FR" xml:lang="fr-FR"></html>')])).toHaveLength(0);
    expect(core.RGAA84([htmlDocument('<html lang="zh-Hant-TW"></html>')])).toHaveLength(0);
    expect(core.RGAA84([htmlDocument('<html lang="EN"></html>')])).toHaveLength(0);
    expect(core.RGAA84([htmlDocument('<html lang=" fr "></html>')])).toHaveLength(0);
    // ISO 639-2 three-letter code
    expect(core.RGAA84([htmlDocument('<html lang="fra"></html>')])).toHaveLength(0);
    // RGAA glossary: the option after the hyphen is free for the author
    expect(core.RGAA84([htmlDocument('<html lang="fr-custom_1"></html>')])).toHaveLength(0);
  });

  it('leaves missing lang to RGAA 8.3', () => {
    expect(core.RGAA84([htmlDocument('<html></html>')])).toHaveLength(0);
    expect(core.RGAA84([htmlDocument('<html lang=""></html>')])).toHaveLength(0);
  });

  it('reports invalid codes', () => {
    expect(core.RGAA84([htmlDocument('<html lang="french"></html>')])).toStrictEqual([
      {
        element: 'https://example.com',
        message: "Le code de langue par défaut de la page (« french ») n'est pas valide",
        rule: 'RGAA - 8.4.1',
        ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.4.1',
      },
    ]);
    // both lang and xml:lang are checked
    expect(core.RGAA84([htmlDocument('<html lang="en_US" xml:lang="xx"></html>')])).toHaveLength(2);
    expect(core.RGAA84([htmlDocument('<html lang="fr" xml:lang="fr_FR"></html>')])).toHaveLength(1);
  });

  it('works with virtual documents', () => {
    const virtualDoc = (lang: string) =>
      ({ baseURI: 'https://example.com', documentElement: { lang } }) as unknown as Document;
    expect(core.RGAA84([virtualDoc('fr')])).toHaveLength(0);
    expect(core.RGAA84([virtualDoc('fr_FR')])).toHaveLength(1);
    expect(core.RGAA84([...incorrectDocument])).toHaveLength(0);
  });
});

describe('RGAA8.8 - Language change code should be valid (dom)', () => {
  it('accepts valid language changes', () => {
    expect(core.RGAA88(langChanges(htmlDocument('<html lang="fr"><body><p>Bonjour</p></body></html>')))).toHaveLength(
      0,
    );
    const doc = htmlDocument(
      '<html lang="fr"><body><p lang="en">Hello</p><span xml:lang="de-DE">Hallo</span></body></html>',
    );
    expect(core.RGAA88(langChanges(doc))).toHaveLength(0);
  });

  it('reports invalid language changes', () => {
    const doc = htmlDocument('<html lang="fr"><body><p lang="english">Hello</p></body></html>');
    expect(core.RGAA88(langChanges(doc))).toStrictEqual([
      {
        element: '<p lang="english">Hello</p>',
        message: "Le code de langue du changement de langue (« english ») n'est pas valide",
        rule: 'RGAA - 8.8.1',
        ruleLink: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.8.1',
      },
    ]);
  });

  it('reports empty and malformed codes', () => {
    const doc = htmlDocument('<html lang="fr"><body><p lang="">?</p><span lang="en_GB">x</span></body></html>');
    expect(core.RGAA88(langChanges(doc))).toHaveLength(2);
  });

  it('handles large documents', () => {
    const items = Array.from({ length: 5000 }, (_, i) => `<span lang="${i % 2 ? 'en' : 'xx'}">${i}</span>`);
    const doc = htmlDocument(`<html lang="fr"><body>${items.join('')}</body></html>`);
    const start = performance.now();
    expect(core.RGAA88(langChanges(doc))).toHaveLength(2500);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

describe('RGAA8.8 - Language change code should be valid (virtual)', () => {
  const virtualCore = new RGAA8('virtual');

  it('accepts valid language changes', () => {
    const elements: LangVirtualElement[] = [
      { type: 'lang', lang: 'en', outerHTML: '<p lang="en">Hello</p>' },
      { type: 'lang', xmlLang: 'de-DE', outerHTML: '<span xml:lang="de-DE">Hallo</span>' },
    ];
    expect(virtualCore.RGAA88(elements)).toHaveLength(0);
  });

  it('reports invalid language changes', () => {
    const elements: LangVirtualElement[] = [
      { type: 'lang', lang: 'english', outerHTML: '<p lang="english">Hello</p>' },
      { type: 'lang', lang: '', xmlLang: 'en_GB', outerHTML: '<span lang="" xml:lang="en_GB">x</span>' },
      { type: 'lang', lang: null, outerHTML: '<p>no lang</p>' },
    ];
    expect(virtualCore.RGAA88(elements)).toHaveLength(3);
  });
});
