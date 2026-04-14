'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../api/templates');
const EXAMPLES_DIR = path.join(__dirname, '../api/examples');

const EXPECTED_TEMPLATE_IDS = [
  'frontend',
  'backend',
  'iac-terraform',
  'iac-ansible',
  'documentation',
  'linter',
  'testing',
  'security',
];

const EXPECTED_EXAMPLE_IDS = ['fullstack-app', 'devops-pipeline', 'secure-api'];

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */
function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/* ------------------------------------------------------------------ */
/* Templates index                                                     */
/* ------------------------------------------------------------------ */
describe('api/templates/index.json', () => {
  let index;
  beforeAll(() => {
    index = loadJSON(path.join(TEMPLATES_DIR, 'index.json'));
  });

  it('is valid JSON with a "templates" array', () => {
    expect(index).toHaveProperty('templates');
    expect(Array.isArray(index.templates)).toBe(true);
  });

  it('lists all expected template IDs', () => {
    const ids = index.templates.map((t) => t.id);
    EXPECTED_TEMPLATE_IDS.forEach((id) => {
      expect(ids).toContain(id);
    });
  });

  it('every entry has required fields', () => {
    index.templates.forEach((t) => {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('description');
      expect(t).toHaveProperty('category');
      expect(t).toHaveProperty('icon');
      expect(t).toHaveProperty('tags');
      expect(Array.isArray(t.tags)).toBe(true);
    });
  });
});

/* ------------------------------------------------------------------ */
/* Individual template files                                           */
/* ------------------------------------------------------------------ */
describe('Individual template JSON files', () => {
  EXPECTED_TEMPLATE_IDS.forEach((id) => {
    describe(`api/templates/${id}.json`, () => {
      let template;
      beforeAll(() => {
        template = loadJSON(path.join(TEMPLATES_DIR, `${id}.json`));
      });

      it('has the correct id', () => {
        expect(template.id).toBe(id);
      });

      it('has a non-empty name and description', () => {
        expect(typeof template.name).toBe('string');
        expect(template.name.length).toBeGreaterThan(0);
        expect(typeof template.description).toBe('string');
        expect(template.description.length).toBeGreaterThan(0);
      });

      it('has a sections array', () => {
        expect(Array.isArray(template.sections)).toBe(true);
      });

      it('has at least 2 sections', () => {
        expect(template.sections.length).toBeGreaterThanOrEqual(2);
      });

      it('every section has id, title, and content', () => {
        template.sections.forEach((section) => {
          expect(section).toHaveProperty('id');
          expect(section).toHaveProperty('title');
          expect(section).toHaveProperty('content');
          expect(typeof section.content).toBe('string');
          expect(section.content.length).toBeGreaterThan(50);
        });
      });

      it('section IDs are unique within the template', () => {
        const ids = template.sections.map((s) => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });
    });
  });
});

/* ------------------------------------------------------------------ */
/* Examples index                                                      */
/* ------------------------------------------------------------------ */
describe('api/examples/index.json', () => {
  let index;
  beforeAll(() => {
    index = loadJSON(path.join(EXAMPLES_DIR, 'index.json'));
  });

  it('is valid JSON with an "examples" array', () => {
    expect(index).toHaveProperty('examples');
    expect(Array.isArray(index.examples)).toBe(true);
  });

  it('lists all expected example IDs', () => {
    const ids = index.examples.map((e) => e.id);
    EXPECTED_EXAMPLE_IDS.forEach((id) => {
      expect(ids).toContain(id);
    });
  });

  it('every entry has required fields', () => {
    index.examples.forEach((e) => {
      expect(e).toHaveProperty('id');
      expect(e).toHaveProperty('name');
      expect(e).toHaveProperty('description');
      expect(e).toHaveProperty('templates');
      expect(Array.isArray(e.templates)).toBe(true);
    });
  });
});

/* ------------------------------------------------------------------ */
/* Individual example files                                            */
/* ------------------------------------------------------------------ */
describe('Individual example JSON files', () => {
  EXPECTED_EXAMPLE_IDS.forEach((id) => {
    describe(`api/examples/${id}.json`, () => {
      let example;
      beforeAll(() => {
        example = loadJSON(path.join(EXAMPLES_DIR, `${id}.json`));
      });

      it('has the correct id', () => {
        expect(example.id).toBe(id);
      });

      it('has a non-empty name and description', () => {
        expect(typeof example.name).toBe('string');
        expect(example.name.length).toBeGreaterThan(0);
        expect(typeof example.description).toBe('string');
        expect(example.description.length).toBeGreaterThan(0);
      });

      it('has a templates array referencing valid IDs', () => {
        expect(Array.isArray(example.templates)).toBe(true);
        example.templates.forEach((tid) => {
          expect(EXPECTED_TEMPLATE_IDS).toContain(tid);
        });
      });

      it('has a non-empty content string', () => {
        expect(typeof example.content).toBe('string');
        expect(example.content.length).toBeGreaterThan(100);
      });
    });
  });
});
