'use strict';

const AgentsMDLib = require('../src/agentsmd-lib');

// Mock global fetch
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  // Reset internal state between tests
  AgentsMDLib._state.selectedBlocks = [];
  AgentsMDLib._state.loadedTemplates = {};
  AgentsMDLib._state.loadedExamples = {};
  AgentsMDLib._listeners = {};
});

/* ------------------------------------------------------------------ */
/* _fetchJSON                                                           */
/* ------------------------------------------------------------------ */
describe('_fetchJSON', () => {
  it('returns parsed JSON on success', async () => {
    const payload = { id: 'frontend', name: 'Frontend' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    });
    const result = await AgentsMDLib._fetchJSON('https://example.com/api.json');
    expect(result).toEqual(payload);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    await expect(AgentsMDLib._fetchJSON('https://example.com/missing.json')).rejects.toThrow(
      '404'
    );
  });
});

/* ------------------------------------------------------------------ */
/* loadTemplate                                                         */
/* ------------------------------------------------------------------ */
describe('loadTemplate', () => {
  it('fetches and returns the template', async () => {
    const template = { id: 'frontend', name: 'Frontend', sections: [] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => template });

    const result = await AgentsMDLib.loadTemplate('frontend');
    expect(result).toEqual(template);
  });

  it('caches the template on subsequent calls', async () => {
    const template = { id: 'backend', name: 'Backend', sections: [] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => template });

    await AgentsMDLib.loadTemplate('backend');
    await AgentsMDLib.loadTemplate('backend');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('emits templateLoaded event', async () => {
    const template = { id: 'testing', name: 'Testing', sections: [] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => template });

    const handler = jest.fn();
    AgentsMDLib.on('templateLoaded', handler);
    await AgentsMDLib.loadTemplate('testing');

    expect(handler).toHaveBeenCalledWith(template);
  });
});

/* ------------------------------------------------------------------ */
/* loadAllTemplates                                                     */
/* ------------------------------------------------------------------ */
describe('loadAllTemplates', () => {
  it('fetches the templates index', async () => {
    const index = { templates: [{ id: 'frontend' }] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => index });

    const result = await AgentsMDLib.loadAllTemplates();
    expect(result).toEqual(index);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('templates/index.json'));
  });

  it('emits allTemplatesLoaded event', async () => {
    const index = { templates: [] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => index });

    const handler = jest.fn();
    AgentsMDLib.on('allTemplatesLoaded', handler);
    await AgentsMDLib.loadAllTemplates();
    expect(handler).toHaveBeenCalledWith(index);
  });
});

/* ------------------------------------------------------------------ */
/* loadExample / loadAllExamples                                       */
/* ------------------------------------------------------------------ */
describe('loadExample', () => {
  it('fetches an example by id', async () => {
    const example = { id: 'fullstack-app', name: 'Full-Stack App' };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => example });

    const result = await AgentsMDLib.loadExample('fullstack-app');
    expect(result).toEqual(example);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('fullstack-app.json'));
  });

  it('caches the example on subsequent calls', async () => {
    const example = { id: 'secure-api', name: 'Secure API' };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => example });

    await AgentsMDLib.loadExample('secure-api');
    await AgentsMDLib.loadExample('secure-api');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('loadAllExamples', () => {
  it('fetches the examples index', async () => {
    const index = { examples: [{ id: 'fullstack-app' }] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => index });

    const result = await AgentsMDLib.loadAllExamples();
    expect(result).toEqual(index);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('examples/index.json'));
  });
});

/* ------------------------------------------------------------------ */
/* Block state management                                              */
/* ------------------------------------------------------------------ */
describe('addBlock / removeBlock / toggleBlock', () => {
  const block = { id: 'frontend', name: 'Frontend', sections: [] };

  it('addBlock adds a block and emits events', () => {
    const added = jest.fn();
    const changed = jest.fn();
    AgentsMDLib.on('blockAdded', added);
    AgentsMDLib.on('selectionChanged', changed);

    AgentsMDLib.addBlock(block);
    expect(AgentsMDLib.getSelectedBlocks()).toHaveLength(1);
    expect(added).toHaveBeenCalledWith(block);
    expect(changed).toHaveBeenCalledWith([block]);
  });

  it('addBlock does not add duplicates', () => {
    AgentsMDLib.addBlock(block);
    AgentsMDLib.addBlock(block);
    expect(AgentsMDLib.getSelectedBlocks()).toHaveLength(1);
  });

  it('removeBlock removes a block', () => {
    AgentsMDLib.addBlock(block);
    AgentsMDLib.removeBlock(block.id);
    expect(AgentsMDLib.getSelectedBlocks()).toHaveLength(0);
  });

  it('removeBlock emits blockRemoved', () => {
    const removed = jest.fn();
    AgentsMDLib.on('blockRemoved', removed);
    AgentsMDLib.addBlock(block);
    AgentsMDLib.removeBlock(block.id);
    expect(removed).toHaveBeenCalledWith(block);
  });

  it('removeBlock is a no-op for unknown id', () => {
    expect(() => AgentsMDLib.removeBlock('nonexistent')).not.toThrow();
  });

  it('toggleBlock adds when not selected, returns true', () => {
    const result = AgentsMDLib.toggleBlock(block);
    expect(result).toBe(true);
    expect(AgentsMDLib.isSelected(block.id)).toBe(true);
  });

  it('toggleBlock removes when selected, returns false', () => {
    AgentsMDLib.addBlock(block);
    const result = AgentsMDLib.toggleBlock(block);
    expect(result).toBe(false);
    expect(AgentsMDLib.isSelected(block.id)).toBe(false);
  });

  it('isSelected returns false when block not in selection', () => {
    expect(AgentsMDLib.isSelected('nonexistent')).toBe(false);
  });

  it('clearBlocks removes all blocks', () => {
    AgentsMDLib.addBlock(block);
    AgentsMDLib.addBlock({ id: 'backend', name: 'Backend', sections: [] });
    AgentsMDLib.clearBlocks();
    expect(AgentsMDLib.getSelectedBlocks()).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */
/* generateAgentsMD                                                    */
/* ------------------------------------------------------------------ */
describe('generateAgentsMD', () => {
  it('returns placeholder when no blocks provided', () => {
    const result = AgentsMDLib.generateAgentsMD([]);
    expect(result).toContain('No templates selected');
  });

  it('returns placeholder for non-array input', () => {
    const result = AgentsMDLib.generateAgentsMD(null);
    expect(result).toContain('No templates selected');
  });

  it('includes section content from blocks', () => {
    const blocks = [
      {
        id: 'frontend',
        name: 'Frontend',
        sections: [
          { id: 'frontend-overview', title: 'Frontend Overview', content: '## Frontend Overview\n\nSome content here.' },
        ],
      },
    ];
    const result = AgentsMDLib.generateAgentsMD(blocks);
    expect(result).toContain('# AGENTS.md');
    expect(result).toContain('Some content here.');
  });

  it('includes a table of contents when sections are present', () => {
    const blocks = [
      {
        id: 'backend',
        name: 'Backend',
        sections: [
          { id: 'backend-api', title: 'API Design', content: '## API Design\n\nContent.' },
        ],
      },
    ];
    const result = AgentsMDLib.generateAgentsMD(blocks);
    expect(result).toContain('Table of Contents');
    expect(result).toContain('[API Design]');
  });

  it('combines multiple blocks in order', () => {
    const blocks = [
      {
        id: 'block-a',
        name: 'A',
        sections: [{ id: 'a1', title: 'Section A', content: '## Section A\n\nContent A.' }],
      },
      {
        id: 'block-b',
        name: 'B',
        sections: [{ id: 'b1', title: 'Section B', content: '## Section B\n\nContent B.' }],
      },
    ];
    const result = AgentsMDLib.generateAgentsMD(blocks);
    expect(result.indexOf('Content A.')).toBeLessThan(result.indexOf('Content B.'));
  });

  it('handles blocks without sections gracefully', () => {
    const blocks = [{ id: 'empty', name: 'Empty', sections: [] }];
    const result = AgentsMDLib.generateAgentsMD(blocks);
    expect(result).toContain('# AGENTS.md');
  });
});

/* ------------------------------------------------------------------ */
/* parseAgentsMD                                                       */
/* ------------------------------------------------------------------ */
describe('parseAgentsMD', () => {
  const sample = `# My Project AGENTS.md

Some intro text.

## Section One

Content of section one.

## Section Two

Content of section two.
`;

  it('extracts the title', () => {
    const result = AgentsMDLib.parseAgentsMD(sample);
    expect(result.title).toBe('My Project AGENTS.md');
  });

  it('extracts sections', () => {
    const result = AgentsMDLib.parseAgentsMD(sample);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].title).toBe('Section One');
    expect(result.sections[1].title).toBe('Section Two');
  });

  it('includes section content', () => {
    const result = AgentsMDLib.parseAgentsMD(sample);
    expect(result.sections[0].content).toContain('Content of section one.');
  });

  it('throws TypeError for non-string input', () => {
    expect(() => AgentsMDLib.parseAgentsMD(null)).toThrow(TypeError);
    expect(() => AgentsMDLib.parseAgentsMD(42)).toThrow(TypeError);
  });

  it('handles content with no h1 title', () => {
    const noTitle = '## Section\n\nContent.\n';
    const result = AgentsMDLib.parseAgentsMD(noTitle);
    expect(result.title).toBe('');
    expect(result.sections).toHaveLength(1);
  });

  it('handles empty string', () => {
    const result = AgentsMDLib.parseAgentsMD('');
    expect(result.title).toBe('');
    expect(result.sections).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ */
/* Event system                                                        */
/* ------------------------------------------------------------------ */
describe('Event system', () => {
  it('on/emit/off work correctly', () => {
    const handler = jest.fn();
    AgentsMDLib.on('test-event', handler);
    AgentsMDLib.emit('test-event', { data: 42 });
    expect(handler).toHaveBeenCalledWith({ data: 42 });

    AgentsMDLib.off('test-event', handler);
    AgentsMDLib.emit('test-event', { data: 99 });
    expect(handler).toHaveBeenCalledTimes(1); // not called again after off
  });

  it('emit on unknown event does not throw', () => {
    expect(() => AgentsMDLib.emit('no-such-event', {})).not.toThrow();
  });

  it('off on unknown event does not throw', () => {
    expect(() => AgentsMDLib.off('no-such-event', () => {})).not.toThrow();
  });

  it('supports multiple handlers on the same event', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    AgentsMDLib.on('multi', h1);
    AgentsMDLib.on('multi', h2);
    AgentsMDLib.emit('multi', 'payload');
    expect(h1).toHaveBeenCalledWith('payload');
    expect(h2).toHaveBeenCalledWith('payload');
  });
});

/* ------------------------------------------------------------------ */
/* _slugify                                                            */
/* ------------------------------------------------------------------ */
describe('_slugify', () => {
  it('converts heading to GitHub anchor slug', () => {
    expect(AgentsMDLib._slugify('Frontend Development Guidelines')).toBe(
      'frontend-development-guidelines'
    );
  });

  it('removes non-word characters', () => {
    // '&' is stripped; surrounding spaces become a single dash (GitHub anchor behaviour)
    expect(AgentsMDLib._slugify('Error Handling & Logging')).toBe('error-handling-logging');
  });

  it('collapses multiple spaces', () => {
    expect(AgentsMDLib._slugify('Hello   World')).toBe('hello-world');
  });
});
